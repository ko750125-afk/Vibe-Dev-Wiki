'use client'

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { BlockType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Edit3, Trash2 } from 'lucide-react'
import { WIKI_PROSE_CLASSES } from '@/lib/constants'

interface ViewNoteModalProps {
  isOpen: boolean
  onClose: () => void
  onEdit?: () => void
  onDelete?: () => void
  note: {
    title: string
    content: string
    block_type: BlockType
    stage_name: string
    created_at?: string
  }
}

const proseClass = cn(WIKI_PROSE_CLASSES)

export default function ViewNoteModal({ isOpen, onClose, onEdit, onDelete, note }: ViewNoteModalProps) {
  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    onEdit?.()
  }

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    onDelete?.()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        hideClose
        className="max-w-4xl w-[95vw] h-[85vh] overflow-hidden flex flex-col p-0 gap-0 shadow-2xl rounded-[24px] bg-background text-foreground border-border"
      >
        <div className="sr-only">
          <DialogDescription>
            {note.title} 지식 상세 보기
          </DialogDescription>
        </div>
        
        <div className="px-8 py-5 border-b border-border bg-background shrink-0">
          <DialogTitle className="text-2xl font-bold leading-tight text-foreground">
            {note.title}
          </DialogTitle>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 p-8 custom-scrollbar bg-background">
          <div 
            className={proseClass}
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        </div>

        <div className="p-6 px-8 border-t border-border flex items-center justify-between bg-background shrink-0">
          <div className="flex items-center gap-3">
            {onEdit && (
              <button
                onClick={handleEditClick}
                className="w-32 h-11 inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                <Edit3 className="w-4 h-4" />
                EDIT
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDeleteClick}
                className="w-32 h-11 inline-flex items-center justify-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                DELETE
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-32 h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
          >
            CLOSE
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
