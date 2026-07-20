import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const products = [
  {
    name: 'Signature Photo Book',
    category: 'photo_book',
    description: 'Beautifully crafted layflat photo books that turn your digital memories into archival quality heirlooms.',
    base_price: 799,
    stock_quantity: 100,
    is_active: true,
    is_customizable: true,
    images: ['https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=800&h=800&fit=crop'],
    attributes: {
      sizes: '8x8 to 12x12 inches (3 different sizes)',
      supported_formats: ['.JPG', '.PNG', '.HEIC', '.WEBP', '+ more']
    }
  },
  {
    name: 'Custom Photo Frames',
    category: 'photo_frame',
    description: 'Transform your digital memories into premium gallery-quality frames. Ready to hang, built to last.',
    base_price: 135,
    stock_quantity: 500,
    is_active: true,
    is_customizable: true,
    images: ['https://images.unsplash.com/photo-1577003833610-388e6e8e8f81?w=800&h=800&fit=crop'],
    attributes: {
      sizes: '3x3 to 13x19 inches (8 different sizes to choose from)',
      supported_formats: ['.JPG', '.PNG', '.HEIC', '.WEBP', '.PDF', '.PSD', '.AI', '.EPS', '.TIFF', '+ more']
    }
  },
  {
    name: 'Vintage Polaroid Set',
    category: 'polaroid',
    description: 'Retro-style polaroid prints perfect for decorating your space or gifting to loved ones.',
    base_price: 299,
    stock_quantity: 1000,
    is_active: true,
    is_customizable: true,
    images: ['https://images.unsplash.com/photo-1526315274116-29177119b5e5?w=800&h=800&fit=crop'],
    attributes: {
      sizes: 'Standard Polaroid Size (Pack of 12, 24, 48)',
      supported_formats: ['.JPG', '.PNG', '.HEIC', '.WEBP']
    }
  },
  {
    name: 'Premium Fridge Magnets',
    category: 'fridge_magnet',
    description: 'High-quality magnetic prints to brighten up your kitchen and keep memories close.',
    base_price: 199,
    stock_quantity: 200,
    is_active: true,
    is_customizable: true,
    images: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&h=800&fit=crop'],
    attributes: {
      sizes: '2x2 to 3x4 inches (4 different sizes)',
      supported_formats: ['.JPG', '.PNG', '.HEIC', '.WEBP']
    }
  },
  {
    name: 'Crystal Acrylic Frames',
    category: 'acrylic_frame',
    description: 'Modern, borderless acrylic frames that make your photos pop with stunning depth and clarity.',
    base_price: 899,
    stock_quantity: 50,
    is_active: true,
    is_customizable: true,
    images: ['https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=800&h=800&fit=crop'],
    attributes: {
      sizes: '5x7 to 20x30 inches (6 different sizes)',
      supported_formats: ['.JPG', '.PNG', '.HEIC', '.WEBP', '.TIFF']
    }
  },
  {
    name: 'Gallery Canvas Frames',
    category: 'photo_canvas',
    description: 'Museum-quality canvas prints stretched over solid wood frames for a timeless look.',
    base_price: 1299,
    stock_quantity: 75,
    is_active: true,
    is_customizable: true,
    images: ['https://images.unsplash.com/photo-1580974582391-a6649c82a85f?w=800&h=800&fit=crop'],
    attributes: {
      sizes: '8x10 to 36x48 inches (10 different sizes)',
      supported_formats: ['.JPG', '.PNG', '.HEIC', '.WEBP', '.TIFF']
    }
  }
];

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

async function seed() {
  console.log('Clearing existing products...');
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  console.log('Inserting 6 correct products...');
  const productsToInsert = products.map(p => ({
    ...p,
    slug: slugify(p.name) + '-' + Math.random().toString(36).slice(2, 7)
  }));
  
  const { data, error } = await supabase.from('products').insert(productsToInsert).select();
  if (error) {
    console.error('Error seeding products:', error);
  } else {
    console.log(`Successfully seeded ${data.length} products.`);
  }
}

seed();
