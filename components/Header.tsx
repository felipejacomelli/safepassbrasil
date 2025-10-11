"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import {
    User,
    ShoppingCart,
    ChevronDown,
    LogOut,
    UserCircle,
    Settings,
} from "lucide-react"

export default function Header() {
    const router = useRouter()
    const { isAuthenticated, logout, user } = useAuth()
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

    const handleAccountAccess = () => {
        router.push("/account")
        setIsUserMenuOpen(false)
    }

    const handleLogoutFromDropdown = () => {
        logout()
        setIsUserMenuOpen(false)
    }

    const handleAdminPanelAccess = () => {
        router.push("/admin")
        setIsUserMenuOpen(false)
    }

    return (
        <header className="sticky top-0 z-10 bg-black border-b border-zinc-800">
            <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <div className="bg-blue-500 p-1.5 rounded">
                        <div className="w-6 h-6 bg-black rounded" />
                    </div>
                    reticket
                </Link>
                <nav className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-2 border border-blue-500 px-3 py-1.5 rounded text-sm font-semibold hover:bg-blue-500/10 transition-colors"
                            >
                                <UserCircle size={18} />
                                <span>{user?.name || 'Usuário'}</span>
                                <ChevronDown size={16} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {isUserMenuOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg z-50">
                                    <div className="py-2">
                                        <button
                                            onClick={handleAccountAccess}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-zinc-800 transition-colors text-left"
                                        >
                                            <UserCircle size={16} />
                                            Minha Conta
                                        </button>
                                        {user?.isAdmin && (
                                            <button
                                                onClick={handleAdminPanelAccess}
                                                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-zinc-800 transition-colors text-left text-blue-400"
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
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-zinc-800 transition-colors text-left"
                                        >
                                            <ShoppingCart size={16} />
                                            Carrinho
                                        </button>
                                        <button
                                            onClick={handleLogoutFromDropdown}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-zinc-800 transition-colors text-left text-red-400"
                                        >
                                            <LogOut size={16} />
                                            Sair
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => router.push("/login")}
                                className="p-2 border border-blue-500 rounded"
                            >
                                <User size={18} />
                            </button>
                            <button
                                onClick={() => router.push("/cart")}
                                className="p-2 border border-blue-500 rounded"
                            >
                                <ShoppingCart size={18} />
                            </button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    )
}