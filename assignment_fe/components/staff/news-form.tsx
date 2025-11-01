"use client"

import React, { useState, useEffect } from "react"
import type { FormEvent, ChangeEvent, KeyboardEvent } from "react"
import { X } from "lucide-react"
import { NewsArticle } from "../types/NewsArticle"
import { useFetchData } from "../hooks/useFetchData"
import { Category } from "../types/Category"

// [THAY ĐỔI] 1. Cập nhật Interface cho state của form
interface IFormData {
    title: string
    category: string
    headline: string
    newsSource: string // <-- ĐÃ THÊM
    content: string
    tags: string[]
    tagInput: string
    status: "Active" | "Inactive"
}

interface TagPayload {
    tagName: string;
    note: string;
}

export interface NewsArticlePayload {
    newsTitle: string;
    headline: string;
    newsContent: string;
    newsSource: string;
    categoryId: number;
    newsStatus: boolean;
    tags: TagPayload[];
    categoryName?: string; // (Thêm ? vì nó chỉ dùng cho "mock" ở client)
}
interface NewsFormProps {
    article: NewsArticle | null
    // [THAY ĐỔI] 2. onSubmit giờ sẽ nhận payload đã định dạng
    // (Mặc dù 'any' vẫn hoạt động, nhưng logic bên trong handleSubmit sẽ gửi đi đúng)
    onSubmit: (data: any) => void
    onCancel: () => void
}

// [THAY ĐỔI] 3. Cập nhật logic khởi tạo state
const getInitialState = (article: NewsArticle | null): IFormData => ({
    title: article?.newsTitle || "",
    category: article?.categoryName || "",
    headline: article?.headline || "",
    newsSource: article?.newsSource || "", // <-- ĐÃ THÊM
    content: article?.newsContent || "",
    tags: article?.tags ? article.tags.map(tag => tag.tagName) : [],
    tagInput: "",
    status: article?.newsStatus === false ? "Inactive" : "Active",
})

export default function NewsForm({ article, onSubmit, onCancel }: NewsFormProps) {
    const [formData, setFormData] = useState<IFormData>(getInitialState(article))

    // (Fetch categories - Giữ nguyên)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const {
        data: fetchedCategories,
        isLoading,
        error,
    } = useFetchData<Category[]>(apiUrl ? `${apiUrl}/Category` : null)

    const [categories, setCategories] = useState<Category[]>([])

    useEffect(() => {
        if (fetchedCategories) {
            setCategories(fetchedCategories)
        }
    }, [fetchedCategories])

    // (Các useEffect đồng bộ state - Giữ nguyên)
    useEffect(() => {
        setFormData(getInitialState(article))
    }, [article])

    useEffect(() => {
        if (article === null && categories.length > 0 && formData.category === "") {
            setFormData(prev => ({
                ...prev,
                category: categories[0].categoryName
            }))
        }
    }, [article, categories, formData.category])

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    // [THAY ĐỔI] 4. Bổ sung logic cho các hàm xử lý Tag
    const handleAddTag = () => {
        const newTag = formData.tagInput.trim()
        // Cho phép thêm tag trùng, vì API có thể xử lý việc này (ví dụ GetByName)
        if (newTag) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag],
                tagInput: "" // Xóa input
            }))
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            // Xóa chỉ 1 lần xuất hiện của tag
            tags: prev.tags.filter((_, i) => i !== prev.tags.findIndex(t => t === tagToRemove))
        }))
    }

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault() // Ngăn form submit
            handleAddTag()
        }
    }

    // [THAY ĐỔI] 5. Cập nhật handleSubmit để gửi đúng DTO
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        // Tách `tagInput` (không cần gửi) và lấy ra `data`
        const { tagInput, ...data } = formData

        // 1. Tìm Category ID (Logic của bạn đã đúng)
        const selectedCategory = categories.find(
            cat => cat.categoryName === data.category
        )
        // API DTO yêu cầu `int`, nên dùng 0 nếu không tìm thấy
        const categoryId = selectedCategory ? selectedCategory.categoryId : 0

        // 2. Chuyển đổi Tags từ string[] sang CreateTagDto[]
        const tagsPayload = data.tags.map(tagName => ({
            tagName: tagName,
            note: "" // Form không thu thập 'note', gửi chuỗi rỗng
        }))

        // 3. Xây dựng payload cuối cùng khớp với DTO
        const finalPayload = {
            newsTitle: data.title,
            headline: data.headline,
            newsContent: data.content,
            newsSource: data.newsSource, // <-- ĐÃ THÊM
            categoryId: categoryId,
            newsStatus: data.status === "Active", // Chuyển "Active" -> true
            tags: tagsPayload, // <-- ĐÃ CHUYỂN ĐỔI
            categoryName: data.category
        }

        onSubmit(finalPayload)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2" aria-busy={isLoading}>
            {/* Input Title (không đổi) */}
            <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    required
                />
            </div>

            {/* Input Headline (không đổi) */}
            <div>
                <label className="block text-sm font-medium mb-2">Headline</label>
                <input
                    type="text"
                    name="headline"
                    value={formData.headline}
                    onChange={handleChange}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
            </div>

            {/* [THAY ĐỔI] 6. Thêm Input News Source */}
            <div>
                <label className="block text-sm font-medium mb-2">News Source</label>
                <input
                    type="text"
                    name="newsSource" // <-- Tên phải khớp state
                    value={formData.newsSource} // <-- Tên phải khớp state
                    onChange={handleChange}
                    placeholder="e.g., TechInsider, Reuters..."
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
            </div>

            {/* Input Category (không đổi) */}
            <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={isLoading || !!error}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    required
                >
                    {isLoading && <option value="">Loading categories...</option>}
                    {error && <option value="">Error: {error.message}</option>}
                    {article && !isLoading && formData.category && !categories.find(c => c.categoryName === formData.category) && (
                        <option value={formData.category}>{formData.category}</option>
                    )}
                    {!isLoading && !error && categories.map((cat) => (
                        <option key={cat.categoryId} value={cat.categoryName}>
                            {cat.categoryName}
                        </option>
                    ))}
                </select>
            </div>

            {/* Input Content (không đổi) */}
            <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                    rows={4}
                    required
                />
            </div>

            {/* Input Tags (Logic đã được cập nhật) */}
            <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        name="tagInput"
                        value={formData.tagInput}
                        onChange={handleChange}
                        onKeyPress={handleKeyPress} // <-- Đã kết nối
                        placeholder="Add a tag and press Enter"
                        className="flex-1 bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <button
                        type="button"
                        onClick={handleAddTag} // <-- Đã kết nối
                        className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors font-medium"
                    >
                        Add
                    </button>
                </div>
                {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => ( // Thêm index làm key dự phòng
                            <div
                                key={`${tag}-${index}`} // Key an toàn hơn
                                className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)} // <-- Đã kết nối
                                    className="hover:text-primary-dark transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Select Status (không đổi) */}
            <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                    <option value="Active">Active (Published)</option>
                    <option value="Inactive">Inactive (Draft)</option>
                </select>
            </div>

            {/* Buttons (không đổi) */}
            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-2 rounded-lg transition-colors"
                >
                    {article ? "Update" : "Create"}
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