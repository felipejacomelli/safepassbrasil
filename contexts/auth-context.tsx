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
  cpf?: string
  country?: string
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

type OccurrenceContext = {
  eventId: string
  occurrenceId: string
  selectedTickets?: any[]
  returnUrl: string
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
  // Funções para gerenciar contexto de ocorrência
  saveOccurrenceContext: (context: OccurrenceContext) => void
  getOccurrenceContext: () => OccurrenceContext | null
  clearOccurrenceContext: () => void
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
  // Funções padrão para contexto de ocorrência
  saveOccurrenceContext: (context) => {},
  getOccurrenceContext: () => null,
  clearOccurrenceContext: () => {},
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
      
      // Se há token válido, tentar obter dados atualizados do perfil
      if (storedToken && storedToken !== 'null' && storedToken !== 'undefined') {
        tryAutoLogin('')
      } else {
        // Se não há token válido, limpar dados antigos e finalizar loading
        if (storedUser) {
          localStorage.removeItem('user');
          setUser(null);
        }
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [])

  // Debug effect removido para evitar loop infinito de re-renderizações

  // Função para tentar login automático e obter token
  const tryAutoLogin = async (email: string) => {
    try {
      // Verificar se há token válido antes de fazer a chamada
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      // Tentar obter perfil com a API para verificar se há sessão ativa
      const profile = await authApi.getProfile()
      // Se conseguiu obter o perfil, significa que há uma sessão válida
      
      // Determine if user is admin based on backend fields
      const isAdmin = profile.is_staff || profile.is_superuser || false
      
      // Atualizar o usuário com os dados da API, incluindo memberSince
      const updatedUser: User = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.location,
        cpf: profile.cpf,
        country: profile.country,
        profileImage: profile.profile_image, // Mapear profile_image para profileImage
        has2FA: false,
        isVerified: true,
        isAdmin: isAdmin, // Use real admin status from backend
        balance: 0,
        pendingBalance: 0,
        transactions: [],
        memberSince: profile.created_at ? new Date(profile.created_at).getFullYear().toString() : ''
      }
      
      
      setUser(updatedUser)
      if (typeof window !== 'undefined') {
        localStorage.setItem("user", JSON.stringify(updatedUser))
        
        // Sincronizar dados com cookies para o middleware
        document.cookie = `authToken=${storedToken}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 dias
        document.cookie = `userData=${JSON.stringify(updatedUser)}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 dias
      }
    } catch (error: any) {
      
      // Se o erro for de token inválido, limpar dados de autenticação
      if (error.message && (error.message.includes('Invalid token') || error.message.includes('401') || error.message.includes('Unauthorized'))) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          
          // Limpar cookies também
          document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'userData=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        setUser(null);
      }
    } finally {
      // Sempre finalizar o loading após tentar verificar
      setIsLoading(false)
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

      // Buscar dados completos do perfil após login bem-sucedido
      const profile = await authApi.getProfile();

      // Determine if user is admin based on backend fields
      const isAdmin = profile.is_staff || profile.is_superuser || false;

      // Criar objeto de usuário compatível com o frontend usando dados completos do perfil
      const loggedInUser: User = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        cpf: profile.cpf,
        country: profile.country,
        address: profile.location,
        has2FA: false,
        isVerified: true,
        isAdmin: isAdmin,
        balance: 0,
        pendingBalance: 0,
        transactions: [],
        memberSince: profile.created_at ? new Date(profile.created_at).getFullYear().toString() : ''
      };

      setUser(loggedInUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        
        // Sincronizar dados com cookies para o middleware
        document.cookie = `authToken=${response.token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 dias
        document.cookie = `userData=${JSON.stringify(loggedInUser)}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 dias
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

      // Determine if user is admin based on backend fields
      const isAdmin = response.is_staff || response.is_superuser || false

      // Criar objeto de usuário compatível com o frontend
      const registeredUser: User = {
        id: response.id,
        name: response.name,
        email: response.email,
        phone: response.phone,
        cpf: response.cpf,
        country: response.country,
        address: response.location,
        has2FA: false,
        isVerified: true,
        isAdmin: isAdmin, // Use real admin status from backend
        balance: 0,
        pendingBalance: 0,
        transactions: [],
        memberSince: response.created_at ? new Date(response.created_at).getFullYear().toString() : ''
      }


      setUser(registeredUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem("user", JSON.stringify(registeredUser));
      }

      return { success: true };
    } catch (error: any) {
      console.error('Erro no registro:', error);
      
      // Tentar extrair informações específicas do erro
      let errorMessage = 'Erro ao criar conta. Tente novamente.';
      
      if (error.message) {
        // Verificar se é erro de CPF duplicado
        if (error.message.includes('duplicate key') && error.message.includes('cpf')) {
          errorMessage = 'Este CPF já está cadastrado no sistema';
        }
        // Verificar se é erro de email duplicado
        else if (error.message.includes('duplicate key') && error.message.includes('email')) {
          errorMessage = 'Este email já está cadastrado no sistema';
        }
        // Verificar se é erro de validação
        else if (error.message.includes('400') || error.message.includes('Bad Request')) {
          errorMessage = 'Dados inválidos. Verifique as informações e tente novamente.';
        }
      }
      
      // Tentar fazer parse da resposta de erro se disponível
      try {
        if (error.response) {
          const errorData = await error.response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          }
        }
      } catch (parseError) {
        // Se não conseguir fazer parse, usar a mensagem padrão
      }
      
      return { success: false, message: errorMessage };
    }
  }

  const verifyTwoFactor = async (email: string, code: string, isBackupCode = false) => {
    // Em uma aplicação real, isso verificaria o código com o servidor
    // Por enquanto, retornamos false pois não temos 2FA implementado
    return false
  }

  const logout = async () => {
    try {
      // Chama a API de logout do backend
      await authApi.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Remove o token e limpa o estado independentemente do resultado da API
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        
        // Limpar cookies também
        document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'userData=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    }
  };

  const updateUser = async (data: Partial<User>): Promise<{ success: boolean; message?: string }> => {
    try {
      // Verificar se há token de autenticação
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      if (!token) {
        return { success: false, message: 'Token de autenticação não encontrado. Faça login novamente.' };
      }

      // Verificar se o usuário está autenticado no estado
      if (!user) {
        return { success: false, message: 'Usuário não autenticado. Faça login novamente.' };
      }

      // Verificar se o token ainda é válido fazendo uma requisição de teste
      try {
        await authApi.getProfile();
      } catch (tokenError) {
        // Limpar dados de autenticação inválidos
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
          localStorage.removeItem('authToken');
        }
        return { success: false, message: 'Sessão expirada. Faça login novamente.' };
      }

      // Atualizar com a API real - mapear campos corretamente
      const response = await authApi.updateProfile({
        name: data.name,
        email: data.email,
        phone: data.phone,
        country: data.country,
        profile_image: data.profileImage, // Mapear profileImage para profile_image
      });

      // Atualizar o usuário local com os dados retornados da API
      const updatedUser: User = {
        ...user!,
        name: response.name,
        email: response.email,
        phone: response.phone,
        address: response.location, // Backend retorna location, frontend usa address
        cpf: response.cpf,
        country: response.country,
        profileImage: response.profile_image, // Mapear profile_image para profileImage
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

  // Funções para gerenciar contexto de ocorrência
  const saveOccurrenceContext = (context: OccurrenceContext) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pendingOccurrenceContext', JSON.stringify(context))
    }
  }

  const getOccurrenceContext = (): OccurrenceContext | null => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pendingOccurrenceContext')
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch (error) {
          localStorage.removeItem('pendingOccurrenceContext')
        }
      }
    }
    return null
  }

  const clearOccurrenceContext = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pendingOccurrenceContext')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user, // Simplificado: se há usuário, está autenticado
        isLoading: !mounted || isLoading,
        transactions,
        orders,
        sales,
        login,
        register,
        verifyTwoFactor,
        logout,
        updateUser,
        // Funções de contexto de ocorrência
        saveOccurrenceContext,
        getOccurrenceContext,
        clearOccurrenceContext,
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
