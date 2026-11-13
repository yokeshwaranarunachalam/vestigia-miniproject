import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// Create the Auth Context
const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  sendOtp: async () => {},
  verifyOtp: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch current active session on mount
    const getInitialSession = async () => {
      try {
        const isConfigured =
          import.meta.env.VITE_SUPABASE_URL &&
          import.meta.env.VITE_SUPABASE_ANON_KEY &&
          !import.meta.env.VITE_SUPABASE_URL.includes('your-project-id');

        if (!isConfigured) {
          const stored = localStorage.getItem('vestigia_demo_user');
          if (stored) {
            const parsed = JSON.parse(stored);
            setUser(parsed);
            setSession({ user: parsed, access_token: 'mock-token' });
          }
          setLoading(false);
          return;
        }

        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[AuthContext] Error getting session:', error.message);
        }
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      } catch (err) {
        console.error('[AuthContext] Unexpected session initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 2. Listen to authentication state changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  /**
   * Request OTP code sent to user email
   * @param {string} email
   */
  const sendOtp = async (email) => {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        // Keeps user creation enabled if first time logging in
        shouldCreateUser: true,
      },
    });

    if (error) {
      console.error('[AuthContext] sendOtp error:', error.message);
      throw error;
    }

    return data;
  };

  /**
   * Verify the 6-digit OTP code sent to user email
   * @param {string} email
   * @param {string} token (6-digit OTP)
   */
  const verifyOtp = async (email, token) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanToken = (token || '').trim();

    const isConfigured =
      import.meta.env.VITE_SUPABASE_URL &&
      import.meta.env.VITE_SUPABASE_ANON_KEY &&
      !import.meta.env.VITE_SUPABASE_URL.includes('your-project-id');

    // If Supabase not yet configured, allow demo OTP verification
    if (!isConfigured) {
      if (cleanToken === '123456' || cleanToken.length === 6) {
        const mockUserSession = {
          user: {
            id: 'mock-user-1',
            email: cleanEmail || 'student@vestigia.app',
            user_metadata: {
              full_name: (cleanEmail || 'student').split('@')[0],
            },
          },
          access_token: 'mock-access-token',
        };
        setSession(mockUserSession);
        setUser(mockUserSession.user);
        try {
          localStorage.setItem('vestigia_demo_user', JSON.stringify(mockUserSession.user));
        } catch (_) {}
        return { data: mockUserSession, error: null };
      } else {
        throw new Error('Invalid OTP. Please enter 6 digits (or 123456).');
      }
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'email',
    });

    if (error) {
      console.error('[AuthContext] verifyOtp error:', error.message);
      throw error;
    }

    if (data?.session) {
      setSession(data.session);
      setUser(data.user);
    }

    return data;
  };

  /**
   * Log out user and clear active session
   */
  const signOut = async () => {
    try {
      localStorage.removeItem('vestigia_demo_user');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[AuthContext] signOut error:', error.message);
      }
    } catch (_) {
    } finally {
      setSession(null);
      setUser(null);
    }
  };

  const value = {
    user,
    session,
    loading,
    sendOtp,
    verifyOtp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to consume the AuthContext safely
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
