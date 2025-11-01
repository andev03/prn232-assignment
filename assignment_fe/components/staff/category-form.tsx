"use client"

import type React from "react"
// THAY ĐỔI: Import useEffect
import { useState, useEffect } from "react"
import { Category } from "../types/Category"
// THAY ĐỔI: Import các type và icon cần thiết
import { ApiResponse } from "../types/ApiResponse"
import { AlertCircle } from "lucide-react"

interface CategoryFormProps {
    category: Category | null
    // THAY ĐỔI: onSubmit giờ sẽ nhận payload đã được định dạng
    onSubmit: (data: CategoryPayload) => void
    onCancel: () => void
}

// THAY ĐỔI: Định nghĩa type cho payload gửi đi (dựa trên yêu cầu của bạn)
export interface CategoryPayload {
    categoryName: string
    categoryDescription: string
    parentCategoryId: number
    isActive: boolean
}

export default function CategoryForm({ category, onSubmit, onCancel }: CategoryFormProps) {

    // THAY ĐỔI: Thêm 'parentCategoryId' vào state
    const [formData, setFormData] = useState({
        name: category?.categoryName || "",
        description: category?.categoryDescription || "",
        // Dùng 0 làm giá trị default cho "No Parent"
        parentCategoryId: category?.parentCategoryId || 0,
        status: category?.isActive !== undefined
            ? category.isActive ? "Active" : "Inactive"
            : "Active",
    })

    // THAY ĐỔI: State để lưu danh sách category cha
    const [allCategories, setAllCategories] = useState<Category[]>([])
    const [isLoadingCategories, setIsLoadingCategories] = useState(true)
    const [fetchError, setFetchError] = useState("")

    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    // THAY ĐỔI: useEffect để fetch tất cả category khi component mount
    useEffect(() => {
        const fetchCategories = async () => {
            if (!apiUrl) {
                setFetchError("Lỗi: API URL chưa được cấu hình.")
                setIsLoadingCategories(false)
                return
            }

            try {
                // Giả sử API này cần xác thực
                const token = localStorage.getItem("authToken")
                const response = await fetch(`${apiUrl}/Category`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })

                const result: ApiResponse<Category[]> = await response.json()

                if (!response.ok || result.status !== "success") {
                    throw new Error(result.message || "Không thể tải danh mục")
                }

                setAllCategories(result.data)
            } catch (err) {
                setFetchError((err as Error).message)
            } finally {
                setIsLoadingCategories(false)
            }
        }

        fetchCategories()
    }, [apiUrl]) // Chỉ chạy 1 lần khi apiUrl có sẵn


    // THAY ĐỔI: Chuyển đổi formData sang DTO payload trước khi gọi onSubmit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const payload: CategoryPayload = {
            categoryName: formData.name,
            categoryDescription: formData.description,
            // Đảm bảo parentCategoryId là một con số
            parentCategoryId: Number(formData.parentCategoryId),
            // Chuyển "Active" / "Inactive" thành true / false
            isActive: formData.status === "Active",
        }

        onSubmit(payload)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Name (Không đổi) */}
            <div>
                <label className="block text-sm font-medium mb-2">Category Name</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    required
                />
            </div>

            {/* Description (Không đổi) */}
            <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                    rows={4}
                    required
                />
            </div>

            {/* THAY ĐỔI: Thêm dropdown cho Parent Category */}
            <div>
                <label className="block text-sm font-medium mb-2">Parent Category</label>
                <select
                    value={formData.parentCategoryId}
                    onChange={(e) => setFormData({ ...formData, parentCategoryId: parseInt(e.target.value, 10) })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    disabled={isLoadingCategories} // Vô hiệu hóa khi đang tải
                >
                    {/* Option mặc định cho "Không có cha" */}
                    <option value="0">-- No Parent --</option>

                    {/* Render danh sách category đã fetch */}
                    {!isLoadingCategories && allCategories.length > 0 && (
                        allCategories
                            // Lọc ra chính category đang sửa (để không tự làm cha)
                            .filter(cat => cat.categoryId !== category?.categoryId)
                            .map((cat) => (
                                <option key={cat.categoryId} value={cat.categoryId}>
                                    {cat.categoryName}
                                </option>
                            ))
                    )}
                </select>
                {/* Hiển thị trạng thái loading hoặc lỗi */}
                {isLoadingCategories && (
                    <p className="text-sm text-muted mt-1">Đang tải danh mục...</p>
                )}
                {fetchError && (
                    <p className="text-error text-sm mt-2 flex items-center gap-1">
                        <AlertCircle size={16} />
                        {fetchError}
                    </p>
                )}
            </div>

            {/* Status (Không đổi) */}
            <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>

            {/* Buttons (Không đổi) */}
            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    // Vô hiệu hóa nút submit nếu chưa tải xong categories
                    disabled={isLoadingCategories}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                    {category ? "Update" : "Create"}
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