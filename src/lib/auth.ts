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

  const { data: adminRow, error: adminError } = await supabase
    .from('vibe_admin_users')
    .select('email')
    .eq('email', user.email)
    .maybeSingle()

  if (adminError) {
    const tableMissing =
      adminError.message.includes("Could not find the table 'public.vibe_admin_users'") ||
      adminError.code === 'PGRST205'

    if (tableMissing) {
      return {
        supabase,
        user,
        isAdmin: false,
      }
    }

    throw new Error(`Failed to verify admin: ${adminError.message}`)
  }

  return {
    supabase,
    user,
    isAdmin: !!adminRow,
  }
}
