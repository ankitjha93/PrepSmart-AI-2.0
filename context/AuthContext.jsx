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
      // 1. Check if demo user is stored in localStorage AND demo cookie is active
      const hasDemoCookie = typeof document !== 'undefined' && document.cookie.includes('prepsmart_demo_session=true');
      const savedDemo = typeof window !== 'undefined' ? localStorage.getItem('prepsmart_demo_user') : null;
      if (savedDemo && hasDemoCookie) {
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
      } else if (typeof localStorage !== 'undefined' && savedDemo && !hasDemoCookie) {
        localStorage.removeItem('prepsmart_demo_user');
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

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
          if (mounted) {
            setSession(currentSession);
            if (currentSession?.user) {
              setUser(formatUser(currentSession.user));
              if (typeof window !== 'undefined') {
                document.cookie = 'prepsmart_user_session=true; path=/; max-age=604800; SameSite=Lax';
              }
            } else if (event === 'SIGNED_OUT') {
              if (typeof window !== 'undefined') {
                document.cookie = 'prepsmart_user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                document.cookie = 'prepsmart_demo_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
              }
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

    const handleStorageChange = (e) => {
      if (e.key === 'prepsmart_auth_sync') {
        if (e.newValue === 'signout') {
          setUser(null);
          setSession(null);
          if (typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard')) {
            window.location.href = '/sign-in';
          }
        } else if (e.newValue === 'signin') {
          supabase.auth.getSession().then(({ data: { session: s } }) => {
            if (s?.user) {
              setUser(formatUser(s.user));
              setSession(s);
            }
          });
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }

    return () => {
      mounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, [supabase, isConfigured]);

  const signIn = async ({ email, password, rememberMe = true }) => {
    const res = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (res.data?.user) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('prepsmart_demo_user');
        localStorage.setItem('prepsmart_auth_sync', `signin-${Date.now()}`);
        const maxAge = rememberMe ? 2592000 : 86400; // 30 days vs 1 day
        document.cookie = `prepsmart_user_session=true; path=/; max-age=${maxAge}; SameSite=Lax`;
      }
      setUser(formatUser(res.data.user));
    }
    return res;
  };

  const signInWithOtp = async (email) => {
    if (!isConfigured) {
      return signInDemo();
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const emailRedirectTo = `${origin}/auth/callback?next=/dashboard`;
    return await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo,
      },
    });
  };

  const signInDemo = () => {
    const demoCandidate = {
      id: 'demo-ankit-jha',
      email: '93ankitjha@gmail.com',
      user_metadata: { full_name: 'Ankit Jha' },
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('prepsmart_demo_user', JSON.stringify(demoCandidate));
      localStorage.setItem('prepsmart_auth_sync', `signin-${Date.now()}`);
      document.cookie = 'prepsmart_demo_session=true; path=/; max-age=604800; SameSite=Lax';
      document.cookie = 'prepsmart_user_session=true; path=/; max-age=604800; SameSite=Lax';
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('prepsmart_demo_user');
        localStorage.setItem('prepsmart_auth_sync', `signin-${Date.now()}`);
        document.cookie = 'prepsmart_user_session=true; path=/; max-age=604800; SameSite=Lax';
      }
      setUser(formatUser(res.data.user));
    }
    return res;
  };

  const signInWithOAuth = async ({ provider, redirectTo = '/dashboard' }) => {
    if (!isConfigured) {
      return signInDemo();
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`;
    const res = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl,
      },
    });
    return res;
  };

  const resetPassword = async (email) => {
    if (!isConfigured) {
      return { data: {}, error: null };
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const redirectTo = `${origin}/auth/callback?next=/reset-password`;
    const res = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    return res;
  };

  const updatePassword = async (newPassword) => {
    if (!isConfigured) {
      return { data: {}, error: null };
    }
    const res = await supabase.auth.updateUser({
      password: newPassword,
    });
    return res;
  };

  const updateProfile = async ({ fullName }) => {
    if (!user) return { error: new Error('User not authenticated') };
    
    // If in demo mode, update local state
    if (user.id?.startsWith('demo') || !isConfigured) {
      const updated = {
        ...user,
        fullName,
        user_metadata: { ...user.user_metadata, full_name: fullName },
      };
      setUser(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('prepsmart_demo_user', JSON.stringify(updated));
      }
      return { data: { user: updated }, error: null };
    }

    const res = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
      },
    });
    if (res.data?.user) {
      setUser(formatUser(res.data.user));
    }
    return res;
  };

  const resendVerificationEmail = async (email) => {
    if (!isConfigured) {
      return { data: {}, error: null };
    }
    const res = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    return res;
  };

  const signOut = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('prepsmart_demo_user');
      localStorage.setItem('prepsmart_auth_sync', `signout-${Date.now()}`);
      document.cookie = 'prepsmart_demo_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'prepsmart_user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
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
    if (typeof window !== 'undefined') {
      window.location.href = '/sign-in';
    } else {
      router.push('/sign-in');
    }
    return { error: null };
  };

  const isDemoUser = Boolean(
    user && (user.id?.startsWith('demo') || (typeof document !== 'undefined' && document.cookie.includes('prepsmart_demo_session=true')))
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured,
        isDemoUser,
        signIn,
        signInWithOtp,
        signInDemo,
        signUp,
        signInWithOAuth,
        resetPassword,
        updatePassword,
        updateProfile,
        resendVerificationEmail,
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
