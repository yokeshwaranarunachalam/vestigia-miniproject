import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch current session on initial load
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[useAuth] Error getting session:', error.message);
        }
        setUser(session?.user ?? null);
      } catch (err) {
        console.error('[useAuth] Unexpected error getting session:', err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 2. Subscribe to auth state updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // 3. Unsubscribe on cleanup / unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return { user, loading };
}

export default useAuth;

