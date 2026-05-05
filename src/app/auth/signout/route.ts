import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  // 로그아웃 수행
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Sign out error:', error)
  }

  const { origin } = new URL(request.url)
  return NextResponse.redirect(`${origin}/login`, {
    status: 303,
  })
}
