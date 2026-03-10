import { useState } from 'react'
import { useBlogPosts, useBlogCategories } from '../../hooks/useData'
import { blogService } from '../../services/blog'
import type { BlogPost } from '../../types'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, X, Check, Loader2, Eye } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const postSchema = z.object({
  title: z.string().min(1, '제목을 입력하세요'),
  slug: z.string().min(1, 'slug를 입력하세요').regex(/^[a-z0-9-]+$/, '소문자, 숫자, 하이픈만 허용됩니다'),
  excerpt: z.string().optional(),
  content: z.string().min(1, '본문을 입력하세요'),
  category_id: z.string().optional(),
  cover_image_url: z.string().url('유효한 URL을 입력하세요').optional().or(z.literal('')),
  is_published: z.boolean().default(false),
  is_featured: z.boolean().default(false),
})

type PostFormData = z.infer<typeof postSchema>

function BlogPostForm({ initialData, onClose, onSuccess }: { initialData?: BlogPost; onClose: () => void; onSuccess: () => void }) {
  const [saving, setSaving] = useState(false)
  const { data: categories } = useBlogCategories()
  const { register, handleSubmit, formState: { errors } } = useForm<PostFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(postSchema) as any,
    defaultValues: initialData
      ? {
          title: initialData.title,
          slug: initialData.slug,
          excerpt: initialData.excerpt ?? '',
          content: initialData.content,
          category_id: initialData.category_id ?? '',
          cover_image_url: initialData.cover_image_url ?? '',
          is_published: initialData.is_published,
          is_featured: initialData.is_featured,
        }
      : { title: '', slug: '', excerpt: '', content: '', category_id: '', cover_image_url: '', is_published: false, is_featured: false },
  })

  const onSubmit = async (data: PostFormData) => {
    setSaving(true)
    try {
      const payload = {
        ...data,
        cover_image_url: data.cover_image_url || null,
        category_id: data.category_id || null,
      }
      if (initialData) {
        await blogService.update(initialData.id, payload)
      } else {
        await blogService.create(payload)
      }
      onSuccess()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="font-display text-lg font-light">{initialData ? '포스트 편집' : '새 포스트'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-brand-black"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit as any /* eslint-disable-line @typescript-eslint/no-explicit-any */)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">제목 *</label>
              <input {...register('title')} className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">Slug *</label>
              <input {...register('slug')} className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black" />
              {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">카테고리</label>
              <select {...register('category_id')} className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black bg-white">
                <option value="">-- 선택 --</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">커버 이미지 URL</label>
              <input {...register('cover_image_url')} placeholder="https://" className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black" />
              {errors.cover_image_url && <p className="text-red-500 text-xs mt-1">{errors.cover_image_url.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">요약 (Excerpt)</label>
            <textarea {...register('excerpt')} rows={2} className="w-full border border-gray-200 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black resize-none" />
          </div>
          <div>
            <label className="block text-xs font-sans text-gray-600 tracking-wider uppercase mb-1">본문 * (Markdown 지원)</label>
            <textarea {...register('content')} rows={12} className="w-full border border-gray-200 px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-black resize-none" />
            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('is_published')} className="w-4 h-4" />
              <span className="text-sm font-sans text-gray-700">발행 (Published)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('is_featured')} className="w-4 h-4" />
              <span className="text-sm font-sans text-gray-700">메인 노출 (Featured)</span>
            </label>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-sans text-gray-600 hover:text-brand-black">취소</button>
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

export default function AdminBlogPage() {
  const { data: blogResult, isLoading } = useBlogPosts({ limit: 50 })
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const posts = blogResult?.data ?? []

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['blog'] })
    setFormOpen(false)
    setEditingPost(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 포스트를 삭제하시겠습니까?')) return
    setDeletingId(id)
    try {
      await blogService.delete(id)
      queryClient.invalidateQueries({ queryKey: ['blog'] })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-light text-brand-black">Blog</h1>
          <p className="font-sans text-sm text-gray-500 mt-1">블로그 포스트 관리</p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-black text-white text-sm font-sans hover:bg-brand-muted transition-colors"
        >
          <Plus size={16} />
          새 포스트
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
                <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase">제목</th>
                <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase hidden md:table-cell">카테고리</th>
                <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase hidden lg:table-cell">조회수</th>
                <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase hidden md:table-cell">상태</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-sans text-sm font-medium text-brand-black line-clamp-1">{post.title}</p>
                      {post.is_featured && (
                        <span className="text-[10px] font-sans tracking-widest uppercase text-brand-accent">Featured</span>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-xs font-sans text-gray-600">{post.category?.name ?? '-'}</span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="flex items-center gap-1 text-xs font-sans text-gray-600">
                        <Eye size={12} />
                        {post.view_count ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-sans tracking-widest uppercase ${post.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {post.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditingPost(post)} className="p-1.5 text-gray-400 hover:text-brand-black transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          disabled={deletingId === post.id}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        >
                          {deletingId === post.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center font-sans text-sm text-gray-400">
                    등록된 포스트가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {(formOpen || editingPost) && (
        <BlogPostForm
          initialData={editingPost ?? undefined}
          onClose={() => { setFormOpen(false); setEditingPost(null) }}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
