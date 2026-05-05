import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/navigation/Sidebar'
import { SECTORS } from '@/lib/constants'
import { Suspense } from 'react'
import { getNotes } from './actions'
import WikiContainer from '@/components/wiki/WikiContainer'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // vibe_admin_users 테이블에서 관리자 여부 확인
  const { data: adminUser } = await supabase
    .from('vibe_admin_users')
    .select('email')
    .eq('email', user.email)
    .single()
  
  const isAdmin = !!adminUser

  const { sector } = await searchParams
  const currentSectorId = Number(sector) || 1
  const currentSector = SECTORS.find(s => s.id === currentSectorId) || SECTORS[0]

  // Fetch real data from server
  const notes = await getNotes(currentSectorId)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Suspense fallback={<div className="w-72 bg-white/30 border-r" />}>
        <Sidebar userEmail={user.email} isAdmin={isAdmin} />
      </Suspense>

      {/* Main Content Container (Client Component for Search) */}
      <WikiContainer 
        initialNotes={notes} 
        currentSectorId={currentSectorId} 
        isAdmin={isAdmin} 
      />
    </div>
  )
}
