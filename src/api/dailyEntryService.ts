/**
 * Banas App - Daily Entry API Service
 * Layer 2 of the 3-layer API architecture.
 * Ref: RULES.md §4 — "API Services"
 */

import { apiClient } from '@/src/api/axiosClient';
import { ENDPOINTS } from '@/src/utils/constants';

export interface DailyEntry {
    id: string;
    customerId: string;
    customerName: string;
    cooler: number | string;
    addedBy: string;
    date: string;
    status: 'verified' | 'pending';
}

export interface CreateEntryPayload {
    customerId: string;
    cooler: number | string;
    date: string;
}

export interface VerifyEntryPayload {
    id: string;
    customer: string;
    coolers: number | string;
    date_added: string;
}

export interface MissingEntryCustomer {
    id: string;
    first_name: string;
    last_name: string;
}

export interface MissingEntriesResponse {
    date: string;
    route: string | null;
    missing_count: number;
    customers: MissingEntryCustomer[];
}

export interface BulkImportPayloadItem {
    customer: string;
    cooler: number;
}

export async function fetchEntries(): Promise<DailyEntry[]> {
    const [dailyRes, pendingRes] = await Promise.all([
        apiClient.get(ENDPOINTS.ENTRIES.DAILY),
        apiClient.get(ENDPOINTS.ENTRIES.PENDING)
    ]);

    const verifiedEntries: DailyEntry[] = dailyRes.data.map((item: any) => ({
        id: item.id,
        customerId: item.customer,
        customerName: item.customer_name,
        cooler: item.cooler ?? item.coolers ?? 0,
        addedBy: item.addedby || 'Admin',
        date: item.date_added,
        status: 'verified',
    }));

    const pendingEntries: DailyEntry[] = pendingRes.data.map((item: any) => ({
        id: item.id,
        customerId: item.customer,
        customerName: item.customer_name,
        cooler: item.coolers ?? item.cooler ?? 0,
        addedBy: item.addedby || 'Admin',
        date: item.date_added,
        status: 'pending',
    }));

    return [...verifiedEntries, ...pendingEntries];
}

export async function createEntry(payload: CreateEntryPayload): Promise<void> {
    await apiClient.post(ENDPOINTS.ENTRIES.DAILY, {
        customer: payload.customerId,
        cooler: Number(payload.cooler),
        date_added: payload.date,
    });
}

export async function verifyEntries(payload: VerifyEntryPayload[]): Promise<void> {
    await apiClient.post(ENDPOINTS.ENTRIES.VERIFY, payload);
}

export async function fetchMissingDailyEntries(routeId?: string): Promise<MissingEntriesResponse> {
    const url = routeId
        ? `/dailyentry/today/missing/?route=${routeId}`
        : `/dailyentry/today/missing/`;
    const { data } = await apiClient.get(url);
    return data;
}

export async function bulkImportDailyEntries(payload: BulkImportPayloadItem[]): Promise<void> {
    await apiClient.post(`/dailyentry/bulk/import/`, payload);
}
