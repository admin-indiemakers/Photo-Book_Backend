# E-commerce Cart & Checkout Implementation Plan

Building the complete cart lifecycle, checkout flow, and live admin tracking requires multiple phases. Here is the step-by-step roadmap for implementing these requested features.

## Phase 1: Database Architecture (The Foundation)
We need to create the database structure to store active shopping carts and user items.
*   **Table:** `carts` (Tracks active sessions. Columns: `id`, `customer_id` or `session_id`, `created_at`, `updated_at`, `status`).
*   **Table:** `cart_items` (Tracks the specific products. Columns: `id`, `cart_id`, `product_id`, `quantity`, `custom_options` like chosen size/format, `price`).
*   **Table Updates:** Ensure the existing `orders` table properly links to shipping/delivery address fields.

## Phase 2: Backend APIs
We will create secure REST endpoints in the Express backend for both the customer frontend and the admin dashboard.
*   `POST /api/cart`: Add an item to the cart.
*   `GET /api/cart`: Fetch the current user's cart.
*   `POST /api/checkout`: Convert the active cart into an official `order`, capturing delivery information and clearing the cart.
*   `GET /api/admin/active-carts`: A specialized admin endpoint to fetch all live carts (so you can see what users are adding in real-time).

## Phase 3: Customer Frontend (Shopping & Checkout)
*   **Cart UI:** Implement a sliding cart drawer or dedicated `/cart` page where users can review added items.
*   **Checkout Flow:** Build a beautiful `/checkout` page to capture "Delivery Information" (address, city, state, pincode) and verify user details.
*   **Order Confirmation:** Upon submission, send the data to the backend to generate the order and show a success screen.

## Phase 4: Admin Dashboard Features
*   **Cart Management Page:** Add a new section in the sidebar. This page will display a real-time table of users and what products are currently sitting in their carts (excellent for tracking abandoned carts).
*   **Sales Management Page:** Enhance the existing "Orders" page (or create a dedicated Sales hub) to explicitly show the captured delivery details, customer information, and fulfillment status for completed purchases.
