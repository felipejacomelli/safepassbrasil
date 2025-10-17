import { cache } from 'react'
import 'server-only'

// ✅ PRÁTICA NEXT.JS: Usar React cache para memoização
export const getEscrowBalance = cache(async (userId: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  
  const response = await fetch(`${apiUrl}/api/escrow/balance/`, {
    headers: { 'Authorization': `Token ${process.env.API_TOKEN}` },
    next: { revalidate: 300 } // ✅ PRÁTICA NEXT.JS: Revalidação a cada 5 minutos
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch escrow balance')
  }
  
  return response.json()
})

export const getEscrowTransactions = cache(async (userId: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  
  const response = await fetch(`${apiUrl}/api/escrow/transactions/`, {
    headers: { 'Authorization': `Token ${process.env.API_TOKEN}` },
    next: { revalidate: 600 } // ✅ PRÁTICA NEXT.JS: Revalidação a cada 10 minutos
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch escrow transactions')
  }
  
  const data = await response.json()
  return data.escrows || []
})

export const getEscrowDisputes = cache(async (userId: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  
  const response = await fetch(`${apiUrl}/api/escrow/disputes/`, {
    headers: { 'Authorization': `Token ${process.env.API_TOKEN}` },
    next: { revalidate: 600 } // ✅ PRÁTICA NEXT.JS: Revalidação a cada 10 minutos
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch escrow disputes')
  }
  
  const data = await response.json()
  return data.disputes || []
})

export const getEscrowTransfers = cache(async (userId: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  
  const response = await fetch(`${apiUrl}/api/escrow/transfers/`, {
    headers: { 'Authorization': `Token ${process.env.API_TOKEN}` },
    next: { revalidate: 600 } // ✅ PRÁTICA NEXT.JS: Revalidação a cada 10 minutos
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch escrow transfers')
  }
  
  const data = await response.json()
  return data.transfers || []
})

export const getEscrowNotifications = cache(async (userId: string, limit: number = 5) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  
  const response = await fetch(`${apiUrl}/api/escrow/notifications/?limit=${limit}`, {
    headers: { 'Authorization': `Token ${process.env.API_TOKEN}` },
    next: { revalidate: 60 } // ✅ PRÁTICA NEXT.JS: Revalidação a cada 1 minuto (dados críticos)
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch escrow notifications')
  }
  
  const data = await response.json()
  return data.notifications || []
})

export const getUnreadNotificationsCount = cache(async (userId: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  
  const response = await fetch(`${apiUrl}/api/escrow/notifications/unread-count/`, {
    headers: { 'Authorization': `Token ${process.env.API_TOKEN}` },
    next: { revalidate: 30 } // ✅ PRÁTICA NEXT.JS: Revalidação a cada 30 segundos
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch unread notifications count')
  }
  
  const data = await response.json()
  return data.unread_count || 0
})

// ✅ PRÁTICA NEXT.JS: Função para preload de dados
export const preloadEscrowData = (userId: string) => {
  void getEscrowBalance(userId)
  void getEscrowTransactions(userId)
  void getEscrowDisputes(userId)
  void getEscrowTransfers(userId)
  void getEscrowNotifications(userId)
  void getUnreadNotificationsCount(userId)
}



