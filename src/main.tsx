import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { queryClient } from "./lib/queryClient.ts";
import { heroSlidesService } from "./services/heroSlides.ts";

// 배포 버전 확인 (브라우저 콘솔: [The Lit] v2026-07-29)
console.info(`[The Lit] v${__APP_VERSION__}`);

// ── 첫 방문 성능 최적화 ────────────────────────────────────────────────────
// preconnect는 index.html에서 처리 — JS 실행 전 TCP/TLS 핸드셰이크 시작
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;

// Hero 슬라이드만 선행 prefetch — React 렌더 전 최단 경로로 네트워크 요청 시작
//    나머지 홈 데이터(Spaces, Archive, Media, Photos)는 컴포넌트 마운트 후 자체 요청
if (supabaseUrl && import.meta.env.VITE_SUPABASE_ANON_KEY) {
  queryClient.prefetchQuery({
    queryKey: ["hero-slides", "active"],
    queryFn: () => heroSlidesService.getActive(),
    staleTime: 10 * 60 * 1000,
  });
}
// ─────────────────────────────────────────────────────────────────────────────

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
