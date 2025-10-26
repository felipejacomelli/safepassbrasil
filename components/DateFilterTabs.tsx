"use client"

import { useRouter } from "next/navigation"
import { Clock, CalendarDays } from "lucide-react"

interface DateFilterTabsProps {
  className?: string
}

export function DateFilterTabs({ className = "" }: DateFilterTabsProps) {
  const router = useRouter()

  const handleTabClick = (dateFilter: 'today' | 'weekend') => {
    router.push(`/search?dateFilter=${dateFilter}`)
  }

  return (
    <div className={`${className}`}>
      <div className="bg-card rounded-lg shadow-md border border-border p-3">
        <div className="flex justify-center gap-6">
          {/* Eventos hoje */}
          <button
            onClick={() => handleTabClick('today')}
            className="flex items-center gap-2 hover:bg-accent px-3 py-2 rounded-md transition-all duration-300 cursor-pointer hover:scale-105"
            aria-label="Filtrar eventos de hoje"
          >
            <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
              <Clock size={14} className="text-blue-600" />
            </div>
            <span className="font-medium text-card-foreground text-sm">Eventos hoje</span>
          </button>

          {/* Neste final de semana */}
          <button
            onClick={() => handleTabClick('weekend')}
            className="flex items-center gap-2 hover:bg-accent px-3 py-2 rounded-md transition-all duration-300 cursor-pointer hover:scale-105"
            aria-label="Filtrar eventos do final de semana"
          >
            <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
              <CalendarDays size={14} className="text-blue-600" />
            </div>
            <span className="font-medium text-card-foreground text-sm">Neste final de semana</span>
          </button>
        </div>
      </div>
    </div>
  )
}
