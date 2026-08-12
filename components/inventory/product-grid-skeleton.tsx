import { Skeleton } from "@/components/ui/skeleton"

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-4 rounded-[var(--radius)] border border-border bg-card p-5"
        >
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-10 w-1/2" />
          <div className="flex justify-end gap-1 border-t border-border pt-3">
            <Skeleton className="size-7" />
            <Skeleton className="size-7" />
          </div>
        </div>
      ))}
    </div>
  )
}
