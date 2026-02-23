/**
 * Banas App - Edit Customer Data Store
 * Ref: RULES.md - Zustand + TS
 */
import { create } from 'zustand';
import { CustomerDetails, updateCustomer } from '../../api/customersService';

interface EditCustomerState {
    // Form fields
    customerId: string | null;
    firstName: string;
    lastName: string;
    routeId: string;
    rate: string;
    phone: string;
    email: string;
    sequenceNo: string;
    isActive: boolean;

    // UI state
    errors: Record<string, string>;
    loading: boolean;
    submitError: string | null;

    // Actions
    initForm: (customer: CustomerDetails, matchedRouteId?: string) => void;
    setField: (field: string, value: any) => void;
    submit: () => Promise<boolean>;
    reset: () => void;
}

export const useEditCustomerStore = create<EditCustomerState>((set, get) => ({
    customerId: null,
    firstName: '',
    lastName: '',
    routeId: '',
    rate: '',
    phone: '',
    email: '',
    sequenceNo: '',
    isActive: true,

    errors: {},
    loading: false,
    submitError: null,

    initForm: (customer, matchedRouteId) => {
        set({
            customerId: customer.id,
            firstName: customer.first_name || '',
            lastName: customer.last_name || '',
            routeId: matchedRouteId || '',
            rate: customer.rate ? String(customer.rate) : '',
            phone: customer.phone_no || '',
            email: /* backend doesn't seem to return email in detail, but we can clear it */ '',
            sequenceNo: customer.sequence_no ? String(customer.sequence_no) : '',
            isActive: customer.active !== undefined ? customer.active : true,
            errors: {},
            submitError: null,
            loading: false,
        });
    },

    setField: (field, value) => {
        set((state) => ({
            ...state,
            [field]: value,
            errors: { ...state.errors, [field]: '' },
            submitError: null,
        }));
    },

    submit: async () => {
        const state = get();
        const newErrors: Record<string, string> = {};

        if (!state.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!state.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!state.routeId) newErrors.routeId = 'Route is required';
        if (!state.rate || isNaN(Number(state.rate))) newErrors.rate = 'Valid rate is required';
        if (!state.phone || state.phone.length !== 10) newErrors.phone = 'Valid 10-digit phone number is required';

        if (state.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
            newErrors.email = 'Invalid email address';
        }

        if (Object.keys(newErrors).length > 0) {
            set({ errors: newErrors });
            return false;
        }

        set({ loading: true, submitError: null });

        try {
            if (!state.customerId) throw new Error("Missing customer ID");
            await updateCustomer(state.customerId, {
                first_name: state.firstName.trim(),
                last_name: state.lastName.trim(),
                route: state.routeId,
                rate: Number(state.rate),
                phone_no: state.phone.trim(),
                email: state.email.trim() || undefined,
                sequence_no: state.sequenceNo ? Number(state.sequenceNo) : null,
                active: state.isActive,
            });

            set({ loading: false });
            return true;
        } catch (err: any) {
            set({
                loading: false,
                submitError: err?.message || 'Failed to update customer. Please try again.',
            });
            return false;
        }
    },

    reset: () => {
        set({
            customerId: null,
            firstName: '',
            lastName: '',
            routeId: '',
            rate: '',
            phone: '',
            email: '',
            sequenceNo: '',
            isActive: true,
            errors: {},
            submitError: null,
            loading: false,
        });
    },
}));
