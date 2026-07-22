/**
 * AuthContext.tsx
 * 앱 전체에서 인증 상태를 공유하는 Context
 *
 * - 프로필/role 조회를 앱 마운트 시 1회만 수행
 * - RoleGuard, AdminLayout 등이 동일 상태를 재사용하므로
 *   메뉴 클릭 시 blank 화면 현상이 발생하지 않음
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import {
  isSuperAdmin as checkSuperAdmin,
  isOperator as checkOperator,
  hasPermission as checkPermission,
} from "../lib/permissions";
import type { AdminRole, Permission, Profile } from "../types";

// ── Context shape ───────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  role: AdminRole | null;
  loading: boolean;
  isSuperAdmin: boolean;
  isOperator: boolean;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data ?? null);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;

        if (error) {
          // 만료·손상된 세션 — 네트워크 없이 로컬 스토리지만 제거 후 비인증 상태로 진행
          // scope:'local' 은 서버 API 호출 없이 localStorage 토큰만 삭제한다.
          await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
          setUser(null);
          setProfile(null);
          return;
        }

        const currentUser = data.session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          try {
            await fetchProfile(currentUser.id);
          } catch {
            // 프로필 조회 실패 — 인증 자체는 유지하되 프로필 없음으로 처리
            setProfile(null);
          }
        }
      } catch {
        if (!mounted) return;
        // Auth 초기화 예외 — 비인증 상태로 진행
        setUser(null);
        setProfile(null);
      } finally {
        // 성공·오류·예외 어느 경우에도 반드시 loading 종료
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // INITIAL_SESSION은 initAuth()가 이미 처리 — 중복 profiles 조회 방지
      if (event === 'INITIAL_SESSION') return;
      if (!mounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      try {
        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          setProfile(null);
        }
      } catch {
        setProfile(null);
      } finally {
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const role = profile?.role ?? null;

  const value: AuthContextValue = {
    user,
    profile,
    role,
    loading,
    isSuperAdmin: checkSuperAdmin(role),
    isOperator: checkOperator(role),
    hasPermission: (permission: Permission) =>
      checkPermission(role, permission),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Consumer hook ───────────────────────────────────────────

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within <AuthProvider>");
  }
  return ctx;
}
