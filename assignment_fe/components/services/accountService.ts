import { Account } from "@/components/types/Account";
import { ApiResponse } from "../types/ApiResponse";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const BASE_URL = `${apiUrl}/SystemAccounts`;

const getToken = (): string | null => {
    if (typeof window === "undefined") {
        return null;
    }
    return localStorage.getItem("authToken");
};

export const addAccount = async (
    accountData: Omit<Account, "accountId">
): Promise<Account> => {
    const token = getToken();
    if (!token) throw new Error("User not authenticated");

    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(accountData),
    });

    const result: ApiResponse<Account> = await response.json();

    if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Failed to create account");
    }

    return result.data;
};

export const updateAccount = async (
    id: number,
    accountData: Partial<Account>
): Promise<Account> => {
    const token = getToken();
    if (!token) throw new Error("User not authenticated");

    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(accountData),
    });

    const result: ApiResponse<Account> = await response.json();

    if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Failed to update account");
    }

    return result.data;
};

export const deleteAccount = async (id: number): Promise<void> => {
    const token = getToken();
    if (!token) throw new Error("User not authenticated");

    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.status === 204) {
        return;
    }

    const result: ApiResponse<null> = await response.json();

    if (!response.ok || result.status !== "success") {

        const errorMessage = result.errors
            ? String(result.errors)
            : result.message;

        throw new Error(errorMessage || "Failed to delete account");
    }

};