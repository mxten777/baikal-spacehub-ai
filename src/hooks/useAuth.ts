/**
 * useAuth.ts
 * 인증 상태 + 프로필(role) 통합 Hook
 *
 * AuthContext에서 상태를 읽어 반환합니다.
 * 앱 전체에서 동일한 인스턴스를 공유하므로
 * 메뉴 클릭 시 중복 네트워크 호출이 발생하지 않습니다.
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

export { useAuthContext as useAuth } from "../contexts/AuthContext";
