/**
 * 페이지 캡처 설정 파일
 * URL 목록과 캡처 옵션을 여기서 수정할 수 있습니다.
 */

export interface PageConfig {
  /** URL 경로 (baseUrl 기준 상대 경로) */
  path: string;
  /** 저장 파일명 (확장자 제외) */
  filename: string;
}

export interface CaptureConfig {
  /** 캡처 대상 사이트 기본 URL */
  baseUrl: string;
  /** 사이트 식별자 (폴더명 및 PDF명에 사용) */
  siteName: string;
  /** 뷰포트 너비 */
  viewportWidth: number;
  /** 뷰포트 높이 */
  viewportHeight: number;
  /** 페이지 로딩 대기 시간 (ms) */
  waitAfterLoad: number;
  /** 스크롤 단계당 이동 픽셀 */
  scrollStep: number;
  /** 스크롤 단계 간 대기 시간 (ms) */
  scrollDelay: number;
  /** 캡처 대상 페이지 목록 */
  pages: PageConfig[];
}

export const defaultConfig: CaptureConfig = {
  baseUrl: "https://baikal-spacehub-ai.vercel.app",
  siteName: "thelit",
  viewportWidth: 1440,
  viewportHeight: 1000,
  waitAfterLoad: 5000,
  scrollStep: 600,
  scrollDelay: 150,
  pages: [
    { path: "/", filename: "01-home" },
    { path: "/about", filename: "02-about" },
    { path: "/spaces", filename: "03-spaces" },
    { path: "/programs", filename: "04-programs" },
    { path: "/archive", filename: "05-archive" },
    { path: "/blog", filename: "06-blog" },
    { path: "/media", filename: "07-media" },
    { path: "/contact", filename: "08-contact" },
    { path: "/wedding", filename: "09-wedding" },
    { path: "/contact?type=wedding", filename: "10-contact-wedding" },
  ],
};

export const adminPages: PageConfig[] = [
  { path: "/admin", filename: "admin-01-dashboard" },
  { path: "/admin/hero", filename: "admin-02-hero" },
  { path: "/admin/spaces", filename: "admin-03-spaces" },
  { path: "/admin/programs", filename: "admin-04-programs" },
  { path: "/admin/archive", filename: "admin-05-archive" },
  { path: "/admin/blog", filename: "admin-06-blog" },
  { path: "/admin/media", filename: "admin-07-media" },
  { path: "/admin/content-sources", filename: "admin-08-content-sources" },
  { path: "/admin/external-content", filename: "admin-09-external-content" },
  { path: "/admin/reservations", filename: "admin-10-reservations" },
  { path: "/admin/photo-curator", filename: "admin-11-photo-curator" },
  { path: "/admin/inquiries", filename: "admin-12-inquiries" },
  { path: "/admin/settings", filename: "admin-13-settings" },
];
