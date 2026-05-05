import { 
  Monitor, 
  Server, 
  Database, 
  Globe
} from 'lucide-react'

export const SIDEBAR_CATEGORIES = [
  { id: 1, name: 'Client Side', icon: Monitor },
  { id: 2, name: 'Server Side', icon: Server },
  { id: 3, name: 'DataBase', icon: Database },
  { id: 4, name: 'Others', icon: Globe },
] as const

export type CategoryId = typeof SIDEBAR_CATEGORIES[number]['id']
