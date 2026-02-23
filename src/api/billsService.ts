/**
 * Banas App - Bills API Service
 * Layer 2 of the 3-layer API architecture.
 * Ref: RULES.md §4 — "API Services"
 */

import { apiClient } from '@/src/api/axiosClient';
import { ENDPOINTS } from '@/src/utils/constants';

export interface Bill {
    id: string;
    customer_name: string;
    bill_number: string | null;
    from_date: string;
    to_date: string;
    coolers: number;
    Rate: number;
    Amount: number;
    Pending_amount: number;
    Advanced_amount: number;
    Total: number;
    date: string;
    paid: boolean;
    addedby: string | null;
    updatedby: string | null;
}

export async function fetchBills(): Promise<Bill[]> {
    const { data } = await apiClient.get(ENDPOINTS.BILLING.LIST);
    return Array.isArray(data) ? data : (data.bills ?? data.results ?? []);
}

export interface BillDailyEntry {
    cooler: number;
    date_added: string;
    addedby: string;
}

export interface BillDetailResponse {
    bill: Bill;
    daily_entry: BillDailyEntry[];
}

export async function fetchBillDetails(id: string): Promise<BillDetailResponse> {
    const { data } = await apiClient.get(ENDPOINTS.BILLING.DETAIL(id));
    return data;
}
