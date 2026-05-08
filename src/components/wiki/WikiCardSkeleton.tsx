import { Skeleton } from "@/components/ui/skeleton"

export function WikiCardSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-stretch overflow-hidden rounded-xl border border-border bg-background min-h-[120px]">
      <div className="w-full sm:w-1/3 sm:min-w-[200px] sm:max-w-[300px] p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-border bg-muted/20 flex flex-col justify-center gap-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
      </div>
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-center gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  )
}
