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
  LogOut,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SIDEBAR_CATEGORIES } from '@/lib/constants'
import { WikiSector } from '@/lib/types'
import { addSector, updateSector, deleteSector, signOutAction } from '@/app/actions'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface SidebarProps {
  userEmail: string | undefined
  isAdmin: boolean
  initialSectors: WikiSector[]
}

const DELETE_SECTOR_TITLE = '⚠️ 기술 스택 삭제'
const DELETE_SECTOR_DESCRIPTION = '이 기술 스택을 삭제하면 해당 분류에 저장된 모든 지식 정보들이 함께 삭제되거나 연결을 잃게 됩니다. 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'

const startsWithEnglish = (value: string) => /^[A-Za-z]/.test(value)

const sortSectorNames = (a: WikiSector, b: WikiSector) => {
  const aName = a.name.trim()
  const bName = b.name.trim()
  const aIsEnglish = startsWithEnglish(aName)
  const bIsEnglish = startsWithEnglish(bName)

  if (aIsEnglish !== bIsEnglish) {
    return aIsEnglish ? -1 : 1
  }

  return aName.localeCompare(bName, aIsEnglish ? 'en' : 'ko', { sensitivity: 'base' })
}

export default function Sidebar({ userEmail, isAdmin, initialSectors }: SidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const currentSectorIdFromUrl = Number(searchParams.get('sector')) || (initialSectors.length > 0 ? initialSectors[0].id : 0)
  const [currentSectorId, setCurrentSectorId] = useState(currentSectorIdFromUrl)

  const [activeCategoryId, setActiveCategoryId] = useState<number>(1)
  const [pendingSectorId, setPendingSectorId] = useState<number | null>(null)
  const [editingSectorId, setEditingSectorId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [newValue, setNewValue] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // 삭제용 상태
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [sectorToDelete, setSectorToDelete] = useState<number | null>(null)

  // URL 파라미터 변경 시 초기화
  useEffect(() => {
    setCurrentSectorId(currentSectorIdFromUrl)
  }, [currentSectorIdFromUrl])

  // 커스텀 이벤트 (sectorChange) 수신을 통한 상태 동기화
  useEffect(() => {
    const handleSectorChange = (e: CustomEvent<number>) => {
      setCurrentSectorId(e.detail)
    }
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      const id = Number(params.get('sector')) || (initialSectors.length > 0 ? initialSectors[0].id : 0)
      setCurrentSectorId(id)
      window.dispatchEvent(new CustomEvent('sectorChange', { detail: id }))
    }
    window.addEventListener('sectorChange', handleSectorChange as EventListener)
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('sectorChange', handleSectorChange as EventListener)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [initialSectors])

  // 현재 선택된 섹터에 맞춰 카테고리 탭 활성화
  useEffect(() => {
    const currentSector = initialSectors.find(s => s.id === currentSectorId)
    if (currentSector) {
      setActiveCategoryId(currentSector.category_id)
    }
    setPendingSectorId(null)
  }, [currentSectorId, initialSectors])

  const filteredSectors = useMemo(() => 
    initialSectors
      .filter(s => s.category_id === activeCategoryId)
      .sort(sortSectorNames)
  , [activeCategoryId, initialSectors])

  const handleSectorClick = (id: number) => {
    setIsMobileMenuOpen(false)
    if (id === currentSectorId) return
    setCurrentSectorId(id)
    window.history.pushState(null, '', `/?sector=${id}`)
    window.dispatchEvent(new CustomEvent('sectorChange', { detail: id }))
  }

  // --- CRUD 기능 ---
  const handleAddSector = async () => {
    if (!newValue.trim()) return
    try {
      await addSector(activeCategoryId, newValue.trim())
      setNewValue('')
      setIsAdding(false)
    } catch {
      alert('섹터 추가 실패')
    }
  }

  const handleUpdateSector = async (id: number) => {
    if (!editValue.trim()) return
    try {
      await updateSector(id, editValue.trim())
      setEditingSectorId(null)
    } catch {
      alert('섹터 수정 실패')
    }
  }

  const handleDeleteSector = async () => {
    if (sectorToDelete === null) return
    try {
      await deleteSector(sectorToDelete)
      setIsDeleteDialogOpen(false)
      setSectorToDelete(null)
    } catch {
      alert('섹터 삭제 실패')
    }
  }

  return (
    <>
      {/* 모바일 배경 오버레이 */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <aside className="h-screen flex bg-background text-foreground sticky top-0 z-50 border-r border-border w-[64px] md:w-auto">
        {/* 1. Icon Rail (좌측 아이콘 레일) */}
        <div className="w-[64px] border-r border-border flex flex-col items-center py-4 gap-4 bg-secondary z-50">
        <div className="h-10 mb-4 flex items-center justify-center">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg shadow-sm" />
        </div>

        <div className="flex-1 w-full flex flex-col items-center gap-2">
          {SIDEBAR_CATEGORIES.map((cat) => {
            const isActive = activeCategoryId === cat.id
            const Icon = cat.icon
            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (isActive) {
                    setIsMobileMenuOpen(!isMobileMenuOpen)
                  } else {
                    setActiveCategoryId(cat.id)
                    setIsMobileMenuOpen(true)
                  }
                }}
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
      <div className={cn(
        "absolute left-[64px] top-0 h-screen w-[270px] flex flex-col border-r border-border bg-background shadow-xl md:shadow-none transition-transform duration-300 ease-in-out md:relative md:left-0 z-40",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-foreground uppercase tracking-wide">
              {SIDEBAR_CATEGORIES.find(c => c.id === activeCategoryId)?.name}
            </h2>
            <button 
              onClick={() => setIsAdding(true)}
              className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
              title="기술 스택 추가"
            >
              <Plus className="w-4 h-4" />
            </button>
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
                      
                      <div className="absolute right-2 flex items-center gap-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingSectorId(sector.id)
                            setEditValue(sector.name)
                          }}
                          className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
                          title="수정"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            setSectorToDelete(sector.id)
                            setIsDeleteDialogOpen(true)
                          }}
                          className="p-1 hover:bg-red-500/10 rounded text-muted-foreground hover:text-red-500 transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
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
                <svg className="w-4 h-4 text-foreground" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold truncate text-foreground">{userEmail?.split('@')[0]}</p>
                {isAdmin && <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">User</span>}
              </div>
            </div>

            <form action={signOutAction}>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all border border-transparent hover:border-border">
                <LogOut className="w-4 h-4" />
                <span>SIGN OUT</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{DELETE_SECTOR_TITLE}</AlertDialogTitle>
            <AlertDialogDescription>
              {DELETE_SECTOR_DESCRIPTION}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSectorToDelete(null)}>취소</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSector}
              className="bg-red-600 hover:bg-red-700 text-white border-none"
            >
              삭제하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
    </>
  )
}
