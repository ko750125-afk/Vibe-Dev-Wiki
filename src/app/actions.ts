'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { WikiNote, NotePayload } from '@/lib/types'

/**
 * 관리자 권한을 확인하고 Supabase 클라이언트와 사용자 정보를 반환합니다.
 */
async function ensureAdmin() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized: User not found')
  }

  // vibe_admin_users 테이블에서 이메일 확인
  const { data: adminUser, error: adminError } = await supabase
    .from('vibe_admin_users')
    .select('email')
    .eq('email', user.email)
    .single()

  if (adminError || !adminUser) {
    console.error(`[ensureAdmin] Forbidden: ${user.email} is not an admin.`, adminError?.message)
    throw new Error('Unauthorized: Admin access required')
  }

  return { supabase, user }
}


export async function getNotes(sectorId: number): Promise<WikiNote[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('vibe_wiki_notes')
    .select('*')
    .eq('sector_id', sectorId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(`[getNotes] Error fetching notes for sector ${sectorId}:`, error.message)
    return []
  }

  return data as WikiNote[]
}

export async function addNote(payload: NotePayload & { sector_id: number }) {
  const { supabase, user } = await ensureAdmin()
  
  const { error } = await supabase
    .from('vibe_wiki_notes')
    .insert([{
      ...payload,
      tags: payload.tags || [],
      user_id: user.id
    }])

  if (error) {
    console.error('[addNote] Insert Error:', error.message)
    throw new Error(`Failed to add note: ${error.message}`)
  }

  revalidatePath('/')
}

export async function deleteNote(id: string) {
  const { supabase } = await ensureAdmin()
  
  const { error } = await supabase
    .from('vibe_wiki_notes')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[deleteNote] Delete Error:', error.message)
    throw new Error(`Failed to delete note: ${error.message}`)
  }

  revalidatePath('/')
}

export async function updateNote(id: string, payload: NotePayload) {
  const { supabase } = await ensureAdmin()
  
  const { error } = await supabase
    .from('vibe_wiki_notes')
    .update({
      ...payload,
      tags: payload.tags || []
    })
    .eq('id', id)

  if (error) {
    console.error('[updateNote] Update Error:', error.message)
    throw new Error(`Failed to update note: ${error.message}`)
  }

  revalidatePath('/')
}
