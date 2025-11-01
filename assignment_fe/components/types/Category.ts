export interface Category {
    categoryId: number
    categoryName: string
    categoryDescription: string
    parentCategoryId: number | null
    isActive: boolean
    newsArticleCount: number
    subCategoryCount: number
}