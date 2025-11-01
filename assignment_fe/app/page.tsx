"use client";

import { useState, useEffect } from "react"; // Import thêm useEffect
import PublicNewsPage from "@/components/public/news-page";
import AdminDashboard from "@/components/admin/dashboard";
import StaffDashboard from "@/components/staff/dashboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode"; // Giả sử bạn dùng JWT
import { DecodedToken } from "@/components/types/DecodedToken";

type UserRole = "admin" | "staff" | "user" | null;

export default function Home() {
  const [isLoading, setIsLoading] = useState(true); // 1. Thêm state loading
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userName, setUserName] = useState("");

  // 2. Thêm useEffect để kiểm tra token khi tải trang
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

  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Xóa token
    setIsAuthenticated(false);
    setUserRole(null);
    setUserName("");
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <main className="p-6 text-center">
          <h1>Loading...</h1>
          <p>Vui lòng đợi trong giây lát.</p>
        </main>
      );
    }

    if (!isAuthenticated) {
      return <PublicNewsPage />;
    }

    if (userRole === "admin") {
      return <AdminDashboard userName={userName} onLogout={handleLogout} />;
    }

    if (userRole === "staff") {
      return <StaffDashboard userName={userName} onLogout={handleLogout} />;
    }

    return <PublicNewsPage />;
  };

  return (
    <>
      {renderContent()}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}