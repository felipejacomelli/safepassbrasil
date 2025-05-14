import { Skeleton } from "@/components/ui/skeleton"

export default function AdminDashboardLoading() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-32 bg-zinc-800" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-36 bg-zinc-800 rounded-md" />
          <Skeleton className="h-10 w-32 bg-zinc-800 rounded-md" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 bg-zinc-800 rounded-lg" />
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 bg-zinc-800 rounded-lg" />
        ))}
      </div>

      {/* Recent Sales */}
      <Skeleton className="h-96 bg-zinc-800 rounded-lg" />
    </div>
  )
}
