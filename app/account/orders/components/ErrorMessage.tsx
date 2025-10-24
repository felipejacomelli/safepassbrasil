"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
  retryText?: string
  className?: string
}

export function ErrorMessage({ 
  title = "Erro", 
  message, 
  onRetry, 
  retryText = "Tentar novamente",
  className = "" 
}: ErrorMessageProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" aria-hidden="true" />
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      
      <p className="text-muted-foreground mb-6 max-w-md">
        {message}
      </p>
      
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="border-border text-foreground hover:bg-accent"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {retryText}
        </Button>
      )}
    </div>
  )
}