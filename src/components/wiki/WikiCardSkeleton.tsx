import { Skeleton } from "@/components/ui/skeleton"

export function WikiCardSkeleton() {
  return (
    <div className="rounded-2xl border-2 border-primary/5 bg-white p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-24 w-full" />
      <div className="h-1.5 w-full bg-primary/5 rounded-full" />
    </div>
  )
}
