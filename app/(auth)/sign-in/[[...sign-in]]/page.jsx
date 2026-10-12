"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  ArrowRight, 
  Lock, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  Eye, 
  EyeOff, 
  Mic, 
  Star, 
  Activity, 
  ShieldCheck,
  AlertCircle 
} from 'lucide-react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState('password'); // 'password' | 'otp'
  const [otpEmail, setOtpEmail] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [rememberMe, setRememberMe] = useState(true);

  const { user, loading, signIn, signInWithOtp, signInDemo, signInWithOAuth } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirectedFrom') || '/dashboard';
  // Sanitize redirectedFrom against open redirects
  const redirectedFrom = rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/dashboard';
  const errorParam = searchParams.get('error');
  const [errorMessage, setErrorMessage] = useState(errorParam || '');

  // Automatically redirect if already signed in
  useEffect(() => {
    if (!loading && user) {
      window.location.href = redirectedFrom;
    }
  }, [user, loading, redirectedFrom]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await signIn({ email, password, rememberMe });
      if (error) {
        toast.error(error.message || 'Invalid login credentials.');
        setErrorMessage(error.message || 'Invalid login credentials.');
        setIsLoading(false);
      } else {
        toast.success('Successfully signed in! Redirecting to dashboard...');
        window.location.href = redirectedFrom;
      }
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    if (!otpEmail) {
      toast.error('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signInWithOtp(otpEmail);
      if (error) {
        toast.error(error.message || 'Failed to send magic link.');
        setErrorMessage(error.message || 'Failed to send magic link.');
        setIsLoading(false);
      } else {
        setIsOtpSent(true);
        setOtpCooldown(60);
        toast.success('Magic sign-in link sent to your email!');
        const timer = setInterval(() => {
          setOtpCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        setIsLoading(false);
      }
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      signInDemo();
      toast.success('Signed in as Demo Candidate (Ankit Jha)! Redirecting...');
      window.location.href = redirectedFrom;
    } catch (err) {
      toast.error('Demo sign-in failed.');
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    setIsLoading(true);
    try {
      const { error } = await signInWithOAuth({ provider, redirectTo: redirectedFrom });
      if (error) {
        toast.error(error.message || `Failed to sign in with ${provider}`);
        setErrorMessage(error.message || `Failed to sign in with ${provider}`);
        setIsLoading(false);
      }
    } catch (err) {
      toast.error(err.message || 'OAuth sign in failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row bg-grid-pattern selection:bg-blue-500 selection:text-white">
      
      {/* ===================================================================== */}
      {/* LEFT SHOWCASE PANEL                                                   */}
      {/* ===================================================================== */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] relative overflow-hidden flex-col justify-between p-12 text-white border-r border-slate-800">
        
        {/* Ambient Gradient Orbs */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-[#0F172A] to-slate-950 pointer-events-none" />
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-xl p-2 border border-white/20 flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
              <Image src="/logo.svg" alt="PrepSmart AI Logo" width={32} height={32} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-white">
                PrepSmart
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] px-2 py-0.5 rounded-full shadow-sm">
                AI 2.0
              </span>
            </div>
          </Link>
        </div>

        {/* Central Content with Live Mock Session Widget */}
        <div className="relative z-10 max-w-lg space-y-6 my-auto py-8">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Supabase Auth & Multi-Model Gemini 3.5 AI
          </div>

          <h1 className="text-4xl font-black tracking-tight text-white leading-tight">
            Nail your next interview with real-time AI guidance.
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Practice job-specific technical and behavioral questions, capture audio answers with live spectrum visualization, and receive instantaneous feedback from Google Gemini.
          </p>

          {/* Interactive Floating Live Session Card */}
          <div className="rounded-2xl p-5 bg-slate-900/80 border border-slate-700/80 shadow-2xl backdrop-blur-xl space-y-3.5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400" />
            
            {/* Header with Live Mic Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-200">Full Stack System Architecture</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
                <Star className="w-3 h-3 fill-emerald-400" />
                <span>9.7 / 10</span>
              </div>
            </div>

            {/* Question Snippet */}
            <p className="text-xs text-slate-300 font-medium italic bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
              &ldquo;How do you optimize distributed cache invalidation during rapid database mutations?&rdquo;
            </p>

            {/* Live Audio Spectrum Equalizer */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Mic className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-end gap-1 h-4">
                  {[30, 85, 45, 100, 70, 40, 90, 60, 95, 50, 75, 40].map((h, i) => (
                    <span 
                      key={i} 
                      style={{ height: `${h}%` }} 
                      className="w-1 rounded-full bg-gradient-to-t from-blue-500 to-emerald-400 animate-wave-bar" 
                    />
                  ))}
                </div>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 animate-spin" /> Speech Transcribed
              </span>
            </div>
          </div>

          {/* Social Proof Avatar Stack */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex -space-x-2">
              {['alex', 'priya', 'marcus', 'sara'].map((seed, i) => (
                <img 
                  key={i}
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=2563eb,10b981,6366f1,0f172a`} 
                  alt="Candidate Avatar"
                  className="w-8 h-8 rounded-full border-2 border-[#0F172A] shadow-sm"
                />
              ))}
            </div>
            <div className="text-xs text-slate-300">
              <span className="font-bold text-white">15,000+ candidates</span> practicing for top-tier tech offers
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="relative z-10 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-6">
          <span>&copy; {new Date().getFullYear()} PrepSmart AI. All rights reserved.</span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Supabase Protected
          </span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* RIGHT AUTH CARD FORM                                                  */}
      {/* ===================================================================== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 relative z-10">
          
          {/* Mobile Logo Header */}
          <div className="lg:hidden flex items-center gap-2.5 justify-center mb-1">
            <Image src="/logo.svg" alt="PrepSmart AI Logo" width={32} height={32} />
            <span className="font-extrabold text-xl text-slate-900 dark:text-white">
              PrepSmart <span className="text-blue-600">AI 2.0</span>
            </span>
          </div>

          <div className="text-center space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Sign In to Your Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Enter your credentials or choose 1-click social sign-in.
            </p>
          </div>

          {/* Error Banner if error query param or submit failure */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-xs text-red-600 dark:text-red-400 flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick 1-Click Demo Candidate Bypass */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all duration-200 group transform active:scale-[0.99] cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
            <span className="text-white font-semibold tracking-wide">Instant 1-Click Test Drive (Demo Mode)</span>
            <ArrowRight className="w-4 h-4 text-blue-200 group-hover:translate-x-1 transition-transform ml-1" />
          </button>

          {/* Social OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuthLogin('github')}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <svg className="w-4 h-4 shrink-0 fill-current text-slate-900 dark:text-white" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          {/* Method Selector Tabs: Password vs Magic Link */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('password');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                authMethod === 'password'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('otp');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
                authMethod === 'otp'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Passwordless (Magic Link)</span>
            </button>
          </div>

          {authMethod === 'password' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 rounded-md"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Remember me for 30 days
                  </span>
                </label>
              </div>

              {/* Submit Button with Shimmer Sweep */}
              <Button
                type="submit"
                disabled={isLoading}
                className="relative overflow-hidden w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/25 transition-all group mt-2"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
                <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
              </Button>
            </form>
          ) : (
            /* Magic Link View */
            <div className="space-y-4">
              {!isOtpSent ? (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 transition"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                      We’ll email you a secure 1-click login link. No password required.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="relative overflow-hidden w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/25 transition-all group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending Link...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>Send 1-Click Magic Link</span>
                        </>
                      )}
                    </span>
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-3.5 py-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-500 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Magic Link Sent!
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Check your inbox at <span className="font-semibold text-slate-900 dark:text-white">{otpEmail}</span>. Click the link to log in directly.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    disabled={otpCooldown > 0 || isLoading}
                    onClick={handleMagicLink}
                    className="w-full text-xs font-semibold h-10 border-slate-200 dark:border-slate-800"
                  >
                    {otpCooldown > 0 ? `Resend link in ${otpCooldown}s` : 'Resend Magic Link'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Privacy Guarantee Micro-Copy */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-center flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Camera feeds run 100% locally and are never stored or recorded.</span>
          </div>

          <div className="text-center text-xs text-slate-500 pt-1">
            Don&apos;t have an account yet?{' '}
            <Link
              href="/sign-up"
              className="text-blue-600 hover:text-blue-700 font-bold hover:underline"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}