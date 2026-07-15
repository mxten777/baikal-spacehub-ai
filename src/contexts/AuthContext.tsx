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

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
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
