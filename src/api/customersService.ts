/**
 * Banas App - Customers API Service
 * Layer 2 of the 3-layer API architecture.
 * Ref: RULES.md §4 — "API Services"
 */

import { apiClient } from '@/src/api/axiosClient';
import { ENDPOINTS } from '@/src/utils/constants';

export interface Route {
    id: string;
    route_name: string;
    date_added?: string;
    date_updated?: string;
    addedby?: string;
    updatedby?: string | null;
}

export interface Customer {
    id: string;
    name: string;
    initials: string;
    avatarUrl?: string;
    route: string;
    milkType: string;
    isActive: boolean;
}

export interface CreateCustomerPayload {
    first_name: string;
    last_name: string;
    route: string;       // route UUID
    rate: number;
    phone_no: number;
    email?: string;
    sequence_no?: number | null | string;
}

export interface UpdateCustomerPayload {
    route: string;
    first_name: string;
    last_name: string;
    phone_no: string;
    email?: string;
    rate: number;
    sequence_no?: number | null | string;
    active?: boolean;
}

export interface CustomerAccount {
    total_paid: number;
    due: number;
}

export interface DailyEntry {
    cooler: number;
    date_added: string;
    addedby: string;
}

export interface Bill {
    id?: string;
    from_date: string;
    to_date: string;
    coolers: number;
    Total: number;
    paid: boolean;
    bill_number: string;
}

export interface Payment {
    id?: string;
    amount?: number;
    paid_amount?: number;
    rounf_off_amount?: number;
    date: string;
    method: string;
}

export interface CustomerDetails {
    id: string;
    first_name: string;
    last_name: string;
    sequence_no: number;
    phone_no: string;
    route: string;
    rate: number;
    date_added: string;
    active: boolean;
    customer_account: CustomerAccount;
    bills: Bill[];
    daily_entries: DailyEntry[];
    daily_entry_monthly: number;
    payments: Payment[];
    qr_code: {
        qrcode_url: string;
    };
}
export async function fetchCustomers(): Promise<Customer[]> {
    const { data } = await apiClient.get(ENDPOINTS.CUSTOMERS.LIST);

    // Map backend snake_case to frontend camelCase
    return data.map((item: any) => ({
        id: item.id,
        name: `${item.first_name} ${item.last_name}`,
        initials: `${item.first_name?.[0] || ''}${item.last_name?.[0] || ''}`.toUpperCase(),
        route: item.route,
        milkType: '', // We don't get milkType in the listing right now
        isActive: item.active,
    }));
}

export async function fetchCustomersByRoute(routeId: string): Promise<Customer[]> {
    const { data } = await apiClient.get(ENDPOINTS.CUSTOMERS.BY_ROUTE(routeId));

    return data.map((item: any) => ({
        id: item.id,
        name: `${item.first_name} ${item.last_name}`,
        initials: `${item.first_name?.[0] || ''}${item.last_name?.[0] || ''}`.toUpperCase(),
        route: item.route,
        milkType: '',
        isActive: item.active,
    }));
}

export async function fetchRoutes(): Promise<Route[]> {
    const { data } = await apiClient.get(ENDPOINTS.ROUTES.LIST);
    return data;
}

// ─── Create Customer ─────────────────────────────────────────────────────────
export async function createCustomer(payload: CreateCustomerPayload): Promise<void> {
    await apiClient.post(ENDPOINTS.CUSTOMERS.CREATE, payload);
}

export async function updateCustomer(id: string, payload: UpdateCustomerPayload): Promise<void> {
    await apiClient.put(`/customer/${id}/`, payload);
}

// ─── Customer Details (with ledger/bills/entries) ──────────────────────────
export async function fetchCustomerDetails(id: string): Promise<CustomerDetails> {
    const { data } = await apiClient.get(ENDPOINTS.CUSTOMERS.DETAIL(id));
    return data;
}

export interface CustomerAccountDue {
    id: string;
    date: string;
    due: number;
    total_paid: number;
    addedby: string;
    updatedby: string | null;
    customer_name: string;
}

export async function fetchCustomerAccountDue(id: string): Promise<CustomerAccountDue> {
    const { data } = await apiClient.get(ENDPOINTS.CUSTOMERS.ACCOUNT(id));
    return data;
}
