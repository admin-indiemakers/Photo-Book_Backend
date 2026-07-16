-- ============================================================================
-- PhotoLab Admin — Supabase Schema
-- Run this in Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
create type product_category as enum (
  'polaroid',
  'photo_frame',
  'photo_canvas',
  'fridge_magnet',
  'acrylic_frame',
  'photo_book'
);

create type order_status as enum (
  'pending',      -- just placed, awaiting review
  'confirmed',    -- admin has verified payment/details
  'processing',   -- being printed / produced
  'shipped',      -- handed to courier
  'delivered',    -- completed
  'cancelled'
);

create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');

create type admin_role as enum ('super_admin', 'manager', 'support');

-- ----------------------------------------------------------------------------
-- ADMINS
-- Admin accounts are Supabase Auth users (auth.users). This table stores
-- profile + role info and is what the Express API checks for authorization.
-- ----------------------------------------------------------------------------
create table admins (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  avatar_url text,
  role admin_role not null default 'manager',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- CUSTOMERS
-- Populated by your existing customer-facing app. If customers also sign in
-- via Supabase Auth, id should reference auth.users(id). Otherwise this is a
-- standalone table your storefront writes to on signup/checkout.
-- ----------------------------------------------------------------------------
create table customers (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text not null unique,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  postal_code text,
  country text default 'India',
  is_blocked boolean not null default false,
  notes text,                     -- internal admin notes about the customer
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- PRODUCTS
-- ----------------------------------------------------------------------------
create table products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  category product_category not null,
  description text,
  base_price numeric(10, 2) not null check (base_price >= 0),
  compare_at_price numeric(10, 2),          -- for showing a strikethrough MRP
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true,   -- toggle visibility on storefront
  is_customizable boolean not null default true, -- customer uploads own photo
  images text[] not null default '{}',       -- Supabase Storage public URLs
  attributes jsonb not null default '{}',    -- e.g. {"sizes":["4x6","5x7"],"materials":["matte","glossy"]}
  sku text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_products_category on products(category);
create index idx_products_active on products(is_active);

-- ----------------------------------------------------------------------------
-- ORDERS
-- ----------------------------------------------------------------------------
create table orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique,          -- human-friendly e.g. PL-20260716-0001
  customer_id uuid not null references customers(id) on delete restrict,
  status order_status not null default 'pending',
  payment_status payment_status not null default 'pending',
  payment_method text,                        -- e.g. razorpay, cod, upi
  subtotal numeric(10, 2) not null default 0,
  shipping_fee numeric(10, 2) not null default 0,
  discount numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  shipping_address jsonb not null,            -- snapshot at time of order
  tracking_number text,
  courier_name text,
  admin_notes text,                           -- internal notes, not shown to customer
  placed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_orders_customer on orders(customer_id);
create index idx_orders_status on orders(status);
create index idx_orders_placed_at on orders(placed_at desc);

-- ----------------------------------------------------------------------------
-- ORDER ITEMS
-- Each line item snapshots product name/price at time of order, plus any
-- customization data (uploaded photo, chosen size/material, engraving text).
-- ----------------------------------------------------------------------------
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,                 -- snapshot
  category product_category not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null,
  line_total numeric(10, 2) not null,
  customization jsonb not null default '{}',  -- {"size":"5x7","material":"matte","photo_url":"...","text":"..."}
  created_at timestamptz not null default now()
);

create index idx_order_items_order on order_items(order_id);

-- ----------------------------------------------------------------------------
-- ORDER STATUS HISTORY (audit trail for the film-strip tracker in the UI)
-- ----------------------------------------------------------------------------
create table order_status_history (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  status order_status not null,
  note text,
  changed_by uuid references admins(id),
  created_at timestamptz not null default now()
);

create index idx_status_history_order on order_status_history(order_id);

-- ----------------------------------------------------------------------------
-- TRIGGER: auto-update updated_at columns
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_admins_updated_at before update on admins
  for each row execute function set_updated_at();
create trigger trg_customers_updated_at before update on customers
  for each row execute function set_updated_at();
create trigger trg_products_updated_at before update on products
  for each row execute function set_updated_at();
create trigger trg_orders_updated_at before update on orders
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- TRIGGER: log status changes automatically
-- ----------------------------------------------------------------------------
create or replace function log_order_status_change()
returns trigger as $$
begin
  if (tg_op = 'INSERT') or (old.status is distinct from new.status) then
    insert into order_status_history (order_id, status, changed_by)
    values (new.id, new.status, null);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_orders_status_log after insert or update of status on orders
  for each row execute function log_order_status_change();

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- The Express backend uses the Supabase SERVICE ROLE key, which bypasses RLS.
-- RLS below protects these tables if ever queried with the anon/public key
-- (e.g. directly from the customer-facing storefront).
-- ----------------------------------------------------------------------------
alter table admins enable row level security;
alter table customers enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_status_history enable row level security;

-- Public can read active products only (storefront browsing)
create policy "Public can view active products"
  on products for select
  using (is_active = true);

-- Customers can view their own record and their own orders
create policy "Customers view own profile"
  on customers for select
  using (auth.uid() = auth_user_id);

create policy "Customers view own orders"
  on orders for select
  using (
    customer_id in (select id from customers where auth_user_id = auth.uid())
  );

create policy "Customers view own order items"
  on order_items for select
  using (
    order_id in (
      select o.id from orders o
      join customers c on c.id = o.customer_id
      where c.auth_user_id = auth.uid()
    )
  );

-- No public policies on admins / order_status_history — service role only.

-- ----------------------------------------------------------------------------
-- SEED: a couple of starter products so the admin UI has data on first run
-- ----------------------------------------------------------------------------
insert into products (name, slug, category, description, base_price, stock_quantity, images, attributes, sku)
values
  ('Classic Instant Polaroid Print', 'classic-instant-polaroid', 'polaroid',
   'Vintage-style instant photo prints from your favorite digital pictures.', 149.00, 500,
   '{}', '{"sizes":["2x3"],"pack_sizes":[9,18,36]}', 'POL-001'),
  ('Wooden Wall Photo Frame', 'wooden-wall-photo-frame', 'photo_frame',
   'Solid wood frame with anti-glare glass, available in walnut and oak finish.', 499.00, 200,
   '{}', '{"sizes":["4x6","5x7","8x10"],"finish":["walnut","oak","white"]}', 'FRM-001'),
  ('Premium Photo Canvas', 'premium-photo-canvas', 'photo_canvas',
   'Gallery-wrapped canvas print on a solid wood frame, fade resistant ink.', 899.00, 150,
   '{}', '{"sizes":["12x18","16x24","20x30"]}', 'CNV-001'),
  ('Custom Fridge Magnet Set', 'custom-fridge-magnet-set', 'fridge_magnet',
   'Set of 6 photo magnets, glossy finish, strong magnetic backing.', 249.00, 400,
   '{}', '{"set_size":[4,6,9]}', 'MAG-001'),
  ('Acrylic Photo Block Frame', 'acrylic-photo-block-frame', 'acrylic_frame',
   'Vibrant, high-gloss acrylic block that makes colors pop off the wall.', 799.00, 120,
   '{}', '{"sizes":["6x6","8x8","10x10"],"thickness_mm":[10,15]}', 'ACR-001'),
  ('Custom Hardcover Photo Book', 'custom-hardcover-photo-book', 'photo_book',
   'Premium hardcover photo book, up to 40 pages, lay-flat binding.', 1299.00, 100,
   '{}', '{"page_counts":[20,30,40],"cover":["matte","glossy"]}', 'BOOK-001');
