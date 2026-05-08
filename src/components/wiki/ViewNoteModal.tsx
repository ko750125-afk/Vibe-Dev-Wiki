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

const proseClass = cn(
  "prose max-w-none dark:prose-invert",
  "prose-headings:tracking-tight prose-headings:text-foreground prose-headings:font-bold",
  "prose-p:my-2 prose-p:leading-relaxed text-foreground/90",
  "prose-pre:bg-slate-900 prose-pre:border prose-pre:border-white/5",
  "prose-a:text-primary prose-a:underline",
  "prose-ul:my-4 prose-ol:my-4 prose-li:my-1",
  "whitespace-pre-wrap break-words"
)

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
        className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 shadow-xl rounded-2xl bg-background text-foreground"
      >
        <div className="sr-only">
          <DialogDescription>
            {note.title} 지식 상세 보기
          </DialogDescription>
        </div>
        
        <div className="p-6 border-b border-border">
          <DialogTitle className="text-2xl font-bold leading-tight text-foreground">
            {note.title}
          </DialogTitle>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-background">
          <div 
            className={proseClass}
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        </div>

        <div className="p-4 px-6 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={handleEditClick}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                <Edit3 className="w-4 h-4" />
                수정
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDeleteClick}
                className="inline-flex items-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                삭제
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
          >
            닫기
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
