/**
 * Banas App - Home API Service
 * Layer 2 of the 3-layer API architecture.
 * Ref: RULES.md §4 — "API Services"
 *
 * NOTE: Currently returns MOCK data only. The actual axios calls
 * are stubbed with a TODO comment for when the backend is connected.
 */

import { apiClient } from '@/src/api/axiosClient';
import { ENDPOINTS } from '@/src/utils/constants';

export interface DashboardMetrics {
    totalActiveCustomers: number;
    todayCustomerCount: number;
    todayCoolersCount: number;
    totalPendingDue: number;
}

export interface DashboardData {
    // Admin name is removed from the payload, so we pull it from authStore
    metrics: DashboardMetrics;
}

export async function fetchDashboard(): Promise<DashboardData> {
    const { data } = await apiClient.get(ENDPOINTS.HOME.DASHBOARD);
    return {
        metrics: {
            totalActiveCustomers: data.total_active_customers,
            todayCustomerCount: data.today_customer_count,
            todayCoolersCount: data.today_coolers_count,
            totalPendingDue: data.total_pending_due,
        }
    };
}
