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

export const WIKI_PROSE_CLASSES = 
  "prose max-w-none dark:prose-invert " +
  "prose-headings:tracking-tight prose-headings:text-foreground prose-headings:font-bold " +
  "prose-p:my-2 prose-p:leading-relaxed text-foreground/90 " +
  "prose-pre:bg-slate-900 prose-pre:border prose-pre:border-white/5 " +
  "prose-a:text-primary prose-a:underline " +
  "prose-ul:my-4 prose-ol:my-4 prose-li:my-1 " +
  "whitespace-pre-wrap break-words outline-none"
