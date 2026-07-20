import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function updateDb() {
  const { data, error } = await supabase
    .from('products')
    .update({ base_price: 135 })
    .eq('category', 'photo_frame');

  if (error) {
    console.error('Error updating:', error);
  } else {
    console.log('Successfully updated DB prices.');
  }
}
updateDb();
