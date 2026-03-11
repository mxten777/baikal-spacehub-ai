/**
 * Supabase Edge Function: fetch-rss
 *
 * 브라우저 CORS 제한을 우회하여 서버사이드에서 RSS 피드를 가져옵니다.
 * Naver, Tistory 등 외부 CORS 프록시를 차단하는 사이트에 대응.
 *
 * POST { url: "https://rss.blog.naver.com/..." }
 * → { content: "<rss>...</rss>" }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// SSRF 방어: private/loopback 대역 차단
function isSafeUrl(input: string): boolean {
  let url: URL
  try {
    url = new URL(input)
  } catch {
    return false
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
  const hostname = url.hostname.toLowerCase()
  // loopback, private ranges, metadata endpoints
  const blocked = [
    /^localhost$/,
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^169\.254\./, // link-local
    /^::1$/,
    /^fc00:/,
    /^fe80:/,
    /metadata\.google\.internal/,
  ]
  return !blocked.some(re => re.test(hostname))
}

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  let rssUrl: string
  try {
    const body = await req.json()
    rssUrl = body?.url ?? ''
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  if (!rssUrl || !isSafeUrl(rssUrl)) {
    return new Response(JSON.stringify({ error: 'Invalid or disallowed URL' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  try {
    const upstream = await fetch(rssUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
      },
      // Edge Function 환경에서는 AbortSignal 지원 방식이 다를 수 있으므로 signal 생략
    })

    if (!upstream.ok) {
      return new Response(
        JSON.stringify({ error: `Upstream returned ${upstream.status}` }),
        {
          status: upstream.status,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        },
      )
    }

    const content = await upstream.text()

    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      },
    )
  }
})
