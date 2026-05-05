'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BlockType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ShieldAlert, Key, Terminal, Lightbulb, X, Copy, Check, Calendar, Edit3, Trash2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { useState } from 'react'

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

const STYLES = {
  security: { icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', label: 'SECURITY' },
  config: { icon: Key, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', label: 'CONFIG' },
  command: { icon: Terminal, color: 'text-slate-400', bg: 'bg-slate-900', border: 'border-slate-800', label: 'COMMAND' },
  tip: { icon: Lightbulb, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', label: 'TIP' },
}

export default function ViewNoteModal({ isOpen, onClose, onEdit, onDelete, note }: ViewNoteModalProps) {
  const [copied, setCopied] = useState(false)
  const style = STYLES[note.block_type]
  const Icon = style.icon

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(note.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Copy failed', err)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        hideClose
        className={cn(
          "max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-none shadow-2xl rounded-3xl",
          note.block_type === 'command' ? "bg-slate-950 text-slate-300" : "bg-background text-foreground"
        )}
      >
        {/* Custom Header Area */}
        <div className={cn(
          "p-8 pb-6 border-b",
          note.block_type === 'command' ? "border-slate-800 bg-slate-900/50" : "bg-secondary border-border"
        )}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-xl", note.block_type === 'command' ? "bg-slate-800" : "bg-background shadow-sm border border-border")}>
                <Icon className={cn("w-5 h-5", note.block_type === 'command' ? "text-slate-400" : "text-muted-foreground")} />
              </div>
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black tracking-widest",
                note.block_type === 'command' ? "bg-slate-800 text-slate-400" : "bg-accent text-muted-foreground"
              )}>
                {note.stage_name.toUpperCase()}
              </span>
            </div>
          </div>
          
          <DialogTitle className={cn(
            "text-3xl font-black tracking-tight leading-tight mb-4",
            note.block_type === 'command' ? "text-white" : "text-foreground"
          )}>
            {note.title}
          </DialogTitle>
        </div>

        {/* Scrollable Content */}
        <div className={cn(
          "flex-1 overflow-y-auto p-8 custom-scrollbar",
          note.block_type === 'command' ? "bg-slate-950" : "bg-background"
        )}>
          <div className={cn(
            "prose max-w-none prose-headings:tracking-tight prose-pre:bg-slate-900 prose-pre:border prose-pre:border-white/5 whitespace-normal",
            "prose-p:my-1 prose-p:leading-relaxed prose-li:my-0 prose-ul:my-2 prose-ol:my-2",
            "prose-table:border-collapse prose-table:border prose-table:border-border prose-th:border prose-th:border-border prose-th:bg-secondary prose-th:px-4 prose-th:py-2 prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2",
            "prose-li:list-none [&_ul_input[type='checkbox']]:mr-2 [&_ul_input[type='checkbox']]:mt-1",
            note.block_type === 'command' 
              ? "prose-invert prose-slate" 
              : "prose-stone prose-headings:text-foreground text-foreground/90 dark:prose-invert"
          )}>
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
              {note.content.replace(/\\n/g, '\n')}
            </ReactMarkdown>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className={cn(
          "p-4 px-8 border-t flex justify-between items-center",
          note.block_type === 'command' ? "bg-slate-900/50 border-slate-800" : "bg-background border-border"
        )}>
          <p className="text-[10px] text-muted-foreground font-bold italic tracking-wider">
            &copy; VIBE DEV-WIKI KNOWLEDGE ASSET
          </p>
          <div className="flex items-center gap-3">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95",
                  note.block_type === 'command'
                    ? "bg-slate-800 text-amber-400 hover:bg-slate-700 shadow-black/20"
                    : "bg-background text-amber-600 border border-amber-100 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-950/30 shadow-sm"
                )}
              >
                <Edit3 className="w-4 h-4" />
                <span>수정</span>
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95",
                  note.block_type === 'command'
                    ? "bg-slate-800 text-red-400 hover:bg-slate-700 shadow-black/20"
                    : "bg-background text-red-500 border border-red-100 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 shadow-sm"
                )}
              >
                <Trash2 className="w-4 h-4" />
                <span>삭제</span>
              </button>
            )}
            <button
              onClick={handleCopy}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95",
                note.block_type === 'command' 
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700 shadow-black/20" 
                  : "bg-background text-foreground border border-border hover:bg-accent shadow-sm"
              )}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-muted-foreground/40" />
                  <span>내용 복사</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-black tracking-widest transition-all active:scale-95",
                note.block_type === 'command'
                  ? "bg-white text-slate-950 hover:bg-slate-200"
                  : "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20"
              )}
            >
              CLOSE
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
