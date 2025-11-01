"use client"

import StaffDashboard from "@/components/staff/dashboard";
import { DecodedToken } from "@/components/types/DecodedToken";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react"
import PublicNewsPage from "@/components/public/news-page";

type UserRole = "admin" | "staff" | "user" | null

export default function LoginRoutePage() {
    const [isLoading, setIsLoading] = useState(true); // 1. Thêm state loading
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [userRole, setUserRole] = useState<UserRole>(null)
    const [userName, setUserName] = useState("")

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
                    handleLogout(); // Token hết hạn, đăng xuất
                } else {
                    // Token hợp lệ
                    setIsAuthenticated(true);
                    setUserRole(decoded.role as UserRole); // Ví dụ: "admin", "staff"
                    setUserName(decoded.unique_name);
                }
            } catch (error) {
                console.error("Lỗi giải mã token:", error);
                handleLogout(); // Token lỗi, đăng xuất
            }
        } else {
            setIsAuthenticated(false);
        }
        setIsLoading(false); // Kiểm tra xong, tắt loading
    }, []); // Mảng rỗng [] nghĩa là chỉ chạy 1 lần khi component mount

    if (!isAuthenticated) {
        return <PublicNewsPage />;
    }

    return (
        <StaffDashboard userName={userName} onLogout={handleLogout} />
    );
}