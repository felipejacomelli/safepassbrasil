import { Skeleton } from "@/components/ui/skeleton"

export default function CheckoutErrorLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="w-full py-4 border-b border-zinc-800">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded">
              <div className="w-6 h-6 bg-background rounded" />
            </div>
            <Skeleton className="h-6 w-24 bg-accent" />
          </div>
          <div className="flex items-center gap-6">
            <Skeleton className="h-4 w-24 bg-accent" />
            <Skeleton className="h-4 w-20 bg-accent" />
            <Skeleton className="h-10 w-20 bg-accent rounded-md" />
          </div>
        </div>
      </nav>

      {/* Error Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Error Message */}
          <div className="bg-card rounded-lg p-8 mb-8 text-center">
            <Skeleton className="w-20 h-20 rounded-full mx-auto mb-6 bg-accent" />
            <Skeleton className="h-8 w-3/4 mx-auto mb-4 bg-accent" />
            <Skeleton className="h-4 w-full mx-auto mb-6 bg-accent" />
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Skeleton className="h-10 w-40 bg-accent rounded-md" />
              <Skeleton className="h-10 w-40 bg-accent rounded-md" />
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-card rounded-lg p-6">
            <Skeleton className="h-6 w-48 mb-4 bg-accent" />

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Skeleton className="w-8 h-8 rounded-full bg-accent flex-shrink-0" />
                <div className="w-full">
                  <Skeleton className="h-5 w-40 mb-1 bg-accent" />
                  <Skeleton className="h-4 w-full bg-accent" />
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Skeleton className="w-8 h-8 rounded-full bg-accent flex-shrink-0" />
                <div className="w-full">
                  <Skeleton className="h-5 w-40 mb-1 bg-accent" />
                  <Skeleton className="h-4 w-full bg-accent" />
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Skeleton className="w-8 h-8 rounded-full bg-accent flex-shrink-0" />
                <div className="w-full">
                  <Skeleton className="h-5 w-40 mb-1 bg-accent" />
                  <Skeleton className="h-4 w-full bg-accent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
