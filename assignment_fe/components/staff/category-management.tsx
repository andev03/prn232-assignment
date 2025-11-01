"use client"

import { useState, useEffect, useMemo } from "react"
import {
    Plus,
    Edit2,
    Trash2,
    Search,
    AlertCircle,
    FileText,
} from "lucide-react"
import Modal from "@/components/ui/modal"
import CategoryForm, {
    CategoryPayload,
} from "@/components/staff/category-form"
import { useFetchData } from "../hooks/useFetchData"
import { Category } from "../types/Category"

export default function CategoryManagement() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    const {
        data: fetchedCategories,
        isLoading,
        error: fetchError,
        refetch,
    } = useFetchData<Category[]>(apiUrl ? `${apiUrl}/Category` : null)

    const [categories, setCategories] = useState<Category[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [actionError, setActionError] = useState("")

    useEffect(() => {
        if (fetchedCategories) {
            setCategories(fetchedCategories)
        }
    }, [fetchedCategories])

    const [searchTerm, setSearchTerm] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

    const filteredCategories = categories.filter((cat) =>
        cat.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getToken = () => localStorage.getItem("authToken")

    // (handleAddCategory và handleUpdateCategory giữ nguyên)
    const handleAddCategory = async (payload: CategoryPayload) => {
        setIsSubmitting(true)
        setActionError("")
        try {
            const response = await fetch(`${apiUrl}/Category`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`,
                },
                body: JSON.stringify(payload),
            })
            const result = await response.json()
            if (!response.ok || result.status !== "success") {
                throw new Error(result.message || "Tạo danh mục thất bại")
            }
            await refetch()
            setIsModalOpen(false)
        } catch (err) {
            setActionError((err as Error).message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdateCategory = async (payload: CategoryPayload) => {
        if (!editingCategory) return
        setIsSubmitting(true)
        setActionError("")
        try {
            const updatePayload = {
                ...payload,
                categoryId: editingCategory.categoryId,
            }
            const response = await fetch(`${apiUrl}/Category/${editingCategory.categoryId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`,
                },
                body: JSON.stringify(updatePayload),
            })
            const result = await response.json()
            if (!response.ok || result.status !== "success") {
                throw new Error(result.message || "Cập nhật thất bại")
            }
            await refetch()
            setIsModalOpen(false)
            setEditingCategory(null)
        } catch (err) {
            setActionError((err as Error).message)
        } finally {
            setIsSubmitting(false)
        }
    }

    // --- THAY ĐỔI: CẬP NHẬT LOGIC CỦA handleDeleteCategory ---
    const handleDeleteCategory = async (id: number) => {
        setActionError("") // Xóa lỗi cũ
        const category = categories.find((c) => c.categoryId === id)

        // 1. Validation check
        if (category && (category.newsArticleCount > 0 || category.subCategoryCount > 0)) {
            // THAY ĐỔI: Dùng setError thay vì alert
            setActionError("Không thể xóa danh mục đang có bài viết hoặc danh mục con.")
            // KHÔNG đóng modal, để user thấy lỗi
            return
        }

        setIsSubmitting(true)
        try {
            const response = await fetch(`${apiUrl}/Category/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${getToken()}`,
                },
            })

            if (!response.ok) {
                const result = await response.json()
                throw new Error(result.message || "Xóa thất bại")
            }

            // 2. Thành công:
            await refetch()
            setDeleteConfirm(null) // Đóng modal KHI thành công

        } catch (err) {
            // 3. Lỗi API:
            setActionError((err as Error).message)
            // KHÔNG đóng modal, để user thấy lỗi
        } finally {
            setIsSubmitting(false)
            // THAY ĐỔI: Xóa dòng `setDeleteConfirm(null)` ở đây
            // Chỉ đóng modal khi thành công
        }
    }

    const stats = useMemo(() => {
        return [
            {
                label: "Total Categories",
                value: categories.length.toString(),
                color: "text-primary",
            },
            {
                label: "Active Categories",
                value: categories.filter((c) => c.isActive).length.toString(),
                color: "text-success",
            },
            {
                label: "Total Articles",
                value: categories
                    .reduce((sum, c) => sum + c.newsArticleCount, 0)
                    .toLocaleString(),
                color: "text-accent",
            },
        ]
    }, [categories])

    // (Phần Loading/Error ban đầu giữ nguyên)
    if (isLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Category Management</h1>
                <p>Loading categories...</p>
            </div>
        )
    }

    if (fetchError) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Category Management</h1>
                <p className="text-error">Error loading categories: {fetchError.message}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* (Header, Stats, Search giữ nguyên) */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Category Management</h1>
                    <p className="text-muted text-sm mt-1">
                        Organize and manage article categories
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingCategory(null)
                        setIsModalOpen(true)
                        setActionError("")
                    }}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                    <Plus size={20} />
                    Add Category
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, idx) => (
                    <div
                        key={idx}
                        className="bg-card border border-border rounded-lg p-4"
                    >
                        <p className="text-muted text-sm mb-2">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-3 text-muted" size={20} />
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
            </div>


            {/* (Grid Card hiển thị giữ nguyên) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((category) => (
                    <div
                        key={category.categoryId}
                        className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-all hover:shadow-lg"
                    >
                        {/* (Nội dung card giữ nguyên) */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold">
                                    {category.categoryName}
                                </h3>
                                <p className="text-sm text-muted mt-1">
                                    {category.categoryDescription}
                                </p>
                            </div>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${category.isActive
                                    ? "bg-success/20 text-success"
                                    : "bg-error/20 text-error"
                                    }`}
                            >
                                {category.isActive ? "Active" : "Inactive"}
                            </span>
                        </div>
                        <div className="mb-4 pt-4 border-t border-border space-y-2">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-primary" />
                                <p className="text-sm text-muted">
                                    <span className="text-foreground font-semibold">
                                        {category.newsArticleCount}
                                    </span>{" "}
                                    articles
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-accent" />
                                <p className="text-sm text-muted">
                                    <span className="text-foreground font-semibold">
                                        {category.subCategoryCount}
                                    </span>{" "}
                                    sub-categories
                                </p>
                            </div>
                        </div>
                        {/* (Các nút Edit/Delete giữ nguyên) */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setEditingCategory(category)
                                    setIsModalOpen(true)
                                    setActionError("")
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-background hover:bg-border rounded-lg transition-colors text-accent font-medium text-sm"
                            >
                                <Edit2 size={16} />
                                Edit
                            </button>
                            <button
                                onClick={() => {
                                    setDeleteConfirm(category.categoryId)
                                    setActionError("")
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-background hover:bg-border rounded-lg transition-colors text-error font-medium text-sm"
                            >
                                <Trash2 size={16} />
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* (Empty state giữ nguyên) */}
            {filteredCategories.length === 0 && (
                <div className="text-center py-12">
                    <AlertCircle className="mx-auto mb-3 text-muted" size={32} />
                    <p className="text-muted">No categories found</p>
                </div>
            )}

            {/* (Modal Form giữ nguyên) */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setEditingCategory(null)
                }}
                title={editingCategory ? "Edit Category" : "Add New Category"}
            >
                {actionError && (
                    <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg flex items-center gap-2 text-error text-sm">
                        <AlertCircle size={16} />
                        {actionError}
                    </div>
                )}
                <fieldset disabled={isSubmitting}>
                    <CategoryForm
                        category={editingCategory}
                        onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}
                        onCancel={() => {
                            setIsModalOpen(false)
                            setEditingCategory(null)
                        }}
                    />
                </fieldset>
            </Modal>

            {/* --- THAY ĐỔI: CẬP NHẬT MODAL XÁC NHẬN XÓA --- */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-lg max-w-sm w-full">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertCircle className="text-error" size={24} />
                                <h3 className="text-lg font-bold">Delete Category</h3>
                            </div>

                            {/* THAY ĐỔI: Thêm khối hiển thị lỗi */}
                            {actionError && (
                                <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg flex items-center gap-2 text-error text-sm">
                                    <AlertCircle size={16} />
                                    {actionError}
                                </div>
                            )}

                            <p className="text-muted mb-6">
                                Are you sure you want to delete this category? This action cannot
                                be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleDeleteCategory(deleteConfirm)}
                                    disabled={isSubmitting}
                                    className="flex-1 bg-error hover:bg-error/90 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? "Deleting..." : "Delete"}
                                </button>
                                <button
                                    onClick={() => {
                                        setDeleteConfirm(null)
                                        setActionError("") // THAY ĐỔI: Xóa lỗi khi cancel
                                    }}
                                    disabled={isSubmitting}
                                    className="flex-1 bg-background border border-border hover:bg-card text-foreground font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}