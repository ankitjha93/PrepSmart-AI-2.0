"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const supabase = useMemo(() => createClient(), []);

  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id') &&
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('your-anon-key')
  );

  // Helper to format a user object with Clerk backwards-compatibility
  const formatUser = (rawUser) => {
    if (!rawUser) return null;
    const email = rawUser.email || rawUser.user_metadata?.email || 'user@example.com';
    return {
      ...rawUser,
      email,
      primaryEmailAddress: {
        emailAddress: email,
      },
      fullName:
        rawUser.user_metadata?.full_name ||
        rawUser.user_metadata?.name ||
        email.split('@')[0],
      imageUrl:
        rawUser.user_metadata?.avatar_url ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
    };
  };

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      // 1. Check if demo user is stored in localStorage
      const savedDemo = typeof window !== 'undefined' ? localStorage.getItem('prepsmart_demo_user') : null;
      if (savedDemo) {
        try {
          const parsed = JSON.parse(savedDemo);
          if (mounted) {
            setUser(formatUser(parsed));
            setLoading(false);
          }
          return;
        } catch {
          // ignore parse error
        }
      }

      if (!isConfigured) {
        // Default candidate user in unconfigured mode
        const defaultDemo = {
          id: 'demo-user-123',
          email: '93ankitjha@gmail.com',
          user_metadata: { full_name: 'Ankit Jha' },
        };
        if (mounted) {
          setUser(formatUser(defaultDemo));
          setLoading(false);
        }
        return;
      }

      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(initialSession);
          if (initialSession?.user) {
            setUser(formatUser(initialSession.user));
          }
          setLoading(false);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
          if (mounted) {
            setSession(currentSession);
            if (currentSession?.user) {
              setUser(formatUser(currentSession.user));
            }
            setLoading(false);
          }
        });

        return () => {
          subscription?.unsubscribe();
        };
      } catch (err) {
        console.warn('Supabase auth initialization error:', err);
        if (mounted) setLoading(false);
      }
    }

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [supabase, isConfigured]);

  const signIn = async ({ email, password }) => {
    const res = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (res.data?.user) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('prepsmart_demo_user');
      }
      setUser(formatUser(res.data.user));
    }
    return res;
  };

  const signInDemo = () => {
    const demoCandidate = {
      id: 'demo-ankit-jha',
      email: '93ankitjha@gmail.com',
      user_metadata: { full_name: 'Ankit Jha' },
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('prepsmart_demo_user', JSON.stringify(demoCandidate));
      document.cookie = 'prepsmart_demo_session=true; path=/; max-age=604800; SameSite=Lax';
    }
    setUser(formatUser(demoCandidate));
    return { data: { user: demoCandidate }, error: null };
  };

  const signUp = async ({ email, password, fullName }) => {
    const res = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (res.data?.user) {
      setUser(formatUser(res.data.user));
    }
    return res;
  };

  const signOut = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('prepsmart_demo_user');
      document.cookie = 'prepsmart_demo_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    setUser(null);
    setSession(null);
    try {
      if (isConfigured) {
        await supabase.auth.signOut();
      }
    } catch {
      // ignore
    }
    router.push('/sign-in');
    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured,
        signIn,
        signInDemo,
        signUp,
        signOut,
        supabase,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Seamless drop-in replacement for Clerk's useUser hook
export function useUser() {
  const context = useContext(AuthContext);
  return {
    user: context?.user || null,
    isLoaded: !context?.loading,
    isSignedIn: Boolean(context?.user),
  };
}
