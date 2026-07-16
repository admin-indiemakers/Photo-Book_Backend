# PhotoLab Admin — Dashboard & Backend

Admin dashboard + API for a photo-products storefront selling **polaroids, photo
frames, photo canvas, fridge magnets, acrylic frames, and photo books**.

```
photo-admin/
├── backend/            Express + Node API (talks to Supabase with the service role key)
└── admin-frontend/     React (Vite) admin dashboard — orange/white theme
```

Your customer-facing site stays exactly as it is. It should write orders directly
into the `orders` / `order_items` tables in Supabase (or through its own API) —
this project only adds the **admin side**: reviewing orders, managing products,
and managing customers.

---

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com) (or use your existing one).
2. Open **SQL Editor → New query**, paste the contents of `backend/supabase/schema.sql`,
   and run it. This creates all tables, enums, triggers, RLS policies, and seeds
   the 6 starter products.
3. Go to **Storage** and create a new **public** bucket named `product-images`
   (or change `PRODUCT_IMAGES_BUCKET` in your `.env` to match a different name).
4. Go to **Authentication → Users → Add user** and create your first admin login
   (email + password).
5. Copy that new user's UUID (from the Users table) and run this in the SQL editor
   to make them an admin:

   ```sql
   insert into admins (id, full_name, email, role)
   values ('paste-the-uuid-here', 'Your Name', 'you@example.com', 'super_admin');
   ```

6. Grab your keys from **Project Settings → API**:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (backend only — never expose to the browser)
   - `anon public` key → `VITE_SUPABASE_ANON_KEY` (frontend)

---

## 2. Run the backend

```bash
cd backend
cp .env.example .env      # fill in your Supabase keys
npm install
npm run dev                # http://localhost:5000
```

Health check: `GET http://localhost:5000/health`

### API overview

All routes below (except `/auth/login`) require `Authorization: Bearer <access_token>`.

| Area | Method & path | What it does |
|---|---|---|
| Auth | `POST /api/auth/login` | Log in, returns Supabase session + admin profile |
| Auth | `GET /api/auth/me` | Current admin profile |
| Auth | `PATCH /api/auth/profile` | Update name/phone/avatar |
| Auth | `POST /api/auth/change-password` | Change password |
| Dashboard | `GET /api/dashboard/summary` | Revenue, order counts, low stock, 14-day chart data |
| Dashboard | `GET /api/dashboard/top-products` | Best-selling products by revenue |
| Orders | `GET /api/orders` | List orders — filter by `status`, `search`, `from`, `to` |
| Orders | `GET /api/orders/:id` | Order detail, line items, status history |
| Orders | `PATCH /api/orders/:id/status` | Advance/cancel status, set tracking info |
| Orders | `PATCH /api/orders/:id/notes` | Save internal admin notes |
| Customers | `GET /api/customers` | List — filter by `search`, `is_blocked` |
| Customers | `GET /api/customers/:id` | Customer detail + order history |
| Customers | `PATCH /api/customers/:id` | Edit details, block/unblock, save notes |
| Products | `GET /api/products` | List — filter by `category`, `search`, `is_active` |
| Products | `POST /api/products` | Create product |
| Products | `PATCH /api/products/:id` | Edit product |
| Products | `DELETE /api/products/:id` | Delete product |
| Products | `POST /api/products/upload-image` | Upload image (multipart, field `image`) → Supabase Storage URL |

Order status can only move forward through:
`pending → confirmed → processing → shipped → delivered`, or to `cancelled`
from any non-final state. This is enforced server-side in
`orders.controller.js`.

---

## 3. Run the admin frontend

```bash
cd admin-frontend
cp .env.example .env      # fill in API URL + Supabase anon key
npm install
npm run dev                # http://localhost:5173
```

Log in with the admin email/password you created in Supabase Auth.

### Pages

- **Overview** — revenue (14-day chart), orders today, pending orders, order
  status breakdown, top-selling products, low-stock alerts.
- **Orders** — searchable/filterable table → detail view with a film-strip
  style fulfillment tracker, line items (including any customer-uploaded photo),
  shipping/tracking fields, internal notes, and full status history.
- **Customers** — searchable table with lifetime order count/spend → detail
  view with order history, block/unblock, internal notes.
- **Products** — grid of all 6 categories with polaroid-style thumbnails, add/edit
  modal (multi-image upload, pricing, stock, active/hidden toggle), delete.
- **Profile** — edit name/phone, change password.

---

## 4. Connecting your existing customer site

Your storefront should, on checkout, insert into Supabase:

1. A row in `customers` (or reuse an existing one by email).
2. A row in `orders` with a generated `order_number` (e.g. `PL-20260716-0001`),
   `shipping_address` as JSON, and totals.
3. One row per cart line in `order_items`, with `customization` JSON holding
   things like `{"size": "5x7", "material": "matte", "photo_url": "..."}` —
   this is exactly what the admin Order Detail page reads and displays.

Once those rows exist, they show up in the admin dashboard immediately — no
extra wiring needed.

---

## Design notes

- **Theme**: orange (`#E85D2C`) on warm white/cream (`#FFF9F4`), with a
  restrained set of status colors (green/amber/red/blue) used consistently
  across badges, charts, and alerts.
- **Signature motif**: a perforated "film strip" pattern (nods to instant-photo
  printing) used on the sidebar logo and reused functionally as the order
  fulfillment stepper — so the one visual flourish also carries information.
- Fonts: **Sora** (display/headings), **Inter** (body/tables), **JetBrains Mono**
  (order numbers, SKUs).

## Tech stack

React 18 (Vite) · Tailwind CSS · Recharts · lucide-react · Express · Supabase
(Postgres + Auth + Storage)
