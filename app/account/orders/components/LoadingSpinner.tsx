"use client"

import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
}

export function LoadingSpinner({ 
  size = "md", 
  text = "Carregando...", 
  className = "" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  }

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <Loader2 
        className={`${sizeClasses[size]} animate-spin text-blue-500 mb-2`}
        aria-hidden="true"
      />
      <p className="text-muted-foreground text-sm" aria-live="polite">
        {text}
      </p>
    </div>
  )
}