/**
 * Banas App - Customers Zustand Store
 * Layer 3 of the 3-layer API architecture.
 * Ref: RULES.md §3
 */
import { Customer, fetchCustomers, fetchCustomersByRoute, fetchRoutes, Route } from '@/src/api/customersService';
import { create } from 'zustand';

type FilterTab = 'all' | 'active' | 'inactive';

interface CustomersState {
    customers: Customer[];
    loading: boolean;
    error: string | null;
    searchQuery: string;
    activeFilter: FilterTab;

    routes: Route[];
    routesLoading: boolean;
    selectedRouteId: string | null;

    // Computed
    filteredCustomers: () => Customer[];

    // Actions
    loadCustomers: () => Promise<void>;
    loadRoutes: () => Promise<void>;
    setSearchQuery: (q: string) => void;
    setFilter: (filter: FilterTab) => void;
    setSelectedRoute: (routeId: string | null) => void;
}

export const useCustomersStore = create<CustomersState>((set, get) => ({
    customers: [],
    loading: false,
    error: null,
    searchQuery: '',
    activeFilter: 'all',

    routes: [],
    routesLoading: false,
    selectedRouteId: null,

    filteredCustomers: () => {
        const { customers, searchQuery, activeFilter } = get();

        return customers.filter((c) => {
            const matchesSearch =
                searchQuery.trim() === '' ||
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.route.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesFilter =
                activeFilter === 'all' ||
                (activeFilter === 'active' && c.isActive) ||
                (activeFilter === 'inactive' && !c.isActive);

            return matchesSearch && matchesFilter;
        });
    },

    loadCustomers: async () => {
        set({ loading: true, error: null });
        try {
            const { selectedRouteId } = get();
            let customers;
            if (selectedRouteId) {
                customers = await fetchCustomersByRoute(selectedRouteId);
            } else {
                customers = await fetchCustomers();
            }
            set({ customers, loading: false });
        } catch (err: any) {
            set({ error: err?.message ?? 'Failed to load customers.', loading: false });
        }
    },

    loadRoutes: async () => {
        set({ routesLoading: true });
        try {
            const routes = await fetchRoutes();
            set({ routes, routesLoading: false });
        } catch (err: any) {
            console.error('Failed to load routes', err);
            set({ routesLoading: false });
            // Not setting full error state as this shouldn't block customer list rendering
        }
    },

    setSearchQuery: (q) => set({ searchQuery: q }),
    setFilter: (filter) => set({ activeFilter: filter }),
    setSelectedRoute: (routeId) => {
        set({ selectedRouteId: routeId });
        get().loadCustomers();
    },
}));
