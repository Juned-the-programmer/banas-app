/**
 * Banas App - Axios HTTP Client
 * Centralised axios instance with base URL + auth token interceptor.
 * Ref: RULES.md §4 — "API Services"
 */
import { BASE_URL, ENDPOINTS } from '@/src/utils/constants';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const ACCESS_TOKEN_KEY = 'banas_access_token';
export const REFRESH_TOKEN_KEY = 'banas_refresh_token';

/**
 * Hook mechanism for the Auth store to listen for 401s / missing tokens.
 * This avoids circular dependencies between axiosClient and useAuthStore.
 */
let onAuthFailure: (() => void) | null = null;
export const setOnAuthFailure = (callback: () => void) => {
    onAuthFailure = callback;
};

export const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor ───────────────────────────────────────────────────
// Inject access token OR redirect if missing for protected routes.
apiClient.interceptors.request.use(async (config) => {
    // Skip auth check for public endpoints (Login, Refresh)
    const isPublic =
        config.url?.includes(ENDPOINTS.AUTH.LOGIN) ||
        config.url?.includes(ENDPOINTS.AUTH.REFRESH);

    if (isPublic) return config;

    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);

    if (!token) {
        // Token missing - Trigger auth failure to redirect to login
        onAuthFailure?.();
        return Promise.reject(new Error('No authentication token found.'));
    }

    config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ─── Response Interceptor ──────────────────────────────────────────────────
// Handle 401 Unauthorized / 403 Forbidden - Redirect to login
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
            // Token invalid or user deleted
            onAuthFailure?.();
        }

        return Promise.reject(error);
    }
);
