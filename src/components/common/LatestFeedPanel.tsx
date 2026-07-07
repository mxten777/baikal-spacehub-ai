import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowUpRight } from 'lucide-react'

interface LatestFeedPanelProps {
  open: boolean
  onClose: () => void
}

// Static feed — replace with real data hooks when API is ready
const FEED = [
  { type: 'Program',   label: '여름 사진 워크숍',             date: '2026.07.15', href: '/programs', isNew: true,  external: false },
  { type: 'Blog',      label: '복합문화공간이란 무엇인가',     date: '2026.07.10', href: '/blog',     isNew: true,  external: false },
  { type: 'Instagram', label: '@thelit_official 최신 포스트', date: '2026.07.08', href: 'https://instagram.com/thelit_official', isNew: false, external: true },
  { type: 'Archive',   label: '2026 봄 브랜드 협업 기록',     date: '2026.07.05', href: '/archive',  isNew: false, external: false },
  { type: 'YouTube',   label: '더릿 공간 투어 영상',           date: '2026.07.03', href: '/media',    isNew: false, external: false },
  { type: 'Program',   label: '음악 퍼포먼스 나이트',          date: '2026.06.28', href: '/programs', isNew: false, external: false },
]

type FeedItem = typeof FEED[number]

function FeedRow({ item, onClose }: { item: FeedItem; onClose: () => void }) {
  const inner = (
    <>
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-sans text-[8px] tracking-[0.18em] uppercase text-brand-subtle">{item.type}</span>
          {item.isNew && (
            <span className="font-sans text-[7.5px] tracking-[0.1em] uppercase bg-rose-500 text-white px-[5px] py-[2px] leading-none">NEW</span>
          )}
        </div>
        <p className="font-sans text-[13px] text-brand-black group-hover:text-brand-accent transition-colors duration-200 truncate leading-snug">{item.label}</p>
        <p className="font-sans text-[10px] text-brand-subtle mt-1">{item.date}</p>
      </div>
      <ArrowUpRight size={12} className="shrink-0 mt-1 text-brand-line group-hover:text-brand-black transition-colors duration-200" />
    </>
  )

  const cls = 'group flex items-start py-4 border-b border-brand-line'

  return item.external ? (
    <a href={item.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
  ) : (
    <Link to={item.href} onClick={onClose} className={cls}>{inner}</Link>
  )
}

export default function LatestFeedPanel({ open, onClose }: LatestFeedPanelProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[55] bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          {/* Slide-in panel */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="최신 업데이트"
            className="fixed right-0 top-0 bottom-0 z-[56] w-full max-w-[360px] bg-white shadow-2xl flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Panel header */}
            <div className="flex items-start justify-between px-8 pt-8 pb-6 border-b border-brand-line">
              <div>
                <p className="font-sans text-[8px] tracking-[0.26em] uppercase text-brand-subtle mb-1.5">What's New</p>
                <h2 className="font-display text-xl font-light text-brand-black">Latest Updates</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center border border-brand-line text-brand-subtle hover:border-brand-border hover:text-brand-black transition-all shrink-0"
                aria-label="닫기"
              >
                <X size={13} />
              </button>
            </div>

            {/* Feed */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-8 py-2">
                {FEED.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.055, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <FeedRow item={item} onClose={onClose} />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-brand-line">
              <Link
                to="/media"
                onClick={onClose}
                className="inline-flex items-center gap-2 font-sans text-[9.5px] tracking-[0.2em] uppercase text-brand-black border-b border-brand-black pb-px hover:text-brand-accent hover:border-brand-accent transition-colors duration-200"
              >
                All Updates <ArrowUpRight size={11} />
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
