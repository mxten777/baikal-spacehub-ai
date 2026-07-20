import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { queryClient } from './lib/queryClient.ts'
import { heroSlidesService } from './services/heroSlides.ts'

// ── 첫 방문 성능 최적화 ────────────────────────────────────────────────────
// 1) Supabase에 preconnect 링크를 DOM에 삽입 (TCP/TLS 핸드셰이크 조기 시작)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
if (supabaseUrl) {
  const link = document.createElement('link')
  link.rel = 'preconnect'
  link.href = supabaseUrl
  document.head.appendChild(link)
}

// 2) React 트리 렌더링 전에 hero slides 요청을 미리 시작
//    (컴포넌트 마운트를 기다리지 않고 네트워크 요청 선행)
if (supabaseUrl && import.meta.env.VITE_SUPABASE_ANON_KEY) {
  queryClient.prefetchQuery({
    queryKey: ['hero-slides', 'active'],
    queryFn: () => heroSlidesService.getActive(),
    staleTime: 10 * 60 * 1000,
  })
}
// ─────────────────────────────────────────────────────────────────────────────

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
