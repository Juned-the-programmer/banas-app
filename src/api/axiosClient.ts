/**
 * Banas App - Axios HTTP Client
 * Centralised axios instance with base URL + auth token interceptor.
 * Ref: RULES.md §4 — "API Services"
 */
import { BASE_URL } from '@/src/utils/constants';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const ACCESS_TOKEN_KEY = 'banas_access_token';
export const REFRESH_TOKEN_KEY = 'banas_refresh_token';

export const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

// Inject access token on every request
apiClient.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
