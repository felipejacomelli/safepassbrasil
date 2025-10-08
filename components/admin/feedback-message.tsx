"use client"

import React from 'react'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

interface FeedbackMessageProps {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  onClose?: () => void
  autoClose?: boolean
  duration?: number
}

export function FeedbackMessage({
  type,
  message,
  onClose,
  autoClose = false,
  duration = 5000
}: FeedbackMessageProps) {
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [autoClose, onClose, duration])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />
      case 'error':
        return <AlertCircle className="h-5 w-5" />
      case 'warning':
        return <AlertCircle className="h-5 w-5" />
      case 'info':
        return <AlertCircle className="h-5 w-5" />
      default:
        return <AlertCircle className="h-5 w-5" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-900 bg-opacity-20 border border-green-800 text-green-400'
      case 'error':
        return 'bg-red-900 bg-opacity-20 border border-red-800 text-red-400'
      case 'warning':
        return 'bg-yellow-900 bg-opacity-20 border border-yellow-800 text-yellow-400'
      case 'info':
        return 'bg-blue-900 bg-opacity-20 border border-blue-800 text-blue-400'
      default:
        return 'bg-gray-900 bg-opacity-20 border border-gray-800 text-gray-400'
    }
  }

  return (
    <div className={`flex items-center gap-2 p-4 rounded ${getStyles()}`}>
      {getIcon()}
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="hover:opacity-70 transition-opacity rounded"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
