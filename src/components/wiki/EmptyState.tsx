import { LucideIcon, SearchX, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  sectorName: string
  SectorIcon?: LucideIcon
  isAdmin: boolean
  onReset?: () => void
}

export default function EmptyState({ sectorName, SectorIcon, isAdmin, onReset }: EmptyStateProps) {
  const isSearch = sectorName.includes('검색 결과')
  const Icon = SectorIcon || (isSearch ? SearchX : Sparkles)

  return (
    <div className="flex flex-col items-center justify-center py-32 px-4 text-center border-2 border-dashed border-border rounded-[40px] bg-background/30 backdrop-blur-sm animate-in zoom-in-95 duration-500 max-w-2xl mx-auto">
      <div className="relative mb-10">
        <div className="absolute inset-0 bg-border/50 blur-3xl rounded-full scale-150" />
        <div className="relative z-10 w-28 h-28 bg-card rounded-[32px] shadow-2xl shadow-foreground/5 flex items-center justify-center border border-border rotate-12 group-hover:rotate-0 transition-transform duration-700">
          <Icon className="w-12 h-12 text-muted-foreground/40" />
        </div>
      </div>
      
      <h3 className="text-2xl font-black text-foreground tracking-tight mb-4">
        {isSearch ? '일치하는 지식을 찾지 못했습니다' : `${sectorName}의 지식을 채워주세요`}
      </h3>
      
      <p className="text-muted-foreground font-medium max-w-[320px] leading-relaxed mb-8">
        {isSearch 
          ? '다른 검색어를 입력하거나, 필터를 확인해보세요.' 
          : '아직 등록된 노하우가 없습니다. 부장님의 소중한 경험을 첫 번째로 공유해보세요!'}
      </p>

      {isSearch && onReset && (
        <Button 
          onClick={onReset}
          variant="outline"
          className="h-12 px-8 rounded-2xl font-bold border-border hover:bg-muted text-foreground transition-all active:scale-95"
        >
          검색 초기화
        </Button>
      )}

      {isAdmin && !isSearch && (
        <div className="mt-8 flex items-center gap-2 px-5 py-2 bg-muted rounded-full border border-border">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
            Admin Authoring Enabled
          </span>
        </div>
      )}
    </div>
  )
}
