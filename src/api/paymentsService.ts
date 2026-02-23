/**
 * Banas App - Payments API Service
 * Layer 2 of the 3-layer API architecture.
 * Ref: RULES.md §4 — "API Services"
 */

import { apiClient } from '@/src/api/axiosClient';
import { ENDPOINTS } from '@/src/utils/constants';

export interface Payment {
    id: string;
    customer_name: string;
    pending_amount: number;
    paid_amount: number;
    payment_method: string;
    date: string;
    addedby: string;
    round_off_amount?: number;
}

export interface PaymentsResponse {
    payments: Payment[];
    total_paid_amount: number;
}

export async function fetchPayments(): Promise<PaymentsResponse> {
    const { data } = await apiClient.get(ENDPOINTS.PAYMENTS.LIST);
    // Handle both wrapped { payments: [...], total_paid_amount: 0 }
    // and direct array responses gracefully
    if (Array.isArray(data)) {
        return { payments: data, total_paid_amount: 0 };
    }
    return {
        payments: data.payments ?? [],
        total_paid_amount: data['total paid amount'] ?? data.total_paid_amount ?? 0,
    };
}

export interface CreatePaymentPayload {
    customer_name: string;
    paid_amount: number;
    rounf_off_amount?: number;
    payment_method: 'cash' | 'UPI' | 'cheque';
    notes?: string;
}

export async function createPayment(payload: CreatePaymentPayload): Promise<void> {
    await apiClient.post(ENDPOINTS.PAYMENTS.COLLECT, payload);
}
