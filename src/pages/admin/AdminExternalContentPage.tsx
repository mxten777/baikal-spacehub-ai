import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Star, StarOff, ExternalLink, Loader2,
  Youtube, Instagram, Twitter, Rss, RefreshCw, Filter,
  ChevronLeft, ChevronRight, CheckCircle, Clock, XCircle,
} from 'lucide-react'
import { externalContentsService } from '../../services/externalContents'
import { runFetchAll } from '../../services/fetchers/aggregator'
import type { ContentPlatform, VisibilityStatus, ExternalContent } from '../../types'
import { format } from 'date-fns'

const PLATFORM_ICONS: Record<ContentPlatform, React.ElementType> = {
  rss: Rss,
  youtube: Youtube,
  instagram: Instagram,
  x: Twitter,
}

const PLATFORM_COLORS: Record<ContentPlatform, string> = {
  rss: 'text-orange-500',
  youtube: 'text-red-500',
  instagram: 'text-pink-500',
  x: 'text-gray-600',
}

const PLATFORM_LABELS: Record<ContentPlatform, string> = {
  rss: 'RSS',
  youtube: 'YouTube',
  instagram: 'Instagram',
  x: 'X',
}

const STATUS_CONFIG: Record<
  VisibilityStatus,
  { label: string; cls: string; icon: React.ElementType }
> = {
  pending: { label: '대기', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock },
  published: { label: '공개', cls: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle },
  featured: { label: '대표노출', cls: 'bg-blue-50 text-blue-700 border-blue-200', icon: Star },
  hidden: { label: '숨김', cls: 'bg-gray-50 text-gray-500 border-gray-200', icon: XCircle },
}

function StatusBadge({ status }: { status: VisibilityStatus }) {
  const cfg = STATUS_CONFIG[status]
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs border font-sans ${cfg.cls}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  )
}

function ContentCard({
  item,
  onStatusChange,
  onFeaturedChange,
}: {
  item: ExternalContent
  onStatusChange: (id: string, status: VisibilityStatus) => void
  onFeaturedChange: (id: string, val: boolean) => void
}) {
  const Icon = PLATFORM_ICONS[item.platform]
  const [updating, setUpdating] = useState(false)

  const handleStatus = async (status: VisibilityStatus) => {
    setUpdating(true)
    try { await onStatusChange(item.id, status) }
    finally { setUpdating(false) }
  }

  const handleFeatured = async () => {
    setUpdating(true)
    try { await onFeaturedChange(item.id, !item.is_featured) }
    finally { setUpdating(false) }
  }

  return (
    <div className={`bg-white border p-4 flex gap-4 ${
      item.visibility_status === 'hidden' ? 'opacity-50' : ''
    }`}>
      {/* Thumbnail */}
      <div className="w-20 h-16 shrink-0 bg-gray-100 overflow-hidden relative">
        {item.thumbnail_url ? (
          <img
            src={item.thumbnail_url}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              const t = e.currentTarget
              t.style.display = 'none'
              t.nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        <div className={`absolute inset-0 flex items-center justify-center ${item.thumbnail_url ? 'hidden' : ''}`}>
          <Icon size={20} className={PLATFORM_COLORS[item.platform]} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`${PLATFORM_COLORS[item.platform]} shrink-0`}>
                <Icon size={13} />
              </span>
              <span className="text-xs text-gray-400 tracking-wider uppercase shrink-0">
                {PLATFORM_LABELS[item.platform]}
              </span>
              <StatusBadge status={item.visibility_status} />
              {item.is_featured && (
                <span className="text-xs text-yellow-500">★ Featured</span>
              )}
            </div>
            <p className="font-sans text-sm font-medium text-brand-black line-clamp-1 mb-1">
              {item.title ?? '(제목 없음)'}
            </p>
            <p className="font-sans text-xs text-gray-500 line-clamp-2">
              {item.summary ?? ''}
            </p>
            <p className="font-sans text-xs text-gray-300 mt-1">
              {item.author_name && `by ${item.author_name} · `}
              {item.published_at
                ? format(new Date(item.published_at), 'yyyy.MM.dd')
                : '날짜 없음'}
              {item.category && ` · ${item.category}`}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {updating ? (
              <Loader2 size={16} className="animate-spin text-gray-400" />
            ) : (
              <>
                <a
                  href={item.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-gray-400 hover:text-brand-black transition-colors"
                  title="원문 보기"
                >
                  <ExternalLink size={14} />
                </a>
                <button
                  onClick={handleFeatured}
                  className={`p-1.5 transition-colors ${
                    item.is_featured ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
                  }`}
                  title={item.is_featured ? 'Featured 해제' : 'Featured 설정'}
                >
                  {item.is_featured ? <Star size={14} fill="currentColor" /> : <StarOff size={14} />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Status actions */}
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          {(['pending', 'published', 'featured', 'hidden'] as VisibilityStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => handleStatus(s)}
              disabled={item.visibility_status === s || updating}
              className={`px-2 py-0.5 text-xs font-sans border transition-colors disabled:opacity-40 ${
                item.visibility_status === s
                  ? STATUS_CONFIG[s].cls
                  : 'border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600'
              }`}
            >
              {STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AdminExternalContentPage() {
  const qc = useQueryClient()
  const [platform, setPlatform] = useState<ContentPlatform | undefined>()
  const [status, setStatus] = useState<VisibilityStatus | undefined>()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)

  const LIMIT = 20

  const { data, isLoading } = useQuery({
    queryKey: ['external-contents', { platform, status, search, page }],
    queryFn: () =>
      externalContentsService.getAllAdmin({
        platform,
        visibility_status: status,
        search: search || undefined,
        page,
        limit: LIMIT,
      }),
    placeholderData: (prev) => prev,
  })

  const refresh = () => qc.invalidateQueries({ queryKey: ['external-contents'] })

  const handleStatusChange = async (id: string, s: VisibilityStatus) => {
    await externalContentsService.updateVisibility(id, s)
    refresh()
  }

  const handleFeaturedChange = async (id: string, val: boolean) => {
    await externalContentsService.updateFeatured(id, val)
    refresh()
  }

  const handleSyncAll = async () => {
    setSyncing(true)
    setSyncResult(null)
    try {
      const results = await runFetchAll()
      const totalNew = results.reduce((s, r) => s + r.items_new, 0)
      const totalFound = results.reduce((s, r) => s + r.items_found, 0)
      const errors = results.filter((r) => r.status === 'error')
      setSyncResult(
        `✓ ${results.length}개 소스 완료 · ${totalFound}개 확인 · ${totalNew}개 신규 저장${
          errors.length > 0 ? ` · ${errors.length}개 소스 오류` : ''
        }`
      )
      refresh()
    } catch (e) {
      setSyncResult(`✗ 오류: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setSyncing(false)
    }
  }

  const items: ExternalContent[] = data?.data ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.ceil(totalCount / LIMIT)

  const PLATFORMS: Array<{ value: ContentPlatform | undefined; label: string }> = [
    { value: undefined, label: '전체' },
    { value: 'rss', label: 'RSS' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'x', label: 'X' },
  ]

  const STATUSES: Array<{ value: VisibilityStatus | undefined; label: string }> = [
    { value: undefined, label: '전체 상태' },
    { value: 'pending', label: '대기' },
    { value: 'published', label: '공개' },
    { value: 'featured', label: '대표노출' },
    { value: 'hidden', label: '숨김' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-light text-brand-black">
            외부 콘텐츠 관리
          </h1>
          <p className="font-sans text-sm text-gray-500 mt-1">
            수집된 외부 콘텐츠를 검토하고 승인·분류합니다
          </p>
        </div>
        <button
          onClick={handleSyncAll}
          disabled={syncing}
          className="btn-primary flex items-center gap-2 px-5 py-2"
        >
          {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          전체 소스 수집 실행
        </button>
      </div>

      {syncResult && (
        <div
          className={`mb-4 p-3 text-sm font-sans border ${
            syncResult.startsWith('✓')
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {syncResult}
          <button onClick={() => setSyncResult(null)} className="ml-3 opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1">
          {PLATFORMS.map((p) => (
            <button
              key={String(p.value)}
              onClick={() => { setPlatform(p.value); setPage(1) }}
              className={`px-3 py-1.5 text-xs font-sans tracking-wider uppercase transition-colors ${
                platform === p.value
                  ? 'bg-brand-black text-white'
                  : 'bg-brand-cream text-brand-muted hover:text-brand-black'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <select
          value={status ?? ''}
          onChange={(e) => {
            setStatus((e.target.value as VisibilityStatus) || undefined)
            setPage(1)
          }}
          className="border border-gray-200 px-3 py-1.5 text-xs font-sans bg-white focus:outline-none"
        >
          {STATUSES.map((s) => (
            <option key={String(s.value)} value={s.value ?? ''}>
              {s.label}
            </option>
          ))}
        </select>

        <input
          type="search"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="제목/요약 검색..."
          className="border border-gray-200 px-3 py-1.5 text-xs font-sans focus:outline-none focus:border-brand-black w-48"
        />

        {totalCount > 0 && (
          <span className="text-xs text-gray-400 ml-auto">
            총 {totalCount.toLocaleString()}개
          </span>
        )}
      </div>

      {/* Content list */}
      {isLoading ? (
        <div className="text-center py-16">
          <Loader2 size={32} className="animate-spin mx-auto text-gray-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 text-gray-400">
          <Filter size={32} className="mx-auto mb-3 opacity-40" />
          <p className="font-sans text-sm">콘텐츠가 없습니다.</p>
          <p className="font-sans text-xs mt-1">
            소스 관리에서 소스를 추가하고 수집을 실행하세요.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              onStatusChange={handleStatusChange}
              onFeaturedChange={handleFeaturedChange}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 text-gray-400 hover:text-brand-black disabled:opacity-40"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="font-sans text-sm text-gray-500">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 text-gray-400 hover:text-brand-black disabled:opacity-40"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
