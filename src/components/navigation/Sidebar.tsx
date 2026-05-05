'use client'

import { useState, useEffect, useMemo, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Settings, 
  Plus, 
  Check, 
  X, 
  Edit2, 
  Trash2, 
  User, 
  LogOut,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SIDEBAR_CATEGORIES } from '@/lib/constants'
import { WikiSector } from '@/lib/types'
import { addSector, updateSector, deleteSector } from '@/app/actions'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface SidebarProps {
  userEmail: string | undefined
  isAdmin: boolean
  initialSectors: WikiSector[]
}

export default function Sidebar({ userEmail, isAdmin, initialSectors }: SidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const currentSectorId = Number(searchParams.get('sector')) || (initialSectors.length > 0 ? initialSectors[0].id : 0)

  const [activeCategoryId, setActiveCategoryId] = useState<number>(1)
  const [pendingSectorId, setPendingSectorId] = useState<number | null>(null)
  const [editingSectorId, setEditingSectorId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [newValue, setNewValue] = useState('')

  // 현재 선택된 섹터에 맞춰 카테고리 탭 활성화
  useEffect(() => {
    const currentSector = initialSectors.find(s => s.id === currentSectorId)
    if (currentSector) {
      setActiveCategoryId(currentSector.category_id)
    }
    setPendingSectorId(null)
  }, [currentSectorId, initialSectors])

  const filteredSectors = useMemo(() => 
    initialSectors.filter(s => s.category_id === activeCategoryId)
  , [activeCategoryId, initialSectors])

  const handleSectorClick = (id: number) => {
    if (id === currentSectorId) return
    setPendingSectorId(id)
    startTransition(() => {
      router.push(`/?sector=${id}`)
    })
  }

  // --- CRUD 기능 ---
  const handleAddSector = async () => {
    if (!newValue.trim()) return
    try {
      await addSector(activeCategoryId, newValue.trim())
      setNewValue('')
      setIsAdding(false)
    } catch (err) {
      alert('섹터 추가 실패')
    }
  }

  const handleUpdateSector = async (id: number) => {
    if (!editValue.trim()) return
    try {
      await updateSector(id, editValue.trim())
      setEditingSectorId(null)
    } catch (err) {
      alert('섹터 수정 실패')
    }
  }

  const handleDeleteSector = async (id: number) => {
    const isConfirmed = window.confirm(
      '⚠️ [위험] 기술 스택 삭제\n\n이 기술 스택을 삭제하면 해당 분류에 저장된 모든 지식 정보들이 함께 삭제되거나 연결을 잃게 됩니다.\n정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
    )
    if (!isConfirmed) return
    try {
      await deleteSector(id)
    } catch (err) {
      alert('섹터 삭제 실패')
    }
  }

  return (
    <aside className="h-screen flex bg-background text-foreground sticky top-0 z-50 border-r border-border">
      {/* 1. Icon Rail (좌측 아이콘 레일) */}
      <div className="w-[64px] border-r border-border flex flex-col items-center py-4 gap-4 bg-secondary">
        <div className="h-10 mb-4" /> {/* Logo removed */}

        <div className="flex-1 w-full flex flex-col items-center gap-2">
          {SIDEBAR_CATEGORIES.map((cat) => {
            const isActive = activeCategoryId === cat.id
            const Icon = cat.icon
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={cn(
                  "p-2.5 rounded-lg transition-all relative group",
                  isActive ? "bg-accent text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
                title={cat.name}
              >
                <Icon className="w-5 h-5" />
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-primary rounded-r-full" />
                )}
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-4 pb-2 items-center">
          <ThemeToggle />
          <button className="p-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Navigation Menu (상세 메뉴 패널) */}
      <div className="w-[270px] flex flex-col border-r border-border bg-background">
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              {SIDEBAR_CATEGORIES.find(c => c.id === activeCategoryId)?.name}
            </h2>
            {isAdmin && (
              <button 
                onClick={() => setIsAdding(true)}
                className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
                title="기술 스택 추가"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          <nav className="space-y-1">
            {/* 추가 모드 입력창 */}
            {isAdding && (
              <div className="px-3 py-2 flex items-center gap-2 bg-accent rounded-lg mb-2 ring-1 ring-ring/30">
                <input 
                  autoFocus
                  className="bg-transparent text-sm w-full outline-none text-foreground placeholder:text-muted-foreground/50"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSector()}
                  placeholder="기술 스택명..."
                />
                <button onClick={handleAddSector} className="text-muted-foreground hover:scale-110 transition-transform"><Check className="w-4 h-4"/></button>
                <button onClick={() => setIsAdding(false)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4"/></button>
              </div>
            )}

            {filteredSectors.map((sector) => {
              const isActive = currentSectorId === sector.id
              const isEditing = editingSectorId === sector.id

              return (
                <div key={sector.id} className="group relative">
                  {isEditing ? (
                    <div className="px-3 py-2 flex items-center gap-2 bg-accent rounded-lg ring-1 ring-ring/50">
                      <input 
                        autoFocus
                        className="bg-transparent text-sm w-full outline-none text-foreground"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdateSector(sector.id)}
                      />
                      <button onClick={() => handleUpdateSector(sector.id)} className="text-muted-foreground"><Check className="w-4 h-4"/></button>
                      <button onClick={() => setEditingSectorId(null)} className="text-muted-foreground"><X className="w-4 h-4"/></button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <button
                        onClick={() => handleSectorClick(sector.id)}
                        className={cn(
                          "flex-1 flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all",
                          isActive 
                            ? "bg-accent text-foreground font-bold" 
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                        )}
                      >
                        <span className="truncate">{sector.name}</span>
                        {isPending && pendingSectorId === sector.id && (
                          <Loader2 className="w-3 h-3 animate-spin text-primary" />
                        )}
                      </button>
                      
                      {/* 수정/삭제 버튼 (관리자용) */}
                      {isAdmin && (
                        <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingSectorId(sector.id)
                              setEditValue(sector.name)
                            }}
                            className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteSector(sector.id)
                            }}
                            className="p-1 hover:bg-red-500/10 rounded text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>

        {/* 푸터 (사용자 정보 및 로그아웃) */}
        <div className="mt-auto p-4 border-t border-border">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center border border-border">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold truncate text-foreground">{userEmail?.split('@')[0]}</p>
                {isAdmin && <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Admin</span>}
              </div>
            </div>

            <form action="/auth/signout" method="post">
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all border border-transparent hover:border-border">
                <LogOut className="w-4 h-4" />
                <span>SIGN OUT</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  )
}
