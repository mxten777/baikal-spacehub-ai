import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { ROLE_LABELS } from "../../lib/permissions";
import type { Profile, AdminRole } from "../../types";
import {
  Users,
  Shield,
  Check,
  Loader2,
  UserCircle2,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";

const ROLE_OPTIONS: { value: AdminRole; label: string; desc: string }[] = [
  {
    value: "super_admin",
    label: ROLE_LABELS["super_admin"],
    desc: "전체 시스템 관리 (바이칼시스템즈 전용)",
  },
  {
    value: "operator",
    label: ROLE_LABELS["operator"],
    desc: "콘텐츠 운영 전용 (더릿 운영자)",
  },
  {
    value: "viewer",
    label: ROLE_LABELS["viewer"],
    desc: "읽기 전용",
  },
];

const ROLE_BADGE: Record<AdminRole, string> = {
  super_admin: "bg-brand-accent/20 text-brand-accent",
  operator: "bg-blue-100 text-blue-700",
  viewer: "bg-gray-100 text-gray-500",
};

async function fetchProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

async function updateRole(id: string, role: AdminRole): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfiles()
      .then(setProfiles)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (profile: Profile, newRole: AdminRole) => {
    if (profile.role === newRole) return;
    if (profile.id === currentUser?.id && newRole !== "super_admin") {
      if (
        !confirm(
          "자신의 권한을 낮추면 이 페이지에 접근할 수 없게 됩니다. 계속하시겠습니까?",
        )
      )
        return;
    }
    setSavingId(profile.id);
    setError(null);
    try {
      await updateRole(profile.id, newRole);
      setProfiles((prev) =>
        prev.map((p) => (p.id === profile.id ? { ...p, role: newRole } : p)),
      );
      setSavedId(profile.id);
      setTimeout(() => setSavedId(null), 2000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "역할 변경에 실패했습니다.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={16} className="text-brand-accent" />
          <h1 className="font-display text-2xl font-light text-brand-black">
            사용자 관리
          </h1>
        </div>
        <p className="font-sans text-sm text-gray-500 mt-1">
          공급자 전용 — 관리자 계정 목록과 역할(Role)을 관리합니다.
        </p>
      </div>

      {/* 신규 사용자 초대 안내 */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <UserCircle2 size={18} className="text-blue-600 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="font-sans text-sm font-medium text-blue-800 mb-1">
              신규 사용자 초대
            </p>
            <p className="font-sans text-sm text-blue-700 mb-2">
              Supabase 대시보드에서 이메일로 초대 링크를 발송합니다. 초대받은
              사용자가 비밀번호를 설정하면 자동으로 <strong>operator</strong>{" "}
              역할로 등록됩니다.
            </p>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-900 underline underline-offset-2"
            >
              Supabase Dashboard → Authentication → Users → Invite user
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          <AlertTriangle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      {/* User list */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <Users size={15} className="text-gray-400" />
          <span className="font-sans text-sm font-medium text-gray-700">
            등록된 사용자
          </span>
          {!loading && (
            <span className="ml-auto font-sans text-xs text-gray-400">
              {profiles.length}명
            </span>
          )}
        </div>

        {loading ? (
          <ul className="divide-y divide-gray-100">
            {Array.from({ length: 3 }, (_, i) => (
              <li key={i} className="px-4 py-4 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 animate-pulse rounded w-48" />
                  <div className="h-2 bg-gray-100 animate-pulse rounded w-32" />
                </div>
                <div className="h-6 w-16 bg-gray-100 animate-pulse rounded shrink-0" />
                <div className="h-8 w-28 bg-gray-100 animate-pulse rounded shrink-0" />
              </li>
            ))}
          </ul>
        ) : profiles.length === 0 ? (
          <div className="py-12 text-center font-sans text-sm text-gray-400">
            등록된 사용자가 없습니다.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {profiles.map((profile) => {
              const isCurrentUser = profile.id === currentUser?.id;
              const isSaving = savingId === profile.id;
              const isSaved = savedId === profile.id;

              return (
                <li
                  key={profile.id}
                  className="px-4 py-4 flex items-center gap-4 flex-wrap sm:flex-nowrap"
                >
                  {/* Avatar & info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                      <UserCircle2 size={18} className="text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className="font-sans text-sm text-gray-900 truncate"
                        title={profile.email}
                      >
                        {profile.email}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-gray-400">
                            (나)
                          </span>
                        )}
                      </p>
                      {profile.full_name && (
                        <p className="font-sans text-xs text-gray-400 truncate">
                          {profile.full_name}
                        </p>
                      )}
                      <p className="font-sans text-xs text-gray-300 mt-0.5">
                        가입:{" "}
                        {new Date(profile.created_at).toLocaleDateString(
                          "ko-KR",
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Current role badge */}
                  <span
                    className={`shrink-0 text-xs font-medium px-2 py-1 rounded ${ROLE_BADGE[profile.role]}`}
                  >
                    {ROLE_LABELS[profile.role] ?? profile.role}
                  </span>

                  {/* Role selector */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={profile.role}
                      onChange={(e) =>
                        handleRoleChange(profile, e.target.value as AdminRole)
                      }
                      disabled={isSaving}
                      className="font-sans text-sm border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-brand-accent disabled:opacity-50"
                    >
                      {ROLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    {isSaving && (
                      <Loader2
                        size={16}
                        className="animate-spin text-gray-400"
                      />
                    )}
                    {isSaved && !isSaving && (
                      <Check size={16} className="text-green-500" />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Role legend */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="font-sans text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">
          역할 안내
        </p>
        <ul className="space-y-2">
          {ROLE_OPTIONS.map((opt) => (
            <li key={opt.value} className="flex items-start gap-2">
              <span
                className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded mt-0.5 ${ROLE_BADGE[opt.value]}`}
              >
                {opt.label}
              </span>
              <span className="font-sans text-xs text-gray-500">
                {opt.desc}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
