import { Suspense } from 'react'
import { getEscrowBalance, getEscrowTransactions, getEscrowDisputes, getEscrowTransfers, getEscrowNotifications, getUnreadNotificationsCount } from '@/lib/escrow-data'

// ✅ PRÁTICA NEXT.JS: Server Component com Suspense
export async function EscrowDataProvider({ userId, children }: { userId: string, children: React.ReactNode }) {
  return (
    <Suspense fallback={<EscrowDataSkeleton />}>
      <EscrowDataLoader userId={userId}>
        {children}
      </EscrowDataLoader>
    </Suspense>
  )
}

// ✅ PRÁTICA NEXT.JS: Server Component que carrega dados
async function EscrowDataLoader({ userId, children }: { userId: string, children: React.ReactNode }) {
  // ✅ PRÁTICA NEXT.JS: Parallel data fetching
  const [balance, transactions, disputes, transfers, notifications, unreadCount] = await Promise.all([
    getEscrowBalance(userId),
    getEscrowTransactions(userId),
    getEscrowDisputes(userId),
    getEscrowTransfers(userId),
    getEscrowNotifications(userId),
    getUnreadNotificationsCount(userId)
  ])

  return (
    <div data-escrow-data={JSON.stringify({
      balance,
      transactions,
      disputes,
      transfers,
      notifications,
      unreadCount
    })}>
      {children}
    </div>
  )
}

// ✅ PRÁTICA NEXT.JS: Loading skeleton
function EscrowDataSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
    </div>
  )
}
