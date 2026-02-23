/**
 * Banas App - Payments & Bills Zustand Store
 * Layer 3 of the 3-layer API architecture.
 * Ref: RULES.md §3 — Zustand for state management
 */
import { Bill, fetchBills } from '@/src/api/billsService';
import { fetchPayments, Payment, PaymentsResponse } from '@/src/api/paymentsService';
import { create } from 'zustand';

interface PaymentsState {
    // Payments
    payments: Payment[];
    totalPaidAmount: number;
    paymentsLoading: boolean;
    paymentsError: string | null;

    // Bills
    bills: Bill[];
    billsLoading: boolean;
    billsError: string | null;

    // Actions
    loadPayments: () => Promise<void>;
    loadBills: () => Promise<void>;
    refreshAll: () => Promise<void>;
}

export const usePaymentsStore = create<PaymentsState>((set) => ({
    payments: [],
    totalPaidAmount: 0,
    paymentsLoading: false,
    paymentsError: null,

    bills: [],
    billsLoading: false,
    billsError: null,

    loadPayments: async () => {
        set({ paymentsLoading: true, paymentsError: null });
        try {
            const res: PaymentsResponse = await fetchPayments();
            set({
                payments: res.payments,
                totalPaidAmount: res.total_paid_amount,
                paymentsLoading: false,
            });
        } catch (err: any) {
            set({ paymentsLoading: false, paymentsError: err?.message ?? 'Failed to load payments.' });
        }
    },

    loadBills: async () => {
        set({ billsLoading: true, billsError: null });
        try {
            const bills = await fetchBills();
            set({ bills, billsLoading: false });
        } catch (err: any) {
            set({ billsLoading: false, billsError: err?.message ?? 'Failed to load bills.' });
        }
    },

    refreshAll: async () => {
        set({
            paymentsLoading: true, paymentsError: null,
            billsLoading: true, billsError: null,
        });
        const [paymentsRes, billsRes] = await Promise.allSettled([
            fetchPayments(),
            fetchBills(),
        ]);

        if (paymentsRes.status === 'fulfilled') {
            set({
                payments: paymentsRes.value.payments,
                totalPaidAmount: paymentsRes.value.total_paid_amount,
                paymentsLoading: false,
            });
        } else {
            set({ paymentsLoading: false, paymentsError: paymentsRes.reason?.message ?? 'Failed to load payments.' });
        }

        if (billsRes.status === 'fulfilled') {
            set({ bills: billsRes.value, billsLoading: false });
        } else {
            set({ billsLoading: false, billsError: billsRes.reason?.message ?? 'Failed to load bills.' });
        }
    },
}));
