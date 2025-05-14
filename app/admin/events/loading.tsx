import { Skeleton } from "@/components/ui/skeleton"

export default function AdminEventsLoading() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-48 bg-zinc-800" />
        <Skeleton className="h-10 w-32 bg-zinc-800 rounded-md" />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Skeleton className="h-10 w-full md:w-2/3 bg-zinc-800 rounded-md" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-20 bg-zinc-800 rounded-md" />
          ))}
        </div>
      </div>

      {/* Events Table */}
      <Skeleton className="h-[600px] w-full bg-zinc-800 rounded-lg" />
    </div>
  )
}
