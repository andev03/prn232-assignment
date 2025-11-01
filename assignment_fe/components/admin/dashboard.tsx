"use client"

import { useState } from "react"
import Sidebar from "@/components/layout/sidebar"
import Header from "@/components/layout/header"
import AccountManagement from "@/components/admin/account-management"
import ReportingPage from "@/components/admin/reporting-page"
import { useRouter } from "next/navigation"

type AdminPage = "accounts" | "reporting"

interface AdminDashboardProps {
    userName: string
    onLogout: () => void
}

export default function AdminDashboard({ userName, onLogout }: AdminDashboardProps) {
    const router = useRouter();

    const [currentPage, setCurrentPage] = useState<AdminPage>("accounts")

    const handleLogout = () => {
        localStorage.removeItem('authToken');

        router.push('/');
    };
    const adminMenuItems = [
        { id: "accounts", label: "Account Management", icon: "👥" },
        { id: "reporting", label: "Reports & Statistics", icon: "📊" },
    ]

    return (
        <div className="flex h-screen bg-background">
            <Sidebar
                role="admin"
                menuItems={adminMenuItems}
                currentPage={currentPage}
                onPageChange={(page) => setCurrentPage(page as AdminPage)}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header userName={userName} role="Admin" onLogout={handleLogout} />
                <main className="flex-1 overflow-auto p-6">
                    {currentPage === "accounts" && <AccountManagement />}
                    {currentPage === "reporting" && <ReportingPage />}
                </main>
            </div>
        </div>
    )
}
