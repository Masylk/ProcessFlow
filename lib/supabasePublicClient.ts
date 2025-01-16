import { createClient } from '@supabase/supabase-js';

// Public Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Public client for frontend usage
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);
