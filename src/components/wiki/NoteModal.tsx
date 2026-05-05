'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, Plus, Edit3, Eye, PenTool, Hash } from 'lucide-react'
import { addNote, updateNote } from '@/app/actions'
import { cn } from '@/lib/utils'
import { WikiNote, BlockType } from '@/lib/types'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface NoteModalProps {
  sectorId: number
  isOpen: boolean
  onClose: () => void
  initialData?: WikiNote
}

export default function NoteModal({ sectorId, isOpen, onClose, initialData }: NoteModalProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    block_type: 'tip' as BlockType,
    stage_name: '',
    tags: [] as string[],
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        content: initialData.content || '',
        block_type: initialData.block_type,
        stage_name: initialData.stage_name,
        tags: initialData.tags || [],
      })
    } else {
      setFormData({
        title: '',
        content: '',
        block_type: 'tip' as BlockType,
        stage_name: '',
        tags: [],
      })
    }
    setActiveTab('write')
  }, [initialData, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (initialData) {
        await updateNote(initialData.id, formData)
      } else {
        await addNote({
          sector_id: sectorId,
          ...formData
        })
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
      <DialogContent className="max-w-3xl bg-cream border-primary/10 rounded-3xl p-0 overflow-hidden">
        <DialogHeader className="px-8 py-6 border-b border-primary/5 bg-white/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              {initialData ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-primary tracking-tight">
                {initialData ? '지식 수정' : '새 지식 등록'}
              </DialogTitle>
              <DialogDescription className="text-xs text-primary/40 font-medium">
                {initialData ? '기존 노하우의 내용을 보강합니다.' : '새로운 노하우를 위키에 추가합니다.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-primary/40 tracking-widest ml-1 uppercase">블록 타입</Label>
              <Select 
                value={formData.block_type} 
                onValueChange={(val: BlockType) => setFormData({ ...formData, block_type: val })}
              >
                <SelectTrigger className="bg-white border-2 border-primary/5 h-12 rounded-xl">
                  <SelectValue placeholder="타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="security">Security (보안)</SelectItem>
                  <SelectItem value="config">Config (설정)</SelectItem>
                  <SelectItem value="command">Command (명령어)</SelectItem>
                  <SelectItem value="tip">Tip (일반 팁)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-primary/40 tracking-widest ml-1 uppercase">단계 명칭</Label>
              <input
                required
                type="text"
                value={formData.stage_name}
                onChange={(e) => setFormData({ ...formData, stage_name: e.target.value })}
                placeholder="예: 초기설정, 배포전"
                className="w-full bg-white border-2 border-primary/5 rounded-xl px-4 h-12 focus:border-primary/20 outline-none transition-all font-medium text-primary placeholder:text-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label className="text-[10px] font-black text-primary/40 tracking-widest ml-1 uppercase">제목</Label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="지식의 제목을 입력하세요"
                className="w-full bg-white border-2 border-primary/5 rounded-xl px-4 h-12 focus:border-primary/20 outline-none transition-all font-bold text-primary placeholder:text-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-primary/40 tracking-widest ml-1 uppercase flex items-center gap-1">
                <Hash className="w-3 h-3" /> 태그
              </Label>
              <input
                type="text"
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                placeholder="태그1, 태그2"
                className="w-full bg-white border-2 border-primary/5 rounded-xl px-4 h-12 focus:border-primary/20 outline-none transition-all font-medium text-primary placeholder:text-primary/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1 mb-1">
              <Label className="text-[10px] font-black text-primary/40 tracking-widest uppercase">내용 (Markdown 지원)</Label>
            </div>
            
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-2 bg-primary/5 p-1 rounded-xl">
                <TabsTrigger value="write" className="rounded-lg gap-2">
                  <PenTool className="w-4 h-4" /> Write
                </TabsTrigger>
                <TabsTrigger value="preview" className="rounded-lg gap-2">
                  <Eye className="w-4 h-4" /> Preview
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="write" className="mt-0">
                <textarea
                  required
                  rows={10}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="상세 내용을 입력하세요 (Markdown 문법을 사용할 수 있습니다)..."
                  className={cn(
                    "w-full bg-white border-2 border-primary/5 rounded-xl px-4 py-4 focus:border-primary/20 outline-none transition-all font-medium text-primary placeholder:text-primary/20 resize-none min-h-[300px]",
                    formData.block_type === 'command' && "font-mono text-sm bg-slate-900 text-emerald-400 border-slate-800 focus:border-slate-700"
                  )}
                />
              </TabsContent>
              
              <TabsContent value="preview" className="mt-0">
                <div className="w-full bg-white border-2 border-primary/5 rounded-xl px-6 py-6 min-h-[300px] overflow-y-auto max-h-[400px] prose prose-sm max-w-none prose-headings:text-primary prose-p:text-primary/80 prose-code:text-emerald-600 prose-pre:bg-slate-900">
                  {formData.content ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {formData.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-primary/20 italic text-center py-20">입력된 내용이 없습니다.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="flex gap-3 pt-4 sm:justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl font-bold"
            >
              취소
            </Button>
            <Button
              disabled={loading}
              type="submit"
              className="flex-[2] h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {initialData ? '수정 완료' : '등록 완료'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
