/**
 * Banas App - Home (Dashboard) Zustand Store
 * Layer 3 of the 3-layer API architecture.
 * Ref: RULES.md §3 — "Use Zustand for all global state"
 */
import { DashboardData, fetchDashboard } from '@/src/api';
import { create } from 'zustand';

interface HomeState {
    data: DashboardData | null;
    loading: boolean;
    error: string | null;

    // Actions
    loadDashboard: () => Promise<void>;
}

export const useHomeStore = create<HomeState>((set) => ({
    data: null,
    loading: false,
    error: null,

    loadDashboard: async () => {
        set({ loading: true, error: null });
        try {
            const data = await fetchDashboard();
            set({ data, loading: false });
        } catch (err: any) {
            set({
                error: err?.message ?? 'Failed to load dashboard data.',
                loading: false,
            });
        }
    },
}));
