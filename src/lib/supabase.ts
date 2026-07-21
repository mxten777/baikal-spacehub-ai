import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  "https://placeholder.supabase.co";
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "placeholder-key";

export const isSupabaseConfigured = !!(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

if (!isSupabaseConfigured) {
  console.warn(
    "⚠️ Supabase 환경변수 없음 — .env.local 파일을 설정하세요. 현재 fallback 데이터로 동작합니다.",
  );
}

// Supabase 무료 플랜 콜드 스타트(~25초) 대응:
// 모든 fetch 요청에 30초 타임아웃을 적용 — 개별 서비스마다 Promise.race 불필요
function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);
  const signal = init?.signal
    ? AbortSignal.any([init.signal, controller.signal])
    : controller.signal;
  return fetch(input, { ...init, signal }).finally(() =>
    clearTimeout(timeoutId),
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // React StrictMode 개발 환경에서만 lock 우회 (이중 마운트 시 gotrue 락 미해제 방지)
    // 프로덕션에서는 기본 lock을 사용해 autoRefreshToken 경쟁 조건을 방지합니다.
    ...(import.meta.env.DEV
      ? {
          lock: <R>(
            _name: string,
            _acquireTimeout: number,
            fn: () => Promise<R>,
          ) => fn(),
        }
      : {}),
  },
  global: { fetch: fetchWithTimeout },
});

export type { SupabaseClient } from "@supabase/supabase-js";
