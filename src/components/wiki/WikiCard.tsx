'use client'

import { useState, memo } from 'react'
import { cn } from '@/lib/utils'
import { deleteNote } from '@/app/actions'
import NoteModal from './NoteModal'
import ViewNoteModal from './ViewNoteModal'
import { BlockType } from '@/lib/types'

const DELETE_NOTE_CONFIRM_MESSAGE =
  '⚠️ [경고] 지식 삭제\n\n작성하신 소중한 노하우가 영구적으로 삭제됩니다.\n정말로 삭제하시겠습니까?'

interface WikiCardProps {
  id: string
  title: string
  content: string
  block_type: BlockType
  stage_name: string
  created_at?: string
  sectorId: number
  searchTerm?: string
}

const HighlightText = ({ text, query }: { text: string; query?: string }) => {
  if (!query?.trim()) return <>{text}</>
  
  const parts = text.split(new RegExp(`(${query})`, 'gi'))
  return (
    <>
      {parts.map((part, i) => (
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-200 text-primary px-0.5 rounded-sm animate-pulse">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      ))}
    </>
  )
}

function WikiCard({ 
  id, 
  title, 
  content, 
  block_type, 
  stage_name, 
  created_at, 
  sectorId,
  searchTerm 
}: WikiCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)

  const handleDelete = async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    const isConfirmed = window.confirm(DELETE_NOTE_CONFIRM_MESSAGE)
    if (!isConfirmed) return
    setIsDeleting(true)
    try {
      await deleteNote(id)
    } catch (err) {
      alert('삭제에 실패했습니다.')
      console.error(err)
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div 
        onClick={() => setIsViewOpen(true)}
        className={cn(
          "group relative flex items-center justify-between cursor-pointer px-5 py-3.5 rounded-xl border border-border bg-background transition-all hover:bg-accent/40 hover:shadow-md hover:ring-1 hover:ring-border animate-in fade-in slide-in-from-bottom-2 duration-300",
          isDeleting && "opacity-50 grayscale pointer-events-none"
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Decorative Dot / Icon Placeholder */}
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors shrink-0" />
          
          <h3 className="text-base font-bold text-foreground truncate group-hover:text-primary transition-colors">
            <HighlightText text={title} query={searchTerm} />
          </h3>
        </div>

        <div className="flex items-center gap-4 shrink-0 ml-4">
          {/* Optional: Meta info like created date or simple arrow */}
          {created_at && (
            <span className="hidden sm:block text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">
              {new Date(created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
            </span>
          )}
          <div className="w-6 h-6 rounded-lg bg-accent/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ViewNoteModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        onEdit={() => {
          setIsViewOpen(false)
          setIsEditOpen(true)
        }}
        onDelete={handleDelete}
        note={{ title, content, block_type, stage_name, created_at }}
      />

      {isEditOpen && (
        <NoteModal
          sectorId={sectorId}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          initialData={{
            id,
            title,
            content,
            block_type,
            stage_name,
            sector_id: sectorId
          }}
        />
      )}
    </>
  )
}

export default memo(WikiCard)
