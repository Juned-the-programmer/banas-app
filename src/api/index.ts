/**
 * Banas App - API Layer Index
 * Re-exports all domain services for clean imports.
 * Ref: RULES.md §4 — "Export from src/api/index.js"
 */
export { fetchCustomers } from './customersService';
export type { Customer } from './customersService';
export { fetchDashboard } from './homeService';
export type { DashboardData, DashboardMetrics } from './homeService';

