export type BlockType = 'security' | 'config' | 'command' | 'tip'

export interface WikiNote {
  id: string
  sector_id: number
  stage_name: string
  title: string
  content: string
  block_type: BlockType
  tags: string[]
  user_id?: string
  created_at?: string
}

export interface NotePayload {
  stage_name: string
  title: string
  content: string
  block_type: BlockType
  tags: string[]
  sector_id?: number
}
