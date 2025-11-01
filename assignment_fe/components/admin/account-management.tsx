"use client"

import { useEffect, useState } from "react"
import { Plus, Edit2, Trash2, Search, Shield, AlertCircle } from "lucide-react"
import Modal from "@/components/ui/modal"
import AccountForm from "@/components/admin/account-form"
import { Account } from "../types/Account"
import { useFetchData } from "../hooks/useFetchData"
import {
    addAccount,
    deleteAccount,
    updateAccount,
} from "../services/accountService"
import { toast } from "react-toastify";
// KHÔNG CẦN DÒNG NÀY NỮA
// import { ApiResponse } from "../types/ApiResponse" 

export default function AccountManagement() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    // [THAY ĐỔI] 1. Lấy `refetch` từ hook (nếu hook của bạn đã được nâng cấp)
    const {
        data: accounts,
        isLoading: isSystemAccountLoading,
        error: systemAccountError,
        refetch // <-- Thêm refetch
    } = useFetchData<Account[]>(apiUrl ? `${apiUrl}/SystemAccounts` : null)

    const [accountsState, setAccountsState] = useState<Account[]>([])

    useEffect(() => {
        if (accounts) setAccountsState(accounts)
    }, [accounts])

    const [searchTerm, setSearchTerm] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingAccount, setEditingAccount] = useState<Account | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

    // [THAY ĐỔI] 2. Thêm state cho loading và LỖI
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [actionError, setActionError] = useState("") // <-- State để giữ lỗi

    const filteredAccounts =
        accountsState &&
        accountsState.filter(
            (acc) =>
                acc.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                acc.accountEmail.toLowerCase().includes(searchTerm.toLowerCase())
        )

    // [THAY ĐỔI] 3. Cập nhật các hàm để dùng refetch, isSubmitting, và actionError

    const handleAddAccount = async (data: Partial<Account>) => {
        setIsSubmitting(true);
        setActionError(""); // Xóa lỗi cũ
        try {
            const newAccount = await addAccount(data as Account);
            await refetch(); // Tải lại data
            setIsModalOpen(false);
            toast.success("Account added successfully!");
        } catch (err: any) {
            // Hiển thị lỗi trong modal
            setActionError(err.message || "Error adding account");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateAccount = async (data: Partial<Account>) => {
        if (!editingAccount) return;

        setIsSubmitting(true);
        setActionError(""); // Xóa lỗi cũ
        const idToUpdate = editingAccount.accountId;

        try {
            const updated = await updateAccount(idToUpdate, data);
            await refetch(); // Tải lại data
            setEditingAccount(null);
            setIsModalOpen(false);
            toast.success("Account updated successfully!");
        } catch (err: any) {
            // Hiển thị lỗi trong modal
            setActionError(err.message || "Error updating account");
        } finally {
            setIsSubmitting(false);
        }
    };

    // [THAY ĐỔI] 4. Sửa hoàn toàn logic của handleDeleteAccount
    const handleDeleteAccount = async (id: number) => {
        setActionError(""); // Xóa lỗi cũ

        // 4.1. Validation phía Client (Kiểm tra Active)
        const accountToDelete = accountsState.find(acc => acc.accountId === id);

        if (accountToDelete && accountToDelete.isActive) {
            // Hiển thị lỗi trong modal, KHÔNG đóng modal
            setActionError("Không thể xóa tài khoản đang 'Active'. Vui lòng deactive trước.");
            return;
        }

        setIsSubmitting(true);
        try {
            // 4.2. Gọi API
            // Service `deleteAccount` sẽ throw lỗi (bao gồm lỗi 'errors' từ API)
            await deleteAccount(id);

            // 4.3. Chỉ chạy khi thành công
            await refetch();
            setDeleteConfirm(null); // Đóng modal KHI thành công
            toast.success("Account successfully deleted!");

        } catch (err: any) {
            // 4.4. Bắt lỗi (từ API hoặc client)
            // Lỗi "Không thể xóa... đã tạo bài viết." sẽ được set vào đây
            setActionError(err.message || "Cannot delete the account.");
            // KHÔNG đóng modal
        } finally {
            setIsSubmitting(false);
        }
    };

    // (Stats, Loading, Error... giữ nguyên)
    const stats = [
        {
            label: "Total Accounts",
            value: accountsState.length.toString(),
            color: "text-primary",
        },
        {
            label: "Active Users",
            value: accountsState.filter((a) => a.isActive).length.toString(),
            color: "text-success",
        },
        {
            label: "Staff Members",
            value: accountsState.filter((a) => a.accountRole === 1).length.toString(),
            color: "text-warning",
        },
    ]

    if (isSystemAccountLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Account Management</h1>
                <p>Loading accounts...</p>
            </div>
        )
    }

    if (systemAccountError) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Account Management</h1>
                <p className="text-error">
                    Error loading accounts: {systemAccountError.message}
                </p>
            </div>
        )
    }
    // ----------------------------------------------------

    return (
        <div className="space-y-6">
            {/* (Header, Stats, Search, Table... giữ nguyên) */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Account Management</h1>
                    <p className="text-foreground text-sm mt-1">
                        Manage user accounts and permissions
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingAccount(null)
                        setIsModalOpen(true)
                        setActionError("") // Xóa lỗi cũ khi mở
                    }}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                    <Plus size={20} />
                    Add Account
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((stat, idx) => (
                    <div
                        key={idx}
                        className="bg-card border border-border rounded-lg p-4"
                    >
                        <p className="text-muted text-sm mb-2">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-3 text-muted" size={20} />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-background border-b border-border">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredAccounts &&
                            filteredAccounts.map((account) => (
                                <tr
                                    key={account.accountId}
                                    className="hover:bg-background transition-colors"
                                >
                                    <td className="px-6 py-4 font-medium">
                                        {account.accountName}
                                    </td>
                                    <td className="px-6 py-4 text-muted text-sm">
                                        {account.accountEmail}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                                                {account.accountRole == 1 ? "Staff" : "Lecturer"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${account.isActive
                                                ? "bg-success/20 text-success"
                                                : "bg-error/20 text-error"
                                                }`}
                                        >
                                            {account.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingAccount(account)
                                                    setIsModalOpen(true)
                                                    setActionError("") // Xóa lỗi cũ
                                                }}
                                                className="p-2 hover:bg-background rounded-lg transition-colors text-accent hover:text-accent"
                                                title="Edit account"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setDeleteConfirm(account.accountId)
                                                    setActionError("") // Xóa lỗi cũ
                                                }}
                                                className="p-2 hover:bg-background rounded-lg transition-colors text-error hover:text-error"
                                                title="Delete account"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>

                {filteredAccounts && filteredAccounts.length === 0 && (
                    <div className="px-6 py-12 text-center">
                        <AlertCircle className="mx-auto mb-3 text-muted" size={32} />
                        <p className="text-muted">No accounts found</p>
                    </div>
                )}
            </div>

            {/* [THAY ĐỔI] 5. Cập nhật Modal (Form) */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    if (isSubmitting) return; // Chặn đóng
                    setIsModalOpen(false)
                    setEditingAccount(null)
                }}
                title={editingAccount ? "Edit Account" : "Add New Account"}
            >
                {/* Thêm khối hiển thị lỗi */}
                {actionError && (
                    <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg flex items-center gap-2 text-error text-sm">
                        <AlertCircle size={16} />
                        {actionError}
                    </div>
                )}
                <fieldset disabled={isSubmitting}>
                    <AccountForm
                        account={editingAccount}
                        onSubmit={editingAccount ? handleUpdateAccount : handleAddAccount}
                        onCancel={() => {
                            setIsModalOpen(false)
                            setEditingAccount(null)
                        }}
                    />
                </fieldset>
            </Modal>

            {/* [THAY ĐỔI] 6. Cập nhật Modal (Xóa) */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-lg max-w-sm w-full">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertCircle className="text-error" size={24} />
                                <h3 className="text-lg font-bold">Delete Account</h3>
                            </div>

                            {/* Thêm khối hiển thị lỗi */}
                            {actionError && (
                                <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg flex items-center gap-2 text-error text-sm">
                                    <AlertCircle size={16} />
                                    {actionError}
                                </div>
                            )}

                            <p className="text-muted mb-6">
                                Are you sure you want to delete this account? This action cannot
                                be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleDeleteAccount(deleteConfirm)}
                                    disabled={isSubmitting}
                                    className="flex-1 bg-error hover:bg-error/90 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? "Deleting..." : "Delete"}
                                </button>
                                <button
                                    onClick={() => {
                                        setDeleteConfirm(null)
                                        setActionError("") // Xóa lỗi khi cancel
                                    }}
                                    disabled={isSubmitting}
                                    className="flex-1 bg-background border border-border hover:bg-card text-foreground font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}