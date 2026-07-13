import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, X } from 'lucide-react'
import { createPhotoProject } from '../../../services/photoProjects'
import type { ProjectCategory, ProjectStage } from '../../../types'

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS: { label: string; value: ProjectCategory }[] = [
  { label: 'Main', value: 'main' },
  { label: 'Wedding', value: 'wedding' },
  { label: 'Space', value: 'space' },
  { label: 'F&B', value: 'food_beverage' },
  { label: 'Archive', value: 'archive' },
  { label: 'Online Wedding', value: 'online_wedding' },
  { label: 'Online Space', value: 'online_space' },
  { label: 'Contact', value: 'contact' },
  { label: 'About', value: 'about' },
]

const STAGE_OPTIONS: { label: string; value: ProjectStage }[] = [
  { label: 'Source', value: 'source' },
  { label: 'Selected', value: 'selected' },
  { label: 'Edited', value: 'edited' },
  { label: 'Web', value: 'web' },
  { label: 'PDF', value: 'pdf' },
]

const ALL_STAGES: ProjectStage[] = ['source', 'selected', 'edited', 'web', 'pdf']

// ─── Props ────────────────────────────────────────────────────────────────────

interface CreatePhotoProjectModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (msg: string) => void
  onError?: (msg: string) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreatePhotoProjectModal({
  open,
  onClose,
  onSuccess,
  onError,
}: CreatePhotoProjectModalProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categories, setCategories] = useState<ProjectCategory[]>([])
  const [stages, setStages] = useState<ProjectStage[]>([...ALL_STAGES])
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  if (!open) return null

  function toggleCategory(value: ProjectCategory) {
    setCategories(prev =>
      prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value],
    )
  }

  function toggleStage(value: ProjectStage) {
    setStages(prev =>
      prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value],
    )
  }

  function handleClose() {
    if (submitting) return
    onClose()
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return

    const trimmedName = name.trim()
    if (!trimmedName) {
      setFormError('프로젝트명을 입력해 주세요.')
      return
    }
    if (categories.length === 0) {
      setFormError('카테고리를 하나 이상 선택해 주세요.')
      return
    }
    if (stages.length === 0) {
      setFormError('관리 단계를 하나 이상 선택해 주세요.')
      return
    }

    setFormError(null)
    setSubmitting(true)
    try {
      await createPhotoProject({
        name: trimmedName,
        description: description.trim() || undefined,
        categories,
        stages,
      })
      await queryClient.invalidateQueries({ queryKey: ['admin-photo-projects'] })
      onSuccess('프로젝트가 생성되었습니다.')
      onClose()
    } catch (err) {
      const raw = err instanceof Error ? err.message : ''
      const isSlugOrDuplicate =
        raw.toLowerCase().includes('slug') ||
        raw.toLowerCase().includes('duplicate') ||
        raw.toLowerCase().includes('unique')
      const userMsg = isSlugOrDuplicate
        ? '같은 이름의 프로젝트가 이미 존재합니다. 다른 프로젝트명을 사용해 주세요.'
        : '프로젝트 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.'
      setFormError(userMsg)
      onError?.(userMsg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={handleClose}
        aria-hidden="true"
      />
      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white w-full max-w-lg shadow-xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 shrink-0">
            <div>
              <h2
                id="create-modal-title"
                className="font-display text-lg font-light text-brand-black"
              >
                새 이미지 자산 프로젝트
              </h2>
              <p className="font-sans text-xs text-gray-500 mt-0.5">
                프로젝트별 이미지 분류 및 관리 구조를 생성합니다.
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="ml-4 shrink-0 text-gray-400 hover:text-brand-black disabled:opacity-40 transition-colors"
              aria-label="닫기"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* 프로젝트명 */}
            <div>
              <label
                htmlFor="create-project-name"
                className="block text-xs font-sans font-medium text-brand-black mb-1.5"
              >
                프로젝트명 <span className="text-rose-500">*</span>
              </label>
              <input
                id="create-project-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="예: THE LIT 2026"
                disabled={submitting}
                className="w-full border border-gray-300 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black disabled:bg-gray-50 transition-colors"
              />
            </div>

            {/* 설명 */}
            <div>
              <label
                htmlFor="create-project-description"
                className="block text-xs font-sans font-medium text-brand-black mb-1.5"
              >
                설명
              </label>
              <textarea
                id="create-project-description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="프로젝트 설명을 입력하세요 (선택)"
                disabled={submitting}
                className="w-full border border-gray-300 px-3 py-2 text-sm font-sans focus:outline-none focus:border-brand-black resize-none disabled:bg-gray-50 transition-colors"
              />
            </div>

            {/* 카테고리 */}
            <div>
              <p className="text-xs font-sans font-medium text-brand-black mb-2">
                카테고리 <span className="text-rose-500">*</span>
                <span className="font-normal text-gray-400 ml-1">(1개 이상 선택)</span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-3">
                {CATEGORY_OPTIONS.map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={categories.includes(opt.value)}
                      onChange={() => toggleCategory(opt.value)}
                      disabled={submitting}
                      className="w-4 h-4 shrink-0"
                    />
                    <span className="text-sm font-sans text-brand-black">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 관리 단계 */}
            <div>
              <p className="text-xs font-sans font-medium text-brand-black mb-2">
                관리 단계 <span className="text-rose-500">*</span>
                <span className="font-normal text-gray-400 ml-1">(1개 이상 선택)</span>
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {STAGE_OPTIONS.map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stages.includes(opt.value)}
                      onChange={() => toggleStage(opt.value)}
                      disabled={submitting}
                      className="w-4 h-4 shrink-0"
                    />
                    <span className="text-sm font-sans text-brand-black">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Form error */}
            {formError && (
              <p className="text-xs font-sans text-rose-600">{formError}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="px-4 py-2 border border-gray-300 text-sm font-sans text-brand-black hover:border-brand-black transition-colors disabled:opacity-40"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-brand-black text-white text-sm font-sans hover:bg-brand-charcoal transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  생성 중...
                </>
              ) : (
                '프로젝트 생성'
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
