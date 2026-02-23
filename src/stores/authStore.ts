/**
 * Banas App - Auth Zustand Store (Layer 3)
 * Manages authentication state: user, tokens, login/logout.
 * Ref: RULES.md §3 — "Use Zustand for all global state"
 */
import {
    login as apiLogin,
    logout as apiLogout,
    AuthUser,
    getStoredAccessToken,
    getStoredUser,
    LoginPayload,
} from '@/src/api/authService';
import { create } from 'zustand';

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isInitialising: boolean;   // true while checking SecureStore on app start
    loading: boolean;
    error: string | null;

    // Actions
    initialise: () => Promise<void>;
    login: (payload: LoginPayload) => Promise<boolean>;
    logout: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isInitialising: true,
    loading: false,
    error: null,

    /** Called once on app mount — restores session from SecureStore. */
    initialise: async () => {
        try {
            const token = await getStoredAccessToken();
            const user = await getStoredUser();
            set({ isAuthenticated: !!token, user: user, isInitialising: false });
        } catch {
            set({ isAuthenticated: false, user: null, isInitialising: false });
        }
    },

    login: async (payload) => {
        set({ loading: true, error: null });
        try {
            const { user } = await apiLogin(payload);
            set({ user, isAuthenticated: true, loading: false });
            return true;
        } catch (err: any) {
            const msg =
                err?.response?.data?.detail ??
                err?.response?.data?.non_field_errors?.[0] ??
                'Invalid username or password.';
            set({ loading: false, error: msg });
            return false;
        }
    },

    logout: async () => {
        set({ loading: true });
        await apiLogout();
        set({ user: null, isAuthenticated: false, loading: false, error: null });
    },

    clearError: () => set({ error: null }),
}));
