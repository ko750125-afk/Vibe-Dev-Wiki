'use client'

import { SECTORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useRouter, useSearchParams } from 'next/navigation'
import { LogOut, User, Loader2, Sparkles } from 'lucide-react'
import { useTransition } from 'react'

interface SidebarProps {
  userEmail?: string | null
  isAdmin?: boolean
}

export default function Sidebar({ userEmail, isAdmin }: SidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const currentSectorId = Number(searchParams.get('sector')) || 1

  const handleSectorClick = (id: number) => {
    if (id === currentSectorId) return
    startTransition(() => {
      router.push(`/?sector=${id}`)
    })
  }

  return (
    <aside className="w-72 h-screen border-r bg-cream/40 backdrop-blur-2xl flex flex-col sticky top-0 z-50">
      <div className="p-8 flex-1 overflow-y-auto scrollbar-hide">
        <div className="flex items-center gap-3 mb-10 group cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 group-hover:scale-105 transition-transform duration-500">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-black text-primary tracking-tighter text-lg leading-none">Vibe Dev-Wiki</h1>
            <p className="text-[10px] text-primary/40 font-black uppercase tracking-[0.2em] mt-1.5">Knowledge Hub</p>
          </div>
        </div>

        {/* Timeline Navigation */}
        <div className="relative mt-4">
          {/* Vertical Line with Gradient */}
          <div className="absolute left-[21px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-primary/20 via-primary/5 to-transparent rounded-full" />

          <nav className="space-y-7">
            {SECTORS.map((sector) => {
              const isActive = currentSectorId === sector.id
              const Icon = sector.icon

              return (
                <button
                  key={sector.id}
                  onClick={() => handleSectorClick(sector.id)}
                  className="group relative flex items-start gap-5 w-full text-left outline-none"
                >
                  {/* Timeline Dot & Icon */}
                  <div className={cn(
                    "relative z-10 w-11 h-11 rounded-2xl border-2 flex items-center justify-center transition-all duration-500",
                    isActive 
                      ? "bg-primary border-primary shadow-2xl shadow-primary/40 scale-105" 
                      : "bg-white border-primary/10 group-hover:border-primary/30 group-hover:scale-105"
                  )}>
                    <div className={cn(
                      "transition-all flex items-center justify-center",
                      isActive ? "text-white" : "text-primary/30 group-hover:text-primary/60"
                    )}>
                      {isPending && isActive ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Icon className={cn("w-5 h-5", isActive ? "scale-110" : "scale-100 group-hover:scale-110 transition-transform")} />
                      )}
                    </div>
                  </div>

                  {/* Label & Description */}
                  <div className="pt-1.5 pr-2">
                    <span className={cn(
                      "block text-sm font-black transition-colors tracking-tight",
                      isActive ? "text-primary" : "text-primary/40 group-hover:text-primary/80"
                    )}>
                      {sector.name}
                    </span>
                    <p className={cn(
                      "text-[10px] font-medium leading-tight mt-0.5 line-clamp-1 transition-colors",
                      isActive ? "text-primary/60" : "text-primary/20 group-hover:text-primary/40"
                    )}>
                      {sector.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* User Area & Signout */}
      <div className="p-6 border-t border-primary/5 bg-white/40 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-5 p-3 rounded-2xl bg-primary/5 border border-primary/5">
          <div className="w-10 h-10 bg-white shadow-sm border border-primary/10 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-primary/40" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-[10px] font-black text-primary/80 truncate leading-none mb-1">{userEmail?.split('@')[0]}</p>
            <p className="text-[9px] text-primary/40 truncate leading-none">{userEmail}</p>
            {isAdmin && (
              <span className="inline-block mt-2 bg-primary text-white text-[8px] px-1.5 py-0.5 rounded-md uppercase font-black tracking-widest shadow-lg shadow-primary/20">
                Admin
              </span>
            )}
          </div>
        </div>

        <form action="/auth/signout" method="post">
          <button className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl text-[11px] font-black text-primary/40 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 uppercase tracking-widest">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
