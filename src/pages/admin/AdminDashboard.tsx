import { useSpaces } from "../../hooks/useData";
import { usePrograms } from "../../hooks/useData";
import { useArchive } from "../../hooks/useData";
import { useInquiries } from "../../hooks/useData";
import { useBlogPosts } from "../../hooks/useData";
import { useExternalContentStats } from "../../hooks/useData";
import { useHeroSlides } from "../../hooks/useData";
import { useAuth } from "../../hooks/useAuth";
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
  return (
    <Link
      to={href}
      className="group block bg-white rounded-none border border-gray-200 p-6 hover:border-brand-black transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 ${color} flex items-center justify-center`}>
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
        {
          icon: Info,
          label: "About 페이지",
          value: "편집",
          href: "/admin/about",
          color: "bg-teal-600",
        },
      ]
    : [];

  const stats = [
    ...superAdminStats,
    {
      icon: Image,
      label: "Spaces",
      value: spaces?.length ?? 0,
      href: "/admin/spaces",
      color: "bg-blue-600",
    },
    {
      icon: Calendar,
      label: "Programs",
      value: programs?.length ?? 0,
      href: "/admin/programs",
      color: "bg-purple-600",
    },
    {
      icon: Archive,
      label: "Archive",
      value: archives?.length ?? 0,
      href: "/admin/archive",
      color: "bg-orange-500",
    },
    {
      icon: FileText,
      label: "Blog Posts",
      value: blogResult?.count ?? 0,
      href: "/admin/blog",
      color: "bg-green-600",
    },
    {
      icon: MessageSquare,
      label: "Pending Inquiries",
      value: inquiries?.length ?? 0,
      href: "/admin/inquiries",
      color: "bg-red-500",
    },
    {
      icon: Globe2,
      label: "Pending Content",
      value: pendingExternal,
      href: "/admin/external-content",
      color: pendingExternal > 0 ? "bg-amber-500" : "bg-gray-400",
    },
  ];

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

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="font-sans text-sm font-semibold text-brand-black tracking-wider uppercase mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            {[
              {
                label: "New Program",
                href: "/admin/programs/new",
                icon: Calendar,
              },
              {
                label: "New Blog Post",
                href: "/admin/blog/new",
                icon: FileText,
              },
              { label: "New Space", href: "/admin/spaces/new", icon: Image },
              {
                label: "View Inquiries",
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
                      label: "Content Sources",
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

        {/* Recent inquiries preview */}
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans text-sm font-semibold text-brand-black tracking-wider uppercase">
              Pending Inquiries
            </h2>
            <Link
              to="/admin/inquiries"
              className="text-xs text-brand-accent hover:underline"
            >
              View all
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
