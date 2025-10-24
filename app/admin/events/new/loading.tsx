import { Skeleton } from "@/components/ui/skeleton"

export default function AdminNewEventLoading() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-48 bg-accent" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 bg-accent rounded-md" />
          <Skeleton className="h-10 w-32 bg-accent rounded-md" />
        </div>
      </div>

      <Skeleton className="h-12 w-full bg-accent rounded-md mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Skeleton className="h-[600px] w-full bg-accent rounded-lg" />
        </div>
        <div>
          <Skeleton className="h-[400px] w-full bg-accent rounded-lg" />
        </div>
      </div>
    </div>
  )
}
