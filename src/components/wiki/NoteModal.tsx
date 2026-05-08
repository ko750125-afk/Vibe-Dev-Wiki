'use client'

import { useState, useEffect } from 'react'
import { 
  Loader2, Heading1, Heading2, Heading3, List, Code, Link as LinkIcon, Image as ImageIcon,
  Bold, Italic, ListOrdered, Quote
} from 'lucide-react'
import { addNote, updateNote, uploadImage } from '@/app/actions'
import { cn } from '@/lib/utils'
import { WikiNote, BlockType } from '@/lib/types'
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'

// --- Types & Constants ---

interface NoteModalProps {
  sectorId: number
  isOpen: boolean
  onClose: () => void
  initialData?: WikiNote
}

const ALLOWED_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'jfif'] as const

const extensions = [
  StarterKit,
  ImageExtension.configure({
    inline: true,
  }),
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === 'heading' && node.attrs.level === 3) {
        return '요약설명'
      }
      if (node.type.name === 'paragraph') {
        return '상세내용'
      }
      return ''
    },
    showOnlyWhenEditable: true,
    includeChildren: true,
  }),
]

// import { Extension } from '@tiptap/core'

interface ToolbarButtonProps {
  icon: React.ElementType
  onClick: () => void
  isActive: boolean
  title: string
  disabled?: boolean
}

const ToolbarButton = ({ icon: Icon, onClick, isActive, title, disabled }: ToolbarButtonProps) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "p-2 rounded-lg transition-all border",
      isActive ? "bg-foreground text-background border-foreground shadow-sm" : "text-muted-foreground bg-transparent border-transparent hover:bg-accent hover:text-foreground",
      disabled ? "opacity-50 cursor-not-allowed" : ""
    )}
  >
    <Icon className="w-4 h-4" />
  </button>
)

export default function NoteModal({ sectorId, isOpen, onClose, initialData }: NoteModalProps) {
  const [loading, setLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    block_type: 'tip' as BlockType,
    stage_name: '',
  })

  const updateFormData = (patch: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...patch }))
  }

  const editor = useEditor({
    extensions,
    content: formData.content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      updateFormData({ content: editor.getHTML() })
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none dark:prose-invert prose-headings:tracking-tight prose-pre:bg-slate-900 prose-pre:border prose-pre:border-white/5 whitespace-pre-wrap prose-p:my-2 prose-p:leading-relaxed prose-li:my-1 prose-ul:my-4 prose-ol:my-4 prose-stone prose-headings:text-foreground text-foreground/90 prose-a:text-primary prose-a:underline outline-none min-h-full h-full',
      },
    },
  })

  useEffect(() => {
    if (isOpen) {
      const defaultContent = '<h3></h3><hr><p></p>'
      const contentToSet = initialData?.content || defaultContent

      updateFormData({
        title: initialData?.title || '',
        content: contentToSet,
        block_type: initialData?.block_type || 'tip',
        stage_name: initialData?.stage_name || '',
      })
      if (editor) {
        editor.commands.setContent(contentToSet)
      }
    }
  }, [initialData, isOpen, editor])

  const handleImageUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const isImageType = file.type.startsWith('image/')
    const isCommonImageExt = fileExt && ALLOWED_IMAGE_EXTENSIONS.includes(fileExt as any)
    if (!isImageType && !isCommonImageExt) {
      alert('이미지 파일(png, jpg, jpeg, jfif)만 업로드 가능합니다.')
      return
    }

    setIsUploading(true)
    try {
      const uploadData = new FormData()
      uploadData.append('file', file)
      const url = await uploadImage(uploadData)
      editor?.chain().focus().setImage({ src: url }).run()
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
        className="max-w-4xl w-[95vw] bg-background border-border rounded-[24px] p-0 overflow-hidden shadow-2xl flex flex-col h-[85vh]"
      >
        <div className="sr-only">
          <DialogTitle>{initialData ? '지식 수정' : '새 지식 등록'}</DialogTitle>
          <DialogDescription>개발 지식을 기록하고 관리하는 모달입니다.</DialogDescription>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden bg-background">
          <div className="flex-1 flex flex-col overflow-hidden">
            <DialogHeader className="px-8 py-5 border-b border-border bg-background shrink-0">
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                placeholder="제목"
                className="w-full bg-transparent border-none outline-none text-2xl font-bold text-foreground placeholder:text-muted-foreground"
              />
            </DialogHeader>



            {/* Toolbar */}
            {editor && (
              <div className="flex items-center gap-1 p-3 px-8 bg-muted/20 border-b border-border shrink-0 overflow-x-auto">
                <div className="flex items-center gap-0.5 pr-4 mr-4 border-r border-border shrink-0">
                  <ToolbarButton icon={Heading1} title="Heading 1" isActive={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
                  <ToolbarButton icon={Heading2} title="Heading 2" isActive={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
                  <ToolbarButton icon={Heading3} title="Heading 3" isActive={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
                </div>
                <div className="flex items-center gap-0.5 pr-4 mr-4 border-r border-border shrink-0">
                  <ToolbarButton icon={Bold} title="Bold" isActive={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
                  <ToolbarButton icon={Italic} title="Italic" isActive={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
                </div>
                <div className="flex items-center gap-0.5 pr-4 mr-4 border-r border-border shrink-0">
                  <ToolbarButton icon={List} title="Bullet List" isActive={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
                  <ToolbarButton icon={ListOrdered} title="Ordered List" isActive={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
                  <ToolbarButton icon={Code} title="Code Block" isActive={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
                  <ToolbarButton icon={Quote} title="Blockquote" isActive={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
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
                  <ToolbarButton 
                    icon={isUploading ? Loader2 : ImageIcon} 
                    title="Upload Image" 
                    disabled={isUploading} 
                    isActive={false}
                    onClick={() => document.getElementById('image-upload')?.click()} 
                  />
                </div>
              </div>
            )}

            <div 
              className="flex-1 overflow-y-auto px-8 py-6 bg-background custom-scrollbar"
              onDrop={async (e) => {
                e.preventDefault()
                const file = e.dataTransfer.files[0]
                if (file) await handleImageUpload(file)
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <EditorContent editor={editor} className="h-full" />
            </div>

            {/* Action Buttons */}
            <div className="p-6 px-8 border-t border-border bg-background shrink-0">
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="w-32 h-11 rounded-lg text-sm font-medium border border-border bg-background text-foreground hover:bg-accent transition-colors"
                >
                  CANCEL
                </Button>
                <Button
                  disabled={loading}
                  type="submit"
                  className="w-32 h-11 rounded-lg text-sm font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'SAVE'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
