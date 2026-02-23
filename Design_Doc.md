# App Architecture & Design Document: Banas Milk Delivery App (Mobile Only for Admin/Riders)

## 1. Product & Architecture Vision
The app is designed to be a **single, mobile-only application** used directly by the business Admin (and delivery riders). There will be no web dashboard. The objective is to make managing the entire milk delivery business—from tracking customers to generating bills—as simple as tapping through a few screens on a phone.

The design relies on a **Vibrant Blue "Water/Dairy" Theme**, utilizing soft glassmorphism (frosted glass) cards to keep data legible without feeling cluttered. The interface must be thumb-friendly and extremely simple.

---

## 2. App Workflow & Screen Breakdown 
Based on the `PRD.md`, the app will require the following screens and navigational workflow:

### **Level 0: Authentication**
*   **Screen 1: Login Screen**
    *   *Input:* Username, Password.
    *   *Action:* Login (Returns JWT `access_token` and `refresh_token`).

### **Level 1: Main Navigation (Bottom Tab Bar)**
Once logged in, the Admin will navigate via a persistent 4-tab bottom navigation bar.

1.  **Tab 1: Home (Dashboard)** - The primary landing screen.
2.  **Tab 2: Routes (Daily Deliveries)** - Managing routes and logging daily entries.
3.  **Tab 3: Customers** - Directory and individual customer management.
4.  **Tab 4: Billing & Payments** - Financial operations.

---

### **Level 2: Detailed Screen Requirements**

#### **Tab 1: Home (Dashboard Screen)**
*   **Metrics Cards (Top Half):**
    *   Total Active Customers
    *   Today's Deliveries (Coolers logged out of Total expected)
    *   Total Pending Payments (Outstanding dues system-wide)
*   **Quick ActionsGrid (Bottom Half):** Large, thumb-friendly buttons jumping directly to Add Customer, Log Delivery, or Record Payment.

> [!TIP]
> **Admin Mobile Dashboard UI Inspiration**
> ![Admin Mobile Dashboard](/Users/juneddavada/.gemini/antigravity/brain/81a8773e-0e4c-41d2-abf2-6e6a4360cdae/admin_mobile_dashboard_ui_1771674258344.png)

#### **Tab 2: Routes & Daily Deliveries Workflow**
*   **Screen 2A: Route List Screen**
    *   Displays all assigned/created routes (e.g., "North District").
    *   *Action:* Tapping a route opens the Daily Entry screen for that route.
*   **Screen 2B: Daily Entry Screen (Core Workflow)**
    *   Displays customers sequenced for delivery on the selected route.
    *   *Action:* Two massive buttons per customer card: **[Log Bottles] / [Log Coolers]**.
    *   *Alternative Action:* Floating Action Button (FAB) to open the camera for the **QR Code Scanning** workflow.

> [!TIP]
> **Daily Entry UI Inspiration**
> ![Mobile Daily Entry Screen](/Users/juneddavada/.gemini/antigravity/brain/81a8773e-0e4c-41d2-abf2-6e6a4360cdae/milk_delivery_mobile_ui_1771673815732.png)

#### **Tab 3: Customer Management Workflow**
*   **Screen 3A: Customer Directory**
    *   A searchable, scrollable list of all customers. Supports filtering by route.
    *   *Action:* Add New Customer button. Top a customer to view their profile.
*   **Screen 3B: Customer Profile & Ledger**
    *   Displays Name, Phone, Delivery Sequence, Rate, and Route.
    *   Shows a mini-ledger of `Due Amount` vs `Total Paid`.
    *   *Action:* Toggle Active/Inactive status.

#### **Tab 4: Billing & Payments Workflow**
*   **Screen 4A: Financial Overview**
    *   Split into two segments: **Generate Bills** and **Collect Payments**.
*   **Screen 4B: Generate Bill Screen**
    *   Select `from_date` and `to_date`.
    *   Select specific route or "All Routes".
    *   *Action:* Tap "Generate Bills" (triggers background job).
*   **Screen 4C: Payment Collection Screen**
    *   Select Customer -> Enter `Paid Amount` -> Select Method (Cash, UPI) -> Submit. Updates the customer's pending amount automatically.

---

## 3. UI/UX Style Guide

1.  **Color Palette:**
    *   **Background:** Milk White (`#F8F9FA` or `#FFFFFF`).
    *   **Primary Accent:** Vibrant Aqua/Cyan (`#00E5FF`) for metrics and highlights.
    *   **Card Backgrounds:** Deep primary blue with 80% opacity and background blur (Glassmorphism).
2.  **Typography:**
    *   `Inter` or `Outfit` fonts. Numbers (Prices, Cooler Counts) must be bold and highly legible.
3.  **Interactions:**
    *   Use bottom sheets (slide up from the bottom) for entering data (like typing a payment amount or adding a route) rather than navigating to entirely new pages. This keeps the Admin grounded in their current context.
