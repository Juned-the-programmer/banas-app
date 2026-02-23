# Project Architecture & Coding Style Guidelines

You are an expert React Native developer. When generating or refactoring code for this project, you MUST adhere strictly to the following architectural patterns, coding styles, and API integration processes.

## 1. Directory Structure & Feature-Based Architecture
We use a scalable, feature-first modular architecture.
- Group files by feature domains (e.g., `src/features/auth`, `src/features/home`).
- Inside each feature folder, maintain sub-folders for `screens/`, `components/`, and `assets/`.
- Global utilities, themes, global stores, and API services should reside in `src/utils/`, `src/theme/`, `src/stores/`, and `src/api/` respectively.

## 2. UI & Styling (Theming & React Native)
- **Use Themed Components**: Always use custom wrapper components like `<ThemedView>` and `<ThemedText>` for layout and text to easily manage dark/light modes and consistent typography.
- **Styling**: Always use `StyleSheet.create`. Do not use inline styles unless absolutely necessary for dynamic values.
- **Premium Aesthetics**: Utilize `LinearGradient` (via `expo-linear-gradient`) and custom SVGs (imported as React components) for high-quality, rich UIs. Use a curated color palette defined in `src/utils/constants.js` (e.g., `COLORS.GOLD`, `COLORS.CARD`).
- **Icons**: Prefer vector icons from `@expo/vector-icons` (like `Ionicons`) or custom SVG assets.
- **Language & Fonts**: Support dynamic localization cleanly. Inject specific fonts dynamically based on the active language (e.g., swapping to a bold Gujarati font if the language is set to 'gu').

## 3. Global State Management (Zustand)
- Use **Zustand** for all global state management. 
- Create domain-specific stores in `src/stores/` (e.g., `authStore.js`, `homeStore.js`).
- Export all custom store hooks from `src/stores/index.js` (e.g., `export { useAuthStore } from './authStore'`).
- UI Components should pull exact state variables and loading/error flags directly from hooks (e.g., `const { data, loading, error } = useDataStore()`). Avoid prop-drilling.

## 4. API Integration Flow
We use a clean, 3-layer architecture for data fetching. Do NOT fetch data directly inside UI components or hardcode API URLs in components.

**Layer 1: Centralized Constants (`src/utils/constants.js`)**
- Define `BASE_URL` dynamically handling local development vs production environments.
- Maintain an `ENDPOINTS` dictionary. For routes with path parameters, use functions returning template literals (e.g., `DETAIL: (id) => \`/items/\${id}\``).

**Layer 2: API Services (`src/api/`)**
- Create dedicated service files per domain (e.g., `authService.js`, `userService.js`).
- Export them from `src/api/index.js`.
- These services handle the actual HTTP requests (`axios` or `fetch`) using the URLs from the `ENDPOINTS` dictionary. They should return formatted data or throw clean errors.

**Layer 3: Store & Component Consumption**
- **Action**: UI components trigger actions (like `fetchData()`) preferably defined in the component's `useEffect`, or action handlers inside the Zustand store.
- **State Update**: The service fetches the data and updates the global Zustand store (setting `loading` to true, populating `data`, handling `error`).
- **Render**: The Component natively reacts to store changes, rendering `ActivityIndicator` when loading, and mapping over the resulting data when complete.