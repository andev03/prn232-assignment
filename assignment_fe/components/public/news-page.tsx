"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useFetchData } from "../hooks/useFetchData"
// [THAY ĐỔI] 1. Thêm icon Link (hoặc Newspaper) cho NewsSource
import {
    Calendar,
    ChevronRight,
    LogIn,
    Search,
    User,
    Tag as TagIcon,
    Link as LinkIcon, // <-- Thêm icon này
} from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { NewsArticle } from "../types/NewsArticle"
import { Category } from "../types/Category"
import { Tag } from "../types/Tag"

export default function UserArticlesPage() {
    const router = useRouter()

    const handleGoToLogin = () => {
        router.push("/login")
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    // (Fetch data... logic giữ nguyên)
    const {
        data: articles,
        isLoading: isArticlesLoading,
        error: articlesError,
    } = useFetchData<NewsArticle[]>(apiUrl ? `${apiUrl}/NewsArticle` : null)

    const publishedArticles = useMemo(() => {
        if (!articles) return []
        return articles.filter(article => article.newsStatus === true)
    }, [articles])

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [selectedTag, setSelectedTag] = useState<string | null>(null)
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
    const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null)

    const detailUrl = selectedArticleId
        ? `${apiUrl}/NewsArticle/${selectedArticleId}`
        : null

    const {
        data: detailArticle,
        isLoading: isDetailLoading,
        error: detailError,
    } = useFetchData<NewsArticle>(detailUrl)

    // (categories and tags useMemo... logic giữ nguyên)
    const categories = useMemo(() => {
        if (!publishedArticles) return []
        const allCategoryNames = publishedArticles.map((article) => article.categoryName)
        const uniqueCategoryNames = [...new Set(allCategoryNames)]
        return uniqueCategoryNames.map(
            (name) => ({ categoryName: name } as Category)
        )
    }, [publishedArticles])

    const tags = useMemo(() => {
        if (!publishedArticles) return []
        const allTags = publishedArticles.flatMap((article) => article.tags || [])
        const uniqueTags = new Map<string, Tag>()
        allTags.forEach((tag) => {
            if (tag && !uniqueTags.has(tag.tagName)) {
                uniqueTags.set(tag.tagName, tag)
            }
        })
        return Array.from(uniqueTags.values())
    }, [publishedArticles])


    // (filteredArticles... logic giữ nguyên)
    const filteredArticles =
        publishedArticles &&
        publishedArticles
            .filter((article) => {
                const matchesSearch =
                    (article.newsTitle ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (article.headline ?? "").toLowerCase().includes(searchTerm.toLowerCase())

                const matchesCategory =
                    !selectedCategory || article.categoryName === selectedCategory

                const matchesTag =
                    !selectedTag ||
                    (article.tags &&
                        article.tags.some((tag) => tag.tagName === selectedTag))

                return matchesSearch && matchesCategory && matchesTag
            })
            .sort((a, b) => {
                const dateA = new Date(a.createdDate).getTime()
                const dateB = new Date(b.createdDate).getTime()
                return sortOrder === "newest" ? dateB - dateA : dateA - dateB
            })

    // (clearFilters... logic giữ nguyên)
    const clearFilters = () => {
        setSearchTerm("")
        setSelectedCategory(null)
        setSelectedTag(null)
    }

    const activeFilterCount =
        (selectedCategory ? 1 : 0) + (selectedTag ? 1 : 0)

    // (JSX return... phần header, search, filter giữ nguyên)
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b bg-card">
                <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-3 items-center">
                    <div />
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-foreground">News Feed</h1>
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={handleGoToLogin}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <LogIn size={18} />
                            Login
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-3 text-muted-foreground"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Search articles by title or headline..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                <div className="mb-8 space-y-4">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-3">
                            Categories
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {categories &&
                                categories.map((cat) => (
                                    <button
                                        key={cat.categoryName}
                                        onClick={() =>
                                            setSelectedCategory(
                                                selectedCategory === cat.categoryName
                                                    ? null
                                                    : cat.categoryName
                                            )
                                        }
                                        className={`px-4 py-2 rounded-lg transition-colors ${selectedCategory === cat.categoryName
                                            ? "bg-primary-light text-black"
                                            : "bg-card border text-foreground hover:bg-muted hover:text-white"
                                            }`}
                                    >
                                        {cat.categoryName}
                                    </button>
                                ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-foreground mb-3">
                            Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {tags &&
                                tags.map((tag) => (
                                    <button
                                        key={tag.tagId}
                                        onClick={() =>
                                            setSelectedTag(
                                                selectedTag === tag.tagName
                                                    ? null
                                                    : tag.tagName
                                            )
                                        }
                                        className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors text-xs ${selectedTag === tag.tagName
                                            ? "bg-primary-light text-black"
                                            : "bg-card border text-foreground hover:bg-muted hover:text-white"
                                            }`}
                                    >
                                        <TagIcon size={12} />
                                        {tag.tagName}
                                    </button>
                                ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <select
                                value={sortOrder}
                                onChange={(e) =>
                                    setSortOrder(e.target.value as "newest" | "oldest")
                                }
                                className="px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="newest">Bài mới nhất</option>
                                <option value="oldest">Bài cũ nhất</option>
                            </select>
                        </div>
                        {activeFilterCount > 0 && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-primary hover:underline"
                            >
                                Clear Filters ({activeFilterCount})
                            </button>
                        )}
                    </div>
                </div>

                {/* (Article Grid... logic giữ nguyên, không hiển thị source ở card) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isArticlesLoading && <p>Loading articles...</p>}
                    {articlesError && (
                        <p className="text-red-500">
                            {articlesError.message}
                        </p>
                    )}
                    {filteredArticles &&
                        filteredArticles.map((article) => (
                            <div
                                key={article.newsArticleId}
                                className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => setSelectedArticleId(article.newsArticleId)}
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                                            {article.categoryName}
                                        </span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar size={14} />
                                            {new Date(article.createdDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-foreground mb-2">
                                        {article.newsTitle}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {article.headline}
                                    </p>

                                    {article.tags && article.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {article.tags.map((tag) => (
                                                <span
                                                    key={tag.tagId}
                                                    className="text-xs font-medium bg-muted text-white px-2 py-1 rounded-full flex items-center gap-1"
                                                >
                                                    <TagIcon size={12} />
                                                    {tag.tagName}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <User size={14} />
                                            {article.createdByName}
                                        </span>
                                        <span className="text-primary flex items-center gap-1">
                                            Đọc hết <ChevronRight size={16} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </main>

            {/* --- ĐÂY LÀ PHẦN SỬA --- */}
            <Dialog
                open={!!selectedArticleId}
                onOpenChange={() => setSelectedArticleId(null)}
            >
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <VisuallyHidden>
                        <DialogTitle>Article details</DialogTitle>
                    </VisuallyHidden>

                    {isDetailLoading && (
                        <div className="p-6 text-center">
                            <p>Loading details...</p>
                        </div>
                    )}

                    {detailError && (
                        <div className="p-6 text-center text-red-500">
                            <p>Error loading article: {detailError.message}</p>
                        </div>
                    )}

                    {detailArticle && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-2xl text-foreground">
                                    {detailArticle.newsTitle}
                                </DialogTitle>
                                <DialogDescription className="text-foreground">
                                    {detailArticle.headline}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span className="flex items-center gap-2">
                                        <User size={16} />
                                        {detailArticle.createdByName}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Calendar size={16} />
                                        {new Date(detailArticle.createdDate).toLocaleDateString()}
                                    </span>
                                </div>

                                {/* [THAY ĐỔI] THÊM KHỐI NÀY ĐỂ HIỂN THỊ NEWS SOURCE */}
                                {detailArticle.newsSource && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
                                        <LinkIcon size={16} />
                                        <span>Source: {detailArticle.newsSource}</span>
                                    </div>
                                )}
                                {/* [KẾT THÚC THAY ĐỔI] */}


                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                                        {detailArticle.categoryName}
                                    </span>
                                </div>

                                {detailArticle.tags && detailArticle.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {detailArticle.tags.map((tag) => (
                                            <span
                                                key={tag.tagId}
                                                className="text-xs font-medium bg-muted text-muted-foreground px-2 py-1 rounded-full flex items-center gap-1"
                                            >
                                                <TagIcon size={12} />
                                                {tag.tagName}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="prose prose-invert max-w-none">
                                    <p className="text-foreground leading-relaxed">
                                        {detailArticle.newsContent}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}