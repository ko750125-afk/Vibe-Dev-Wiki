import { ShieldAlert, Key, Terminal, Lightbulb, Copy, Check, Trash2, Edit3, Eye, Hash } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { deleteNote } from '@/app/actions'
import NoteModal from './NoteModal'
import ViewNoteModal from './ViewNoteModal'
import { BlockType } from '@/lib/types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface WikiCardProps {
  id: string
  title: string
  content: string
  block_type: BlockType
  stage_name: string
  tags?: string[]
  created_at?: string
  isAdmin?: boolean
  sectorId?: number
  searchTerm?: string
}

const STYLES = {
  security: {
    icon: ShieldAlert,
    borderColor: 'border-red-500/50',
    bgColor: 'bg-red-50/50',
    iconColor: 'text-red-500',
    label: 'SECURITY',
  },
  config: {
    icon: Key,
    borderColor: 'border-blue-500/50',
    bgColor: 'bg-blue-50/50',
    iconColor: 'text-blue-500',
    label: 'CONFIG',
  },
  command: {
    icon: Terminal,
    borderColor: 'border-slate-800',
    bgColor: 'bg-slate-900',
    iconColor: 'text-slate-400',
    label: 'COMMAND',
  },
  tip: {
    icon: Lightbulb,
    borderColor: 'border-emerald-500/50',
    bgColor: 'bg-emerald-50/50',
    iconColor: 'text-emerald-500',
    label: 'TIP',
  },
}

export default function WikiCard({ 
  id, 
  title, 
  content, 
  block_type, 
  stage_name, 
  tags = [],
  created_at, 
  isAdmin, 
  sectorId,
  searchTerm 
}: WikiCardProps) {
  const [copied, setCopied] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  
  const style = STYLES[block_type]
  const Icon = style.icon

  const HighlightText = ({ text, query }: { text: string; query?: string }) => {
    if (!query?.trim()) return <>{text}</>
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return (
      <>
        {parts.map((part, i) => (
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 text-primary px-0.5 rounded-sm animate-pulse">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        ))}
      </>
    )
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy!', err)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('정말 삭제하시겠습니까?')) return
    setIsDeleting(true)
    try {
      await deleteNote(id)
    } catch (err) {
      alert('삭제에 실패했습니다.')
      console.error(err)
      setIsDeleting(false)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditOpen(true)
  }

  return (
    <>
      <div 
        onClick={() => setIsViewOpen(true)}
        className={cn(
          "group relative overflow-hidden rounded-[24px] border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 cursor-pointer",
          style.borderColor,
          block_type === 'command' ? style.bgColor : 'bg-white',
          isDeleting && "opacity-50 grayscale pointer-events-none"
        )}
      >
        {/* Top Banner */}
        <div className={cn(
          "flex items-center justify-between px-5 py-3 border-b",
          block_type === 'command' ? "border-slate-800 bg-black/20" : style.borderColor.replace('/50', '/10')
        )}>
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "w-2 h-2 rounded-full shadow-sm",
              block_type === 'security' ? "bg-red-500 animate-pulse" : 
              block_type === 'config' ? "bg-blue-500" :
              block_type === 'command' ? "bg-slate-500" : "bg-emerald-500"
            )} />
            <Icon className={cn("w-4 h-4", style.iconColor)} />
            <span className={cn("text-[10px] font-black tracking-[0.15em] uppercase", style.iconColor)}>
              {style.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter",
              block_type === 'command' ? "bg-slate-800 text-slate-400" : "bg-primary/5 text-primary/60"
            )}>
              <HighlightText text={stage_name} query={searchTerm} />
            </span>
            {isAdmin && (
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button 
                  onClick={handleEdit}
                  className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={handleDelete}
                  className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className={cn(
            "font-black text-xl mb-3 leading-tight tracking-tight",
            block_type === 'command' ? "text-slate-100" : "text-primary"
          )}>
            <HighlightText text={title} query={searchTerm} />
          </h3>
          
          <div className={cn(
            "text-sm leading-relaxed line-clamp-3 prose prose-sm max-w-none mb-4",
            block_type === 'command' ? "prose-invert text-slate-400 font-mono" : "text-muted-foreground"
          )}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag, i) => (
                <span key={i} className={cn(
                  "text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 uppercase tracking-wider",
                  block_type === 'command' ? "bg-slate-800 text-slate-400" : "bg-primary/5 text-primary/50 border border-primary/5"
                )}>
                  <Hash className="w-2 h-2" />
                  <HighlightText text={tag} query={searchTerm} />
                </span>
              ))}
            </div>
          )}
        </div>


        {/* Quick Actions Hover */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
          <button
            onClick={handleCopy}
            className={cn(
              "p-2 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 px-3",
              block_type === 'command' ? "bg-slate-800 text-slate-200 hover:bg-slate-700" : "bg-white text-primary hover:bg-gray-50"
            )}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span className="text-[10px] font-bold uppercase tracking-widest">Quick Copy</span>
          </button>
          <div className={cn(
            "p-2 rounded-xl shadow-lg flex items-center gap-2 px-3",
            block_type === 'command' ? "bg-emerald-500 text-white" : "bg-primary text-white"
          )}>
            <Eye className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">View Full</span>
          </div>
        </div>

        {/* Footer Decoration */}
        <div className={cn(
          "h-2 w-full",
          block_type === 'command' ? "bg-slate-800" : style.bgColor
        )} />
      </div>

      {/* Modals */}
      <ViewNoteModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        note={{ title, content, block_type, stage_name, tags, created_at }}
      />

      {isAdmin && isEditOpen && (
        <NoteModal
          sectorId={sectorId || 1}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          initialData={{
            id,
            title,
            content,
            block_type,
            stage_name,
            tags,
            sector_id: sectorId || 1
          }}
        />
      )}
    </>
  )
}
