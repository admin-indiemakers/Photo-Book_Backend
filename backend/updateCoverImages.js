import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET = 'product-images';

async function uploadFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return null;
  }

  const fileName = path.basename(filePath);
  const fileBuffer = fs.readFileSync(filePath);
  const contentType = 'image/png';
  const uploadPath = `products/${Date.now()}-${fileName.replace(/\s+/g, '_')}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(uploadPath, fileBuffer, { contentType, upsert: true });

  if (error) {
    console.error(`Failed to upload ${fileName}:`, error.message);
    return null;
  }

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(uploadPath);
  return publicUrlData.publicUrl;
}

async function run() {
  const images = [
    {
      category: 'photo_frame',
      name: 'Custom Photo Frames',
      path: 'C:\\Users\\bijok\\.gemini\\antigravity\\brain\\f6026272-c74c-4751-a14f-0498bffb770c\\custom_photo_frames_studio_1784624411324.png'
    },
    {
      category: 'photo_book',
      name: 'Signature Photo Book',
      path: 'C:\\Users\\bijok\\.gemini\\antigravity\\brain\\f6026272-c74c-4751-a14f-0498bffb770c\\signature_photo_book_studio_1784624428119.png'
    }
  ];

  for (const img of images) {
    console.log(`Uploading ${img.name}...`);
    const publicUrl = await uploadFile(img.path);
    
    if (publicUrl) {
      console.log(`Uploaded! URL: ${publicUrl}`);
      console.log(`Updating database for category: ${img.category}...`);
      
      const { data, error } = await supabase
        .from('products')
        .update({ images: [publicUrl] })
        .eq('category', img.category);
        
      if (error) {
        console.error(`Error updating DB for ${img.name}:`, error.message);
      } else {
        console.log(`Successfully updated ${img.name} cover image in DB!`);
      }
    }
  }
}

run();
