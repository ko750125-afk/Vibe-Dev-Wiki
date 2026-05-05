'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Search, SlidersHorizontal, Info, X, Zap } from 'lucide-react'
import WikiCard from './WikiCard'
import EmptyState from './EmptyState'
import AdminControls from './AdminControls'
import { WikiNote, WikiSector } from '@/lib/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

interface WikiContainerProps {
  initialNotes: WikiNote[]
  initialSectors: WikiSector[]
  currentSectorId: number
  isAdmin: boolean
}

const STAGES = ['All', 'Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5']

export default function WikiContainer({ initialNotes, initialSectors, currentSectorId, isAdmin }: WikiContainerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStage, setSelectedStage] = useState('All')
  const searchInputRef = useRef<HTMLInputElement>(null)

  // 현재 선택된 섹터 정보 (DB 데이터에서 찾음)
  const currentSector = useMemo(() => 
    initialSectors.find(s => s.id === currentSectorId) || (initialSectors.length > 0 ? initialSectors[0] : { name: 'Wiki', icon: 'Sparkles' })
  , [currentSectorId, initialSectors])

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

  // 🟢 필터링 로직: 검색어가 있으면 위키 전체 검색, 없으면 섹터+단계 필터링
  const filteredNotes = useMemo(() => {
    return initialNotes.filter(note => {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = searchQuery === '' || 
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower) ||
        note.stage_name.toLowerCase().includes(searchLower)

      // 1. 검색어가 입력된 경우: 위키 전체에서 제목/본문 검색 (섹터/단계 필터 무시)
      if (searchQuery !== '') return matchesSearch

      // 2. 검색어가 없는 경우: 현재 선택된 섹터 및 단계 필터 적용
      const matchesSector = note.sector_id === currentSectorId
      const matchesStage = selectedStage === 'All' || note.stage_name === selectedStage

      return matchesSector && matchesStage
    })
  }, [initialNotes, searchQuery, selectedStage, currentSectorId])

  return (
    <main className="flex-1 overflow-y-auto pb-20 custom-scrollbar bg-background">
      <header className="h-20 border-b bg-background/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40 border-border">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-foreground tracking-tight leading-none">
              {searchQuery ? '전체 검색 결과' : currentSector.name}
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

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
                title="단계 필터"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{selectedStage}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Stage Filter</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {STAGES.map((stage) => (
                <DropdownMenuItem
                  key={stage}
                  onClick={() => setSelectedStage(stage)}
                  className="flex items-center justify-between"
                >
                  <span>{stage}</span>
                  {stage === selectedStage && <Zap className="w-3.5 h-3.5 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {searchQuery && (
            <div
              className="hidden lg:inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-2.5 py-2 text-[11px] text-muted-foreground"
              title="검색 시 섹터/단계 필터는 적용되지 않습니다"
            >
              <Info className="w-3 h-3" />
              <span>검색 중 단계 필터 비활성</span>
            </div>
          )}
        </div>
      </header>

      <div className="p-8 max-w-7xl mx-auto">
        {filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {filteredNotes.map((note) => {
              const noteSector = initialSectors.find(s => s.id === note.sector_id)
              return (
                <WikiCard
                  key={note.id}
                  id={note.id}
                  title={note.title}
                  content={note.content}
                  block_type={note.block_type}
                  stage_name={note.stage_name}
                  isAdmin={isAdmin}
                  sectorId={note.sector_id}
                  sectorName={noteSector?.name || 'Unknown'}
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
              isAdmin={isAdmin} 
              onReset={() => {
                setSearchQuery('')
                setSelectedStage('All')
              }}
            />
          </div>
        )}
      </div>

      {/* Floating Admin Controls */}
      {isAdmin && <AdminControls sectorId={currentSectorId} />}
    </main>
  )
}
