'use client'

import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, Info } from 'lucide-react'
import WikiCard from './WikiCard'
import EmptyState from './EmptyState'
import AdminControls from './AdminControls'
import { WikiNote } from '@/lib/types'
import { LucideIcon } from 'lucide-react'

import { SECTORS } from '@/lib/constants'

interface WikiContainerProps {
  initialNotes: WikiNote[]
  currentSectorId: number
  isAdmin: boolean
}

export default function WikiContainer({ initialNotes, currentSectorId, isAdmin }: WikiContainerProps) {
  const currentSector = useMemo(() => 
    SECTORS.find(s => s.id === currentSectorId) || SECTORS[0]
  , [currentSectorId])

  const [searchQuery, setSearchQuery] = useState('')

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return initialNotes

    const query = searchQuery.toLowerCase()
    return initialNotes.filter(note => 
      note.title.toLowerCase().includes(query) || 
      note.content.toLowerCase().includes(query) ||
      note.stage_name.toLowerCase().includes(query) ||
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(query)))
    )
  }, [initialNotes, searchQuery])

  return (
    <main className="flex-1 overflow-y-auto pb-20">
      <header className="h-20 border-b bg-white/70 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-primary/10 rounded-2xl">
            <currentSector.icon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-black text-primary tracking-tight leading-none mb-1">
              {currentSector.name}
            </h2>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">
              {currentSector.description}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-12 hidden md:block">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              placeholder={`${currentSector.name} 섹션에서 검색 (태그 포함)...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-primary/5 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
            />
            <div className="absolute inset-y-0 right-4 flex items-center">
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2.5 rounded-xl hover:bg-black/5 text-muted-foreground transition-colors">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-black/5 mx-1" />
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-xl text-primary text-xs font-black">
            <Info className="w-4 h-4" />
            <span>{filteredNotes.length} Notes</span>
          </div>
        </div>
      </header>

      <div className="p-8 max-w-7xl mx-auto">
        {filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {filteredNotes.map((note) => (
              <WikiCard
                key={note.id}
                id={note.id}
                title={note.title}
                content={note.content}
                block_type={note.block_type}
                stage_name={note.stage_name}
                tags={note.tags}
                isAdmin={isAdmin}
                sectorId={currentSector.id}
                created_at={note.created_at}
                searchTerm={searchQuery}
              />
            ))}
          </div>
        ) : (
          <div className="py-12">
            <EmptyState 
              sectorName={searchQuery ? `'${searchQuery}' 검색 결과` : currentSector.name} 
              SectorIcon={searchQuery ? Search : currentSector.icon} 
              isAdmin={isAdmin} 
              onReset={() => setSearchQuery('')}
            />
          </div>
        )}
      </div>

      {/* Floating Admin Controls */}
      {isAdmin && <AdminControls sectorId={currentSector.id} />}
    </main>
  )
}
