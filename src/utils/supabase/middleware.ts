import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname
  const cookieCount = request.cookies.getAll().length
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 중요: 세션 갱신을 위해 getUser()를 호출해야 합니다.
  const { data, error } = await supabase.auth.getUser()
  // #region agent log
  fetch('http://127.0.0.1:7278/ingest/e57c9c70-c756-4613-96ca-1ef08deda9d5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'c6b1d8'},body:JSON.stringify({sessionId:'c6b1d8',runId:'mobile-login-block-v1',hypothesisId:'H3',location:'src/utils/supabase/middleware.ts:33',message:'Middleware getUser result',data:{path,cookieCount,hasUser:Boolean(data?.user),error:error?.message??null},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  return supabaseResponse
}
