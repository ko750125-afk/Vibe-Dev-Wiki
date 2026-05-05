import { useState } from 'react'
import { cn } from '@/lib/utils'
import { deleteNote } from '@/app/actions'
import NoteModal from './NoteModal'
import ViewNoteModal from './ViewNoteModal'
import { BlockType } from '@/lib/types'

const DELETE_NOTE_CONFIRM_MESSAGE =
  '⚠️ [경고] 지식 삭제\n\n작성하신 소중한 노하우가 영구적으로 삭제됩니다.\n정말로 삭제하시겠습니까?'

const sanitizeSummary = (raw: string) =>
  raw
    .replace(/[#>*`[\]\-]/g, ' ')
    .replace(/\((.*?)\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

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

export default function WikiCard({ 
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
  const plainSummary = sanitizeSummary(content)
  const descriptionText = (stage_name || plainSummary || '설명이 없습니다.').trim()


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
          "group relative flex h-52 cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-background transition-colors hover:bg-accent/30",
          isDeleting && "opacity-50 grayscale pointer-events-none"
        )}
      >
        <div className="p-5">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground">
            <HighlightText text={title} query={searchTerm} />
          </h3>
        </div>

        <div className="mx-5 border-t border-border" />
        <div className="flex-1 p-5 pt-4">
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            <HighlightText text={descriptionText} query={searchTerm} />
          </p>
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
