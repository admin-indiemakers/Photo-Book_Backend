import { supabase } from './src/config/supabaseClient.js';

const productsToSeed = [
  {
    name: 'Vintage Polaroid Set',
    category: 'polaroid',
    slug: 'polaroid',
    description: 'A beautifully crafted set of vintage-style polaroid prints. Perfect for preserving your most cherished memories with a timeless aesthetic.',
    base_price: 299,
    compare_at_price: 399,
    stock_quantity: 500,
    sku: 'PB-POL-01',
    is_active: true,
    is_customizable: true,
    images: [] // You can upload images via admin panel later
  },
  {
    name: 'Classic Photo Frame',
    category: 'photo_frame',
    slug: 'photo-frame',
    description: 'An elegant wooden photo frame designed to complement any interior space. Features premium non-glare glass and archival backing.',
    base_price: 999,
    compare_at_price: 1299,
    stock_quantity: 200,
    sku: 'PB-FRM-01',
    is_active: true,
    is_customizable: true,
    images: []
  },
  {
    name: 'Gallery Photo Canvas',
    category: 'photo_canvas',
    slug: 'photo-canvas',
    description: 'Transform your photos into gallery-quality canvas art. Printed on premium textured canvas and wrapped over a sturdy wooden frame.',
    base_price: 1499,
    compare_at_price: 1999,
    stock_quantity: 150,
    sku: 'PB-CNV-01',
    is_active: true,
    is_customizable: true,
    images: []
  },
  {
    name: 'Premium Fridge Magnet',
    category: 'fridge_magnet',
    slug: 'fridge-magnet',
    description: 'Turn your favorite moments into high-quality magnetic prints. Features a strong magnetic back and a glossy, scratch-resistant finish.',
    base_price: 199,
    compare_at_price: 249,
    stock_quantity: 1000,
    sku: 'PB-MAG-01',
    is_active: true,
    is_customizable: true,
    images: []
  },
  {
    name: 'Modern Acrylic Frame',
    category: 'acrylic_frame',
    slug: 'acrylic-frame',
    description: 'Sleek, modern, and vibrant. Our acrylic blocks give your photos a stunning 3D depth effect with diamond-polished edges.',
    base_price: 1299,
    compare_at_price: 1599,
    stock_quantity: 300,
    sku: 'PB-ACR-01',
    is_active: true,
    is_customizable: true,
    images: []
  },
  {
    name: 'Signature Photo Book',
    category: 'photo_book',
    slug: 'photo-book',
    description: 'The ultimate way to tell your story. Bound in premium materials with lay-flat pages, printed on ultra-thick photographic paper.',
    base_price: 2499,
    compare_at_price: 2999,
    stock_quantity: 100,
    sku: 'PB-BOK-01',
    is_active: true,
    is_customizable: true,
    images: []
  }
];

async function seedDatabase() {
  console.log('Starting product database seeding...');
  
  try {
    // Check if products already exist to avoid duplicates
    const { data: existingProducts, error: fetchError } = await supabase
      .from('products')
      .select('sku');
      
    if (fetchError) throw fetchError;
    
    const existingSkus = existingProducts.map(p => p.sku);
    const newProducts = productsToSeed.filter(p => !existingSkus.includes(p.sku));
    
    if (newProducts.length === 0) {
      console.log('All products already exist in the database! No new records added.');
      process.exit(0);
    }

    const { data, error } = await supabase
      .from('products')
      .insert(newProducts)
      .select();

    if (error) {
      throw error;
    }

    console.log(`Successfully inserted ${data.length} products into the database!`);
    console.log('Check your Admin Panel > Products tab to see them displayed in the new Print Canvas layout.');
  } catch (error) {
    console.error('Error seeding database:', error.message);
  } finally {
    process.exit(0);
  }
}

seedDatabase();
