import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        async get(name: string) {
          const cookie = (await cookieStore).get(name);
          return cookie?.value ?? '';
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            (await cookieStore).set({ name, value, ...options });
          } catch (error) {
            console.error('Error setting cookie:', error);
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            (await cookieStore).delete({ name, ...options });
          } catch (error) {
            console.error('Error removing cookie:', error);
          }
        },
      },
    }
  );
} 