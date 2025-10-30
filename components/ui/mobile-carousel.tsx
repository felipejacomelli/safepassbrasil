"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface MobileCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

interface MobileCarouselContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

interface MobileCarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

const MobileCarousel = React.forwardRef<HTMLDivElement, MobileCarouselProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative w-full", className)}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        {children}
      </div>
    )
  }
)
MobileCarousel.displayName = "MobileCarousel"

const MobileCarouselContent = React.forwardRef<HTMLDivElement, MobileCarouselContentProps>(
  ({ className, children, ...props }, ref) => {
    const containerRef = React.useRef<HTMLDivElement>(null)

    // Função para lidar com navegação por teclado
    const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
      if (!containerRef.current) return

      const container = containerRef.current
      const itemWidth = container.children[0]?.getBoundingClientRect().width || 0
      
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        container.scrollBy({ left: -itemWidth, behavior: "smooth" })
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        container.scrollBy({ left: itemWidth, behavior: "smooth" })
      }
    }, [])

    React.useImperativeHandle(ref, () => containerRef.current!, [])

    return (
      <div
        ref={containerRef}
        className={cn(
          // Layout base
          "flex overflow-x-auto overflow-y-hidden",
          // Scroll snap
          "scroll-smooth",
          "[scroll-snap-type:x_mandatory]",
          // Ocultar scrollbar
          "scrollbar-none",
          "[-webkit-overflow-scrolling:touch]",
          // Mobile: gap entre cards para mostrar próximo card parcialmente
          "gap-4 sm:gap-0",
          // Padding para mobile (mostra parte do próximo card)
          "px-4 sm:px-0",
          className
        )}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="listbox"
        aria-label="Lista de eventos"
        style={{
          // CSS customizado para scroll-snap
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
MobileCarouselContent.displayName = "MobileCarouselContent"

const MobileCarouselItem = React.forwardRef<HTMLDivElement, MobileCarouselItemProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Scroll snap alignment
          "[scroll-snap-align:start]",
          // Mobile: 85-90% da largura visível + flex-shrink-0 para não comprimir
          "flex-shrink-0",
          // Mobile: largura que mostra ~78% do card + parte do próximo
          "w-[78vw] max-w-[320px] sm:w-auto sm:max-w-none",
          // Desktop/tablet: comportamento normal
          "sm:min-w-0 sm:shrink-0 sm:grow-0 sm:basis-full sm:basis-1/2 lg:sm:basis-1/4",
          className
        )}
        role="option"
        aria-roledescription="slide"
        style={{
          scrollSnapAlign: "start",
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
MobileCarouselItem.displayName = "MobileCarouselItem"

export {
  MobileCarousel,
  MobileCarouselContent,
  MobileCarouselItem,
}