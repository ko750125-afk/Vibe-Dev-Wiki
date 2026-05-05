'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Search, SlidersHorizontal, Info, X } from 'lucide-react'
import WikiCard from './WikiCard'
import EmptyState from './EmptyState'
import AdminControls from './AdminControls'
import { WikiNote } from '@/lib/types'
import { LucideIcon } from 'lucide-react'
import { SECTORS } from '@/lib/constants'
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
  currentSectorId: number
  isAdmin: boolean
}

const STAGES = ['All', 'Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5']

export default function WikiContainer({ initialNotes, currentSectorId, isAdmin }: WikiContainerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStage, setSelectedStage] = useState('All')
  const searchInputRef = useRef<HTMLInputElement>(null)

  const currentSector = useMemo(() => 
    SECTORS.find(s => s.id === currentSectorId) || SECTORS[0]
  , [currentSectorId])

  // Cmd+K Shortcut
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

  const filteredNotes = useMemo(() => {
    let results = initialNotes

    // Stage Filter
    if (selectedStage !== 'All') {
      results = results.filter(note => note.stage_name === selectedStage)
    }

    // Search Query Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      results = results.filter(note => 
        note.title.toLowerCase().includes(query) || 
        note.content.toLowerCase().includes(query) ||
        note.stage_name.toLowerCase().includes(query) ||
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(query)))
      )
    }

    return results
  }, [initialNotes, searchQuery, selectedStage])

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
              ref={searchInputRef}
              type="text"
              placeholder={`${currentSector.name} 섹션에서 검색 (태그 포함)...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-primary/5 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
            />
            <div className="absolute inset-y-0 right-4 flex items-center gap-2">
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="p-1 hover:bg-black/5 rounded-md transition-colors"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`p-2.5 rounded-xl transition-all ${selectedStage !== 'All' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-black/5 text-muted-foreground'}`}>
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 border-primary/5 shadow-2xl">
              <DropdownMenuLabel className="text-[10px] uppercase font-black text-primary/40 tracking-widest px-3 py-2">Stage Filter</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-primary/5" />
              {STAGES.map((stage) => (
                <DropdownMenuItem
                  key={stage}
                  onClick={() => setSelectedStage(stage)}
                  className={`rounded-xl px-3 py-2 text-sm font-bold cursor-pointer transition-colors ${selectedStage === stage ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'}`}
                >
                  {stage}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-6 bg-black/5 mx-1" />
          
          <button 
            onClick={() => {
              setSearchQuery('')
              setSelectedStage('All')
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 hover:bg-primary/10 rounded-xl text-primary text-xs font-black transition-colors group"
          >
            <Info className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span>{filteredNotes.length} Notes</span>
          </button>
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
                sectorId={currentSectorId}
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
