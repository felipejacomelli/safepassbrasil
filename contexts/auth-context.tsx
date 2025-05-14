"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Update the mockUser and add an admin user

// Mock user data
const mockUsers = [
  {
    id: "1",
    name: "Felipe Jacomelli",
    email: "felipejacomelli@gmail.com",
    password: "teste123", // In a real app, this would never be stored in plain text
    has2FA: false,
    isVerified: false,
    isAdmin: false,
    balance: 1250.75,
    pendingBalance: 450.25,
    transactions: [
      {
        id: "1",
        type: "purchase",
        amount: -350.0,
        date: "2025-04-20",
        status: "completed",
        description: "Ingresso Rock in Rio - Metallica",
      },
      {
        id: "2",
        type: "sale",
        amount: 420.5,
        date: "2025-04-18",
        status: "completed",
        description: "Ingresso Lollapalooza - Arctic Monkeys",
      },
      {
        id: "3",
        type: "withdrawal",
        amount: -500.0,
        date: "2025-04-15",
        status: "completed",
        description: "Saque para conta bancária",
      },
      {
        id: "4",
        type: "sale",
        amount: 650.0,
        date: "2025-04-10",
        status: "pending",
        description: "Ingresso Festival de Verão - Caetano Veloso",
      },
      {
        id: "5",
        type: "purchase",
        amount: -220.0,
        date: "2025-04-05",
        status: "completed",
        description: "Ingresso Show Charlie Brown Jr.",
      },
    ],
  },
  {
    id: "2",
    name: "Administrador",
    email: "admin@admin.com",
    password: "admin",
    has2FA: false,
    isVerified: true,
    isAdmin: true,
    balance: 0,
    pendingBalance: 0,
    transactions: [],
  },
]

// Update the User type to include isAdmin
type User = {
  id: string
  name: string
  email: string
  has2FA: boolean
  isVerified: boolean
  isAdmin: boolean
  balance: number
  pendingBalance: number
  transactions: Transaction[]
}

type Transaction = {
  id: string
  type: "purchase" | "sale" | "withdrawal"
  amount: number
  date: string
  status: "pending" | "completed"
  description: string
}

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  transactions: Transaction[]
  orders: any[]
  sales: any[]
  login: (email: string, password: string) => Promise<{ success: boolean; requires2FA?: boolean; isAdmin?: boolean }>
  verifyTwoFactor: (email: string, code: string, isBackupCode?: boolean) => Promise<boolean>
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  transactions: [],
  orders: [],
  sales: [],
  login: (email, password) => Promise.resolve({ success: false }),
  verifyTwoFactor: (email, code, isBackupCode) => Promise.resolve(false),
  logout: () => {},
  updateUser: (data) => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [orders, setOrders] = useState([])
  const [sales, setSales] = useState([])

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  // Update the login function to check both users
  const login = async (email: string, password: string) => {
    // In a real app, this would be an API call
    const user = mockUsers.find((u) => u.email === email && u.password === password)

    if (user) {
      // Check if 2FA is enabled
      if (user.has2FA) {
        return { success: true, requires2FA: true, isAdmin: user.isAdmin }
      }

      // If no 2FA, log in directly
      const loggedInUser = { ...user }
      setUser(loggedInUser)
      localStorage.setItem("user", JSON.stringify(loggedInUser))
      return { success: true, isAdmin: user.isAdmin }
    }

    return { success: false }
  }

  const verifyTwoFactor = async (email: string, code: string, isBackupCode = false) => {
    // In a real app, this would verify the code with the server
    // For demo purposes, we'll accept any valid format
    if (email === mockUsers[0].email) {
      const loggedInUser = { ...mockUsers[0] }
      setUser(loggedInUser)
      localStorage.setItem("user", JSON.stringify(loggedInUser))
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        transactions,
        orders,
        sales,
        login,
        verifyTwoFactor,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
