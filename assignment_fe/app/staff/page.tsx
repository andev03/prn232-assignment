"use client"

import StaffDashboard from "@/components/staff/dashboard";
import { DecodedToken } from "@/components/types/DecodedToken";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react"
import PublicNewsPage from "@/components/public/news-page";
import { useRouter } from "next/navigation";

type UserRole = "admin" | "staff" | "user" | null

export default function LoginRoutePage() {
    const [isLoading, setIsLoading] = useState(true); // 1. Thêm state loading
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [userRole, setUserRole] = useState<UserRole>(null)
    const [userName, setUserName] = useState("")
    const router = useRouter();

    const handleLogout = () => {
        setIsAuthenticated(false)
        setUserRole(null)
        setUserName("")
    }
    useEffect(() => {
        const token = localStorage.getItem("authToken");

        if (token) {
            try {
                const decoded = jwtDecode<DecodedToken>(token);

                if (decoded.exp * 1000 < Date.now()) {
                    handleLogout();
                } else if (decoded.role !== "1") {
                    router.push('/');
                } else {
                    setIsAuthenticated(true);
                    setUserRole(decoded.role as UserRole);
                    setUserName(decoded.unique_name);
                }
            } catch (error) {
                console.error("Lỗi giải mã token:", error);
                handleLogout();
            }
        } else {
            setIsAuthenticated(false);
        }
        setIsLoading(false);
    }, []);

    if (!isAuthenticated) {
        return <PublicNewsPage />;
    }

    return (
        <StaffDashboard userName={userName} onLogout={handleLogout} />
    );
}