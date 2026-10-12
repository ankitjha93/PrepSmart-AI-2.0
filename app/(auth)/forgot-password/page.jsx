"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Mail, 
  KeyRound, 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { resetPassword } = useAuth();

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await resetPassword(email);
      if (error) {
        toast.error(error.message || 'Failed to send reset link.');
      } else {
        setIsSubmitted(true);
        setCooldown(60);
        toast.success('Password reset link sent to your email.');

        // Countdown timer for resend
        const timer = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-6 relative overflow-hidden bg-grid-pattern selection:bg-blue-500 selection:text-white">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Brand Logo */}
        <div className="flex justify-center">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-md p-2.5 border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Image src="/logo.svg" alt="PrepSmart AI Logo" width={34} height={34} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
                PrepSmart
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] px-2 py-0.5 rounded-full shadow-sm">
                AI 2.0
              </span>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          
          {!isSubmitted ? (
            <>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-3">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Reset Your Password
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Enter the email associated with your account and we’ll send you a secure link to reset your password.
                </p>
              </div>

              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01]"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Sending Link...
                    </span>
                  ) : (
                    'Send Password Reset Link'
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-500 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Check Your Email
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  We sent a recovery link to <span className="font-semibold text-slate-900 dark:text-white">{email}</span>. Click the link to set a new password.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  disabled={cooldown > 0 || isLoading}
                  onClick={handleReset}
                  className="w-full h-10 border-slate-200 dark:border-slate-800 text-sm"
                >
                  {cooldown > 0 ? `Resend email in ${cooldown}s` : 'Resend Reset Link'}
                </Button>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-center">
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>
        </div>

        {/* Security footer badge */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Protected by Supabase PKCE Authentication</span>
        </div>
      </div>
    </div>
  );
}
