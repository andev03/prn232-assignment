import { Tag } from "./Tag";

export interface NewsArticle {
    newsArticleId: number;
    headline: string;
    newsTitle: string;
    createdDate: string; // hoặc Date nếu bạn muốn kiểu Date
    views: number;
    newsSource: string;
    newsStatus: boolean;
    categoryName: string;
    createdByName: string;
    newsContent: string;
    tags: Tag[]; // Nếu tags là mảng string, hoặc có thể là array of objects
}
