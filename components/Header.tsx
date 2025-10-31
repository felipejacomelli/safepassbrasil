"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useAuth } from "@/contexts/auth-context"
import { ThemeToggle } from "./ThemeToggle"
import {
    User,
    ShoppingCart,
    ChevronDown,
    LogOut,
    UserCircle,
    Settings,
    Bell,
} from "lucide-react"

// ✅ Lazy loading do NotificationBell para evitar hydration error
const NotificationBell = dynamic(() => import("./NotificationBell"), {
    ssr: false,
    loading: () => (
        <button className="p-2 border border-primary rounded">
            <Bell size={18} />
        </button>
    )
})

export default function Header() {
    const router = useRouter()
    const { isAuthenticated, logout, user } = useAuth()
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    // ✅ Evitar hydration error - só renderizar após montagem
    useEffect(() => {
        setIsMounted(true)
    }, [])

    const handleAccountAccess = () => {
        router.push("/account")
        setIsUserMenuOpen(false)
    }

    const handleLogoutFromDropdown = () => {
        logout()
        setIsUserMenuOpen(false)
        router.push("/") // Redireciona para a home após logout
    }

    const handleAdminPanelAccess = () => {
        router.push("/admin")
        setIsUserMenuOpen(false)
    }

    // ✅ Evitar hydration error - renderizar skeleton simples
    if (!isMounted) {
        return (
            <header className="sticky top-0 z-10 bg-background border-b border-border">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <div className="bg-primary p-1.5 rounded">
                            <div className="w-6 h-6 bg-background rounded" />
                        </div>
                        Safe Pass
                    </Link>
                    <nav className="flex items-center gap-4">
                        <div className="p-2 border border-gray-600 rounded">
                            <div className="w-4 h-4" />
                        </div>
                        <div className="p-2 border border-gray-600 rounded">
                            <div className="w-4 h-4" />
                        </div>
                    </nav>
                </div>
            </header>
        )
    }

    return (
        <header className="sticky top-0 z-10 bg-background border-b border-border">
            <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <div className="bg-primary dark:bg-primary p-1.5 rounded shadow-sm dark:shadow-primary/20">
                        <div className="w-6 h-6 bg-background rounded" />
                    </div>
                    Safe Pass
                </Link>
                <nav className="flex items-center gap-4">
                    <ThemeToggle />
                    {isAuthenticated ? (
                        <>
                            <NotificationBell />
                            <div className="relative">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-2 border border-primary dark:border-primary p-2 md:px-3 md:py-1.5 rounded text-sm font-semibold hover:bg-primary/10 dark:hover:bg-primary/10 transition-colors shadow-sm dark:shadow-primary/10"
                            >
                                <UserCircle size={18} />
                                <span className="hidden md:inline">{user?.name || 'Usuário'}</span>
                                <ChevronDown size={16} className={`hidden md:block transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {isUserMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg dark:shadow-xl dark:shadow-black/20 z-50 backdrop-blur-sm dark:backdrop-blur-md">
                                    <div className="py-2">
                                        <button
                                            onClick={handleAccountAccess}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors text-left text-foreground"
                                        >
                                            <UserCircle size={16} />
                                            Minha Conta
                                        </button>
                                        <button
                                            onClick={() => {
                                                router.push("/dashboard")
                                                setIsUserMenuOpen(false)
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors text-left text-foreground"
                                        >
                                            <Settings size={16} />
                                            Dashboard
                                        </button>
                                        {user?.isAdmin && (
                                            <button
                                                onClick={handleAdminPanelAccess}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors text-left text-primary"
                                            >
                                                <Settings size={16} />
                                                Painel Admin
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                router.push("/cart")
                                                setIsUserMenuOpen(false)
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors text-left text-foreground"
                                        >
                                            <ShoppingCart size={16} />
                                            Carrinho
                                        </button>
                                        <button
                                            onClick={handleLogoutFromDropdown}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors text-left text-destructive"
                                        >
                                            <LogOut size={16} />
                                            Sair
                                        </button>
                                    </div>
                                </div>
                            )}
                            </div>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => router.push("/login")}
                                className="p-2 border border-primary dark:border-primary rounded hover:bg-primary/10 dark:hover:bg-primary/10 transition-colors shadow-sm dark:shadow-primary/10"
                            >
                                <User size={18} className="text-primary dark:text-primary" />
                            </button>
                            <button
                                onClick={() => router.push("/cart")}
                                className="p-2 border border-primary dark:border-primary rounded hover:bg-primary/10 dark:hover:bg-primary/10 transition-colors shadow-sm dark:shadow-primary/10"
                            >
                                <ShoppingCart size={18} className="text-primary dark:text-primary" />
                            </button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    )
}