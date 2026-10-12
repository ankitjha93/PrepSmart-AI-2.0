"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  Eye, 
  EyeOff, 
  Mic, 
  Brain, 
  Star, 
  Activity, 
  ShieldCheck,
  Zap,
  Users
} from 'lucide-react';

export default function SignUpPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading, signUp, signIn, signInDemo } = useAuth();
  const router = useRouter();

  // Automatically redirect if already signed in
  useEffect(() => {
    if (!loading && user) {
      window.location.href = '/dashboard';
    }
  }, [user, loading]);

  // Dynamic Password Strength Meter Calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500', text: 'text-red-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-blue-500', text: 'text-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500' };
  }, [password]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast.error('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await signUp({ email, password, fullName });
      if (error) {
        toast.error(error.message || 'Failed to create account.');
        setIsLoading(false);
      } else {
        toast.success('Account created successfully! Welcome to PrepSmart AI.');
        window.location.href = '/dashboard';
      }
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setIsLoading(true);
    try {
      signInDemo();
      toast.success('Signed in as Demo Candidate (Ankit Jha)! Redirecting...');
      window.location.href = '/dashboard';
    } catch (err) {
      toast.error('Demo sign-in failed.');
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
            Start preparing with intelligent AI interview coaching.
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Create your account to unlock unlimited mock interview simulations, audio transcription analytics, and personalized feedback reports.
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
              Create an Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Sign up in seconds to start practicing with AI interview coaching.
            </p>
          </div>

          {/* Quick 1-Click Demo Candidate Bypass */}
          <button
            type="button"
            onClick={handleDemoSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all duration-200 group transform active:scale-[0.99] cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
            <span className="text-white font-semibold tracking-wide">Instant 1-Click Test Drive (Demo Mode)</span>
            <ArrowRight className="w-4 h-4 text-blue-200 group-hover:translate-x-1 transition-transform ml-1" />
          </button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-medium">Or register with email</span>
            </div>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ankit Jha"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 transition"
                />
              </div>
            </div>

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
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (min 6 characters)"
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

              {/* Password Strength Meter */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Password Strength:</span>
                    <span className={`font-bold ${passwordStrength.text}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`rounded-full transition-all duration-300 ${
                          passwordStrength.score >= step ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
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
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
            </Button>
          </form>

          {/* Privacy Guarantee Micro-Copy */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 text-center flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Camera feeds run 100% locally and are never stored or recorded.</span>
          </div>

          <div className="text-center text-xs text-slate-500 pt-1">
            Already have an account?{' '}
            <Link
              href="/sign-in"
              className="text-blue-600 hover:text-blue-700 font-bold hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}