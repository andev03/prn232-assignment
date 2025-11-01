"use client"

import { useState, useMemo } from "react" // 1. Import thêm useMemo
import { Search, Eye, Calendar } from "lucide-react" // 2. Import thêm Calendar
import { useFetchData } from "../hooks/useFetchData" // 3. Import hook fetch data
import { NewsArticle } from "../types/NewsArticle"


export default function NewsHistory() {
    // 5. GỌI API BẰNG HOOK 'useFetchData'
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const {
        data: articles,
        isLoading,
        error,
    } = useFetchData<NewsArticle[]>(apiUrl ? `${apiUrl}/NewsArticle/Account` : null)

    const [searchTerm, setSearchTerm] = useState("")

    // 6. DÙNG 'useMemo' ĐỂ TÍNH TOÁN DỮ LIỆU KHI 'articles' THAY ĐỔI
    // Lọc bài viết dựa trên 'newsTitle'
    const filteredArticles = useMemo(() => {
        if (!articles) return []
        return articles.filter((article) =>
            article.newsTitle.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [articles, searchTerm]) // Phụ thuộc vào 'articles' và 'searchTerm'

    // Tính toán các số liệu thống kê
    const { totalViews, activeArticlesCount, totalArticlesCount } = useMemo(() => {
        if (!articles) {
            return { totalViews: 0, activeArticlesCount: 0, totalArticlesCount: 0 }
        }

        const totalViews = articles.reduce((sum, article) => sum + article.views, 0)
        // Đếm dựa trên 'newsStatus' (boolean)
        const activeArticlesCount = articles.filter((a) => a.newsStatus === true).length
        const totalArticlesCount = articles.length

        return { totalViews, activeArticlesCount, totalArticlesCount }
    }, [articles]) // Chỉ phụ thuộc vào 'articles'

    // 7. XỬ LÝ TRẠNG THÁI LOADING VÀ ERROR
    if (isLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">My News History</h1>
                <p>Loading your articles...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">My News History</h1>
                <p className="text-error">{error.message}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">My News History</h1>
                <p className="text-muted mt-1">View all articles you have created</p>
            </div>

            {/* Stats (Sử dụng giá trị từ useMemo) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-lg p-6">
                    <p className="text-muted text-sm mb-2">Total Articles</p>
                    <p className="text-3xl font-bold text-primary">
                        {totalArticlesCount}
                    </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                    <p className="text-muted text-sm mb-2">Published</p>
                    <p className="text-3xl font-bold text-success">
                        {activeArticlesCount}
                    </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                    <p className="text-muted text-sm mb-2">Total Views</p>
                    <p className="text-3xl font-bold text-accent">{totalViews}</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-3 text-muted" size={20} />
                <input
                    type="text"
                    placeholder="Search your articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
            </div>

            {/* Timeline (Cập nhật để dùng 'filteredArticles' và thuộc tính mới) */}
            <div className="space-y-4">
                {filteredArticles.map((article) => (
                    <div
                        key={article.newsArticleId} // SỬA: Dùng 'newsArticleId'
                        className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold mb-2">
                                    {article.newsTitle} {/* SỬA: Dùng 'newsTitle' */}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-muted">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={16} /> {/* Dùng icon Calendar */}
                                        {/* SỬA: Định dạng lại ngày tháng */}
                                        {new Date(article.createdDate).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Eye size={16} />
                                        {article.views} views
                                    </span>
                                </div>
                            </div>
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ml-4 ${
                                    // SỬA: Logic dựa trên 'newsStatus' (boolean)
                                    article.newsStatus
                                        ? "bg-success/20 text-success"
                                        : "bg-error/20 text-error"
                                    }`}
                            >
                                {/* SỬA: Hiển thị text dựa trên boolean */}
                                {article.newsStatus ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                ))}

                {filteredArticles.length === 0 && (
                    <div className="text-center py-8 text-muted">
                        <p>No articles found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    )
}