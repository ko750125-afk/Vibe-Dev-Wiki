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

const ALLOWED_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'jfif'] as const

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

const normalizeMarkdown = (raw: string) => {
  return raw
    .split('\n')
    .map((line) => line.replace(/^(\#{1,3})(\S)/, (_m, hashes: string, rest: string) => `${hashes} ${rest}`))
    .join('\n')
}

const MarkdownPreview = memo(({ content }: { content: string }) => {
  const normalized = normalizeMarkdown(content)
  return (
    <div className={cn(
      "prose max-w-none dark:prose-invert prose-headings:tracking-tight prose-pre:bg-slate-900 prose-pre:border prose-pre:border-white/5 whitespace-normal",
      "prose-p:my-2 prose-p:leading-relaxed prose-li:my-1 prose-ul:my-4 prose-ol:my-4",
      "prose-table:border-collapse prose-table:border prose-table:border-border prose-th:border prose-th:border-border prose-th:bg-muted/50 prose-th:px-4 prose-th:py-3 prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-3",
      "prose-stone prose-headings:text-foreground text-foreground/90",
      "prose-a:text-primary prose-a:underline"
    )}>
      {normalized ? (
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
          {normalized}
        </ReactMarkdown>
      ) : (
        <div className="flex flex-col items-center justify-center h-full opacity-10 py-32">
          <p className="font-bold italic text-xl text-center text-foreground">미리보기 영역입니다.</p>
        </div>
      )}
    </div>
  )
})
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
  const updateFormData = (patch: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...patch }))
  }

  // Sync state with initialData
  useEffect(() => {
    if (isOpen) {
      updateFormData({
        title: initialData?.title || '',
        content: (initialData?.content || '').replace(/\\n/g, '\n'),
        block_type: initialData?.block_type || 'tip',
        stage_name: initialData?.stage_name || '',
      })
    }
  }, [initialData, isOpen])

  const syncPreviewScroll = () => {
    if (!editorRef.current || !previewRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = editorRef.current
    const scrollRange = scrollHeight - clientHeight
    if (scrollRange <= 0) {
      previewRef.current.scrollTop = 0
      return
    }
    const scrollPercentage = scrollTop / scrollRange
    previewRef.current.scrollTop = scrollPercentage * (previewRef.current.scrollHeight - previewRef.current.clientHeight)
  }

  const handleScroll = () => {
    syncPreviewScroll()
  }

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      syncPreviewScroll()
    })
    return () => cancelAnimationFrame(id)
  }, [formData.content])

  const handleEditorAction = (prefix: string, suffix: string) => {
    const textarea = editorRef.current
    if (!textarea) return
    
    const { selectionStart: start, selectionEnd: end, value: text } = textarea
    const before = text.substring(0, start)
    const selection = text.substring(start, end)
    const after = text.substring(end)
    
    const newText = before + prefix + selection + suffix + after
    updateFormData({ content: newText })
    
    setTimeout(() => {
      textarea.focus({ preventScroll: true })
      const newPos = start + prefix.length + selection.length + suffix.length
      textarea.setSelectionRange(newPos, newPos)
    }, 0)
  }

  const handleImageUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const isImageType = file.type.startsWith('image/')
    const isCommonImageExt = fileExt && ALLOWED_IMAGE_EXTENSIONS.includes(fileExt as (typeof ALLOWED_IMAGE_EXTENSIONS)[number])
    if (!isImageType && !isCommonImageExt) {
      alert('이미지 파일(png, jpg, jpeg, jfif)만 업로드 가능합니다.')
      return
    }

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
        className="max-w-[95vw] w-[95vw] bg-background border-border rounded-[24px] p-0 overflow-hidden shadow-2xl flex flex-col h-[90vh]"
      >
        <div className="sr-only">
          <DialogTitle>{initialData ? '지식 수정' : '새 지식 등록'}</DialogTitle>
          <DialogDescription>개발 지식을 기록하고 관리하는 모달입니다.</DialogDescription>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden bg-background">
          <div className="flex-1 grid grid-rows-[auto_auto_1fr] overflow-hidden">
            <DialogHeader className="px-8 py-5 border-b border-border bg-background shrink-0">
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                placeholder="제목"
                className="w-full bg-transparent border-none outline-none text-2xl font-semibold text-foreground placeholder:text-muted-foreground"
              />
            </DialogHeader>

            <div className="px-8 py-4 border-b border-border bg-background shrink-0">
              <textarea
                rows={2}
                maxLength={160}
                value={formData.stage_name}
                onChange={(e) => updateFormData({ stage_name: e.target.value })}
                placeholder="설명 (최대 2줄)"
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground outline-none focus:ring-2 focus:ring-ring/20 placeholder:text-muted-foreground"
              />
            </div>

            <div className="grid grid-cols-2 overflow-hidden">
              <div className="flex flex-col min-w-0 border-r border-border bg-background overflow-hidden">
                <textarea
                  ref={editorRef}
                  required
                  value={formData.content}
                  onChange={(e) => updateFormData({ content: e.target.value })}
                  onScroll={handleScroll}
                  onDrop={async (e) => {
                    e.preventDefault()
                    const file = e.dataTransfer.files[0]
                    if (file) await handleImageUpload(file)
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  placeholder="내용"
                  className="flex-1 w-full bg-background px-8 py-8 outline-none font-medium text-foreground placeholder:text-muted-foreground resize-none custom-scrollbar leading-relaxed text-base"
                />
                
                {/* Toolbar */}
                <div className="flex items-center gap-1 p-3 bg-muted/20 border-t border-border shrink-0">
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

              <div className="flex flex-col bg-background overflow-hidden">
                <div ref={previewRef} className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
                  <MarkdownPreview content={formData.content} />
                </div>

                {/* Action Buttons */}
                <div className="p-6 border-t border-border bg-background shrink-0">
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="flex-1 h-11 rounded-lg text-sm font-medium border border-border bg-background text-foreground hover:bg-accent transition-colors"
                    >
                      CANCEL
                    </Button>
                    <Button
                      disabled={loading}
                      type="submit"
                      className="flex-1 h-11 rounded-lg text-sm font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'SAVE'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
