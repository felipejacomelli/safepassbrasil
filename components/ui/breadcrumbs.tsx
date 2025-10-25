"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}
    >
      <Link 
        href="/" 
        className="hover:text-foreground transition-colors"
        aria-label="Página inicial"
      >
        Início
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          
          {item.href && !item.current ? (
            <Link 
              href={item.href}
              className="hover:text-foreground transition-colors truncate max-w-[200px]"
            >
              {item.label}
            </Link>
          ) : (
            <span 
              className={cn(
                "truncate max-w-[200px]",
                item.current && "text-foreground font-medium"
              )}
              aria-current={item.current ? "page" : undefined}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}

// Hook para facilitar o uso de breadcrumbs
export function useBreadcrumbs() {
  const createEventBreadcrumbs = (eventName: string, eventId: string) => [
    { label: "Eventos", href: "/search" },
    { label: eventName, href: `/event/${eventId}` }
  ]

  const createOccurrenceBreadcrumbs = (
    eventName: string, 
    eventId: string, 
    occurrenceDate: string
  ) => [
    { label: "Eventos", href: "/search" },
    { label: eventName, href: `/event/${eventId}` },
    { label: occurrenceDate, current: true }
  ]

  return {
    createEventBreadcrumbs,
    createOccurrenceBreadcrumbs
  }
}