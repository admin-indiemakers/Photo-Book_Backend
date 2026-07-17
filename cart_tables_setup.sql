-- E-commerce Cart & Checkout Tables

-- 1. Create the Carts table
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'abandoned', 'converted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create the Cart Items table
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    custom_options JSONB DEFAULT '{}'::jsonb,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Add delivery information columns to the orders table (if they don't exist)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address_line1 TEXT,
ADD COLUMN IF NOT EXISTS address_line2 TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'India';

-- 4. Set up Row Level Security (RLS) for the new tables
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own carts
CREATE POLICY "Users can view their own carts" 
ON public.carts FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Users can insert their own carts" 
ON public.carts FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own carts" 
ON public.carts FOR UPDATE USING (auth.uid() = customer_id);

-- Allow users to manage their own cart items
CREATE POLICY "Users can view their own cart items" 
ON public.cart_items FOR SELECT USING (
  cart_id IN (SELECT id FROM public.carts WHERE customer_id = auth.uid())
);

CREATE POLICY "Users can insert their own cart items" 
ON public.cart_items FOR INSERT WITH CHECK (
  cart_id IN (SELECT id FROM public.carts WHERE customer_id = auth.uid())
);

CREATE POLICY "Users can update their own cart items" 
ON public.cart_items FOR UPDATE USING (
  cart_id IN (SELECT id FROM public.carts WHERE customer_id = auth.uid())
);

CREATE POLICY "Users can delete their own cart items" 
ON public.cart_items FOR DELETE USING (
  cart_id IN (SELECT id FROM public.carts WHERE customer_id = auth.uid())
);
