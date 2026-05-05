'use client'

import { useState, useEffect, useRef, memo } from 'react'
import { 
  Loader2, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  Code, 
  Link, 
  CheckSquare,
  Image as ImageIcon
} from 'lucide-react'
import { addNote, updateNote, uploadImage } from '@/app/actions'
import { cn } from '@/lib/utils'
import { WikiNote, BlockType } from '@/lib/types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// --- Types & Constants ---

interface NoteModalProps {
  sectorId: number
  isOpen: boolean
  onClose: () => void
  initialData?: WikiNote
}

const TOOLBAR_CONFIG = {
  headings: [
    { icon: Heading1, prefix: '# ', suffix: '', title: 'Heading 1' },
    { icon: Heading2, prefix: '## ', suffix: '', title: 'Heading 2' },
    { icon: Heading3, prefix: '### ', suffix: '', title: 'Heading 3' },
  ],
  formatting: [
    { icon: List, prefix: '- ', suffix: '', title: 'Bullet List' },
    { icon: CheckSquare, prefix: '- [ ] ', suffix: '', title: 'Checklist' },
    { icon: Code, prefix: '```\n', suffix: '\n```', title: 'Code Block' },
    { icon: Link, prefix: '[', suffix: '](url)', title: 'Insert Link' },
  ]
}

// --- Sub-components ---

const ToolbarButton = memo(({ tool, onAction }: { tool: any, onAction: (prefix: string, suffix: string) => void }) => {
  const Icon = tool.icon
  return (
    <button
      type="button"
      title={tool.title}
      onMouseDown={(e) => {
        e.preventDefault()
        onAction(tool.prefix, tool.suffix)
      }}
      className="p-2 rounded-lg text-muted-foreground hover:bg-background hover:text-foreground hover:shadow-sm transition-all border border-transparent hover:border-border"
    >
      <Icon className="w-4 h-4" />
    </button>
  )
})
ToolbarButton.displayName = 'ToolbarButton'

const MarkdownPreview = memo(({ content }: { content: string }) => (
  <div className={cn(
    "prose max-w-none dark:prose-invert prose-headings:tracking-tight prose-pre:bg-slate-900 prose-pre:border prose-pre:border-white/5 whitespace-normal",
    "prose-p:my-2 prose-p:leading-relaxed prose-li:my-1 prose-ul:my-4 prose-ol:my-4",
    "prose-table:border-collapse prose-table:border prose-table:border-border prose-th:border prose-th:border-border prose-th:bg-muted/50 prose-th:px-4 prose-th:py-3 prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-3",
    "prose-li:list-none [&_ul_input[type='checkbox']]:mr-3 [&_ul_input[type='checkbox']]:mt-1.5 prose-stone prose-headings:text-foreground text-foreground/90"
  )}>
    {content ? (
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
        {content}
      </ReactMarkdown>
    ) : (
      <div className="flex flex-col items-center justify-center h-full opacity-10 py-32">
        <p className="font-bold italic text-xl text-center text-foreground">미리보기 영역입니다.</p>
      </div>
    )}
  </div>
))
MarkdownPreview.displayName = 'MarkdownPreview'

// --- Main Component ---

export default function NoteModal({ sectorId, isOpen, onClose, initialData }: NoteModalProps) {
  const [loading, setLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    block_type: 'tip' as BlockType,
    stage_name: '',
  })

  const editorRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  // Sync state with initialData
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: initialData?.title || '',
        content: (initialData?.content || '').replace(/\\n/g, '\n'),
        block_type: initialData?.block_type || 'tip',
        stage_name: initialData?.stage_name || '',
      })
    }
  }, [initialData, isOpen])

  const handleScroll = () => {
    if (!editorRef.current || !previewRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = editorRef.current
    const scrollPercentage = scrollTop / (scrollHeight - clientHeight)
    previewRef.current.scrollTop = scrollPercentage * (previewRef.current.scrollHeight - previewRef.current.clientHeight)
  }

  const handleEditorAction = (prefix: string, suffix: string) => {
    const textarea = editorRef.current
    if (!textarea) return
    
    const { selectionStart: start, selectionEnd: end, value: text } = textarea
    const before = text.substring(0, start)
    const selection = text.substring(start, end)
    const after = text.substring(end)
    
    const newText = before + prefix + selection + suffix + after
    setFormData(prev => ({ ...prev, content: newText }))
    
    setTimeout(() => {
      textarea.focus({ preventScroll: true })
      const newPos = start + prefix.length + selection.length + suffix.length
      textarea.setSelectionRange(newPos, newPos)
    }, 0)
  }

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return alert('이미지 파일만 업로드 가능합니다.')

    setIsUploading(true)
    try {
      const uploadData = new FormData()
      uploadData.append('file', file)
      const url = await uploadImage(uploadData)
      handleEditorAction(`\n![image](${url})\n`, '')
    } catch (err) {
      alert('이미지 업로드에 실패했습니다. Storage 설정을 확인해주세요.')
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (initialData) {
        await updateNote(initialData.id, formData)
      } else {
        await addNote({ sector_id: sectorId, ...formData })
      }
      onClose()
    } catch (err) {
      alert(initialData ? '수정에 실패했습니다.' : '등록에 실패했습니다.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        hideClose 
        className="max-w-[95vw] w-[95vw] bg-background border-border rounded-[32px] p-0 overflow-hidden shadow-2xl flex flex-col h-[90vh]"
      >
        <div className="sr-only">
          <DialogTitle>{initialData ? '지식 수정' : '새 지식 등록'}</DialogTitle>
          <DialogDescription>개발 지식을 기록하고 관리하는 모달입니다.</DialogDescription>
        </div>

        {/* Header */}
        <DialogHeader className="px-10 py-6 border-b border-border bg-muted/50 shrink-0">
          <input
            required
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="지식의 제목을 입력하세요"
            className="w-full bg-transparent border-none outline-none font-black text-3xl text-foreground placeholder:text-muted-foreground/30"
          />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden bg-background">
          <div className="flex-1 grid grid-cols-2 overflow-hidden">
            
            {/* Editor Section */}
            <div className="flex flex-col min-w-0 border-r border-border bg-background overflow-hidden">
              <div className="flex-1 relative flex flex-col overflow-hidden">
                <textarea
                  ref={editorRef}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  onScroll={handleScroll}
                  onDrop={async (e) => {
                    e.preventDefault()
                    const file = e.dataTransfer.files[0]
                    if (file) await handleImageUpload(file)
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  placeholder="이곳에 지식의 내용을 마음껏 펼쳐보세요..."
                  className="flex-1 w-full bg-transparent px-10 py-10 outline-none font-medium text-foreground placeholder:text-muted-foreground/20 resize-none custom-scrollbar leading-relaxed text-lg"
                />
                
                {/* Toolbar */}
                <div className="flex items-center gap-1 p-4 bg-muted/30 border-t border-border shrink-0">
                  <div className="flex items-center gap-0.5 pr-4 mr-4 border-r border-border">
                    {TOOLBAR_CONFIG.headings.map((tool, i) => (
                      <ToolbarButton key={i} tool={tool} onAction={handleEditorAction} />
                    ))}
                  </div>

                  <div className="flex items-center gap-0.5 pr-4 mr-4 border-r border-border">
                    {TOOLBAR_CONFIG.formatting.map((tool, i) => (
                      <ToolbarButton key={i} tool={tool} onAction={handleEditorAction} />
                    ))}
                  </div>

                  <div className="flex items-center gap-0.5">
                    <input
                      type="file"
                      id="image-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) await handleImageUpload(file)
                        e.target.value = ''
                      }}
                    />
                    <button
                      type="button"
                      title="Upload Image"
                      disabled={isUploading}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        document.getElementById('image-upload')?.click()
                      }}
                      className="p-2 rounded-lg text-muted-foreground hover:bg-background hover:text-foreground hover:shadow-sm transition-all border border-transparent hover:border-border disabled:opacity-50"
                    >
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="flex flex-col bg-muted/5 overflow-hidden">
              <div ref={previewRef} className="flex-1 overflow-y-auto px-10 py-10 custom-scrollbar">
                <MarkdownPreview content={formData.content} />
              </div>

              {/* Action Buttons */}
              <div className="p-8 border-t border-border bg-muted/20 shrink-0">
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 h-14 rounded-2xl font-black text-xs tracking-widest border-2 border-border hover:bg-background text-muted-foreground hover:text-foreground transition-all shadow-sm"
                  >
                    CANCEL
                  </Button>
                  <Button
                    disabled={loading}
                    type="submit"
                    className="flex-1 h-14 rounded-2xl font-black text-xs tracking-widest bg-foreground hover:bg-foreground/90 text-background shadow-2xl shadow-foreground/20 transition-all hover:-translate-y-1 active:translate-y-0"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'SAVE'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
