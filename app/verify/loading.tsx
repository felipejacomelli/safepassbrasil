import { Skeleton } from "@/components/ui/skeleton"

export default function VerifyLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-center mb-4">
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>

          <Skeleton className="h-8 w-64 mx-auto mb-2" />
          <Skeleton className="h-4 w-48 mx-auto mb-6" />

          <div className="mt-6 space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="mt-4 text-center">
            <Skeleton className="h-4 w-40 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}
