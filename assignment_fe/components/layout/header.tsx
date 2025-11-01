"use client"

import { LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"

interface HeaderProps {
    userName: string
    role: string
    onLogout: () => void
}

export default function Header({ userName, role, onLogout }: HeaderProps) {


    return (
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
            <div>
                <h2 className="text-xl font-bold">Welcome, {userName}</h2>
                <p className="text-sm text-muted">{role} Dashboard</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg">
                    <User size={18} className="text-primary" />
                    <span className="text-sm">{userName}</span>
                </div>
                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-error/10 hover:bg-error/20 text-error rounded-lg transition-colors"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </header>
    )
}
