'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BlockType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ShieldAlert, Key, Terminal, Lightbulb, X, Copy, Check, Calendar, Hash } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useState } from 'react'

interface ViewNoteModalProps {
  isOpen: boolean
  onClose: () => void
  note: {
    title: string
    content: string
    block_type: BlockType
    stage_name: string
    tags?: string[]
    created_at?: string
  }
}

const STYLES = {
  security: { icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', label: 'SECURITY' },
  config: { icon: Key, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', label: 'CONFIG' },
  command: { icon: Terminal, color: 'text-slate-400', bg: 'bg-slate-900', border: 'border-slate-800', label: 'COMMAND' },
  tip: { icon: Lightbulb, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', label: 'TIP' },
}

export default function ViewNoteModal({ isOpen, onClose, note }: ViewNoteModalProps) {
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
      <DialogContent className={cn(
        "max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-none shadow-2xl",
        note.block_type === 'command' ? "bg-slate-950 text-slate-300" : "bg-white"
      )}>
        {/* Custom Header Area */}
        <div className={cn(
          "p-8 pb-6 border-b",
          note.block_type === 'command' ? "border-slate-800 bg-slate-900/50" : style.bg + " " + style.border
        )}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-xl", note.block_type === 'command' ? "bg-slate-800" : "bg-white shadow-sm")}>
                <Icon className={cn("w-5 h-5", style.color)} />
              </div>
              <div>
                <span className={cn("text-[10px] font-black tracking-[0.2em] uppercase", style.color)}>
                  {style.label}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {note.stage_name}
                  </span>
                  {note.created_at && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          
          <DialogTitle className={cn(
            "text-3xl font-black tracking-tight leading-tight mb-4",
            note.block_type === 'command' ? "text-white" : "text-primary"
          )}>
            {note.title}
          </DialogTitle>

          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag, i) => (
                <span key={i} className={cn(
                  "text-[10px] font-black px-3 py-1 rounded-lg flex items-center gap-1 uppercase tracking-widest",
                  note.block_type === 'command' ? "bg-slate-800 text-slate-400" : "bg-white/80 text-primary/60 border border-primary/5 shadow-sm"
                )}>
                  <Hash className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-pre:bg-slate-900 prose-pre:border prose-pre:border-white/5">
          <div className={cn(
            note.block_type === 'command' ? "markdown-dark" : "markdown-light"
          )}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {note.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className={cn(
          "p-4 px-8 border-t flex justify-between items-center bg-gray-50/50",
          note.block_type === 'command' && "bg-slate-900/50 border-slate-800"
        )}>
          <p className="text-[10px] text-muted-foreground font-medium italic">
            &copy; Vibe Dev-Wiki Knowledge Asset
          </p>
          <button
            onClick={handleCopy}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm",
              note.block_type === 'command' 
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700" 
                : "bg-white text-primary border hover:border-primary/20"
            )}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Content</span>
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
