/**
 * permissions.ts
 * 권한 정의 및 체크 유틸리티
 *
 * 구조:
 *   super_admin (바이칼시스템즈) — 전체 시스템 관리
 *   operator    (THE LIT 운영자) — 콘텐츠 운영 전용
 *   viewer                       — 읽기 전용 (추후 확장용)
 */

import type { AdminRole, Permission } from "../types";

// ── 역할별 허용 권한 ─────────────────────────────────────

const SUPER_ADMIN_PERMISSIONS: Permission[] = [
  "dashboard",
  "spaces",
  "programs",
  "archive",
  "blog",
  "media",
  "inquiries",
  "operator_settings",
  "hero",
  "about",
  "system_settings",
  "storage",
  "users",
  "security",
  "backup",
  // Phase 2 예정 (미리 정의)
  "content_sources",
  "external_content",
  "reservations",
  "photo_curator",
  "photo_projects",
  "wedding_photos",
];

const OPERATOR_PERMISSIONS: Permission[] = [
  "dashboard",
  "spaces",
  "programs",
  "archive",
  "blog",
  "media",
  "inquiries",
  "reservations",
  "photo_curator",
  "wedding_photos",
  "operator_settings",
];

const VIEWER_PERMISSIONS: Permission[] = ["dashboard"];

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: SUPER_ADMIN_PERMISSIONS,
  operator: OPERATOR_PERMISSIONS,
  viewer: VIEWER_PERMISSIONS,
};

// ── 역할 우선순위 ─────────────────────────────────────────

const ROLE_RANK: Record<AdminRole, number> = {
  super_admin: 3,
  operator: 2,
  viewer: 1,
};

// ── 유틸리티 함수 ─────────────────────────────────────────

/** 해당 role이 super_admin인지 확인 */
export function isSuperAdmin(role: AdminRole | null | undefined): boolean {
  return role === "super_admin";
}

/** 해당 role이 operator 이상인지 확인 (super_admin 포함) */
export function isOperator(role: AdminRole | null | undefined): boolean {
  if (!role) return false;
  return ROLE_RANK[role] >= ROLE_RANK["operator"];
}

/** 특정 권한 보유 여부 확인 */
export function hasPermission(
  role: AdminRole | null | undefined,
  permission: Permission,
): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/** 요구 role 이상인지 확인 */
export function hasMinRole(
  role: AdminRole | null | undefined,
  required: AdminRole,
): boolean {
  if (!role) return false;
  return ROLE_RANK[role] >= ROLE_RANK[required];
}

/** role 표시 레이블 */
export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "시스템 관리자",
  operator: "운영자",
  viewer: "조회자",
};
