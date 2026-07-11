/**
 * useAuth.ts
 * 인증 상태 + 프로필(role) 통합 Hook
 *
 * 반환값:
 *   user         — Supabase Auth 사용자
 *   profile      — profiles 테이블 (role 포함)
 *   role         — AdminRole ('super_admin' | 'operator' | 'viewer')
 *   loading      — 초기 로딩 여부
 *   isSuperAdmin — super_admin 여부
 *   isOperator   — operator 이상 여부
 *   hasPermission(p) — 특정 권한 보유 여부
 */

import { useState, useEffect, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import {
  isSuperAdmin as checkSuperAdmin,
  isOperator as checkOperator,
  hasPermission as checkPermission,
} from "../lib/permissions";
import type { AdminRole, Permission, Profile } from "../types";

interface UseAuthReturn {
  user: User | null;
  profile: Profile | null;
  role: AdminRole | null;
  loading: boolean;
  isSuperAdmin: boolean;
  isOperator: boolean;
  hasPermission: (permission: Permission) => boolean;
}

export function useAuth(): UseAuthReturn {
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

  return {
    user,
    profile,
    role,
    loading,
    isSuperAdmin: checkSuperAdmin(role),
    isOperator: checkOperator(role),
    hasPermission: (permission: Permission) =>
      checkPermission(role, permission),
  };
}
