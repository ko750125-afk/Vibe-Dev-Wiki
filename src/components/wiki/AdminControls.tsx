'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import NoteModal from './NoteModal'

interface AdminControlsProps {
  sectorId: number
}

export default function AdminControls({ sectorId }: AdminControlsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-foreground text-background rounded-full shadow-2xl shadow-foreground/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group"
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      <NoteModal 
        sectorId={sectorId} 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}
