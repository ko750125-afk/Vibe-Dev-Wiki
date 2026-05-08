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
  
  // <hr> 태그를 기준으로 위쪽은 설명, 아래쪽은 본문으로 간주
  const contentParts = content.split(/<hr[^>]*>/i)
  const descriptionHTML = contentParts[0]?.trim() || '<p>설명이 없습니다.</p>'

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
          "group relative flex flex-col sm:flex-row sm:items-stretch cursor-pointer overflow-hidden rounded-xl border border-border bg-background transition-all hover:bg-accent/30 hover:shadow-sm",
          isDeleting && "opacity-50 grayscale pointer-events-none"
        )}
      >
        <div className="w-full sm:w-1/3 sm:min-w-[200px] sm:max-w-[300px] p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-border bg-muted/20 flex flex-col justify-center">
          <h3 className="text-xl font-bold leading-snug text-foreground break-words">
            <HighlightText text={title} query={searchTerm} />
          </h3>
        </div>

        <div className="flex-1 p-4 sm:p-5 flex items-start sm:items-center min-w-0">
          <div 
            className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-bold prose-headings:text-foreground prose-p:leading-relaxed text-muted-foreground break-words w-full"
            dangerouslySetInnerHTML={{ __html: descriptionHTML }}
          />
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
