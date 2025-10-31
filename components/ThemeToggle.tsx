"use client"

import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button 
        variant="ghost" 
        className="gap-2"
        aria-label="Alternar tema"
      >
        <Monitor className="h-5 w-5" />
        <span>Tema do sistema</span>
      </Button>
    )
  }

  const getIcon = () => {
    if (theme === "light") return <Sun className="h-5 w-5" />
    if (theme === "dark") return <Moon className="h-5 w-5" />
    return <Monitor className="h-5 w-5" />
  }

  const getThemeLabel = () => {
    if (theme === "light") return "Tema claro"
    if (theme === "dark") return "Tema escuro"
    return "Tema do sistema"
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="gap-2 hover:bg-accent hover:text-accent-foreground transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm dark:shadow-none border border-transparent dark:border-border/50 dark:hover:border-primary/30"
          aria-label={`Alternar tema - ${getThemeLabel()}`}
        >
          {getIcon()}
          <span>{getThemeLabel()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-40 shadow-lg dark:shadow-xl dark:shadow-black/20 backdrop-blur-sm dark:backdrop-blur-md"
        role="menu"
        aria-label="Opções de tema"
      >
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="cursor-pointer hover:bg-accent focus:bg-accent"
          role="menuitem"
          aria-label="Ativar tema claro"
        >
          <Sun className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Claro</span>
          {theme === "light" && (
            <span className="ml-auto text-primary" aria-label="Selecionado">
              ✓
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="cursor-pointer hover:bg-accent focus:bg-accent"
          role="menuitem"
          aria-label="Ativar tema escuro"
        >
          <Moon className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Escuro</span>
          {theme === "dark" && (
            <span className="ml-auto text-primary" aria-label="Selecionado">
              ✓
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className="cursor-pointer hover:bg-accent focus:bg-accent"
          role="menuitem"
          aria-label="Usar tema do sistema"
        >
          <Monitor className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Sistema</span>
          {theme === "system" && (
            <span className="ml-auto text-primary" aria-label="Selecionado">
              ✓
            </span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
