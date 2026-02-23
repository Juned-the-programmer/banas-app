/**
 * Banas App - Auth API Service (Layer 2)
 * Real API integration for login.
 * Ref: RULES.md §4 — "API Services"
 *
 * Endpoint: POST https://banas-api.onrender.com/api/login
 */
import { ENDPOINTS } from '@/src/utils/constants';
import * as SecureStore from 'expo-secure-store';
import { ACCESS_TOKEN_KEY, apiClient, REFRESH_TOKEN_KEY } from './axiosClient';

export const USER_KEY = 'banas_auth_user';

export interface LoginPayload {
    username: string;
    password: string;
}

export interface AuthUser {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    isSuperuser: boolean;
}

export interface LoginResponse {
    access: string;
    refresh: string;
    user: AuthUser;
}

/**
 * POST /api/login
 * On success: persists access + refresh tokens to SecureStore and returns the user.
 */
export async function login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await apiClient.post(ENDPOINTS.AUTH.LOGIN, payload);

    // Map snake_case → camelCase
    const user: AuthUser = {
        id: data.id,
        username: data.user,
        firstName: data.first_name,
        lastName: data.last_name,
        fullName: data.full_name,
        email: data.email ?? '',
        isSuperuser: data.is_superuser,
    };

    // Persist tokens and user securely
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, data.access);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refresh);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

    return { access: data.access, refresh: data.refresh, user };
}

/**
 * Clears tokens from SecureStore on logout.
 */
export async function logout(): Promise<void> {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
}

/**
 * Checks if a valid access token is stored (used for auto-login on app start).
 */
export async function getStoredAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

/**
 * Retrieves the stored user object (for auto-login).
 */
export async function getStoredUser(): Promise<AuthUser | null> {
    const userStr = await SecureStore.getItemAsync(USER_KEY);
    if (!userStr) return null;
    try {
        return JSON.parse(userStr) as AuthUser;
    } catch {
        return null;
    }
}
