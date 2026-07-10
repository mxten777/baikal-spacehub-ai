import { useState, useRef } from 'react'
import { usePrograms } from '../../hooks/useData'
import { programsService } from '../../services/programs'
import type { Program } from '../../types'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import ImageUploadField from '../../components/admin/ImageUploadField'
import { deleteStorageFilesByUrls } from '../../lib/storage'

const programSchema = z.object({
  title: z.string().min(1, '프로그램명을 입력하세요'),
  slug: z.string().min(1, 'slug를 입력하세요').regex(/^[a-z0-9-]+$/, '소문자, 숫자, 하이픈만 허용됩니다'),
  description: z.string().optional(),
  category: z.enum(['exhibition', 'performance', 'lecture', 'workshop', 'event']),
  status: z.enum(['upcoming', 'ongoing', 'closed', 'cancelled']),
  start_date: z.string().min(1, '시작일을 입력하세요'),
  end_date: z.string().optional(),
  venue: z.string().optional(),
  price: z.coerce.number().min(0).optional(),
  capacity: z.coerce.number().min(0).optional(),
  registration_url: z.string().url('유효한 URL을 입력하세요').optional().or(z.literal('')),
  is_featured: z.boolean().default(false),
  cover_image_url: z.string().nullable().optional(),
})

type ProgramFormData = z.infer<typeof programSchema>

const CATEGORY_LABELS: Record<string, string> = {
  exhibition: '전시',
  performance: '공연',
  lecture: '강연',
  workshop: '워크샵',
  event: '이벤트',
}

const STATUS_LABELS: Record<string, string> = {
  upcoming: '예정',
  ongoing: '진행 중',
  closed: '종료',
  cancelled: '취소',
}

const STATUS_COLORS: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-500',
}

const defaultValues: ProgramFormData = {
  title: '',
  slug: '',
  description: '',
  category: 'event',
  status: 'upcoming',
  start_date: '',
  end_date: '',
  venue: '',
  price: undefined,
  capacity: undefined,
  registration_url: '',
  is_featured: false,
  cover_image_url: null,
}

function ProgramForm({ initialData, onClose, onSuccess, onWarning }: { initialData?: Program; onClose: () => void; onSuccess: () => void; onWarning?: (msg: string) => void }) {
  const [saving, setSaving] = useState(false)
  const originalImageUrl = useRef<string | null>(initialData?.cover_image_url ?? null)
  const uploadedUrlsRef = useRef<Set<string>>(new Set())
  const handleUploadComplete = (url: string) => { uploadedUrlsRef.current.add(url) }
  const handleClose = () => {
    const toClean = new Set(uploadedUrlsRef.current)
    uploadedUrlsRef.current.clear()
    onClose()
    if (toClean.size > 0) {
      deleteStorageFilesByUrls(toClean).then((result) => {
        if (result.failed.length > 0) {
          result.failed.forEach(({ url, error }) => console.error('[Storage cleanup]', url, error))
          onWarning?.('화면은 닫혀진만 일부 임시 이미지 파일을 정리하지 못했습니다.')
        }
      }).catch(console.error)
    }
  }
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProgramFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(programSchema) as any,
    defaultValues: initialData
      ? {
          title: initialData.title,
          slug: initialData.slug,
          description: initialData.description ?? '',
          category: initialData.category,
          status: initialData.status,
          start_date: initialData.start_date?.split('T')[0] ?? '',
          end_date: initialData.end_date?.split('T')[0] ?? '',
          venue: initialData.venue ?? '',
          price: initialData.price ?? undefined,
          capacity: initialData.capacity ?? undefined,
          registration_url: initialData.registration_url ?? '',
          is_featured: initialData.is_featured,
          cover_image_url: initialData.cover_image_url ?? null,
        }
      : defaultValues,
  })
  const coverImageUrl = watch('cover_image_url')

  const onSubmit = async (data: ProgramFormData) => {
    setSaving(true)
    try {
      const payload = {
        ...data,
        registration_url: data.registration_url || null,
        end_date: data.end_date || null,
        cover_image_url: data.cover_image_url ?? null,
      }
      if (initialData) {
        await programsService.update(initialData.id, payload)
      } else {
        await programsService.create(payload)
      }
      const savedUrl = payload.cover_image_url
      if (savedUrl !== null) uploadedUrlsRef.current.delete(savedUrl)
      const toClean = new Set(uploadedUrlsRef.current)
      uploadedUrlsRef.current.clear()
      const prevUrl = originalImageUrl.current
      originalImageUrl.current = savedUrl
      onSuccess()
      const urlsToDelete = new Set(toClean)
      if (prevUrl !== null && prevUrl !== savedUrl) urlsToDelete.add(prevUrl)
      if (urlsToDelete.size > 0) {
        deleteStorageFilesByUrls(urlsToDelete).then((result) => {
          if (result.failed.length > 0) {
            result.failed.forEach(({ url, error }) => console.error('[Storage cleanup]', url, error))
            onWarning?.('내용은 저장되었지만 일부 임시 이미지 파일을 정리하지 못했습니다.')
          }
        }).catch(console.error)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="font-display text-lg font-light">{initialData ? '프로그램 편집' : '프로그램 추가'}</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-brand-black"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit as any /* eslint-disable-line @typescript-eslint/no-explicit-any */)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">프로그램명 *</label>
              <input {...register('title')} className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">Slug *</label>
              <input {...register('slug')} className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black" />
              {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">설명</label>
            <textarea {...register('description')} rows={3} className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">카테고리</label>
              <select {...register('category')} className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black bg-white">
                {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">상태</label>
              <select {...register('status')} className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black bg-white">
                {Object.entries(STATUS_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">시작일 *</label>
              <input type="date" {...register('start_date')} className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black" />
              {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">종료일</label>
              <input type="date" {...register('end_date')} className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">장소</label>
              <input {...register('venue')} className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black" />
            </div>
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">수용 인원</label>
              <input type="number" {...register('capacity')} className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">가격 (₩)</label>
              <input type="number" {...register('price')} className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black" />
            </div>
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">예약 URL</label>
              <input {...register('registration_url')} placeholder="https://" className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black" />
              {errors.registration_url && <p className="text-red-500 text-xs mt-1">{errors.registration_url.message}</p>}
            </div>
          </div>
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('is_featured')} className="w-4 h-4" />
              <span className="text-sm font-sans text-gray-700">메인 노출 (Featured)</span>
            </label>
          </div>
          <ImageUploadField
            label="대표 이미지"
            value={coverImageUrl}
            onChange={(url) => setValue('cover_image_url', url)}
            onUploadComplete={handleUploadComplete}
            folder="programs"
          />
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-sans text-gray-600 hover:text-brand-black">취소</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-brand-black text-white text-sm font-sans hover:bg-brand-muted transition-colors disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminProgramsPage() {
  const { data: programs, isLoading } = usePrograms()
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [storageWarning, setStorageWarning] = useState<string | null>(null)

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['programs'] })
    setFormOpen(false)
    setEditingProgram(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 프로그램을 삭제하시겠습니까?')) return
    setDeletingId(id)
    try {
      await programsService.delete(id)
      queryClient.invalidateQueries({ queryKey: ['programs'] })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      {storageWarning && (
        <div className="flex items-center justify-between gap-3 mb-4 px-4 py-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-sans">
          <span>{storageWarning}</span>
          <button type="button" onClick={() => setStorageWarning(null)} className="shrink-0 text-amber-600 hover:text-amber-900">✕</button>
        </div>
      )}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-light text-brand-black">Programs</h1>
          <p className="font-sans text-sm text-gray-500 mt-1">프로그램 관리</p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-black text-white text-sm font-sans hover:bg-brand-muted transition-colors"
        >
          <Plus size={16} />
          프로그램 추가
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={24} className="animate-spin text-brand-muted" />
        </div>
      ) : (
        <div className="bg-white border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase">프로그램</th>
                <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase hidden md:table-cell">카테고리</th>
                <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase hidden md:table-cell">시작일</th>
                <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase hidden lg:table-cell">상태</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {programs && programs.length > 0 ? (
                programs.map((program) => (
                  <tr key={program.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-sans text-sm font-medium text-brand-black">{program.title}</p>
                      {program.is_featured && (
                        <span className="text-[10px] font-sans tracking-widest uppercase text-brand-accent">Featured</span>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-xs font-sans text-gray-600">{CATEGORY_LABELS[program.category] ?? program.category}</span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-xs font-sans text-gray-600">
                        {program.start_date ? new Date(program.start_date).toLocaleDateString('ko-KR') : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-sans tracking-widest uppercase ${STATUS_COLORS[program.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {STATUS_LABELS[program.status] ?? program.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditingProgram(program)} className="p-1.5 text-gray-400 hover:text-brand-black transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(program.id)}
                          disabled={deletingId === program.id}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        >
                          {deletingId === program.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center font-sans text-sm text-gray-400">
                    등록된 프로그램이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {(formOpen || editingProgram) && (
        <ProgramForm
          initialData={editingProgram ?? undefined}
          onClose={() => { setFormOpen(false); setEditingProgram(null) }}
          onSuccess={handleSuccess}
          onWarning={setStorageWarning}
        />
      )}
    </div>
  )
}
