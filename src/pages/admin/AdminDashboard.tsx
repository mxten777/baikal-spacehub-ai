import { useSpaces } from "../../hooks/useData";
import { usePrograms } from "../../hooks/useData";
import { useArchive } from "../../hooks/useData";
import { useInquiries } from "../../hooks/useData";
import { useBlogPosts } from "../../hooks/useData";
import { useExternalContentStats } from "../../hooks/useData";
import { useHeroSlides } from "../../hooks/useData";
import { useAuth } from "../../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { reservationsService } from "../../services/reservations";
import { isSupabaseConfigured } from "../../lib/supabase";
import {
  Image,
  Calendar,
  Archive,
  MessageSquare,
  FileText,
  TrendingUp,
  Globe2,
  SlidersHorizontal,
  Info,
} from "lucide-react";
import { Link } from "react-router-dom";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  href: string;
  color?: string;
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
  color = "bg-brand-black",
}: StatCardProps) {
  const iconBg =
    typeof value === "number" && value === 0 ? "bg-gray-300" : color;
  return (
    <Link
      to={href}
      className="group block bg-white rounded-none border border-gray-200 p-6 hover:border-brand-black transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 ${iconBg} flex items-center justify-center`}>
          <Icon size={18} className="text-white" />
        </div>
        <TrendingUp
          size={16}
          className="text-gray-400 group-hover:text-brand-black transition-colors"
        />
      </div>
      <p className="font-sans text-3xl font-light text-brand-black mb-1">
        {value}
      </p>
      <p className="font-sans text-xs text-gray-500 tracking-widest uppercase">
        {label}
      </p>
    </Link>
  );
}

export default function AdminDashboard() {
  const { data: spaces } = useSpaces();
  const { data: programs } = usePrograms();
  const { data: archives } = useArchive();
  const { data: inquiries } = useInquiries({ status: "pending" });
  const { data: blogResult } = useBlogPosts({ limit: 1 });
  const { data: extStats } = useExternalContentStats();
  const { data: heroSlides } = useHeroSlides();
  const { data: newReservations } = useQuery({
    queryKey: ["reservations", { status: "new" }],
    queryFn: () => reservationsService.getAll({ status: "new" }),
    staleTime: 1 * 60 * 1000,
    enabled: isSupabaseConfigured,
  });
  const { isSuperAdmin } = useAuth();

  const pendingExternal =
    extStats?.reduce((sum, s) => sum + (s.pending ?? 0), 0) ?? 0;

  const superAdminStats = isSuperAdmin
    ? [
        {
          icon: SlidersHorizontal,
          label: "Hero 슬라이드",
          value: heroSlides?.length ?? 0,
          href: "/admin/hero",
          color: "bg-indigo-600",
        },
      ]
    : [];

  const stats = [
    ...superAdminStats,
    {
      icon: Image,
      label: "공간",
      value: spaces?.length ?? 0,
      href: "/admin/spaces",
      color: "bg-blue-600",
    },
    {
      icon: Calendar,
      label: "프로그램",
      value: programs?.length ?? 0,
      href: "/admin/programs",
      color: "bg-purple-600",
    },
    {
      icon: Archive,
      label: "아카이브",
      value: archives?.length ?? 0,
      href: "/admin/archive",
      color: "bg-orange-500",
    },
    {
      icon: FileText,
      label: "블로그",
      value: blogResult?.count ?? 0,
      href: "/admin/blog",
      color: "bg-green-600",
    },
  ];

  const visibleStats = stats;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-light text-brand-black">
          Dashboard
        </h1>
        <p className="font-sans text-sm text-gray-500 mt-1">
          The Lit 관리자 대시보드
        </p>
      </div>

      {/* ── 오늘 할 일 (My Work) ── */}
      <div className="mb-10">
        <h2 className="font-sans text-sm font-semibold text-brand-black tracking-wider uppercase mb-4">
          오늘 할 일
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 신규 문의 */}
          <Link
            to="/admin/inquiries"
            className="flex items-center gap-4 bg-white border border-gray-200 p-5 hover:border-brand-black transition-colors"
          >
            <div
              className={`w-10 h-10 flex items-center justify-center shrink-0 ${(inquiries?.length ?? 0) > 0 ? "bg-red-500" : "bg-gray-300"}`}
            >
              <MessageSquare size={16} className="text-white" />
            </div>
            <div>
              <p className="font-sans text-2xl font-light text-brand-black">
                {inquiries?.length ?? 0}
              </p>
              <p className="font-sans text-xs text-gray-500 tracking-widest uppercase">
                신규 문의
              </p>
            </div>
          </Link>

          {/* 신규 예약 */}
          <Link
            to="/admin/reservations"
            className="flex items-center gap-4 bg-white border border-gray-200 p-5 hover:border-brand-black transition-colors"
          >
            <div
              className={`w-10 h-10 flex items-center justify-center shrink-0 ${(newReservations?.length ?? 0) > 0 ? "bg-teal-600" : "bg-gray-300"}`}
            >
              <Calendar size={16} className="text-white" />
            </div>
            <div>
              <p className="font-sans text-2xl font-light text-brand-black">
                {newReservations?.length ?? 0}
              </p>
              <p className="font-sans text-xs text-gray-500 tracking-widest uppercase">
                신규 예약
              </p>
            </div>
          </Link>

          {/* 승인 대기 콘텐츠 — super_admin, 건수 있을 때만 표시 */}
          {isSuperAdmin && pendingExternal > 0 && (
            <Link
              to="/admin/external"
              className="flex items-center gap-4 bg-white border border-gray-200 p-5 hover:border-brand-black transition-colors"
            >
              <div className="w-10 h-10 bg-amber-500 flex items-center justify-center shrink-0">
                <Globe2 size={16} className="text-white" />
              </div>
              <div>
                <p className="font-sans text-2xl font-light text-brand-black">
                  {pendingExternal}
                </p>
                <p className="font-sans text-xs text-gray-500 tracking-widest uppercase">
                  승인 대기 콘텐츠
                </p>
              </div>
            </Link>
          )}
          {/* 최근 오류 — 데이터 없음, 숨김 */}
        </div>
      </div>

      {/* ── 주요 현황 (Statistics) ── */}
      <div className="mb-10">
        <h2 className="font-sans text-sm font-semibold text-brand-black tracking-wider uppercase mb-4">
          주요 현황
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>

      {/* ── 빠른 작업 / 최근 활동 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="font-sans text-sm font-semibold text-brand-black tracking-wider uppercase mb-4">
            빠른 작업
          </h2>
          <div className="space-y-3">
            {[
              {
                label: "프로그램 추가",
                href: "/admin/programs",
                icon: Calendar,
              },
              {
                label: "블로그 추가",
                href: "/admin/blog",
                icon: FileText,
              },
              { label: "공간 추가", href: "/admin/spaces", icon: Image },
              {
                label: "문의 관리",
                href: "/admin/inquiries",
                icon: MessageSquare,
              },
              ...(isSuperAdmin
                ? [
                    {
                      label: "Hero 슬라이드 편집",
                      href: "/admin/hero",
                      icon: SlidersHorizontal,
                    },
                    {
                      label: "About 페이지 편집",
                      href: "/admin/about",
                      icon: Info,
                    },
                    {
                      label: "콘텐츠 소스 관리",
                      href: "/admin/content-sources",
                      icon: Globe2,
                    },
                  ]
                : []),
            ].map((action) => (
              <Link
                key={action.label}
                to={action.href}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-sm font-sans text-gray-700 hover:text-brand-black"
              >
                <action.icon size={16} className="text-brand-muted" />
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── 최근 활동 ── */}
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans text-sm font-semibold text-brand-black tracking-wider uppercase">
              최근 활동
            </h2>
            <Link
              to="/admin/inquiries"
              className="text-xs text-brand-accent hover:underline"
            >
              전체 보기
            </Link>
          </div>
          {inquiries && inquiries.length > 0 ? (
            <div className="space-y-3">
              {inquiries.slice(0, 5).map((inq) => (
                <Link
                  key={inq.id}
                  to="/admin/inquiries"
                  className="block p-3 bg-gray-50 hover:bg-brand-cream transition-colors"
                >
                  <p className="font-sans text-sm font-medium text-brand-black">
                    {inq.name}
                  </p>
                  <p className="font-sans text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {inq.subject}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="font-sans text-sm text-gray-400">
              대기 중인 문의가 없습니다
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
