import { redirect } from 'next/navigation'
import Sidebar from '@/components/navigation/Sidebar'
import { Suspense } from 'react'
import { getNotes, getSectors } from './actions'
// Vercel deployment trigger
import WikiContainer from '@/components/wiki/WikiContainer'
import { getAuthContext } from '@/lib/auth'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string }>
}) {
  const auth = await getAuthContext()
  if (!auth) {
    return redirect('/login')
  }

  const { user, isAdmin } = auth

  // 1. DB에서 모든 섹터(기술 스택) 가져오기
  const sectors = await getSectors()
  
  const { sector } = await searchParams
  // 2. 현재 선택된 섹터 ID 결정 (없으면 첫 번째 섹터)
  const currentSectorId = Number(sector) || (sectors.length > 0 ? sectors[0].id : 0)

  // 3. 현재 섹터의 노트만 가져오기
  const notes = await getNotes(currentSectorId)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar: DB에서 가져온 섹터 목록 전달 */}
      <Suspense fallback={<div className="w-[340px] bg-background border-r border-border" />}>
        <Sidebar 
          userEmail={user.email} 
          isAdmin={isAdmin} 
          initialSectors={sectors}
        />
      </Suspense>

      {/* Main Content Container: 섹터 목록과 노드 목록 전달 */}
      <WikiContainer 
        initialNotes={notes} 
        initialSectors={sectors}
        currentSectorId={currentSectorId} 
        isAdmin={isAdmin} 
      />
    </div>
  )
}
