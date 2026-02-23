/**
 * Banas App - Customer Profile Store
 * Manages the state for the detailed Customer Profile/Ledger screen.
 */
import { create } from 'zustand';
import { CustomerDetails, fetchCustomerDetails } from '../../api/customersService';

interface CustomerProfileState {
    data: CustomerDetails | null;
    loading: boolean;
    error: string | null;

    loadProfile: (id: string) => Promise<void>;
    clearProfile: () => void;
}

export const useCustomerProfileStore = create<CustomerProfileState>((set) => ({
    data: null,
    loading: false,
    error: null,

    loadProfile: async (id: string) => {
        set({ loading: true, error: null });
        try {
            const data = await fetchCustomerDetails(id);
            set({ data, loading: false });
        } catch (err: any) {
            set({
                error: err.message || 'Failed to load customer profile. Please try again.',
                loading: false,
            });
        }
    },

    clearProfile: () => {
        set({ data: null, error: null, loading: false });
    }
}));
