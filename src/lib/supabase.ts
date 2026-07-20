import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://placeholder.supabase.co'
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'placeholder-key'

export const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase 환경변수 없음 — .env.local 파일을 설정하세요. 현재 fallback 데이터로 동작합니다.')
}

// Supabase 무료 플랜 콜드 스타트(~25초) 대응:
// 모든 fetch 요청에 30초 타임아웃을 적용 — 개별 서비스마다 Promise.race 불필요
function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30_000)
  const signal = init?.signal
    ? AbortSignal.any([init.signal, controller.signal])
    : controller.signal
  return fetch(input, { ...init, signal }).finally(() => clearTimeout(timeoutId))
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // React StrictMode에서 컴포넌트 이중 마운트로 인해 gotrue 락이 해제되지 않는
    // 문제를 방지하기 위해 락을 우회합니다.
    // 단일 탭 사용 환경에서는 안전합니다.
    lock: <R>(_name: string, _acquireTimeout: number, fn: () => Promise<R>) => fn(),
  },
  global: { fetch: fetchWithTimeout },
})

export type { SupabaseClient } from '@supabase/supabase-js'
