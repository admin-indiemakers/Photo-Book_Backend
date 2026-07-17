import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const BUCKET = 'product-images';

const ASSETS_DIR = 'd:\\PhotoBook3\\Photo-Book\\src\\assets';

async function uploadFile(fileName) {
  const filePath = path.join(ASSETS_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return null;
  }

  const fileBuffer = fs.readFileSync(filePath);
  const ext = fileName.split('.').pop();
  let contentType = 'image/jpeg';
  if (ext === 'png') contentType = 'image/png';
  if (ext === 'webp') contentType = 'image/webp';

  const uploadPath = `products/${Date.now()}-${fileName.replace(/\s+/g, '_')}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(uploadPath, fileBuffer, { contentType, upsert: true });

  if (error) {
    console.error(`Failed to upload ${fileName}:`, error.message);
    // If the bucket doesn't exist, this will fail. We might need to create the bucket first or it might exist.
    return null;
  }

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(uploadPath);
  return publicUrlData.publicUrl;
}

const productsToSeed = [
  {
    name: 'Custom Polaroids',
    category: 'polaroid',
    description: 'Turn your digital memories into tangible, hand-finished instant prints. Configure size, quantity, and captions for each photo individually.',
    base_price: 299,
    stock_quantity: 1000,
    is_active: true,
    is_customizable: true,
    localImages: ['Polariod 3.jpg', 'Polariod 1.jpg', 'Polariod 2.jpg'],
    attributes: {
      sizes: 'Mini & Square (2 different sizes to choose from)',
      supported_formats: ['.JPG', '.PNG', '.HEIC', '.WEBP', '.PDF', '.PSD', '.AI', '.EPS', '.TIFF', '+ more']
    }
  },
  {
    name: 'Custom Photo Frames',
    category: 'photo_frame',
    description: 'Transform your digital memories into premium gallery-quality frames. Ready to hang, built to last.',
    base_price: 90,
    stock_quantity: 500,
    is_active: true,
    is_customizable: true,
    // assuming no specific local images for photo frame, using unsplash or if there's any? We'll use the unsplash one for now
    localImages: [],
    fallbackImages: ['https://images.unsplash.com/photo-1577003833610-388e6e8e8f81?w=800&h=800&fit=crop'],
    attributes: {
      sizes: '3x3 to 13x19 inches (8 different sizes to choose from)',
      supported_formats: ['.JPG', '.PNG', '.HEIC', '.WEBP', '.PDF', '.PSD', '.AI', '.EPS', '.TIFF', '+ more']
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
    localImages: ['fridge_magnet1.webp', 'fridge_magnet2.webp', 'fridge_magnet3.jpg'],
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
    localImages: ['Acrylic Frames1.jpg', 'Acrylic Frames2.jpg', 'Acrylic Frames3.jpg'],
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
    localImages: ['Canvas Frame1.jpg', 'Canvas Frame2.jpg', 'Canvas Frame3.jpg'],
    attributes: {
      sizes: '8x10 to 36x48 inches (10 different sizes)',
      supported_formats: ['.JPG', '.PNG', '.HEIC', '.WEBP', '.TIFF']
    }
  },
  {
    name: 'Signature Photo Book',
    category: 'photo_book',
    description: 'Beautifully crafted layflat photo books that turn your digital memories into archival quality heirlooms.',
    base_price: 799,
    stock_quantity: 100,
    is_active: true,
    is_customizable: true,
    localImages: [],
    fallbackImages: ['https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=800&h=800&fit=crop'],
    attributes: {
      sizes: '8x8 to 12x12 inches (3 different sizes)',
      supported_formats: ['.JPG', '.PNG', '.HEIC', '.WEBP', '+ more']
    }
  }
];

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

async function run() {
  console.log('Clearing existing products...');
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  for (const product of productsToSeed) {
    const uploadedUrls = [];
    if (product.localImages && product.localImages.length > 0) {
      console.log(`Uploading images for ${product.name}...`);
      for (const fileName of product.localImages) {
        const url = await uploadFile(fileName);
        if (url) uploadedUrls.push(url);
      }
    }
    
    product.images = uploadedUrls.length > 0 ? uploadedUrls : (product.fallbackImages || []);
    delete product.localImages;
    delete product.fallbackImages;
    
    product.slug = slugify(product.name) + '-' + Math.random().toString(36).slice(2, 7);
  }

  console.log('Inserting products into DB...');
  const { data, error } = await supabase.from('products').insert(productsToSeed).select();
  
  if (error) {
    console.error('Error inserting products:', error);
  } else {
    console.log(`Successfully seeded ${data.length} products with real local assets!`);
  }
}

run();
