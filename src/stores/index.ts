/**
 * Banas App - Stores Index
 * Re-exports all domain Zustand store hooks.
 * Ref: RULES.md §3 — "Export all custom store hooks from src/stores/index.js"
 */
export { useAuthStore } from './authStore';
export { useAddCustomerStore } from './customers/addCustomerStore';
export { useCustomerProfileStore } from './customers/customerProfileStore';
export { useCustomersStore } from './customers/customersStore';
export { useDailyEntryStore } from './dailyEntryStore';
export { useDueListStore } from './dueListStore';
export { useHomeStore } from './homeStore';
export { usePaymentsStore } from './paymentsStore';

export { useEditCustomerStore } from './customers/editCustomerStore';
