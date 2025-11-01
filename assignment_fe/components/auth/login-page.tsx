"use client"

import type React from "react"
import { useState } from "react"
import { Mail, Lock, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { ApiResponse } from "../types/ApiResponse"
import { AuthData } from "../types/AuthData"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        if (!apiUrl) {
            setError("Lỗi: API URL chưa được cấu hình (NEXT_PUBLIC_API_URL).")
            setIsLoading(false)
            return
        }

        try {

            const response = await fetch(`${apiUrl}/Auth/Login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password }),
            })

            const result: ApiResponse<AuthData> = await response.json()

            const { token, role } = result.data

            if (!response.ok || result.status !== "success" || !result.data) {
                throw new Error(result.message || "Email or password is invalid")
            }

            localStorage.setItem("authToken", token)

            if (role === 1) {
                router.push("/staff")
            } else if (role === 0) {
                router.push("/admin")
            } else {
                router.push("/")
            }
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-background via-card to-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary mb-2">FU News</h1>
                    <p className="text-muted">Management System</p>
                </div>

                {/* Login Card */}
                <div className="bg-card border border-border rounded-lg p-8 shadow-xl">
                    <h2 className="text-2xl font-bold mb-6">Sign In</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg flex items-center gap-2 text-error text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-muted" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your-email@example.com"
                                    className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-muted" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    {/* Demo Credentials (Phần này bạn có thể xoá đi nếu không cần) */}
                    <div className="mt-6 pt-6 border-t border-border">
                        <p className="text-xs text-muted mb-3">Demo Credentials:</p>
                        <div className="space-y-2 text-xs">
                            <p>
                                <span className="text-primary">Admin:</span>{" "}
                                admin@FUNewsManagementSystem.org / @@abc123@@
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}