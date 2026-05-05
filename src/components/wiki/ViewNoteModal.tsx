'use client'

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { BlockType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Edit3, Trash2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

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

export default function ViewNoteModal({ isOpen, onClose, onEdit, onDelete, note }: ViewNoteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        hideClose
        className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 shadow-xl rounded-2xl bg-background text-foreground"
      >
        <div className="p-6 border-b border-border">
          <DialogTitle className="text-2xl font-semibold leading-tight text-foreground">
            {note.title}
          </DialogTitle>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-background">
          <div className={cn(
            "prose max-w-none prose-headings:tracking-tight prose-pre:bg-slate-900 prose-pre:border prose-pre:border-white/5 whitespace-normal",
            "prose-p:my-1 prose-p:leading-relaxed prose-li:my-0 prose-ul:my-2 prose-ol:my-2",
            "prose-table:border-collapse prose-table:border prose-table:border-border prose-th:border prose-th:border-border prose-th:bg-secondary prose-th:px-4 prose-th:py-2 prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2",
            "prose-li:list-none [&_ul_input[type='checkbox']]:mr-2 [&_ul_input[type='checkbox']]:mt-1",
            "prose-stone prose-headings:text-foreground text-foreground/90 dark:prose-invert"
          )}>
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
              {note.content.replace(/\\n/g, '\n')}
            </ReactMarkdown>
          </div>
        </div>

        <div className="p-4 px-6 border-t border-border flex items-center justify-end gap-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <Edit3 className="w-4 h-4" />
              수정
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              삭제
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
