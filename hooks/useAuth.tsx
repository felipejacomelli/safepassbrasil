"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  phone: string
  address: string
  balance: number
  pendingBalance: number
  isVerified: boolean
  verificationStatus: "verified" | "pending" | "unverified"
  memberSince: string
  profileImage?: string
  isAdmin: boolean
  twoFactorEnabled: boolean
  birthDate?: string
  has2FA?: boolean
  transactions?: any[]
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: any) => Promise<void>
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading user data
    setTimeout(() => {
      setUser({
        id: "1",
        name: "João Silva",
        email: "joao.silva@example.com",
        phone: "+55 11 99999-9999",
        address: "São Paulo, SP",
        balance: 2500.0,
        pendingBalance: 500.0,
        isVerified: true,
        verificationStatus: "verified",
        memberSince: "Janeiro 2024",
        profileImage: "/placeholder.svg?height=100&width=100",
        isAdmin: true,
        twoFactorEnabled: false,
        birthDate: "1990-01-01",
        has2FA: false,
        transactions: [],
      })
      setIsLoading(false)
    }, 1000)
  }, [])

  const login = async (email: string, password: string) => {
    // Mock login logic
    setIsLoading(true)
    setTimeout(() => {
      setUser({
        id: "1",
        name: "João Silva",
        email: email,
        phone: "+55 11 99999-9999",
        address: "São Paulo, SP",
        balance: 2500.0,
        pendingBalance: 500.0,
        isVerified: true,
        verificationStatus: "verified",
        memberSince: "Janeiro 2024",
        isAdmin: true,
        twoFactorEnabled: false,
        birthDate: "1990-01-01",
        has2FA: false,
        transactions: [],
      })
      setIsLoading(false)
    }, 1000)
  }

  const logout = () => {
    setUser(null)
  }

  const register = async (userData: any) => {
    // Mock register logic
    setIsLoading(true)
    setTimeout(() => {
      setUser({
        id: "1",
        name: userData.name,
        email: userData.email,
        phone: userData.phone || "",
        address: userData.address || "",
        balance: 0,
        pendingBalance: 0,
        isVerified: false,
        verificationStatus: "unverified",
        memberSince: "Janeiro 2024",
        isAdmin: false,
        twoFactorEnabled: false,
        birthDate: userData.birthDate || "",
        has2FA: false,
        transactions: [],
      })
      setIsLoading(false)
    }, 1000)
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // Return mock data for development when context is not available
    return {
      user: {
        id: "1",
        name: "João Silva",
        email: "joao.silva@example.com",
        phone: "+55 11 99999-9999",
        address: "São Paulo, SP",
        balance: 2500.0,
        pendingBalance: 500.0,
        isVerified: true,
        verificationStatus: "verified",
        memberSince: "Janeiro 2024",
        profileImage: "/placeholder.svg?height=100&width=100",
        isAdmin: true,
        twoFactorEnabled: false,
        birthDate: "1990-01-01",
        has2FA: false,
        transactions: [],
      },
      isLoading: false,
      isAuthenticated: true,
      login: async () => {},
      logout: () => {},
      register: async () => {},
      updateUser: () => {},
    }
  }
  return context
}
