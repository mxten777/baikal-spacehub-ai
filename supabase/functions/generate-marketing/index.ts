/**
 * Supabase Edge Function: generate-marketing
 *
 * THE LIT Admin → (Supabase JWT 인증) → baikal-ai /content → marketing_drafts 저장
 *
 * POST { source_type, source_id?, channel, topic, purpose, tone?, keywords? }
 * → { draft_id, ai_draft }
 *
 * 환경변수 (Supabase Dashboard > Edge Functions > Secrets):
 *   BAIKAL_AI_URL  — baikal-ai 배포 URL (예: https://baikal-ai.example.com)
 *   BAIKAL_AI_KEY  — baikal-ai X-API-Key (X-API-Key 프론트 노출 방지)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const VALID_CHANNELS = ['instagram', 'threads', 'naver_blog'] as const
const VALID_SOURCE_TYPES = ['blog', 'archive', 'manual'] as const

type Channel = typeof VALID_CHANNELS[number]
type SourceType = typeof VALID_SOURCE_TYPES[number]

interface RequestBody {
  source_type: SourceType
  source_id?: string
  channel: Channel
  topic: string
  purpose: string
  tone?: string
  keywords?: string[]
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  // ── 1. JWT 검증 ─────────────────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Missing authorization header' }, 401)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  // 사용자 JWT로 역할 확인
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: { user }, error: authError } = await userClient.auth.getUser()
  if (authError || !user) {
    return jsonResponse({ error: 'Invalid or expired token' }, 401)
  }

  // 프로필에서 역할 확인 — operator 이상만 허용
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey)
  const { data: profile, error: profileError } = await serviceClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return jsonResponse({ error: 'Profile not found' }, 403)
  }
  if (!['super_admin', 'operator'].includes(profile.role)) {
    return jsonResponse({ error: 'Insufficient permissions' }, 403)
  }

  // ── 2. 요청 파싱·검증 ────────────────────────────────────────────────────────
  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  const { source_type, source_id, channel, topic, purpose, tone, keywords } = body

  if (!VALID_SOURCE_TYPES.includes(source_type)) {
    return jsonResponse({ error: `source_type must be one of: ${VALID_SOURCE_TYPES.join(', ')}` }, 422)
  }
  if (!VALID_CHANNELS.includes(channel)) {
    return jsonResponse({ error: `channel must be one of: ${VALID_CHANNELS.join(', ')}` }, 422)
  }
  if (!topic?.trim() || !purpose?.trim()) {
    return jsonResponse({ error: 'topic and purpose are required' }, 422)
  }

  // ── 3. baikal-ai /content 호출 ───────────────────────────────────────────────
  const baikalAiUrl = Deno.env.get('BAIKAL_AI_URL')
  const baikalAiKey = Deno.env.get('BAIKAL_AI_KEY')

  if (!baikalAiUrl || !baikalAiKey) {
    return jsonResponse({ error: 'AI service not configured' }, 503)
  }

  let aiDraft: string
  try {
    const aiPayload: Record<string, unknown> = { topic, purpose, channel }
    if (tone) aiPayload.tone = tone
    if (keywords?.length) aiPayload.keywords = keywords

    const aiResponse = await fetch(`${baikalAiUrl.replace(/\/$/, '')}/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': baikalAiKey,
      },
      body: JSON.stringify(aiPayload),
    })

    if (!aiResponse.ok) {
      const errText = await aiResponse.text().catch(() => '')
      return jsonResponse({ error: `AI service error: ${aiResponse.status}`, detail: errText }, 503)
    }

    const aiData = await aiResponse.json()
    aiDraft = aiData?.data?.content ?? ''
    if (!aiDraft) {
      return jsonResponse({ error: 'AI returned empty content' }, 503)
    }
  } catch (err) {
    return jsonResponse({
      error: 'AI service unreachable',
      detail: err instanceof Error ? err.message : String(err),
    }, 503)
  }

  // ── 4. marketing_drafts 저장 ─────────────────────────────────────────────────
  const promptParams = { topic, purpose, channel, ...(tone && { tone }), ...(keywords && { keywords }) }

  const { data: draft, error: insertError } = await serviceClient
    .from('marketing_drafts')
    .insert({
      source_type,
      source_id: source_id ?? null,
      channel,
      prompt_params: promptParams,
      ai_draft: aiDraft,
      status: 'draft',
      created_by: user.id,
    })
    .select('id')
    .single()

  if (insertError || !draft) {
    return jsonResponse({ error: 'Failed to save draft', detail: insertError?.message }, 500)
  }

  return jsonResponse({ draft_id: draft.id, ai_draft: aiDraft }, 200)
})
