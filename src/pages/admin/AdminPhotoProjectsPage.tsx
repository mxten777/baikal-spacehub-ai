import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, X, Pencil, Archive, FolderOpen, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { listPhotoProjects, archivePhotoProject } from '../../services/photoProjects'
import { isSupabaseConfigured } from '../../lib/supabase'
import type { PhotoProject, PhotoProjectStatus } from '../../types'
import CreatePhotoProjectModal from '../../components/admin/photo-projects/CreatePhotoProjectModal'
import EditPhotoProjectModal from '../../components/admin/photo-projects/EditPhotoProjectModal'

// ─── Toast ────────────────────────────────────────────────────────────────────

interface ToastMsg {
  id: string
  message: string
  type: 'success' | 'error'
}

function ToastItem({
  message,
  type,
  onClose,
}: {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 px-4 py-3 border text-sm font-sans shadow-lg max-w-sm w-full ${
        type === 'error'
          ? 'bg-rose-50 border-rose-200 text-rose-800'
          : 'bg-brand-cream border-brand-border text-brand-black'
      }`}
    >
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="shrink-0 mt-0.5 text-current/60 hover:text-current"
        aria-label="알림 닫기"
      >
        <X size={14} />
      </button>
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<PhotoProjectStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-green-100 text-green-700' },
  archived: { label: 'Archived', className: 'bg-gray-100 text-gray-500' },
}

function StatusBadge({ status }: { status: PhotoProjectStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[10px] font-sans tracking-widest uppercase ${cfg.className}`}
    >
      {cfg.label}
    </span>
  )
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function ProjectRow({
  project,
  onEdit,
  onArchive,
  archiving,
}: {
  project: PhotoProject
  onEdit: (project: PhotoProject) => void
  onArchive: (project: PhotoProject) => void
  archiving: boolean
}) {
  const navigate = useNavigate()
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <p className="font-sans text-sm font-medium text-brand-black">{project.name}</p>
        <p className="font-sans text-xs text-gray-400 mt-0.5">/{project.slug}</p>
      </td>
      <td className="px-6 py-4 hidden md:table-cell">
        <StatusBadge status={project.status} />
      </td>
      <td className="px-6 py-4 hidden lg:table-cell">
        <span className="font-sans text-xs text-gray-600">{project.categories.length}</span>
      </td>
      <td className="px-6 py-4 hidden lg:table-cell">
        <span className="font-sans text-xs text-gray-600">{project.stages.length}</span>
      </td>
      <td className="px-6 py-4 hidden lg:table-cell">
        <span className="font-sans text-xs text-gray-500">
          {format(new Date(project.created_at), 'yyyy.MM.dd')}
        </span>
      </td>
      <td className="px-4 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(`/admin/photo-projects/${project.id}`)}
            className="px-2 py-1 text-xs font-sans border border-gray-300 text-gray-600 hover:border-brand-black hover:text-brand-black transition-colors"
            aria-label={`${project.name} 탐색`}
          >
            <span className="hidden sm:inline">탐색</span>
            <FolderOpen size={12} className="sm:hidden" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(project)}
            className="px-2 py-1 text-xs font-sans border border-gray-300 text-gray-600 hover:border-brand-black hover:text-brand-black transition-colors"
            aria-label={`${project.name} 수정`}
          >
            <span className="hidden sm:inline">수정</span>
            <Pencil size={12} className="sm:hidden" aria-hidden="true" />
          </button>
          {project.status === 'active' && (
            <button
              type="button"
              onClick={() => onArchive(project)}
              disabled={archiving}
              className="px-2 py-1 text-xs font-sans border border-gray-300 text-gray-500 hover:border-gray-500 hover:text-gray-700 transition-colors disabled:opacity-40"
              aria-label={`${project.name} 아카이브`}
            >
              <span className="hidden sm:inline">아카이브</span>
              <Archive size={12} className="sm:hidden" aria-hidden="true" />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPhotoProjectsPage() {
  const queryClient = useQueryClient()
  const { data: projects, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-photo-projects'],
    queryFn: () => listPhotoProjects(),
    staleTime: 1000 * 60 * 3, // 3분간 캐시 유지 → 페이지 재방문 시 재요청 없음
    enabled: isSupabaseConfigured,
  })

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editProject, setEditProject] = useState<PhotoProject | null>(null)
  const [archivingId, setArchivingId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<ToastMsg[]>([])
  const toastCountRef = useRef(0)

  function addToast(message: string, type: 'success' | 'error' = 'success') {
    const id = String(++toastCountRef.current)
    setToasts(prev => [...prev, { id, message, type }])
  }

  function dismissToast(id: string) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  async function handleArchive(project: PhotoProject) {
    const confirmed = window.confirm(
      '이 프로젝트를 아카이브하시겠습니까? 기존 사진은 삭제되지 않습니다.',
    )
    if (!confirmed) return

    setArchivingId(project.id)
    try {
      await archivePhotoProject(project.id)
      await queryClient.invalidateQueries({ queryKey: ['admin-photo-projects'] })
      addToast('프로젝트가 아카이브되었습니다.', 'success')
    } catch {
      addToast('아카이브에 실패했습니다. 잠시 후 다시 시도해 주세요.', 'error')
    } finally {
      setArchivingId(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-light text-brand-black">
            Photo Projects
          </h1>
          <p className="font-sans text-sm text-gray-500 mt-1">이미지 자산 프로젝트 관리</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-black text-white text-sm font-sans hover:bg-brand-charcoal transition-colors"
        >
          <Plus size={16} />
          새 프로젝트
        </button>
      </div>

      {!isSupabaseConfigured && (
        <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm font-sans">
          Supabase 환경변수가 설정되지 않았습니다. .env.local 파일을 확인해 주세요.
        </div>
      )}

      {isError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm font-sans flex items-center justify-between gap-4">
          <span>{error instanceof Error ? error.message : '프로젝트 목록을 불러오지 못했습니다.'}</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 border border-red-300 text-red-700 hover:bg-red-100 transition-colors text-xs font-sans"
          >
            <RefreshCw size={12} />
            재시도
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-40 gap-3">
          <Loader2 size={24} className="animate-spin text-brand-muted" />
          <p className="font-sans text-xs text-gray-400">연결 중… 최초 접속 시 잠시 걸릴 수 있습니다</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase">
                  프로젝트명
                </th>
                <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase hidden md:table-cell">
                  상태
                </th>
                <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase hidden lg:table-cell">
                  카테고리
                </th>
                <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase hidden lg:table-cell">
                  단계
                </th>
                <th className="text-left px-6 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase hidden lg:table-cell">
                  생성일
                </th>
                <th className="px-4 py-3 text-xs font-sans tracking-wider text-gray-500 uppercase text-right">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects && projects.length > 0 ? (
                projects.map(project => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    onEdit={setEditProject}
                    onArchive={handleArchive}
                    archiving={archivingId === project.id}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center font-sans text-sm text-gray-400"
                  >
                    등록된 프로젝트가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreatePhotoProjectModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={msg => addToast(msg, 'success')}
          onError={msg => addToast(msg, 'error')}
        />
      )}

      {/* Edit Modal */}
      <EditPhotoProjectModal
        open={editProject !== null}
        project={editProject}
        onClose={() => setEditProject(null)}
        onSuccess={msg => addToast(msg, 'success')}
      />

      {/* Toast container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end">
          {toasts.map(t => (
            <ToastItem
              key={t.id}
              message={t.message}
              type={t.type}
              onClose={() => dismissToast(t.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
