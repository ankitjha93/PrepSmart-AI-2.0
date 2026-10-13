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

  const uploadAvatar = async (file) => {
    if (!user) return { error: new Error('User not authenticated') };
    if (!file) return { error: new Error('No file provided') };

    // File validation: type and size (max 5MB)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return { error: new Error('Please upload a valid image file (JPG, PNG, WebP, or GIF).') };
    }
    if (file.size > 5 * 1024 * 1024) {
      return { error: new Error('Image size must be smaller than 5MB.') };
    }

    try {
      if (isConfigured && !user.id?.startsWith('demo')) {
        const fileExt = file.name.split('.').pop() || 'png';
        const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

        // 1. Upload to Supabase Storage bucket 'avatars'
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file, { upsert: true });

        if (uploadError) {
          console.warn('Storage upload note:', uploadError.message);
        }

        // 2. Get Public URL
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        const avatarUrl = publicUrlData?.publicUrl || URL.createObjectURL(file);

        // 3. Update auth user metadata
        const updateRes = await supabase.auth.updateUser({
          data: { avatar_url: avatarUrl },
        });

        // 4. Update profiles table if it exists
        try {
          await supabase
            .from('profiles')
            .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
            .eq('id', user.id);
        } catch {}

        if (updateRes.data?.user) {
          const updatedUser = formatUser(updateRes.data.user);
          setUser(updatedUser);
        }

        if (typeof window !== 'undefined') {
          localStorage.setItem('prepsmart_auth_sync', `avatar-${Date.now()}`);
        }

        return { data: { avatarUrl }, error: null };
      } else {
        // Fallback for Demo Mode or offline dev: Convert to persistent Data URL
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result;
            const updated = {
              ...user,
              imageUrl: dataUrl,
              user_metadata: { ...user.user_metadata, avatar_url: dataUrl },
            };
            setUser(updated);
            if (typeof window !== 'undefined') {
              localStorage.setItem('prepsmart_demo_user', JSON.stringify(updated));
              localStorage.setItem('prepsmart_auth_sync', `avatar-${Date.now()}`);
            }
            resolve({ data: { avatarUrl: dataUrl }, error: null });
          };
          reader.onerror = () => resolve({ error: new Error('Failed to read image file') });
          reader.readAsDataURL(file);
        });
      }
    } catch (err) {
      return { error: err };
    }
  };

  const linkIdentity = async ({ provider }) => {
    if (!isConfigured || user?.id?.startsWith('demo')) {
      // Demo simulated linking
      const existingIdentities = user?.identities || [];
      const updated = {
        ...user,
        identities: [
          ...existingIdentities.filter(i => i.provider !== provider),
          { id: `demo-${provider}-${Date.now()}`, provider, identity_data: { email: user.email } }
        ]
      };
      setUser(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('prepsmart_demo_user', JSON.stringify(updated));
      }
      return { data: { provider }, error: null };
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const callbackUrl = `${origin}/auth/callback?next=/dashboard`;
    return await supabase.auth.linkIdentity({
      provider,
      options: {
        redirectTo: callbackUrl,
      },
    });
  };

  const unlinkIdentity = async (identityId) => {
    if (!isConfigured || user?.id?.startsWith('demo')) {
      // Demo simulated unlinking
      const updated = {
        ...user,
        identities: (user?.identities || []).filter(i => i.id !== identityId && i.provider !== identityId),
      };
      setUser(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('prepsmart_demo_user', JSON.stringify(updated));
      }
      return { data: {}, error: null };
    }

    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const identity = currentUser?.identities?.find(i => i.id === identityId || i.provider === identityId);
    if (!identity) {
      return { error: new Error('Identity not found') };
    }
    return await supabase.auth.unlinkIdentity(identity);
  };

  const exportUserData = async () => {
    if (!user) return { error: new Error('No active user session') };

    try {
      // Collect local interview records if any
      let localInterviews = [];
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('prepsmart_interviews_cache');
          if (stored) localInterviews = JSON.parse(stored);
        } catch {}
      }

      const exportPayload = {
        platform: "PrepSmart AI",
        version: "2.0",
        exportTimestamp: new Date().toISOString(),
        candidate: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          avatarUrl: user.imageUrl,
          accountCreated: user.created_at || 'Recent',
          authProvider: user.app_metadata?.provider || 'email',
          isEmailVerified: Boolean(user.email_confirmed_at),
          userMetadata: user.user_metadata || {},
        },
        sessions: {
          currentDevice: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
          lastActive: new Date().toISOString(),
        },
        interviews: localInterviews,
      };

      const jsonStr = JSON.stringify(exportPayload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prepsmart-candidate-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { data: { success: true }, error: null };
    } catch (err) {
      return { error: err };
    }
  };

  const deleteAccount = async () => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      if (isConfigured && !user.id?.startsWith('demo')) {
        // Remove profile row if accessible
        try {
          await supabase.from('profiles').delete().eq('id', user.id);
        } catch {}
      }
      await signOut();
      return { data: { deleted: true }, error: null };
    } catch (err) {
      return { error: err };
    }
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

  const signOutOthers = async () => {
    if (isConfigured && supabase?.auth?.signOut) {
      try {
        const res = await supabase.auth.signOut({ scope: 'others' });
        return res;
      } catch (err) {
        return { error: err };
      }
    }
    return { data: {}, error: null };
  };

  const signOutGlobal = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('prepsmart_demo_user');
      localStorage.setItem('prepsmart_auth_sync', `signout-${Date.now()}`);
      document.cookie = 'prepsmart_demo_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'prepsmart_user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    setUser(null);
    setSession(null);
    if (isConfigured && supabase?.auth?.signOut) {
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch {}
    }
    if (typeof window !== 'undefined') {
      window.location.href = '/sign-in';
    } else {
      router.push('/sign-in');
    }
    return { error: null };
  };

  const getMfaFactors = async () => {
    if (!isConfigured || !supabase?.auth?.mfa) {
      return { data: { all: [], totp: [] }, error: null };
    }
    return await supabase.auth.mfa.listFactors();
  };

  const enrollTotp = async (friendlyName = 'PrepSmart Authenticator') => {
    if (!isConfigured || !supabase?.auth?.mfa) {
      return {
        data: {
          id: 'demo-factor-totp',
          type: 'totp',
          totp: {
            secret: 'JBSWY3DPEHPK3PXP',
            qr_code: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="white"/><text x="50%" y="50%" font-size="14" text-anchor="middle" fill="black">Demo Authenticator QR</text></svg>',
            uri: 'otpauth://totp/PrepSmart:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=PrepSmart'
          }
        },
        error: null
      };
    }
    return await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName,
    });
  };

  const verifyTotp = async (factorId, code) => {
    if (!isConfigured || !supabase?.auth?.mfa) {
      return { data: { verified: true }, error: null };
    }
    const challengeRes = await supabase.auth.mfa.challenge({ factorId });
    if (challengeRes.error) return challengeRes;
    return await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeRes.data.id,
      code,
    });
  };

  const unenrollTotp = async (factorId) => {
    if (!isConfigured || !supabase?.auth?.mfa) {
      return { data: { id: factorId }, error: null };
    }
    return await supabase.auth.mfa.unenroll({ factorId });
  };

  const getAal = async () => {
    if (!isConfigured || !supabase?.auth?.mfa) {
      return { data: { currentLevel: 'aal1', nextLevel: 'aal1' }, error: null };
    }
    return await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
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
        uploadAvatar,
        linkIdentity,
        unlinkIdentity,
        exportUserData,
        deleteAccount,
        resendVerificationEmail,
        signOut,
        signOutOthers,
        signOutGlobal,
        getMfaFactors,
        enrollTotp,
        verifyTotp,
        unenrollTotp,
        getAal,
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
