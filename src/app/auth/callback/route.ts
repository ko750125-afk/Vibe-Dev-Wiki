import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const DEBUG_ENDPOINT = 'http://127.0.0.1:7278/ingest/e57c9c70-c756-4613-96ca-1ef08deda9d5'
const DEBUG_SESSION_ID = 'c6b1d8'

function sendDebugLog(location: string, message: string, data: Record<string, unknown>) {
  fetch(DEBUG_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': DEBUG_SESSION_ID,
    },
    body: JSON.stringify({
      sessionId: DEBUG_SESSION_ID,
      runId: 'mobile-login-block-v1',
      hypothesisId: 'H2',
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {})
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  // #region agent log
  console.log('[DBG][H2] callback received', {
    origin,
    hasCode: Boolean(code),
    next,
  })
  // #endregion
  // #region agent log
  sendDebugLog('src/app/auth/callback/route.ts:8', 'OAuth callback received', {
    origin,
    hasCode: Boolean(code),
    next,
  })
  // #endregion

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    // #region agent log
    console.log('[DBG][H2] callback exchange result', {
      error: error?.message ?? null,
    })
    // #endregion
    // #region agent log
    sendDebugLog('src/app/auth/callback/route.ts:14', 'OAuth exchange result', {
      error: error?.message ?? null,
    })
    // #endregion
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // 에러 발생 시 로그인 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
