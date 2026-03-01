/**
 * Banas App - API & App Constants
 * Layer 1 of the 3-layer API architecture.
 * Ref: RULES.md §4 — "Centralized Constants"
 */

// ─── Environment ────────────────────────────────────────────────────────────
export const BASE_URL = 'https://banas-api-edt9.onrender.com/api';

// ─── API Endpoints ───────────────────────────────────────────────────────────
export const ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: '/login/',
        REFRESH: '/token/refresh/',
    },

    // Dashboard / Home
    HOME: {
        DASHBOARD: '/dashboard/',
    },

    // Routes
    ROUTES: {
        LIST: '/route/',
        DETAIL: (id: string | number) => `/route/${id}/`,
    },

    // Customers
    CUSTOMERS: {
        LIST: '/customer/',
        CREATE: '/customer/',
        DETAIL: (id: string | number) => `/customer/detail/${id}/`,
        ACCOUNT: (id: string | number) => `/customer/account/${id}/`,
        BY_ROUTE: (routeId: string | number) => `/customer/route/${routeId}/`,
    },

    // Daily Entries
    ENTRIES: {
        DAILY: '/dailyentry/',
        PENDING: '/dailyentry/list/pending/dailyentry/',
        VERIFY: '/dailyentry/verify/dailyentry/',
        DETAIL: (id: string | number) => `/dailyentry/${id}/`,
    },

    // Billing
    BILLING: {
        GENERATE: '/billing/generate/',
        LIST: '/bill/bills/',
        DETAIL: (id: string | number) => `/bill/${id}/`,
    },

    // Payments
    PAYMENTS: {
        LIST: '/payment/',
        COLLECT: '/payment/',
        DUE: '/payment/due/',
        DUE_BY_ROUTE: (routeId: string) => `/payment/due/route/${routeId}/`,
    },
};
