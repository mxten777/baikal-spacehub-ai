import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Image,
  Images,
  Calendar,
  Archive,
  FileText,
  Video,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  Rss,
  Globe2,
  UserCircle2,
  CalendarCheck,
  MonitorPlay,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Hero 슬라이드", href: "/admin/hero", icon: MonitorPlay },
  { label: "About 페이지", href: "/admin/about", icon: UserCircle2 },
  { label: "Spaces", href: "/admin/spaces", icon: Image },
  { label: "Programs", href: "/admin/programs", icon: Calendar },
  { label: "Archive", href: "/admin/archive", icon: Archive },
  { label: "Blog", href: "/admin/blog", icon: FileText },
  { label: "Media", href: "/admin/media", icon: Video },
  { label: "콘텐츠 소스", href: "/admin/content-sources", icon: Rss },
  { label: "외부 콘텐츠", href: "/admin/external-content", icon: Globe2 },
  { label: "예약 관리", href: "/admin/reservations", icon: CalendarCheck },
  { label: "AI 사진 큐레이터", href: "/admin/photo-curator", icon: Images },
  { label: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // md+(768px) 이상에서는 사이드바 기본 열림
  useEffect(() => {
    const checkWidth = () => setSidebarOpen(window.innerWidth >= 768);
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const emailDisplay = user?.email ?? "";
  const emailShort =
    emailDisplay.length > 20 ? emailDisplay.slice(0, 18) + "…" : emailDisplay;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile backdrop overlay — closes sidebar on tap */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar
          Mobile: slides in/out via translate-x (w-60 always), backdrop behind
          Desktop (md+): translate-x-0 always; w-16 collapsed or w-60 expanded */}
      <aside
        className={`fixed left-0 top-0 h-full z-30 bg-brand-black text-white transition-all duration-300 overflow-hidden
          ${
            sidebarOpen
              ? "w-60 translate-x-0"
              : "-translate-x-full md:translate-x-0 w-60 md:w-16"
          }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          {sidebarOpen && (
            <Link
              to="/"
              className="font-display text-lg font-light tracking-wider text-white"
            >
              The Lit
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-white/60 hover:text-white transition-colors ml-auto"
            aria-label="사이드바 닫기"
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="py-4">
          {adminNav.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.exact}
              onClick={() => {
                if (window.innerWidth < 768) setSidebarOpen(false);
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm font-sans transition-colors duration-150
                ${
                  isActive
                    ? "bg-brand-accent/20 text-brand-accent border-r-2 border-brand-accent"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <item.icon size={18} className="shrink-0" />
              {sidebarOpen && (
                <span className="tracking-wide">{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User info + Logout */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10">
          {sidebarOpen && user && (
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <UserCircle2 size={16} className="shrink-0 text-brand-accent" />
              <span
                className="text-xs text-white/70 truncate"
                title={emailDisplay}
              >
                {emailShort}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-4 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut size={18} className="shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content
          Mobile: ml-0 항상 (사이드바가 오버레이로 처리됨)
          Desktop (md+): ml-16 collapsed / ml-60 expanded */}
      <div
        className={`flex-1 transition-all duration-300 min-w-0 ${sidebarOpen ? "md:ml-60" : "md:ml-16"}`}
      >
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 sm:px-6 sticky top-0 z-10">
          {/* 햄버거 버튼 — 모바일에서 항상 표시, 데스크탑에서도 토글 용도 */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 mr-3 -ml-1 text-gray-500 hover:text-gray-900 transition-colors rounded"
            aria-label="메뉴 열기/닫기"
          >
            <Menu size={20} />
          </button>

          {user && (
            <div className="flex items-center gap-2 text-sm text-gray-500 min-w-0">
              <UserCircle2 size={16} className="shrink-0 text-brand-accent" />
              <span className="font-sans truncate hidden sm:block">
                {user.email}
              </span>
            </div>
          )}
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors ml-auto shrink-0"
          >
            View Site
            <X size={14} className="rotate-45" />
          </Link>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
