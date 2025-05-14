import { Skeleton } from "@/components/ui/skeleton"

export default function SecurityLoading() {
  return (
    <div className="container mx-auto py-6">
      <Skeleton className="h-10 w-48 mb-6" />

      <div className="grid gap-6">
        <div className="border rounded-lg p-6 space-y-4">
          <Skeleton className="h-7 w-64 mb-2" />
          <Skeleton className="h-4 w-full max-w-md" />

          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6 space-y-4">
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-full max-w-md" />

          <div className="space-y-3 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
