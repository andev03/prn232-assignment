"use client"

import { useState } from "react"
import Sidebar from "@/components/layout/sidebar"
import Header from "@/components/layout/header"
import CategoryManagement from "@/components/staff/category-management"
import NewsManagement from "@/components/staff/news-management"
import ProfilePage from "@/components/staff/profile-page"
import NewsHistory from "@/components/staff/news-history"
import { useRouter } from "next/navigation"

type StaffPage = "categories" | "news" | "profile" | "history"

interface StaffDashboardProps {
    userName: string
    onLogout: () => void
}

export default function StaffDashboard({ userName, onLogout }: StaffDashboardProps) {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('authToken');

        router.push('/');
    };

    const [currentPage, setCurrentPage] = useState<StaffPage>("news")

    const staffMenuItems = [
        { id: "news", label: "News Articles", icon: "📰" },
        { id: "categories", label: "Categories", icon: "📁" },
        { id: "history", label: "My News History", icon: "📜" },
        { id: "profile", label: "My Profile", icon: "👤" },
    ]

    return (
        <div className="flex h-screen bg-background">
            <Sidebar
                role="staff"
                menuItems={staffMenuItems}
                currentPage={currentPage}
                onPageChange={(page) => setCurrentPage(page as StaffPage)}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header userName={userName} role="Staff" onLogout={handleLogout} />
                <main className="flex-1 overflow-auto p-6">
                    {currentPage === "categories" && <CategoryManagement />}
                    {currentPage === "news" && <NewsManagement />}
                    {currentPage === "profile" && <ProfilePage />}
                    {currentPage === "history" && <NewsHistory />}
                </main>
            </div>
        </div>
    )
}
