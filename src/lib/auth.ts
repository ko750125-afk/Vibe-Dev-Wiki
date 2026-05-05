import { createClient } from '@/utils/supabase/server'

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>

export interface AuthContext {
  supabase: ServerSupabaseClient
  user: NonNullable<Awaited<ReturnType<ServerSupabaseClient['auth']['getUser']>>['data']['user']>
  isAdmin: boolean
}

/**
 * 앱 권한 기준을 DB(RLS) 기준과 맞추기 위해
 * vibe_admin_users 테이블 존재 여부로 관리자 여부를 판정합니다.
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user || !user.email) {
    return null
  }

  return {
    supabase,
    user,
    // 단일 사용자 운영: 로그인 사용자면 편집 권한 허용
    isAdmin: true,
  }
}
