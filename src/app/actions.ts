'use server'

import { revalidatePath } from 'next/cache'
import { WikiNote, NotePayload, WikiSector } from '@/lib/types'
import { getAuthContext } from '@/lib/auth'
import { createClient } from '@/utils/supabase/server'

/**
 * 관리자 권한을 확인하고 Supabase 클라이언트와 사용자 정보를 반환합니다.
 */
async function ensureAdmin() {
  const auth = await getAuthContext()
  if (!auth) {
    throw new Error('Unauthorized: Please login')
  }

  if (!auth.isAdmin) {
    throw new Error('Forbidden: Admin access required')
  }

  return { supabase: auth.supabase, user: auth.user }
}

/**
 * 섹터(기술 스택) CRUD
 */
export async function getSectors(): Promise<WikiSector[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('vibe_wiki_sectors')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    console.error('[getSectors] Error:', error.message)
    return []
  }
  return data as WikiSector[]
}

export async function addSector(category_id: number, name: string) {
  const { supabase } = await ensureAdmin()
  const { error } = await supabase
    .from('vibe_wiki_sectors')
    .insert([{ category_id, name }])

  if (error) throw new Error(error.message)
  revalidatePath('/')
}

export async function updateSector(id: number, name: string) {
  const { supabase } = await ensureAdmin()
  const { error } = await supabase
    .from('vibe_wiki_sectors')
    .update({ name })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/')
}

export async function deleteSector(id: number) {
  const { supabase } = await ensureAdmin()
  const { error } = await supabase
    .from('vibe_wiki_sectors')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/')
}

/**
 * 노트(지식) CRUD
 */
export async function getNotes(sectorId: number): Promise<WikiNote[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('vibe_wiki_notes')
    .select('*')
    .order('created_at', { ascending: false })

  if (sectorId) {
    query = query.eq('sector_id', sectorId)
  }

  const { data, error } = await query

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
      ...payload
    })
    .eq('id', id)

  if (error) {
    console.error('[updateNote] Update Error:', error.message)
    throw new Error(`Failed to update note: ${error.message}`)
  }

  revalidatePath('/')
}

/**
 * 미디어 업로드 (Supabase Storage)
 */
export async function uploadImage(formData: FormData): Promise<string> {
  const { supabase } = await ensureAdmin()
  const file = formData.get('file') as File
  if (!file) throw new Error('No file provided')

  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
  const filePath = `notes/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('wiki_media')
    .upload(filePath, file)

  if (uploadError) {
    console.error('[uploadImage] Upload Error:', uploadError.message)
    if (uploadError.message === 'Bucket not found') {
      throw new Error(`이미지 버킷('wiki_media')을 찾을 수 없습니다. Supabase 대시보드에서 'wiki_media'라는 이름의 Public 버킷을 생성해주세요.`)
    }
    if (uploadError.message.includes('row-level security policy')) {
      throw new Error(`업로드 권한(RLS)이 없습니다. Supabase SQL Editor에서 다음 명령을 실행해주세요: \n\nCREATE POLICY "Allow Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'wiki_media');`)
    }
    throw new Error(`이미지 업로드 실패: ${uploadError.message}`)
  }

  const { data } = supabase.storage
    .from('wiki_media')
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function signOutAction() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('[signOutAction] Error:', error.message)
    throw new Error('Failed to sign out')
  }
  
  const { redirect } = await import('next/navigation')
  redirect('/login')
}
