export interface Account {
    accountId: number;
    accountName: string;
    accountEmail: string;
    accountRole: number; // 0 = Lecturer, 1 = Staff
    isActive: boolean;
    accountPassword?: string | null; // Trường này có vẻ là 'null' khi fetch về
}