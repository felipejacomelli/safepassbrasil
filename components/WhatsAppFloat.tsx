"use client"

import { MessageCircle } from "lucide-react"
import { useState } from "react"

export default function WhatsAppFloat() {
  const [isHovered, setIsHovered] = useState(false)

  const whatsappNumber = "5531999999999"
  const message = "Olá! Preciso de ajuda com a Safe Pass"
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-16 h-16 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 rounded-full shadow-lg hover:shadow-xl dark:shadow-green-500/20 dark:hover:shadow-green-400/30 transition-all duration-300 transform hover:scale-110"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Falar no WhatsApp"
      >
        <MessageCircle className="w-8 h-8 text-white drop-shadow-sm" />
        
        {/* Tooltip */}
        <div
          className={`absolute right-full mr-3 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap transition-all duration-300 shadow-lg dark:shadow-gray-900/50 ${
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
          }`}
        >
          Falar no WhatsApp
          <div className="absolute top-1/2 left-full w-0 h-0 border-l-4 border-l-gray-900 dark:border-l-gray-800 border-t-4 border-t-transparent border-b-4 border-b-transparent transform -translate-y-1/2" />
        </div>

        {/* Pulse animation */}
        <div className="absolute inset-0 rounded-full bg-green-500 dark:bg-green-600 animate-ping opacity-20 dark:opacity-30" />
      </a>
    </div>
  )
}