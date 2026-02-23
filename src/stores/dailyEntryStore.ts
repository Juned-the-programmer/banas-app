/**
 * Banas App - Daily Entry Zustand Store
 * Ref: RULES.md §3
 */
import { bulkImportDailyEntries, BulkImportPayloadItem, DailyEntry, fetchEntries, fetchMissingDailyEntries, MissingEntryCustomer, verifyEntries } from '@/src/api/dailyEntryService';
import { create } from 'zustand';

interface DailyEntryState {
    entries: DailyEntry[];
    missingCustomers: MissingEntryCustomer[];
    loading: boolean;
    loadingMissing: boolean;
    verifying: boolean;
    error: string | null;
    selectedIds: Set<string>;   // for bulk verification

    // Computed
    verified: () => DailyEntry[];
    pending: () => DailyEntry[];

    // Actions
    loadEntries: () => Promise<void>;
    toggleSelect: (id: string) => void;
    selectAll: () => void;
    clearSelection: () => void;
    verifySelected: () => Promise<void>;
    verifySingle: (id: string) => Promise<void>;

    // Bulk Entry Actions
    loadMissingEntries: (routeId?: string) => Promise<void>;
    submitBulkEntries: (payload: BulkImportPayloadItem[]) => Promise<void>;
}

export const useDailyEntryStore = create<DailyEntryState>((set, get) => ({
    entries: [],
    missingCustomers: [],
    loading: false,
    loadingMissing: false,
    verifying: false,
    error: null,
    selectedIds: new Set(),

    verified: () => get().entries.filter((e) => e.status === 'verified'),
    pending: () => get().entries.filter((e) => e.status === 'pending'),

    loadEntries: async () => {
        set({ loading: true, error: null });
        try {
            const entries = await fetchEntries();
            set({ entries, loading: false, selectedIds: new Set() });
        } catch (err: any) {
            set({ error: err?.message ?? 'Failed to load entries.', loading: false });
        }
    },

    toggleSelect: (id) => {
        set((state) => {
            const next = new Set(state.selectedIds);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return { selectedIds: next };
        });
    },

    selectAll: () => {
        const pendingIds = get().pending().map((e) => e.id);
        set({ selectedIds: new Set(pendingIds) });
    },

    clearSelection: () => set({ selectedIds: new Set() }),

    verifySelected: async () => {
        const ids = Array.from(get().selectedIds);
        if (ids.length === 0) return;

        const payload = get().pending()
            .filter(e => ids.includes(e.id))
            .map(e => ({
                id: e.id,
                customer: e.customerId,
                coolers: e.cooler,
                date_added: e.date
            }));

        set({ verifying: true });
        try {
            await verifyEntries(payload);
            set((state) => ({
                entries: state.entries.map((e) =>
                    ids.includes(e.id) ? { ...e, status: 'verified' } : e
                ),
                selectedIds: new Set(),
                verifying: false,
            }));
        } catch (err: any) {
            set({ verifying: false, error: err?.message ?? 'Verification failed.' });
        }
    },

    verifySingle: async (id) => {
        const entry = get().entries.find(e => e.id === id);
        if (!entry) return;

        const payload = [{
            id: entry.id,
            customer: entry.customerId,
            coolers: entry.cooler,
            date_added: entry.date
        }];

        set({ verifying: true });
        try {
            await verifyEntries(payload);
            set((state) => ({
                entries: state.entries.map((e) =>
                    e.id === id ? { ...e, status: 'verified' } : e
                ),
                verifying: false,
            }));
        } catch (err: any) {
            set({ verifying: false, error: err?.message ?? 'Verification failed.' });
        }
    },

    loadMissingEntries: async (routeId?: string) => {
        set({ loadingMissing: true, error: null });
        try {
            const response = await fetchMissingDailyEntries(routeId);
            set({ missingCustomers: response.customers, loadingMissing: false });
        } catch (err: any) {
            set({ error: err?.message ?? 'Failed to load missing customers.', loadingMissing: false });
        }
    },

    submitBulkEntries: async (payload: BulkImportPayloadItem[]) => {
        set({ loading: true, error: null });
        try {
            await bulkImportDailyEntries(payload);
            set({ loading: false });
            // Refresh entries after bulk import
            await get().loadEntries();
        } catch (err: any) {
            set({ error: err?.message ?? 'Failed to submit bulk entries.', loading: false });
            throw err; // Re-throw to handle it in the UI (e.g. keep UI open, show alert)
        }
    },
}));
