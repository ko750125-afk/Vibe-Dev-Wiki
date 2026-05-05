'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

const DEBUG_ENDPOINT = 'http://127.0.0.1:7278/ingest/e57c9c70-c756-4613-96ca-1ef08deda9d5'
const DEBUG_SESSION_ID = 'c6b1d8'

const stripTrailingSlash = (value: string) => value.replace(/\/$/, '')

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
      hypothesisId: 'H1',
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {})
}

function resolveRedirectBaseUrl(params: {
  origin: string | null
  host: string | null
  forwardedProto: string | null
}) {
  const { origin, host, forwardedProto } = params
  const envBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)
  const headerBaseUrl = origin || (host ? `${forwardedProto || 'https'}://${host}` : undefined)
  const normalizedBaseUrl = stripTrailingSlash(headerBaseUrl || envBaseUrl || 'http://localhost:3000')

  if (normalizedBaseUrl.includes('localhost') && envBaseUrl) {
    return stripTrailingSlash(envBaseUrl)
  }

  return normalizedBaseUrl
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const reqHeaders = await headers()
  const origin = reqHeaders.get('origin')
  const host = reqHeaders.get('host')
  const forwardedProto = reqHeaders.get('x-forwarded-proto')
  const userAgent = reqHeaders.get('user-agent')
  const baseUrl = resolveRedirectBaseUrl({ origin, host, forwardedProto })
  const redirectTo = `${baseUrl}/auth/callback`
  // #region agent log
  console.log('[DBG][H1] signInWithGoogle context', {
    origin,
    host,
    forwardedProto,
    redirectTo,
    hasUserAgent: Boolean(userAgent),
  })
  // #endregion
  // #region agent log
  sendDebugLog('src/app/login/actions.ts:14', 'OAuth start context', {
    origin,
    host,
    forwardedProto,
    hasUserAgent: Boolean(userAgent),
    redirectTo,
  })
  // #endregion

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
    },
  })
  // #region agent log
  sendDebugLog('src/app/login/actions.ts:22', 'OAuth start result', {
    hasDataUrl: Boolean(data?.url),
    error: error?.message ?? null,
  })
  // #endregion
  // #region agent log
  console.log('[DBG][H1] signInWithGoogle result', {
    hasDataUrl: Boolean(data?.url),
    error: error?.message ?? null,
    authUrlHost: data?.url ? new URL(data.url).host : null,
  })
  // #endregion

  if (error) {
    console.error('Login error:', error)
    return redirect('/login?error=auth_failed')
  }

  if (data.url) {
    return redirect(data.url)
  }
}
