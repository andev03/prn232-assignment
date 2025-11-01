export interface AuthData {
    token: string
    email: string
    accountName: string
    role: number // (API của bạn trả về role là number)
}