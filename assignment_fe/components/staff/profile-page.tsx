"use client"

import { useEffect, useState } from "react"
import { jwtDecode } from "jwt-decode"
// THAY ĐỔI: Import useRouter để điều hướng
import { useRouter } from "next/navigation"
import { User, Mail, Lock, Save, AlertCircle, CheckCircle } from "lucide-react"
import { DecodedToken } from "../types/DecodedToken"

// (Component AlertMessage giữ nguyên)
function AlertMessage({
    type,
    text,
}: {
    type: "success" | "error"
    text: string
}) {
    // ... code component giữ nguyên ...
    return (
        <div
            className={`p-4 rounded-lg flex items-center gap-3 ${type === "success"
                    ? "bg-success/10 border border-success/30 text-success"
                    : "bg-error/10 border border-error/30 text-error"
                }`}
        >
            {type === "success" ? (
                <CheckCircle size={20} />
            ) : (
                <AlertCircle size={20} />
            )}
            <span className="text-sm font-medium">{text}</span>
        </div>
    )
}

export default function ProfilePage() {
    // THAY ĐỔI: Khởi tạo router
    const router = useRouter()

    const [profileInfo, setProfileInfo] = useState({
        accountId: 0,
        name: "",
        email: "",
        accountRole: 0,
    })

    const [displayRole, setDisplayRole] = useState("")

    const [passwordForm, setPasswordForm] = useState({
        newPassword: "",
        confirmPassword: "",
    })

    const [isLoading, setIsLoading] = useState(false)
    const [saveMessage, setSaveMessage] = useState<{
        type: "success" | "error"
        text: string
    } | null>(null)

    const [emailError, setEmailError] = useState("")
    const [passwordError, setPasswordError] = useState("")

    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    const getRoleName = (role: number | string) => {
        if (role === 1 || role === "1") return "Staff"
        if (role === 0 || role === "0") return "Admin"
        return String(role)
    }

    useEffect(() => {
        const storedToken = localStorage.getItem("authToken")

        if (storedToken) {
            try {
                const decodedData = jwtDecode<DecodedToken>(storedToken)

                setProfileInfo({
                    accountId: parseInt(decodedData.nameid, 10),
                    name: decodedData.unique_name,
                    email: decodedData.email,
                    accountRole: Number(decodedData.role),
                })

                setDisplayRole(getRoleName(decodedData.role))

            } catch (error) {
                console.error("Failed to decode JWT:", error)
            }
        }
    }, [])

    // (Validation logic giữ nguyên)
    const isValidEmail = (email: string) => {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        return regex.test(email)
    }

    const hasIntentToChangePassword =
        Boolean(passwordForm.newPassword) ||
        Boolean(passwordForm.confirmPassword)

    const isPasswordFormIncomplete =
        hasIntentToChangePassword &&
        (!passwordForm.newPassword ||
            !passwordForm.confirmPassword)


    const handleSaveAll = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaveMessage(null)
        setEmailError("")
        setPasswordError("")

        if (!apiUrl) {
            setSaveMessage({ type: "error", text: "error: API URL has not been configured." })
            return
        }

        if (!isValidEmail(profileInfo.email)) {
            setEmailError("Please enter a valid email format.")
            return
        }

        let accountPasswordToSend: string | null = null
        if (hasIntentToChangePassword) {
            if (isPasswordFormIncomplete) {
                setPasswordError("Please fill in all 2 fields to change the password.")
                return
            }
            if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                setPasswordError("The new password and the confirmation password do not match.")
                return
            }
            if (passwordForm.newPassword.length < 6) {
                setPasswordError("The new password must be at least 6 characters long.")
                return
            }
            accountPasswordToSend = passwordForm.newPassword
        }

        setIsLoading(true)

        const payload = {
            accountId: profileInfo.accountId,
            accountName: profileInfo.name,
            accountEmail: profileInfo.email,
            accountRole: profileInfo.accountRole,
            isActive: true,
            accountPassword: accountPasswordToSend,
        }

        try {
            const token = localStorage.getItem("authToken")
            const response = await fetch(`${apiUrl}/SystemAccounts/${payload.accountId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            })

            const result = await response.json() // Giả sử API luôn trả về JSON

            if (!response.ok || result.status !== "success") {
                throw new Error(result.message || "Update profile failed.")
            }

            // --- THAY ĐỔI: LOGIC XỬ LÝ KHI THÀNH CÔNG ---

            if (accountPasswordToSend !== null) {
                // YÊU CẦU 1: Cập nhật MẬT KHẨU thành công -> LOGOUT
                setSaveMessage({
                    type: "success",
                    text: "Password updated successfully! Logging you out...",
                })

                // Chờ 2 giây để user đọc thông báo
                setTimeout(() => {
                    localStorage.removeItem("authToken")
                    localStorage.removeItem("userEmail") // Xóa cả email
                    router.push("/login") // Điều hướng về trang login
                }, 2000)

            } else {
                // YÊU CẦU 2: Chỉ cập nhật INFO thành công -> CẬP NHẬT UI
                setSaveMessage({
                    type: "success",
                    text: "Update profile success!",
                })

                // Xóa form password (nếu lỡ gõ)
                setPasswordForm({
                    newPassword: "",
                    confirmPassword: "",
                })

                // QUAN TRỌNG: Cập nhật token mới để UI đồng bộ
                // Giả sử API trả về data chứa token mới, giống như Login
                const newAuthData = result.data

                if (newAuthData && newAuthData.token) {
                    // 1. Giải mã token mới
                    const newDecodedToken = jwtDecode<DecodedToken>(newAuthData.token)

                    // 2. Cập nhật state (để UI thay đổi ngay lập tức)
                    setProfileInfo(prev => ({
                        ...prev,
                        name: newDecodedToken.unique_name,
                        email: newDecodedToken.email,
                    }))

                    // 3. Cập nhật localStorage cho lần tải trang sau
                    localStorage.setItem("authToken", newAuthData.token)
                    localStorage.setItem("userEmail", newDecodedToken.email)
                } else {
                    // API không trả token mới -> Tình huống không lý tưởng
                    // Cập nhật tạm localStorage với state hiện tại
                    console.warn("API did not return a new token. UI may be stale on refresh.")
                    localStorage.setItem("userEmail", profileInfo.email)
                }

                // Tự động ẩn thông báo
                setTimeout(() => setSaveMessage(null), 4000)
            }

        } catch (err) {
            setSaveMessage({ type: "error", text: (err as Error).message })
            setTimeout(() => setSaveMessage(null), 4000)
        } finally {
            // Chỉ set loading false. Logic timeout đã chuyển vào trong try/catch
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSaveAll} className="space-y-6 max-w-2xl">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">My Profile</h1>
                <p className="text-muted text-sm mt-1">
                    Manage your account information and security
                </p>
            </div>

            {/* Message chung */}
            {saveMessage && (
                <AlertMessage
                    type={saveMessage.type}
                    text={saveMessage.text}
                />
            )}

            {/* Profile Information Card */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <User size={24} className="text-primary" />
                    Profile Information
                </h2>

                <div className="space-y-4">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={profileInfo.name}
                            onChange={(e) =>
                                setProfileInfo({
                                    ...profileInfo,
                                    name: e.target.value,
                                })
                            }
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail
                                className="absolute left-3 top-3 text-muted"
                                size={18}
                            />
                            <input
                                type="email"
                                value={profileInfo.email}
                                onChange={(e) => {
                                    setProfileInfo({
                                        ...profileInfo,
                                        email: e.target.value,
                                    })
                                    if (emailError) setEmailError("")
                                }}
                                className={`w-full bg-background border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-1 
                                    ${emailError
                                        ? "border-error focus:border-error focus:ring-error"
                                        : "border-border focus:border-primary focus:ring-primary"
                                    }
                                `}
                            />
                        </div>
                        {emailError && (
                            <p className="text-error text-sm mt-2 flex items-center gap-1">
                                <AlertCircle size={16} />
                                {emailError}
                            </p>
                        )}
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Role
                        </label>
                        <input
                            type="text"
                            value={displayRole}
                            disabled
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 opacity-50 cursor-not-allowed"
                        />
                    </div>
                </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Lock size={24} className="text-primary" />
                    Change Password
                </h2>

                {passwordError && (
                    <div className="p-3 bg-error/10 border border-error/30 rounded-lg flex items-center gap-2 text-error text-sm">
                        <AlertCircle size={16} />
                        {passwordError}
                    </div>
                )}

                <div className="space-y-4">
                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => {
                                setPasswordForm({
                                    ...passwordForm,
                                    newPassword: e.target.value,
                                })
                                if (passwordError) setPasswordError("")
                            }}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => {
                                setPasswordForm({
                                    ...passwordForm,
                                    confirmPassword: e.target.value,
                                })
                                if (passwordError) setPasswordError("")
                            }}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-lg transition-colors disabled:opacity-50 w-full justify-center"
            >
                <Save size={20} />
                {isLoading ? "Saving Changes..." : "Save All Changes"}
            </button>
        </form>
    )
}