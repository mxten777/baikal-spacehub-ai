import { Outlet, NavLink, Link } from "react-router-dom";
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
  Users,
  CalendarCheck,
  MonitorPlay,
  SlidersHorizontal,
  FolderKanban,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useAuth } from "../hooks/useAuth";
import type { Permission } from "../types";
import { ROLE_LABELS } from "../lib/permissions";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
  permission: Permission;
}

// operator 메뉴 (THE LIT 운영자)
const operatorNav: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
    permission: "dashboard",
  },
  { label: "Spaces", href: "/admin/spaces", icon: Image, permission: "spaces" },
  {
    label: "Programs",
    href: "/admin/programs",
    icon: Calendar,
    permission: "programs",
  },
  {
    label: "Archive",
    href: "/admin/archive",
    icon: Archive,
    permission: "archive",
  },
  { label: "Blog", href: "/admin/blog", icon: FileText, permission: "blog" },
  { label: "Media", href: "/admin/media", icon: Video, permission: "media" },
  {
    label: "Inquiries",
    href: "/admin/inquiries",
    icon: MessageSquare,
    permission: "inquiries",
  },
  {
    label: "운영 정보",
    href: "/admin/operator-settings",
    icon: SlidersHorizontal,
    permission: "operator_settings",
  },
];

// super_admin 전용 추가 메뉴 (바이칼시스템즈)
const superAdminNav: NavItem[] = [
  {
    label: "Hero 슬라이드",
    href: "/admin/hero",
    icon: MonitorPlay,
    permission: "hero",
  },
  {
    label: "About 페이지",
    href: "/admin/about",
    icon: UserCircle2,
    permission: "about",
  },
  {
    label: "시스템 설정",
    href: "/admin/settings",
    icon: Settings,
    permission: "system_settings",
  },
  {
    label: "사용자 관리",
    href: "/admin/users",
    icon: Users,
    permission: "users",
  },
  // Phase 2 예정 (super_admin에게만 노출)
  {
    label: "콘텐츠 소스",
    href: "/admin/content-sources",
    icon: Rss,
    permission: "content_sources",
  },
  {
    label: "외부 콘텐츠",
    href: "/admin/external-content",
    icon: Globe2,
    permission: "external_content",
  },
  {
    label: "예약 관리",
    href: "/admin/reservations",
    icon: CalendarCheck,
    permission: "reservations",
  },
  {
    label: "이미지 자산 관리",
    href: "/admin/photo-projects",
    icon: FolderKanban,
    permission: "photo_projects",
  },
  {
    label: "AI 사진 큐레이터",
    href: "/admin/photo-curator",
    icon: Images,
    permission: "photo_curator",
  },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { role, isSuperAdmin, hasPermission } = useAuth();

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
    try {
      // scope: 'local' — 네트워크 오류와 무관하게 로컬 세션을 즉시 삭제
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      // 에러 무시 — 로컬 세션은 이미 삭제됨
    } finally {
      // SPA navigate 대신 full reload: React 세션 상태까지 완전 초기화
      window.location.href = '/admin/login';
    }
  };

  const emailDisplay = user?.email ?? "";
  const emailShort =
    emailDisplay.length > 20 ? emailDisplay.slice(0, 18) + "…" : emailDisplay;

  // role 기반 nav 조합: operator 메뉴 + super_admin 추가 메뉴
  const visibleNav = [
    ...operatorNav.filter((item) => hasPermission(item.permission)),
    ...(isSuperAdmin ? superAdminNav : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
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
        className={`fixed left-0 top-0 h-full z-30 bg-brand-black text-white transition-all duration-300 flex flex-col overflow-hidden
          ${
            sidebarOpen
              ? "w-60 translate-x-0"
              : "-translate-x-full md:translate-x-0 w-60 md:w-16"
          }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 shrink-0">
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
        <nav className="flex-1 overflow-y-auto py-4">
          {visibleNav.map((item) => (
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
        <div className="shrink-0 border-t border-white/10">
          {sidebarOpen && user && (
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <UserCircle2 size={16} className="shrink-0 text-brand-accent" />
              <div className="min-w-0">
                <span
                  className="text-xs text-white/70 truncate block"
                  title={emailDisplay}
                >
                  {emailShort}
                </span>
                {role && (
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded mt-0.5 inline-block ${
                      role === "super_admin"
                        ? "bg-brand-accent/20 text-brand-accent"
                        : "bg-white/10 text-white/50"
                    }`}
                  >
                    {ROLE_LABELS[role]}
                  </span>
                )}
              </div>
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
