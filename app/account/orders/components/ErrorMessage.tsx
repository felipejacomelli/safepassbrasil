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
      
      <h3 className="text-lg font-semibold text-white mb-2">
        {title}
      </h3>
      
      <p className="text-gray-400 mb-6 max-w-md">
        {message}
      </p>
      
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="border-zinc-700 text-white hover:bg-zinc-800"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {retryText}
        </Button>
      )}
    </div>
  )
}