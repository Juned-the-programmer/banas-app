# Product Requirements Document (PRD): Banas Milk Delivery App

## 1. Product Overview
Banas is a milk delivery and business management platform that helps milk distributors and delivery route owners manage their operations digitally. The platform tracks their customers, geographic routes, daily delivery quantities (coolers/bottles), periodic billing, and payment processing. It utilizes an asynchronous backend that processes tasks, caching for performance, and background jobs for generating bills and handling data imports/exports.

## 2. Objectives
For the UI/Frontend Team, the primary goal is to create an intuitive, mobile-responsive web application or Progressive Web App (PWA) where delivery personnel and business admins can:
- View and manage customers categorized by geographical routes.
- Execute daily deliveries quickly (via QR code scanning or manual entry).
- Generate end-of-cycle bills and accept payments.
- Access a central dashboard reporting live stats (total customers, daily deliveries, outstanding dues, etc.).
- Ensure secure access through JWT-based authentication.

## 3. Core Modules & Features

### 3.1 Authentication & Authorization
- **Login Screen**: Admin and Delivery Personnel authenticate using their credentials (`username` and `password`).
- **Authorization Flow**: The backend issues JWT tokens. The UI must store the `access_token` and `refresh_token` securely (e.g., in Local Storage, Session Storage, or Secure Cookies). It should attach the access token as a Bearer token (`Authorization: Bearer <token>`) to outgoing API requests and automatically rotate tokens when expired.

### 3.2 Dashboard (Home)
- **Overview Metrics**: Display key business statistics such as:
  - Total Active Customers.
  - Total Coolers Delivered (Current Day / Current Month).
  - Total Outstanding Dues / Pending Payments across the system.
- **UI Elements**: Include metric cards or simple bar schemas to give business owners a quick snapshot of business health (powered by the `DailyEntry_dashboard` model).

### 3.3 Route Management
- Routes organize customers geolocated for a daily delivery cycle.
- **List/Create/Edit Routes**: Table or list view of delivery routes (e.g., "North District", "Route A").
- **Fields**: Route Name.

### 3.4 Customer Management
- **Customer Directory**: A list screen featuring all registered customers. Must support filtering by Route.
- **Customer Profile**:
  - Name (First, Last), Phone Number, Email.
  - Delivery Sequence Number (for ordering them correctly on a delivery route).
  - Customer Specific `Rate` (price per cooler/bottle).
  - Assigned Route.
  - Active/Inactive status toggle.
- **Customer Account Tracking**:
  - Automatically maintained ledger displaying the `Due Amount` and `Total Paid`.

### 3.5 Daily Deliveries (Daily Entry)
- **Daily Entry Screen (Mobile First)**: The core workflow for delivery riders. Shows a list of customers grouped by a mapped route in their sequence order.
- **Manual Entry**: Input the number of "coolers" delivered to each customer on a specific date.
- **QR Code Workflow**: Delivery associate scans a physical QR code placed at the customer's location and inputs a specific `qrcode_pin` to quickly validate and log the secure delivery.
- **Pending Entries Module**: View and rapidly reconcile missed entries or pending deliveries awaiting confirmation.

### 3.6 Billing
- **Billing Cycle Management**: Feature allowing admins to generate bills sequentially spanning a custom date range (`from_date` to `to_date`).
- **Digital Bill**: Show total coolers delivered, the customer's rate, the current cycle amount, previous pending amount, any advance payments, and the grand total due.
- **Bill History**: A screen allowing administrators to view past generated bills, mark them as paid, or resend them to customers.

### 3.7 Payments
- **Payment Collection Screen**: Interface to receive payments against a customer's specific total due amounts.
- **Transaction Fields**: Payment Date, Paid Amount, Round-off amounts, Payment Method (Cash, UPI, Bank Transfer), and Notes.
- **Post-Payment**: Automatically deducts the `paid_amount` from the `pending_amount` on the backend.

## 4. Technical Integration Notes for UI
- **API Base URL**: Should be configurable (e.g., via `.env`). Standard operations happen relative to the base URL setup dynamically.
- **Swagger Documentation**: The full OpenAPI schema is available at `/swagger/` (interactive UI) or directly via `swagger.yaml` in the codebase. The UI developers must reference this document to understand precise endpoint payloads, validation rules, and HTTP verbs.
- **Media Delivery**: QR codes and customer-related media images are loaded externally via remote AWS S3 URIs. Ensure UI image components properly render remote addresses without CORS issues.
- **Pagination & Caching**: List endpoints will be paginated. The UI must support standard pagination controls or infinite scrolling patterns.

## 5. Non-Functional Requirements & UX
- **Mobile Responsiveness**: Mission Critical. Delivery personnel will operate the application entirely from mobile devices while out on routes. Interactive elements (Forms, Submission Buttons, Modals) must be highly accessible, large, and easy to interact with.
- **Performance**: The backend API uses Memcached for rapid data fetching. The UI should complement this by displaying optimistic updates and explicit loading state placeholders (skeleton screens).
- **Error Handling**: Graceful error resolution is required if the backend fails, networks drop mid-delivery log, or token expiration requires a forced re-login.
