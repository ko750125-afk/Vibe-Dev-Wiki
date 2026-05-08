'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import WikiCard from './WikiCard'
import EmptyState from './EmptyState'
import AdminControls from './AdminControls'
import { WikiNote, WikiSector } from '@/lib/types'

interface WikiContainerProps {
  initialNotes: WikiNote[]
  initialSectors: WikiSector[]
  currentSectorId: number
  isAdmin: boolean
}

const SEARCH_RESULT_LABEL = '전체 검색 결과'

const buildSearchTarget = (note: WikiNote) =>
  `${note.title} ${note.content} ${note.stage_name}`.toLowerCase()

export default function WikiContainer({ initialNotes, initialSectors, currentSectorId, isAdmin }: WikiContainerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  // URL 또는 탭 클릭에 의한 로컬 상태 관리
  const [activeSectorId, setActiveSectorId] = useState(currentSectorId)

  // 부모 컴포넌트(서버)에서 받은 초기값이 변경되면 동기화
  useEffect(() => {
    setActiveSectorId(currentSectorId)
  }, [currentSectorId])

  // 사이드바에서 발생시킨 커스텀 이벤트 수신
  useEffect(() => {
    const handleSectorChange = (e: CustomEvent<number>) => {
      setActiveSectorId(e.detail)
    }
    window.addEventListener('sectorChange', handleSectorChange as EventListener)
    return () => window.removeEventListener('sectorChange', handleSectorChange as EventListener)
  }, [])

  // 현재 선택된 섹터 정보 (DB 데이터에서 찾음)
  const currentSector = useMemo(() => 
    initialSectors.find(s => s.id === activeSectorId) || (initialSectors.length > 0 ? initialSectors[0] : { name: 'Wiki', icon: 'Sparkles' })
  , [activeSectorId, initialSectors])

  // Cmd+K 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // 검색어가 있으면 전체 검색, 없으면 현재 섹터 기준으로 표시
  const filteredNotes = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    if (normalizedQuery) {
      return initialNotes.filter((note) => buildSearchTarget(note).includes(normalizedQuery))
    }
    return initialNotes.filter((note) => note.sector_id === activeSectorId)
  }, [initialNotes, searchQuery, activeSectorId])

  return (
    <main className="flex-1 overflow-y-auto pb-20 custom-scrollbar bg-background">
      <header className="h-20 border-b bg-background/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40 border-border">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-foreground tracking-tight leading-none">
              {searchQuery ? SEARCH_RESULT_LABEL : currentSector.name}
            </h2>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-12 hidden md:block">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="전체 지식 검색 (제목, 내용)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-ring/20 transition-all placeholder:text-muted-foreground/50 shadow-inner text-foreground"
            />
            <div className="absolute inset-y-0 right-4 flex items-center gap-2">
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="p-1 hover:bg-foreground/5 rounded-md transition-colors"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="w-[180px] flex justify-end">
          <AdminControls
            sectorId={activeSectorId}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          />
        </div>
      </header>

      <div className="p-8 max-w-7xl mx-auto">
        {filteredNotes.length > 0 ? (
          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {filteredNotes.map((note) => {
              return (
                <WikiCard
                  key={note.id}
                  id={note.id}
                  title={note.title}
                  content={note.content}
                  block_type={note.block_type}
                  stage_name={note.stage_name}
                  sectorId={note.sector_id}
                  created_at={note.created_at}
                  searchTerm={searchQuery}
                />
              )
            })}
          </div>
        ) : (
          <div className="py-12">
            <EmptyState 
              sectorName={searchQuery ? `'${searchQuery}' 검색 결과` : currentSector.name} 
              onReset={() => {
                setSearchQuery('')
              }}
            />
          </div>
        )}
      </div>
    </main>
  )
}
