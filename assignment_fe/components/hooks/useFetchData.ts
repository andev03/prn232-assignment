// THAY ĐỔI: import thêm useCallback
import { useState, useEffect, useCallback } from "react"
import { ApiResponse } from "../types/ApiResponse" // Đảm bảo bạn có import này

export function useFetchData<T>(url: string | null) {
    const [data, setData] = useState<T | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    // THAY ĐỔI 1:
    // Bọc logic fetch vào trong một hàm `useCallback`
    // để có thể gọi lại nó một cách độc lập
    const fetchData = useCallback(async () => {
        if (!url) {
            setIsLoading(false)
            setData(null) // Đảm bảo data là null nếu không có url
            return
        }

        setIsLoading(true)
        setError(null) // Xóa lỗi cũ khi fetch
        try {
            const token = localStorage.getItem("authToken")
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            // Cải thiện xử lý lỗi
            if (!response.ok) {
                let errorMsg = `HTTP error! status: ${response.status}`
                try {
                    const errResult = await response.json()
                    errorMsg = errResult.message || errorMsg
                } catch (e) {
                    // Không thể parse JSON, dùng lỗi status
                }
                throw new Error(errorMsg)
            }

            const result: ApiResponse<T> = await response.json()

            if (result.status === "success") {
                setData(result.data)
            } else {
                throw new Error(result.message || "API request failed")
            }
        } catch (e) {
            setError(e as Error)
        } finally {
            setIsLoading(false)
        }
    }, [url]) // Hàm này sẽ được tạo lại khi `url` thay đổi

    // THAY ĐỔI 2:
    // useEffect bây giờ chỉ cần gọi hàm `fetchData`
    useEffect(() => {
        fetchData()
    }, [fetchData]) // Sẽ chạy khi `fetchData` thay đổi (tức là khi `url` thay đổi)

    // THAY ĐỔI 3:
    // Trả về hàm `fetchData` dưới tên `refetch`
    return { data, isLoading, error, refetch: fetchData }
}