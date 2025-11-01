"use client"

import { useState, useMemo } from "react" // THÊM useMemo
import {
    Calendar,
    TrendingUp,
    Users,
    FileText,
    Filter,
} from "lucide-react"
import { useFetchData } from "../hooks/useFetchData" // THÊM useFetchData

// 1. ĐỊNH NGHĨA INTERFACE DỰA TRÊN API RESPONSE
interface NewsArticle {
    newsArticleId: number
    headline: string
    newsTitle: string
    newsContent: string
    createdDate: string
    views: number
    newsStatus: boolean
    categoryName: string
    createdByName: string
}

export default function ReportingPage() {
    const [startDate, setStartDate] = useState("2024-01-01")
    const [endDate, setEndDate] = useState("2025-12-31") // (Cập nhật ngày để thấy data)

    // 2. FETCH DATA TỪ API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const {
        data: articles,
        isLoading,
        error,
    } = useFetchData<NewsArticle[]>(apiUrl ? `${apiUrl}/NewsArticle` : null)

    // 3. TÍNH TOÁN CÁC SỐ LIỆU (STATS) DỰA TRÊN DATA ĐÃ FETCH
    // 'useMemo' sẽ tự động tính toán lại khi 'articles', 'startDate', hoặc 'endDate' thay đổi
    const {
        stats,
        staffPerformance,
        topArticles,
        filteredArticleCount, // Dùng cho 'Total Articles'
    } = useMemo(() => {
        if (!articles) {
            // Trả về giá trị mặc định khi chưa có data
            return { stats: [], staffPerformance: [], topArticles: [], filteredArticleCount: 0 }
        }

        // A. Lọc bài viết theo ngày
        const start = new Date(startDate).getTime()
        const end = new Date(endDate).getTime()
        const filteredArticles = articles.filter((article) => {
            const articleDate = new Date(article.createdDate).getTime()
            // Chỉ lấy bài viết 'Active' (newsStatus: true)
            return articleDate >= start && articleDate <= end && article.newsStatus === true
        })

        // B. Tính toán Stats Cards
        const totalViews = filteredArticles.reduce(
            (sum, article) => sum + article.views,
            0
        )
        const activeCategories = new Set(
            filteredArticles.map((a) => a.categoryName)
        )
        const activeStaff = new Set(filteredArticles.map((a) => a.createdByName))

        const stats = [
            {
                label: "Total Articles",
                value: filteredArticles.length.toLocaleString(),
                icon: FileText,
                color: "text-primary",
            },
            {
                label: "Total Views",
                value: totalViews.toLocaleString(),
                icon: TrendingUp,
                color: "text-accent",
            },
            {
                label: "Active Categories",
                value: activeCategories.size.toLocaleString(),
                icon: FileText,
                color: "text-success",
            },
            {
                label: "Active Staff",
                value: activeStaff.size.toLocaleString(),
                icon: Users,
                color: "text-warning",
            },
        ]

        // C. Tính toán Staff Performance
        const staffMap = new Map<string, { articles: number; views: number }>()
        filteredArticles.forEach((article) => {
            const staffName = article.createdByName
            const current = staffMap.get(staffName) || { articles: 0, views: 0 }
            current.articles += 1
            current.views += article.views
            staffMap.set(staffName, current)
        })

        const staffPerformance = Array.from(staffMap.entries())
            .map(([name, data]) => ({
                name,
                articles: data.articles,
                views: data.views,
            }))
            .sort((a, b) => b.articles - a.articles) // Sắp xếp theo số lượng bài viết

        // D. Tính toán Top Articles
        const topArticles = [...filteredArticles]
            .sort((a, b) => b.views - a.views) // Sắp xếp theo lượt xem
            .slice(0, 4) // Lấy top 4
            .map((article) => ({
                title: article.newsTitle,
                views: article.views,
                category: article.categoryName,
            }))

        return { stats, staffPerformance, topArticles, filteredArticleCount: filteredArticles.length }
    }, [articles, startDate, endDate]) // Phụ thuộc vào 3 giá trị này

    // 4. XỬ LÝ LOADING VÀ ERROR
    if (isLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold mb-2">Reports & Statistics</h1>
                <p>Loading reports...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold mb-2">Reports & Statistics</h1>
                <p className="text-error">Error loading data: {error.message}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Reports & Statistics</h1>
                <p className="text-muted">
                    Comprehensive analytics and insights for your news platform
                </p>
            </div>

            {/* Date Range Filter */}
            <div className="bg-card border border-border rounded-lg p-4 flex gap-4 items-end flex-wrap">
                <div>
                    <label className="block text-sm font-medium mb-2">Start Date</label>
                    <div className="relative">
                        <Calendar
                            className="absolute left-3 top-3 text-muted"
                            size={18}
                        />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-background border border-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">End Date</label>
                    <div className="relative">
                        <Calendar
                            className="absolute left-3 top-3 text-muted"
                            size={18}
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-background border border-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>
                </div>
                <button className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors font-medium flex items-center gap-2">
                    <Filter size={18} />
                    Filter articles)
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => {
                    const Icon = stat.icon
                    return (
                        <div
                            key={idx}
                            className="bg-card border border-border rounded-lg p-6"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-muted text-sm">{stat.label}</p>
                                <Icon className={`${stat.color}`} size={20} />
                            </div>
                            <p className={`text-3xl font-bold ${stat.color}`}>
                                {stat.value}
                            </p>
                        </div>
                    )
                })}
            </div>

            {/* Staff Performance (SỬA Ở ĐÂY) */}
            <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Staff Performance</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-background border-b border-border">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold">
                                    Staff Member
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">
                                    Articles Published
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-semibold">
                                    Total Views
                                </th>
                                {/* BỎ CỘT Engagement VÀ Performance */}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {staffPerformance.map((staff, idx) => (
                                <tr
                                    key={idx}
                                    className="hover:bg-background transition-colors"
                                >
                                    <td className="px-6 py-4 font-medium">{staff.name}</td>
                                    <td className="px-6 py-4 text-muted">{staff.articles}</td>
                                    <td className="px-6 py-4 text-muted">
                                        {staff.views.toLocaleString()}
                                    </td>
                                    {/* BỎ 2 CỘT TƯƠNG ỨNG */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Top Articles (Sử dụng 'topArticles' từ useMemo) */}
            <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                    Top Performing Articles
                </h3>
                <div className="space-y-3">
                    {topArticles.map((article, idx) => (
                        <div
                            key={idx}
                            className="flex items-center justify-between p-4 bg-background rounded-lg hover:border-primary border border-transparent transition-colors"
                        >
                            <div className="flex-1">
                                <p className="font-medium">{article.title}</p>
                                <p className="text-sm text-muted mt-1">{article.category}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-primary">
                                    {article.views.toLocaleString()}
                                </p>
                                <p className="text-xs text-muted">views</p>
                            </div>
                        </div>
                    ))}
                    {topArticles.length === 0 && (
                        <p className="text-muted text-center py-4">
                            No active articles found in this date range.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}