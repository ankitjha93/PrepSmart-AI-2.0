"use client";

import React, { useState, useMemo } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { 
  User, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  LogOut, 
  KeyRound, 
  Mail, 
  Fingerprint, 
  AlertTriangle,
  ArrowRight,
  Smartphone,
  Laptop,
  Calendar,
  Globe,
  Radio
} from "lucide-react";
import TwoFactorAuthDialog from "./TwoFactorAuthDialog";

export default function AccountSettingsDialog({ open, onOpenChange }) {
  const { user, isDemoUser, updateProfile, updatePassword, signOut, signOutOthers, signOutGlobal } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'session'
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
  const [isInvalidatingOthers, setIsInvalidatingOthers] = useState(false);
  
  // Profile state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Dynamic Password Strength Meter
  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (newPassword.length >= 6) score += 1;
    if (newPassword.length >= 8) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500', text: 'text-red-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-blue-500', text: 'text-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500' };
  }, [newPassword]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Please enter a display name.');
      return;
    }
    setIsUpdatingProfile(true);
    try {
      const { error } = await updateProfile({ fullName: fullName.trim() });
      if (error) {
        toast.error(error.message || 'Failed to update profile.');
      } else {
        toast.success('Display name updated successfully!');
      }
    } catch (err) {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in both password fields.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        toast.error(error.message || 'Failed to update password.');
      } else {
        toast.success('Password updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error('Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSwitchAccount = async () => {
    onOpenChange(false);
    await signOut();
  };

  const handleSignOutOthers = async () => {
    setIsInvalidatingOthers(true);
    try {
      const res = await signOutOthers();
      if (res?.error) {
        toast.error('Failed to invalidate sessions: ' + res.error.message);
      } else {
        toast.success('Successfully signed out of all other devices and tabs!');
      }
    } catch {
      toast.error('Could not revoke sessions.');
    } finally {
      setIsInvalidatingOthers(false);
    }
  };

  const handleSignOutGlobal = async () => {
    onOpenChange(false);
    toast.info('Terminating all sessions across all devices...');
    await signOutGlobal();
  };

  // Format candidate metadata
  const provider = user?.app_metadata?.provider || (isDemoUser ? 'demo' : 'email');
  const isEmailVerified = Boolean(user?.email_confirmed_at || isDemoUser);
  const createdAtFormatted = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Recent';
  const lastSignInFormatted = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })
    : 'Active now';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
        
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <DialogHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                    Candidate Account Settings
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Manage your credentials, security settings, and session status.
                  </DialogDescription>
                </div>
              </div>
              {isDemoUser ? (
                <Badge variant="warning" className="text-[10px] font-black uppercase px-2 py-0.5 shrink-0 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  Demo Mode Active
                </Badge>
              ) : (
                <Badge variant="success" className="text-[10px] font-black uppercase px-2 py-0.5 shrink-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Supabase Verified
                </Badge>
              )}
            </div>
          </DialogHeader>

          {/* Navigation Tabs */}
          <div className="flex gap-1.5 mt-5 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'profile'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Profile Info
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'security'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Password & Security
            </button>
            <button
              onClick={() => setActiveTab('session')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'session'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Session & Tier
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-6 space-y-4">
          
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Primary Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || 'user@example.com'}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Email addresses are authenticated via Supabase and cannot be modified directly.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs px-5 h-10 shadow-md"
                >
                  {isUpdatingProfile ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </span>
                  ) : (
                    'Save Profile Changes'
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* TAB 2: SECURITY & PASSWORD */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                <KeyRound className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Update your password directly without signing out. We recommend at least 8 characters with numbers and symbols.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />

                {newPassword && (
                  <div className="pt-1 space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">Password Strength:</span>
                      <span className={`font-semibold ${passwordStrength.text}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 h-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`h-full rounded-full transition-all duration-300 ${
                            step <= passwordStrength.score ? passwordStrength.color : 'bg-slate-200 dark:bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs px-5 h-10 shadow-md"
                >
                  {isUpdatingPassword ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating...
                    </span>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </div>

              {/* 2FA Card */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 flex items-center justify-between gap-3 mt-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        Two-Factor Authentication (TOTP)
                      </span>
                      <Badge variant="outline" className="text-[10px] py-0">
                        MFA Ready
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Add an authenticator app (Google Authenticator, Authy, 1Password) for enhanced security.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => setShowTwoFactorDialog(true)}
                  className="text-xs font-bold rounded-xl shrink-0 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950"
                >
                  Configure 2FA
                </Button>
              </div>
            </form>
          )}

          {/* TAB 3: SESSION, AUDIT & DEVICES */}
          {activeTab === 'session' && (
            <div className="space-y-4">
              {/* Security Audit Information */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
                <div className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 pb-1 border-b border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <span>Security & Account Metadata</span>
                  <Badge variant="blue" className="text-[10px] py-0">
                    Audited
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Auth Provider</span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">
                      <Globe className="w-3.5 h-3.5 text-indigo-500" />
                      {provider}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Email Status</span>
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isEmailVerified ? 'Verified' : 'Pending'}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Member Since</span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {createdAtFormatted}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Last Activity</span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                      <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                      {lastSignInFormatted}
                    </div>
                  </div>
                </div>
              </div>

              {/* Multi-Device Session Invalidation */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Laptop className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      Multi-Device Session Invalidation
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Notice suspicious logins? Invalidate all other active sessions while remaining signed in here.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={isInvalidatingOthers}
                    onClick={handleSignOutOthers}
                    className="text-xs font-bold rounded-xl border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100/60 dark:hover:bg-amber-950/50"
                  >
                    {isInvalidatingOthers ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Revoking...
                      </span>
                    ) : (
                      'Sign Out All Other Devices'
                    )}
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleSignOutGlobal}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold rounded-xl"
                  >
                    Sign Out Everywhere
                  </Button>
                </div>
              </div>

              {isDemoUser && (
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>You are currently in Demo Mode</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/80">
                    Demo candidate accounts allow instant evaluations. Sign out to log in with your personal credentials or link your Google / GitHub account.
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSwitchAccount}
                  className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900/50 font-bold rounded-xl"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  Sign Out of This Browser
                </Button>

                <Button
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="text-xs font-bold rounded-xl"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>

    {/* Standalone 2FA Dialog */}
    <TwoFactorAuthDialog
      open={showTwoFactorDialog}
      onOpenChange={setShowTwoFactorDialog}
    />
  </>
  );
}
