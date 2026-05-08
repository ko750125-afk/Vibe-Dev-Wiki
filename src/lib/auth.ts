import { createClient } from '@/utils/supabase/server'

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>

export interface AuthContext {
  supabase: ServerSupabaseClient
  user: NonNullable<Awaited<ReturnType<ServerSupabaseClient['auth']['getUser']>>['data']['user']>
  isAdmin: boolean
}

/**
 * 앱 권한 기준: 개인 전용 앱이므로 로그인한 사용자에게 모든 편집 권한을 부여합니다.
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
    // 개인 전용: 로그인 시 모든 권한(편집/삭제 등) 허용
    isAdmin: true,
  }
}
