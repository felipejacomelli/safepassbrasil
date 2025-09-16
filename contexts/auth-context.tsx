"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authApi, type LoginResponse, type ApiUser } from "@/lib/api"

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
  phone?: string
  address?: string
  profileImage?: string
  verificationStatus?: 'pending' | 'verified' | 'rejected'
  memberSince?: string
  twoFactorEnabled?: boolean
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
  register: (userData: { name: string; email: string; password: string; phone?: string; country?: string; cpf?: string }) => Promise<{ success: boolean; message?: string }>
  verifyTwoFactor: (email: string, code: string, isBackupCode?: boolean) => Promise<boolean>
  logout: () => void
  updateUser: (data: Partial<User>) => Promise<{ success: boolean; message?: string }>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  transactions: [],
  orders: [],
  sales: [],
  login: (email, password) => Promise.resolve({ success: false }),
  register: (userData: { name: string; email: string; password: string; phone?: string; country?: string; cpf?: string }) => Promise.resolve({ success: false }),
  verifyTwoFactor: (email, code, isBackupCode) => Promise.resolve(false),
  logout: () => {},
  updateUser: (data) => Promise.resolve({ success: false }),
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [orders, setOrders] = useState([])
  const [sales, setSales] = useState([])

  useEffect(() => {
    setMounted(true)
    // Check if user is logged in from localStorage
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem("user")
      const storedToken = localStorage.getItem("authToken")
      
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
      
      // Se há token, tentar obter dados atualizados do perfil
      if (storedToken) {
        tryAutoLogin('')
      }
      
      // Se não há token mas há usuário, significa que é um usuário mockado
      // Vamos tentar fazer login automático para obter um token válido
      if (storedUser && !storedToken) {
        const user = JSON.parse(storedUser)
        // Tentar fazer login silencioso para obter token
        tryAutoLogin(user.email)
      }
    }
    setIsLoading(false)
  }, [])

  // Função para tentar login automático e obter token
  const tryAutoLogin = async (email: string) => {
    try {
      // Tentar obter perfil com a API para verificar se há sessão ativa
      const profile = await authApi.getProfile()
      // Se conseguiu obter o perfil, significa que há uma sessão válida
      console.log('Sessão válida encontrada:', profile)
      
      // Atualizar o usuário com os dados da API, incluindo memberSince
      const updatedUser: User = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.location,
        has2FA: false,
        isVerified: true,
        isAdmin: false,
        balance: 0,
        pendingBalance: 0,
        transactions: [],
        memberSince: profile.created_at ? new Date(profile.created_at).getFullYear().toString() : '',
        verificationStatus: 'verified' as const
      }
      
      setUser(updatedUser)
      if (typeof window !== 'undefined') {
        localStorage.setItem("user", JSON.stringify(updatedUser))
      }
    } catch (error) {
      console.log('Nenhuma sessão válida encontrada, usando dados locais')
    }
  }

  // Update the login function to use only real API
  const login = async (email: string, password: string) => {
    try {
      // Fazer login com a API real
      const response = await authApi.login({ email, password });
      
      // Salvar token no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', response.token);
      }

      // Criar objeto de usuário compatível com o frontend
      const loggedInUser: User = {
        id: response.id,
        name: response.name,
        email: response.email,
        phone: response.phone,
        has2FA: false, // Por enquanto, assumir que não tem 2FA
        isVerified: true,
        isAdmin: false, // Verificar se é admin baseado no email ou outro campo
        balance: 0,
        pendingBalance: 0,
        transactions: [],
        memberSince: response.created_at ? new Date(response.created_at).getFullYear().toString() : '',
        verificationStatus: 'verified' as const
      };

      setUser(loggedInUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem("user", JSON.stringify(loggedInUser));
      }

      return { success: true, isAdmin: loggedInUser.isAdmin };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false };
    }
  }

  const register = async (userData: { name: string; email: string; password: string; phone?: string; country?: string; cpf?: string }) => {
    try {
      // Tentar fazer registro com a API real
      const response = await authApi.register(userData);
      
      // Salvar token no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', response.token);
      }

      // Criar objeto de usuário compatível com o frontend
      const registeredUser: User = {
        id: response.id,
        name: response.name,
        email: response.email,
        phone: response.phone,
        has2FA: false,
        isVerified: true,
        isAdmin: false,
        balance: 0,
        pendingBalance: 0,
        transactions: [],
        memberSince: response.created_at ? new Date(response.created_at).getFullYear().toString() : ''
      };

      setUser(registeredUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem("user", JSON.stringify(registeredUser));
      }

      return { success: true };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { success: false, message: 'Erro ao criar conta. Tente novamente.' };
    }
  }

  const verifyTwoFactor = async (email: string, code: string, isBackupCode = false) => {
    // Em uma aplicação real, isso verificaria o código com o servidor
    // Por enquanto, retornamos false pois não temos 2FA implementado
    return false
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem("user")
      localStorage.removeItem("authToken") // Remover token também
    }
  }

  const updateUser = async (data: Partial<User>): Promise<{ success: boolean; message?: string }> => {
    try {
      // Verificar se há token de autenticação
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      if (!token) {
        return { success: false, message: 'Token de autenticação não encontrado. Faça login novamente.' };
      }

      // Atualizar com a API real - mapear address do frontend para location do backend
      const response = await authApi.updateProfile({
        name: data.name,
        email: data.email,
        phone: data.phone,
        location: data.address, // Frontend usa address, backend espera location
      });

      // Atualizar o usuário local com os dados retornados da API
      const updatedUser: User = {
        ...user!,
        name: response.name,
        email: response.email,
        phone: response.phone,
        address: response.location, // Mapear location para address
      };

      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      return { success: true, message: 'Perfil atualizado com sucesso!' };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { success: false, message: 'Erro ao atualizar perfil. Tente novamente.' };
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: mounted ? !!user : false,
        isLoading: !mounted || isLoading,
        transactions,
        orders,
        sales,
        login,
        register,
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
