"use client"

import { Component, ReactNode } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="p-6">
          <Alert className="bg-red-950/20 border-red-500/30">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <AlertDescription className="text-red-400">
              <div className="space-y-3">
                <p className="font-medium">Ocorreu um erro inesperado</p>
                <p className="text-sm">
                  {this.state.error?.message || "Algo deu errado. Tente recarregar a página."}
                </p>
                <Button 
                  onClick={this.handleRetry}
                  variant="outline"
                  size="sm"
                  className="bg-red-900/20 border-red-500/30 text-red-400 hover:bg-red-900/30"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar novamente
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    return this.props.children
  }
}
