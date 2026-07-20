-- Create the layout_templates table
CREATE TABLE IF NOT EXISTS public.layout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  pages INTEGER NOT NULL DEFAULT 20,
  status TEXT NOT NULL DEFAULT 'Active',
  image TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed the 8 templates
INSERT INTO public.layout_templates (name, category, pages, status, image) VALUES
  ('Wanderlust (Travel)', 'Travel', 24, 'Active', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=300&h=400&fit=crop'),
  ('Wedding Bliss', 'Wedding', 40, 'Active', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=300&h=400&fit=crop'),
  ('Little One', 'Family', 20, 'Active', 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=300&h=400&fit=crop'),
  ('Minimalist Portfolio', 'Portfolio', 30, 'Draft', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&h=400&fit=crop'),
  ('Year in Review', 'Yearbook', 50, 'Active', 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=300&h=400&fit=crop'),
  ('Graduation Memories', 'Event', 24, 'Active', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300&h=400&fit=crop'),
  ('Pet Adventures', 'Pets', 20, 'Active', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=400&fit=crop'),
  ('Classic Family', 'Family', 30, 'Active', 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=300&h=400&fit=crop');
