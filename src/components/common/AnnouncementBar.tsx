import { Link } from "react-router-dom";

export default function AnnouncementBar() {
  return (
    <div className="relative z-10 bg-stone-100 border-b border-stone-200">
      {/* ── Mobile (< lg): 2줄 중앙 정렬, 문의하기 숨김 ─────────────── */}
      <div className="lg:hidden flex flex-col items-center justify-center py-[9px] px-5 gap-[3px] text-center">
        <p className="text-[11px] text-stone-700 leading-tight tracking-[0.01em]">
          ✨ 홈페이지 리뉴얼 중
        </p>
        <p className="text-[9px] font-medium text-stone-500 leading-tight tracking-[0.1em] uppercase">
          Website Renewal in Progress
        </p>
      </div>

      {/* ── Desktop (lg+): 1줄, 문의하기 버튼 표시 ─────────────────── */}
      <div className="hidden lg:flex container-wide items-center justify-between h-11">
        <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
          <span className="text-[11px] text-stone-600 leading-tight whitespace-nowrap">
            ✨ THE LIT 홈페이지 리뉴얼 중입니다.
          </span>
          <span className="text-stone-300 shrink-0" aria-hidden="true">·</span>
          <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-stone-500 whitespace-nowrap">
            Website Renewal in Progress
          </span>
          <span className="text-stone-300 shrink-0 hidden xl:inline" aria-hidden="true">·</span>
          <span className="hidden xl:inline text-[10.5px] text-stone-500 truncate">
            더 나은 공간과 프로그램으로 곧 정식 오픈합니다.
          </span>
        </div>
        <Link
          to="/contact"
          className="shrink-0 ml-4 text-[10px] font-medium tracking-[0.12em] uppercase text-stone-700 border border-stone-300 px-3 py-1 hover:bg-stone-200 transition-colors duration-150"
        >
          문의하기
        </Link>
      </div>
    </div>
  );
}
