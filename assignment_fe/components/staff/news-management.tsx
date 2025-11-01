"use client"

import { useState, useEffect, useMemo } from "react"
import {
    Plus,
    Edit2,
    Trash2,
    Search,
    Eye,
    EyeOff,
    AlertCircle,
} from "lucide-react"
import Modal from "@/components/ui/modal"
import NewsForm, { NewsArticlePayload } from "@/components/staff/news-form"
import { useFetchData } from "../hooks/useFetchData"
import { NewsArticle } from "../types/NewsArticle"
import { Tag } from "../types/Tag"

export default function NewsManagement() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    const {
        data: fetchedArticles,
        isLoading,
        error: fetchError,
        refetch,
    } = useFetchData<NewsArticle[]>(
        apiUrl ? `${apiUrl}/NewsArticle/Account` : null
    )

    const [articles, setArticles] = useState<NewsArticle[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [actionError, setActionError] = useState("")


    useEffect(() => {
        if (fetchedArticles) {
            setArticles(fetchedArticles)
        }
    }, [fetchedArticles])

    const [searchTerm, setSearchTerm] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

    const filteredArticles = articles.filter((article) =>
        article.newsTitle.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getToken = () => localStorage.getItem("authToken")

    // (handleAddArticle và handleUpdateArticle giữ nguyên)
    const handleAddArticle = async (payload: NewsArticlePayload) => {
        setIsSubmitting(true)
        setActionError("")
        try {
            delete (payload as any).categoryName
            const response = await fetch(`${apiUrl}/NewsArticle`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`,
                },
                body: JSON.stringify(payload),
            })
            const result = await response.json()
            if (!response.ok || result.status !== "success") {
                throw new Error(result.message || "Tạo bài viết thất bại")
            }
            await refetch()
            setIsModalOpen(false)
        } catch (err) {
            setActionError((err as Error).message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdateArticle = async (payload: NewsArticlePayload) => {
        if (!editingArticle) return
        setIsSubmitting(true)
        setActionError("")
        try {
            delete (payload as any).categoryName
            const updatePayload = {
                ...payload,
                newsArticleId: editingArticle.newsArticleId,
            }
            const response = await fetch(`${apiUrl}/NewsArticle/${editingArticle.newsArticleId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`,
                },
                body: JSON.stringify(updatePayload),
            })
            const result = await response.json()
            if (!response.ok || result.status !== "success") {
                throw new Error(result.message || "Cập nhật bài viết thất bại")
            }
            await refetch()
            setIsModalOpen(false)
            setEditingArticle(null)
        } catch (err) {
            setActionError((err as Error).message)
        } finally {
            setIsSubmitting(false)
        }
    }

    // --- [THAY ĐỔI] THÊM VALIDATION VÀO HÀM DELETE ---
    const handleDeleteArticle = async (id: number) => {
        setIsSubmitting(true)
        setActionError("")

        // [THAY ĐỔI] 1. Tìm bài viết trong state
        const articleToDelete = articles.find(a => a.newsArticleId === id);

        if (!articleToDelete) {
            setActionError("Lỗi: Không tìm thấy bài viết.");
            setIsSubmitting(false);
            return;
        }

        if (articleToDelete.newsStatus === true) {
            setActionError("Cannot delete a post that is in the 'Active' (Published) status.");
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/NewsArticle/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${getToken()}`,
                },
            })

            if (!response.ok) {
                try {
                    const result = await response.json()
                    throw new Error(result.message || "Xóa thất bại")
                } catch (e) {
                    throw new Error(`Xóa thất bại (HTTP ${response.status})`)
                }
            }

            await refetch()
            setDeleteConfirm(null) // Đóng modal KHI thành công

        } catch (err) {
            setActionError((err as Error).message)
        } finally {
            setIsSubmitting(false)
            // Đã xóa logic 'if (!actionError)' ở đây
            // Modal chỉ đóng khi thành công (ở trên)
        }
    }

    // (stats useMemo giữ nguyên)
    const stats = useMemo(() => {
        const published = articles.filter((a) => a.newsStatus).length
        const totalViews = articles.reduce((sum, a) => sum + a.views, 0)
        return [
            {
                label: "Total Articles",
                value: articles.length.toString(),
                color: "text-primary",
            },
            {
                label: "Published",
                value: published.toString(),
                color: "text-success",
            },
            {
                label: "Total Views",
                value: totalViews.toLocaleString(),
                color: "text-accent",
            },
        ]
    }, [articles])

    // (isLoading và fetchError checks giữ nguyên)
    if (isLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">News Articles</h1>
                <p>Loading articles...</p>
            </div>
        )
    }

    if (fetchError) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">News Articles</h1>
                <p className="text-error">{fetchError.message}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header (Luôn hiển thị) */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">News Articles</h1>
                    <p className="text-muted text-sm mt-1">
                        Create and manage your news articles
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingArticle(null)
                        setIsModalOpen(true)
                        setActionError("")
                    }}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                    <Plus size={20} />
                    Create Article
                </button>
            </div>

            {/* (Logic hiển thị nội dung giữ nguyên) */}
            {fetchedArticles && fetchedArticles.length === 0 ? (
                <div className="text-center py-12 bg-card border border-border rounded-lg">
                    <AlertCircle className="mx-auto mb-3 text-muted" size={32} />
                    <p className="text-muted">Bạn chưa có bài viết nào.</p>
                    <p className="text-muted text-sm mt-1">
                        Nhấn "Create Article" để bắt đầu.
                    </p>
                </div>
            ) : (
                <>
                    {/* (Stats, Search, Table... giữ nguyên) */}
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
                            placeholder="Search articles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    <div className="bg-card border border-border rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-background border-b border-border">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">
                                        Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">
                                        Views
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredArticles.map((article) => (
                                    <tr
                                        key={article.newsArticleId}
                                        className="hover:bg-background transition-colors"
                                    >
                                        <td className="px-6 py-4 font-medium">
                                            {article.newsTitle}
                                        </td>
                                        <td className="px-6 py-4 text-muted text-sm">
                                            {article.categoryName}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit ${article.newsStatus
                                                    ? "bg-success/20 text-success"
                                                    : "bg-error/20 text-error"
                                                    }`}
                                            >
                                                {article.newsStatus ? (
                                                    <Eye size={14} />
                                                ) : (
                                                    <EyeOff size={14} />
                                                )}
                                                {article.newsStatus ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted text-sm">
                                            {article.views.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-muted text-sm">
                                            {new Date(article.createdDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingArticle(article)
                                                        setIsModalOpen(true)
                                                        setActionError("")
                                                    }}
                                                    className="p-2 hover:bg-background rounded-lg transition-colors text-accent"
                                                    title="Edit article"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setDeleteConfirm(article.newsArticleId)
                                                        setActionError("")
                                                    }}
                                                    className="p-2 hover:bg-background rounded-lg transition-colors text-error"
                                                    title="Delete article"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredArticles.length === 0 && (
                            <div className="px-6 py-12 text-center">
                                <AlertCircle className="mx-auto mb-3 text-muted" size={32} />
                                <p className="text-muted">Không tìm thấy bài viết nào khớp với tìm kiếm.</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* (Modal Form giữ nguyên) */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    if (isSubmitting) return;
                    setIsModalOpen(false)
                    setEditingArticle(null)
                }}
                title={editingArticle ? "Edit Article" : "Create New Article"}
            >
                {actionError && (
                    <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg flex items-center gap-2 text-error text-sm">
                        <AlertCircle size={16} />
                        {actionError}
                    </div>
                )}
                <fieldset disabled={isSubmitting}>
                    <NewsForm
                        article={editingArticle}
                        onSubmit={editingArticle ? handleUpdateArticle : handleAddArticle}
                        onCancel={() => {
                            setIsModalOpen(false)
                            setEditingArticle(null)
                        }}
                    />
                </fieldset>
            </Modal>

            {/* (Modal Xóa giữ nguyên) */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-lg max-w-sm w-full">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertCircle className="text-error" size={24} />
                                <h3 className="text-lg font-bold">Delete Article</h3>
                            </div>

                            {actionError && (
                                <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg flex items-center gap-2 text-error text-sm">
                                    <AlertCircle size={16} />
                                    {actionError}
                                </div>
                            )}

                            <p className="text-muted mb-6">
                                Are you sure you want to delete this article? This action cannot
                                be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleDeleteArticle(deleteConfirm)}
                                    disabled={isSubmitting}
                                    className="flex-1 bg-error hover:bg-error/90 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? "Deleting..." : "Delete"}
                                </button>
                                <button
                                    onClick={() => {
                                        setDeleteConfirm(null)
                                        setActionError("")
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