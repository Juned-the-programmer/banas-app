/**
 * Banas App - Due List Zustand Store
 */
import { fetchRoutes, Route } from '@/src/api/customersService';
import { CustomerDue, DueListResponse, fetchDueList, fetchDueListByRoute } from '@/src/api/dueListService';
import { create } from 'zustand';

interface DueListState {
    items: CustomerDue[];
    dueTotal: number;
    loading: boolean;
    error: string | null;
    routes: Route[];
    selectedRouteId: string | null;

    loadDues: () => Promise<void>;
    loadRoutes: () => Promise<void>;
    setSelectedRoute: (routeId: string | null) => Promise<void>;
}

export const useDueListStore = create<DueListState>((set, get) => ({
    items: [],
    dueTotal: 0,
    loading: false,
    error: null,
    routes: [],
    selectedRouteId: null,

    loadDues: async () => {
        set({ loading: true, error: null });
        try {
            const res: DueListResponse = await fetchDueList();
            set({ items: res.customer_due_list ?? [], dueTotal: res.due_total ?? 0, loading: false });
        } catch (err: any) {
            set({ loading: false, error: err?.message ?? 'Failed to load due list.' });
        }
    },

    loadRoutes: async () => {
        try {
            const routes = await fetchRoutes();
            set({ routes });
        } catch {
            // silently fail – routes are supplementary
        }
    },

    setSelectedRoute: async (routeId) => {
        set({ selectedRouteId: routeId, loading: true, error: null });
        try {
            const res: DueListResponse = routeId
                ? await fetchDueListByRoute(routeId)
                : await fetchDueList();
            set({ items: res.customer_due_list ?? [], dueTotal: res.due_total ?? 0, loading: false });
        } catch (err: any) {
            set({ loading: false, items: [], error: err?.message ?? 'Failed to fetch due list.' });
        }
    },
}));
