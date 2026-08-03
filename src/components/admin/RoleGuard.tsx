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
  const { loading, hasPermission, user, role } = useAuth();

  // auth 로딩 중이거나 user는 있지만 profile(role) 아직 조회 중 → 대기
  if (loading || (user && role === null)) return null;

  if (!hasPermission(permission)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
