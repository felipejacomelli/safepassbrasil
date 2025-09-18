"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Home, LogIn } from 'lucide-react'

export default function UnauthorizedPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Se o usuário não está autenticado, redireciona para login
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin')
      return
    }

    // Se o usuário é admin, redireciona para o admin
    if (user?.isAdmin) {
      router.push('/admin')
      return
    }
  }, [user, isAuthenticated, router])

  const handleGoHome = () => {
    router.push('/')
  }

  const handleLogin = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Acesso Negado
          </CardTitle>
          <CardDescription className="text-gray-600">
            Você não tem permissão para acessar esta área do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-500">
            Esta área é restrita apenas para administradores do sistema.
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleGoHome}
              className="w-full"
              variant="default"
            >
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
            
            {!isAuthenticated && (
              <Button 
                onClick={handleLogin}
                className="w-full"
                variant="outline"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Fazer Login
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}