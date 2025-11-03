"use client"

import AdminDashboard from "@/components/admin/dashboard";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react"
import PublicNewsPage from "@/components/public/news-page";
import { DecodedToken } from "@/components/types/DecodedToken";
import { useRouter } from "next/navigation";

type UserRole = "admin" | "staff" | "user" | null

export default function LoginRoutePage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [userRole, setUserRole] = useState<UserRole>(null)
    const [userName, setUserName] = useState("")

    // ✅ DI CHUYỂN HOOK RA CẤP CAO NHẤT
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
                    handleLogout(); // Token hết hạn, đăng xuất
                } else if (decoded.role !== "0") {
                    // router giờ đã có sẵn từ bên ngoài
                    router.push('/');
                } else {
                    // Token hợp lệ
                    setIsAuthenticated(true);
                    setUserRole(decoded.role as UserRole);
                    setUserName(decoded.unique_name);
                }
            } catch (error) {
                console.error("Lỗi giải mã token:", error);
                handleLogout(); // Token lỗi, đăng xuất
            }
        } else {
            setIsAuthenticated(false);
        }
        setIsLoading(false);
    }, []); // Mảng rỗng [] nghĩa là chỉ chạy 1 lần khi component mount

    if (!isAuthenticated) {
        return <PublicNewsPage />;
    }

    return (
        <AdminDashboard userName={userName} onLogout={handleLogout} />
    );
}