/**
 * Banas App - Due List API Service
 * Layer 2 of the 3-layer API architecture.
 */

import { apiClient } from '@/src/api/axiosClient';
import { ENDPOINTS } from '@/src/utils/constants';

export interface CustomerDue {
    customer_id: string;
    customer_name: string;
    due: number;
}

export interface DueListResponse {
    customer_due_list: CustomerDue[];
    due_total: number;
}

export async function fetchDueList(): Promise<DueListResponse> {
    const { data } = await apiClient.get(ENDPOINTS.PAYMENTS.DUE);
    return data;
}

export async function fetchDueListByRoute(routeId: string): Promise<DueListResponse> {
    const { data } = await apiClient.get(ENDPOINTS.PAYMENTS.DUE_BY_ROUTE(routeId));
    return data;
}
