import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// This client only ever uses the public anon key — safe for the browser.
// All privileged reads/writes go through the Express API instead.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
