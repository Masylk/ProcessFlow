import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

interface SupabaseSessionState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export function useSupabaseSession() {
  const [state, setState] = useState<SupabaseSessionState>({
    session: null,
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`))
            ?.split('=')[1];
        },
        set(name: string, value: string, options: any) {
          let cookie = `${name}=${value}; path=/`;
          if (options.maxAge) {
            cookie += `; max-age=${options.maxAge}`;
          }
          if (options.domain) {
            cookie += `; domain=.process-flow.io`;
          }
          document.cookie = cookie;
        },
        remove(name: string) {
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
        },
      },
    });

    // Function to fetch and update authenticated user
    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        setState(prev => ({
          ...prev,
          user,
          session: user ? { user } as Session : null,
          loading: false,
          error: null
        }));
      } catch (error) {
        console.error('Error fetching user:', error);
        setState(prev => ({
          ...prev,
          user: null,
          session: null,
          loading: false,
          error: error as Error
        }));
      }
    };

    // Initial fetch
    fetchUser();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // After any auth state change, verify the user server-side
      await fetchUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return state;
} 