import { Link } from "react-router-dom";

export default function AnnouncementBar() {
  return (
    <div className="relative z-10 bg-stone-100 border-b border-stone-200">
      <div className="container-wide flex items-center justify-between h-9 gap-4">
        <p className="text-[11px] text-stone-600 leading-tight min-w-0">
          <span className="mr-1">✨</span>
          <span className="hidden sm:inline">
            THE LIT는 현재 리뉴얼(Soft Opening) 기간입니다.&nbsp;&nbsp;콘텐츠와
            프로그램이 순차적으로 업데이트되고 있습니다.
          </span>
          <span className="sm:hidden">THE LIT 리뉴얼(Soft Opening) 진행 중</span>
        </p>
        <Link
          to="/contact"
          className="shrink-0 text-[10px] font-medium tracking-[0.12em] uppercase text-stone-700 border border-stone-300 px-3 py-1 hover:bg-stone-200 transition-colors duration-150"
        >
          문의하기
        </Link>
      </div>
    </div>
  );
}
