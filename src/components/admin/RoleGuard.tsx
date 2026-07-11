/**
 * RoleGuard.tsx
 * Route 레벨 권한 가드
 *
 * 사용법:
 *   <RoleGuard permission="system_settings">
 *     <AdminSettingsPage />
 *   </RoleGuard>
 *
 * 권한 없는 경우 → /admin (Dashboard) 리다이렉트
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { Permission } from "../../types";

interface RoleGuardProps {
  permission: Permission;
  children: React.ReactNode;
  /** 권한 없을 때 이동할 경로 (기본: /admin) */
  redirectTo?: string;
}

export default function RoleGuard({
  permission,
  children,
  redirectTo = "/admin",
}: RoleGuardProps) {
  const { loading, hasPermission } = useAuth();

  // 프로필 로딩 중 — 빈 화면 유지 (레이아웃 깜빡임 방지)
  if (loading) return null;

  if (!hasPermission(permission)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
