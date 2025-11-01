export interface ApiResponse<T> {
    code: number;
    status: string;
    message: string;
    data: T;
    errors: any | null; // 'errors' có thể là null hoặc một đối tượng/mảng lỗi
}