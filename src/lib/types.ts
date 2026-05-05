export type BlockType = 'security' | 'config' | 'command' | 'tip'

export interface WikiSector {
  id: number
  category_id: number // 1: Client, 2: Server, 3: DB, 4: Others
  name: string
  icon?: string
  created_at?: string
}

export interface WikiNote {
  id: string
  sector_id: number
  stage_name: string
  title: string
  content: string
  block_type: BlockType
  user_id?: string
  created_at?: string
}

export interface NotePayload {
  stage_name: string
  title: string
  content: string
  block_type: BlockType
  sector_id?: number
}
