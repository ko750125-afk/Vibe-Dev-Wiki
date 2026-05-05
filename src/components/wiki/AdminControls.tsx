'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import NoteModal from './NoteModal'

interface AdminControlsProps {
  sectorId: number
  className?: string
  label?: string
}

export default function AdminControls({ sectorId, className, label = '키워드카드 추가' }: AdminControlsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={className ?? "fixed bottom-8 right-8 h-12 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent z-50 inline-flex items-center gap-2"}
      >
        <Plus className="w-4 h-4" />
        <span>{label}</span>
      </button>

      <NoteModal 
        sectorId={sectorId} 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}
