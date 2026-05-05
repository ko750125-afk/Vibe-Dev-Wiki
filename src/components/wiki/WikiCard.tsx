import { ShieldAlert, Key, Terminal, Lightbulb, Copy, Check, Trash2, Edit3, Eye, Zap } from 'lucide-react'
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
  created_at?: string
  isAdmin?: boolean
  sectorId: number
  sectorName: string
  searchTerm?: string
}

const STYLES = {
  security: {
    icon: ShieldAlert,
    borderColor: 'border-border',
    bgColor: 'bg-background',
    iconColor: 'text-red-500/70',
    label: 'SECURITY',
  },
  config: {
    icon: Key,
    borderColor: 'border-border',
    bgColor: 'bg-background',
    iconColor: 'text-muted-foreground',
    label: 'CONFIG',
  },
  command: {
    icon: Terminal,
    borderColor: 'border-slate-800 dark:border-slate-700',
    bgColor: 'bg-slate-900 dark:bg-slate-950',
    iconColor: 'text-slate-400',
    label: 'COMMAND',
  },
  tip: {
    icon: Lightbulb,
    borderColor: 'border-border',
    bgColor: 'bg-background',
    iconColor: 'text-muted-foreground',
    label: 'TIP',
  },
}

export default function WikiCard({ 
  id, 
  title, 
  content, 
  block_type, 
  stage_name, 
  created_at, 
  isAdmin, 
  sectorId,
  sectorName,
  searchTerm 
}: WikiCardProps) {
  const [copied, setCopied] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  
  const style = STYLES[block_type]

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

  const handleDelete = async (e?: React.MouseEvent) => {
    e?.stopPropagation()
    const isConfirmed = window.confirm(
      '⚠️ [경고] 지식 삭제\n\n작성하신 소중한 노하우가 영구적으로 삭제됩니다.\n정말로 삭제하시겠습니까?'
    )
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
          style.bgColor,
          isDeleting && "opacity-50 grayscale pointer-events-none"
        )}
      >
        {/* Content */}
        <div className="p-8 pt-10">
          <h3 className={cn(
            "font-black text-xl mb-3 leading-tight tracking-tight",
            block_type === 'command' ? "text-slate-100" : "text-foreground"
          )}>
            <HighlightText text={title} query={searchTerm} />
          </h3>
          
          <div className={cn(
            "text-sm leading-relaxed line-clamp-3 prose prose-sm max-w-none mb-4",
            block_type === 'command' ? "prose-invert text-slate-400 font-mono" : "text-muted-foreground"
          )}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content.replace(/\\n/g, '\n')}
            </ReactMarkdown>
          </div>
        </div>


        {/* Footer Decoration */}
        <div className={cn(
          "h-1 w-full",
          block_type === 'command' ? "bg-slate-800" : "bg-border"
        )} />
      </div>

      {/* Modals */}
      <ViewNoteModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        onEdit={isAdmin ? () => {
          setIsViewOpen(false)
          setIsEditOpen(true)
        } : undefined}
        onDelete={isAdmin ? handleDelete : undefined}
        note={{ title, content, block_type, stage_name, created_at }}
      />

      {isAdmin && isEditOpen && (
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
