import { Skeleton } from "@/components/ui/skeleton"
import { AccountSidebar } from "@/components/account-sidebar"

export default function VerificationLoading() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-1/4">
            <AccountSidebar />
          </div>

          {/* Main Content */}
          <div className="md:w-3/4">
            <Skeleton className="h-10 w-64 bg-zinc-800 mb-6" />

            <div className="bg-zinc-900 rounded-lg p-6 mb-6">
              <Skeleton className="h-8 w-64 bg-zinc-800 mb-4" />

              <div className="bg-zinc-800 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Skeleton className="h-10 w-10 rounded-full bg-zinc-700 mr-4" />
                  <div>
                    <Skeleton className="h-6 w-32 bg-zinc-700 mb-2" />
                    <Skeleton className="h-4 w-full bg-zinc-700 mb-1" />
                    <Skeleton className="h-4 w-3/4 bg-zinc-700 mb-4" />
                    <Skeleton className="h-8 w-32 bg-zinc-700" />
                  </div>
                </div>
              </div>

              <Skeleton className="h-4 w-full bg-zinc-800 mb-2" />
              <Skeleton className="h-4 w-5/6 bg-zinc-800 mb-6" />

              <div className="space-y-6">
                <div className="bg-zinc-800 rounded-lg p-4">
                  <Skeleton className="h-6 w-48 bg-zinc-700 mb-2" />
                  <Skeleton className="h-4 w-full bg-zinc-700 mb-4" />
                  <Skeleton className="h-10 w-48 bg-zinc-700" />
                </div>

                <div className="bg-zinc-800 rounded-lg p-4">
                  <Skeleton className="h-6 w-48 bg-zinc-700 mb-2" />
                  <Skeleton className="h-4 w-full bg-zinc-700 mb-4" />
                  <Skeleton className="h-10 w-48 bg-zinc-700" />
                </div>

                <div className="bg-zinc-800 rounded-lg p-4">
                  <Skeleton className="h-6 w-48 bg-zinc-700 mb-2" />
                  <Skeleton className="h-4 w-full bg-zinc-700 mb-4" />
                  <Skeleton className="h-10 w-48 bg-zinc-700" />
                </div>

                <Skeleton className="h-12 w-full bg-zinc-800" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
