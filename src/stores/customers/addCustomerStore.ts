/**
 * Banas App - Add Customer Zustand Store
 * Manages form state, validation, and submission for the Add Customer screen.
 * Ref: RULES.md §3 — "Use Zustand for all global state"
 */
import { createCustomer, CreateCustomerPayload } from '@/src/api/customersService';
import { create } from 'zustand';



export interface AddCustomerFormErrors {
    firstName?: string;
    lastName?: string;
    routeId?: string;
    rate?: string;
    phone?: string;
    email?: string;
}

interface AddCustomerState {
    // Form fields
    firstName: string;
    lastName: string;
    routeId: string;
    rate: string;
    phone: string;
    email: string;
    sequenceNo: string;

    // UI state
    loading: boolean;
    errors: AddCustomerFormErrors;
    submitError: string | null;

    // Actions
    setField: (field: keyof Omit<AddCustomerState, 'loading' | 'errors' | 'submitError' | 'setField' | 'validate' | 'submit' | 'reset'>, value: string) => void;
    validate: () => boolean;
    submit: () => Promise<boolean>;
    reset: () => void;
}

const INITIAL_STATE = {
    firstName: '',
    lastName: '',
    routeId: '',
    rate: '',
    phone: '',
    email: '',
    sequenceNo: '',
    loading: false,
    errors: {},
    submitError: null,
};

export const useAddCustomerStore = create<AddCustomerState>((set, get) => ({
    ...INITIAL_STATE,

    setField: (field, value) => {
        set((state) => ({
            [field]: value,
            // Clear the error for that field when user types
            errors: { ...state.errors, [field]: undefined },
        }));
    },

    validate: () => {
        const { firstName, lastName, routeId, rate, phone, email } = get();
        const errors: AddCustomerFormErrors = {};

        if (!firstName.trim()) errors.firstName = 'First name is required';
        if (!lastName.trim()) errors.lastName = 'Last name is required';
        if (!routeId) errors.routeId = 'Please select a route';
        if (!rate.trim()) {
            errors.rate = 'Rate is required';
        } else if (isNaN(Number(rate)) || Number(rate) <= 0) {
            errors.rate = 'Enter a valid rate';
        }
        if (!phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(phone.trim())) {
            errors.phone = 'Enter a valid 10-digit phone number';
        }
        if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            errors.email = 'Enter a valid email address';
        }

        set({ errors });
        return Object.keys(errors).length === 0;
    },

    submit: async () => {
        const { validate, firstName, lastName, routeId, rate, phone, email, sequenceNo } = get();

        if (!validate()) return false;

        set({ loading: true, submitError: null });
        try {
            const payload: CreateCustomerPayload = {
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                route: routeId,
                rate: Number(rate),
                phone_no: Number(phone),
                email: email.trim(),
                sequence_no: sequenceNo.trim() ? Number(sequenceNo) : "",
            };
            console.log(payload);
            await createCustomer(payload);
            set({ loading: false });
            return true;
        } catch (err: any) {
            console.log('API Error Response:', err.response?.data || err.message);
            set({ loading: false, submitError: err?.response?.data?.message || err?.message || 'Failed to add customer. Please try again.' });
            return false;
        }
    },

    reset: () => set({ ...INITIAL_STATE }),
}));
