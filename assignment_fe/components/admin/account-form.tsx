"use client"

import type React from "react"
import { useState, useEffect } from "react" // THÊM: Import useEffect
import { Account } from "../types/Account"

interface AccountFormProps {
    account: Account | null
    // SỬA: Dùng type Partial<Account>
    onSubmit: (data: Partial<Account>) => void
    onCancel: () => void
}

// THÊM: State khởi tạo cho form
const initialState = {
    accountName: "",
    accountEmail: "",
    accountRole: 1, // Mặc định là Staff
    isActive: true,
    accountPassword: "", // Thêm trường password
}

export default function AccountForm({
    account,
    onSubmit,
    onCancel,
}: AccountFormProps) {
    // SỬA: Dùng state khởi tạo
    const [formData, setFormData] = useState(initialState)

    // THÊM: Xác định chế độ 'Edit' (true) hay 'Add' (false)
    const isEditMode = !!account

    // THÊM: Dùng useEffect để cập nhật form khi 'account' prop thay đổi
    useEffect(() => {
        if (account) {
            // Chế độ EDIT: Điền thông tin, nhưng giữ password rỗng
            setFormData({
                accountName: account.accountName || "",
                accountEmail: account.accountEmail || "",
                accountRole: account.accountRole || 1,
                isActive: account.isActive ?? true,
                accountPassword: "", // Không bao giờ điền password cũ vào form
            })
        } else {
            // Chế độ ADD: Reset form về trạng thái ban đầu
            setFormData(initialState)
        }
    }, [account]) // Chạy lại khi 'account' thay đổi

    // THÊM: Hàm 'onChange' chung
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const dataToSubmit: Partial<Account> = {
            accountName: formData.accountName,
            accountEmail: formData.accountEmail,
            accountRole: Number(formData.accountRole),
            isActive: formData.isActive,
        }

        if (!isEditMode) {
            dataToSubmit.accountPassword = formData.accountPassword
        }

        onSubmit(dataToSubmit)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                    type="text"
                    name="accountName" // THÊM 'name'
                    value={formData.accountName}
                    onChange={handleChange} // Dùng hàm 'onChange' chung
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                    type="email"
                    name="accountEmail" // THÊM 'name'
                    value={formData.accountEmail}
                    onChange={handleChange} // Dùng hàm 'onChange' chung
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    required
                />
            </div>

            {/* THÊM: Logic ẩn/hiện trường Password */}
            {!isEditMode && (
                <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <input
                        type="password"
                        name="accountPassword" // THÊM 'name'
                        value={formData.accountPassword}
                        onChange={handleChange}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        required // Bắt buộc khi tạo mới
                    />
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                    name="accountRole" // THÊM 'name'
                    value={formData.accountRole}
                    onChange={(e) =>
                        setFormData({ ...formData, accountRole: parseInt(e.target.value) })
                    }
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                    <option value="1">Staff</option>
                    {/* SỬA: Value '0' cho Lecturer để khớp logic */}
                    <option value="0">Lecturer</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                    name="isActive" // THÊM 'name'
                    value={formData.isActive ? "true" : "false"}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            isActive: e.target.value === "true",
                        })
                    }
                    className="w-full bg-background border border-border rounded-lg px-4 py-2"
                >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-2 rounded-lg transition-colors"
                >
                    {/* Sửa: Dùng 'isEditMode' để xác định text */}
                    {isEditMode ? "Update" : "Create"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-background border border-border hover:bg-card text-foreground font-medium py-2 rounded-lg transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}