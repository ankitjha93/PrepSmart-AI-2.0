"use client";

import React, { useState, useMemo, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  AlertTriangle,
  ArrowRight,
  Smartphone,
  Laptop,
  Calendar,
  Globe,
  Radio,
  Camera,
  Download,
  Trash2,
  Share2,
  ExternalLink,
  Shield,
  Clock,
  HardDrive
} from "lucide-react";
import TwoFactorAuthDialog from "./TwoFactorAuthDialog";

export default function AccountSettingsDialog({ open, onOpenChange }) {
  const { 
    user, 
    isDemoUser, 
    updateProfile, 
    updatePassword, 
    uploadAvatar,
    linkIdentity,
    unlinkIdentity,
    exportUserData,
    deleteAccount,
    signOut, 
    signOutOthers, 
    signOutGlobal 
  } = useAuth();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'accounts' | 'sessions' | 'privacy'
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
  const [isInvalidatingOthers, setIsInvalidatingOthers] = useState(false);
  
  // Profile & Avatar state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Data Export & Deletion state
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Social linking state
  const [linkingProvider, setLinkingProvider] = useState(null);

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

  // Detected device metadata
  const deviceOS = useMemo(() => {
    if (typeof navigator === 'undefined') return 'Desktop Device';
    const ua = navigator.userAgent;
    if (ua.includes('Win')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Web Browser';
  }, []);

  const deviceBrowser = useMemo(() => {
    if (typeof navigator === 'undefined') return 'Web Browser';
    const ua = navigator.userAgent;
    if (ua.includes('Edg')) return 'Microsoft Edge';
    if (ua.includes('Chrome')) return 'Google Chrome';
    if (ua.includes('Firefox')) return 'Mozilla Firefox';
    if (ua.includes('Safari')) return 'Apple Safari';
    return 'Browser Session';
  }, []);

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
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const res = await uploadAvatar(file);
      if (res?.error) {
        toast.error(res.error.message || 'Could not upload avatar image.');
      } else {
        toast.success('Profile avatar updated successfully!');
      }
    } catch {
      toast.error('Failed to update avatar photo.');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
    } catch {
      toast.error('Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLinkSocial = async (provider) => {
    setLinkingProvider(provider);
    try {
      const res = await linkIdentity({ provider });
      if (res?.error) {
        toast.error(`Could not link ${provider}: ${res.error.message}`);
      } else {
        toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} account connected!`);
      }
    } catch {
      toast.error(`Error connecting ${provider}`);
    } finally {
      setLinkingProvider(null);
    }
  };

  const handleUnlinkSocial = async (identityId, providerName) => {
    try {
      const res = await unlinkIdentity(identityId);
      if (res?.error) {
        toast.error(`Could not disconnect ${providerName}: ${res.error.message}`);
      } else {
        toast.success(`${providerName} disconnected successfully.`);
      }
    } catch {
      toast.error(`Failed to disconnect ${providerName}`);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await exportUserData();
      if (res?.error) {
        toast.error('Failed to export candidate records: ' + res.error.message);
      } else {
        toast.success('Your complete interview archive has been downloaded!');
      }
    } catch {
      toast.error('Could not export candidate archive.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm account removal.');
      return;
    }
    setIsDeleting(true);
    try {
      const res = await deleteAccount();
      if (res?.error) {
        toast.error('Failed to delete account: ' + res.error.message);
        setIsDeleting(false);
      } else {
        toast.success('Account and associated interview records deleted.');
        onOpenChange(false);
      }
    } catch {
      toast.error('Could not complete account deletion.');
      setIsDeleting(false);
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

  // Connected accounts check
  const isGoogleLinked = user?.identities?.some(i => i.provider === 'google') || provider === 'google';
  const isGithubLinked = user?.identities?.some(i => i.provider === 'github') || provider === 'github';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
          
          {/* Header */}
          <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
                      Candidate Account Settings
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                      Manage your profile, active devices, connected accounts, and security.
                    </DialogDescription>
                  </div>
                </div>
                {isDemoUser ? (
                  <Badge variant="warning" className="text-[10px] font-black uppercase px-2 py-0.5 shrink-0 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    Demo Mode Active
                  </Badge>
                ) : (
                  <Badge variant="success" className="text-[10px] font-black uppercase px-2 py-0.5 shrink-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Enterprise Auth Verified
                  </Badge>
                )}
              </div>
            </DialogHeader>

            {/* Navigation Tabs */}
            <div className="flex gap-1 mt-5 p-1 bg-slate-200/60 dark:bg-slate-800/80 rounded-2xl overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Profile & Photo
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'security'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Password & 2FA
              </button>
              <button
                onClick={() => setActiveTab('accounts')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'accounts'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Connected Accounts
              </button>
              <button
                onClick={() => setActiveTab('sessions')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'sessions'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Sessions & Devices
              </button>
              <button
                onClick={() => setActiveTab('privacy')}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'privacy'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Data & Privacy
              </button>
            </div>
          </div>

          {/* Tab Body */}
          <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
            
            {/* TAB 1: PROFILE & AVATAR PHOTO */}
            {activeTab === 'profile' && (
              <div className="space-y-5">
                {/* Custom Avatar Upload Section */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center gap-4">
                  <div className="relative group shrink-0">
                    <Avatar className="w-16 h-16 rounded-2xl border-2 border-blue-500/30 shadow-md">
                      <AvatarImage src={user?.imageUrl} alt={user?.fullName} className="object-cover" />
                      <AvatarFallback className="bg-blue-600 text-white font-black text-lg">
                        {user?.fullName?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="absolute inset-0 bg-black/50 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Camera className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="flex-1 space-y-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Profile Avatar
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Upload a custom photo (JPG, PNG, WebP up to 5MB). Syncs automatically with your navbar and mock interview reports.
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      onChange={handleAvatarFileChange}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isUploadingAvatar}
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-bold rounded-xl mt-1 h-8"
                    >
                      {isUploadingAvatar ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
                        </span>
                      ) : (
                        'Upload New Photo'
                      )}
                    </Button>
                  </div>
                </div>

                {/* Display Name & Email Form */}
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Candidate Display Name
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
                      Registered Email Address
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
                      Primary sign-in identity verified via Supabase Authentication.
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
              </div>
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
                    Confirm New Password
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

                {/* 2FA Card with Emergency Backup Codes indicator */}
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 flex items-center justify-between gap-3 mt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          Two-Factor Authentication (TOTP + Backup Codes)
                        </span>
                        <Badge variant="outline" className="text-[10px] py-0 text-indigo-600 dark:text-indigo-400">
                          MFA Enabled
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Enforce a 6-digit TOTP code and emergency backup recovery codes on login.
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
                    Manage 2FA
                  </Button>
                </div>
              </form>
            )}

            {/* TAB 3: CONNECTED SOCIAL ACCOUNTS */}
            {activeTab === 'accounts' && (
              <div className="space-y-4">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Connect multiple identity providers to your account for seamless 1-click login from anywhere.
                </div>

                {/* Google Connection Card */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          Google Identity
                        </span>
                        {isGoogleLinked && (
                          <Badge variant="success" className="text-[10px] py-0">
                            Connected
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {isGoogleLinked ? `Linked to ${user?.email}` : 'Sign in instantly with your Google account.'}
                      </p>
                    </div>
                  </div>

                  {isGoogleLinked ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnlinkSocial('google', 'Google')}
                      className="text-xs text-slate-600 dark:text-slate-400 rounded-xl"
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleLinkSocial('google')}
                      disabled={linkingProvider === 'google'}
                      className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                    >
                      {linkingProvider === 'google' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Connect'}
                    </Button>
                  )}
                </div>

                {/* GitHub Connection Card */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          GitHub Developer Identity
                        </span>
                        {isGithubLinked && (
                          <Badge variant="success" className="text-[10px] py-0">
                            Connected
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {isGithubLinked ? 'Linked to your GitHub profile.' : 'Connect your developer profile for coding interview sync.'}
                      </p>
                    </div>
                  </div>

                  {isGithubLinked ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnlinkSocial('github', 'GitHub')}
                      className="text-xs text-slate-600 dark:text-slate-400 rounded-xl"
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleLinkSocial('github')}
                      disabled={linkingProvider === 'github'}
                      className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-xl"
                    >
                      {linkingProvider === 'github' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Connect'}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: SESSIONS, DEVICES & AUDIT LOG */}
            {activeTab === 'sessions' && (
              <div className="space-y-4">
                {/* Current Active Device */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Current Active Device
                      </span>
                    </div>
                    <Badge variant="success" className="text-[10px] py-0">
                      This Session
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 pt-1 text-xs text-slate-700 dark:text-slate-300">
                    <Laptop className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold block">{deviceBrowser} on {deviceOS}</span>
                      <span className="text-[11px] text-slate-400">Last active: Just now • Session authenticated</span>
                    </div>
                  </div>
                </div>

                {/* Multi-Device Session Invalidation */}
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white block">
                        Remote Session Revocation
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Logged in on a public or shared computer? Invalidate all other active sessions while staying authenticated here.
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
                        'Log Out Other Devices'
                      )}
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleSignOutGlobal}
                      className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold rounded-xl"
                    >
                      Log Out Everywhere
                    </Button>
                  </div>
                </div>

                {/* Security Audit Timeline */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-500" /> Recent Security Activity
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Audit Log</span>
                  </div>
                  
                  <div className="space-y-2 pt-1 text-[11px]">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>• Authenticated Session Established</span>
                      <span className="font-mono text-[10px] text-slate-400">{lastSignInFormatted}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>• Account Created</span>
                      <span className="font-mono text-[10px] text-slate-400">{createdAtFormatted}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: DATA EXPORT & DANGER ZONE */}
            {activeTab === 'privacy' && (
              <div className="space-y-5">
                {/* 1. Export Data Card (GDPR) */}
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-900 dark:text-white block">
                        Export Candidate Profile & Interview Records
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Download a formatted JSON archive of your past mock interviews, feedback scores, and profile data.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    disabled={isExporting}
                    onClick={handleExportData}
                    className="text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                  >
                    {isExporting ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Exporting...
                      </span>
                    ) : (
                      'Download Data'
                    )}
                  </Button>
                </div>

                {/* 2. Danger Zone: Delete Account */}
                <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-red-900 dark:text-red-300 block">
                        Danger Zone: Delete Candidate Account
                      </span>
                      <p className="text-[11px] text-red-700/80 dark:text-red-400/80 mt-0.5 leading-relaxed">
                        Permanently delete your profile and wipe all AI interview history and scoring records. This action cannot be reversed.
                      </p>
                    </div>
                  </div>

                  {!showDeleteConfirm ? (
                    <div className="flex justify-end pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="text-xs text-red-600 border-red-300 dark:border-red-800 hover:bg-red-100/50 dark:hover:bg-red-950/50 font-bold rounded-xl"
                      >
                        Delete My Account...
                      </Button>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-red-300 dark:border-red-800 space-y-2.5">
                      <div className="text-xs font-bold text-red-600 dark:text-red-400">
                        Type <span className="font-mono bg-red-100 dark:bg-red-950/60 px-1 py-0.5 rounded">DELETE</span> to confirm permanent deletion:
                      </div>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="DELETE"
                        className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/30 text-red-900 dark:text-red-100 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeleteConfirmText('');
                          }}
                          className="text-xs rounded-xl"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                          onClick={handleDeleteAccount}
                          className="text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md"
                        >
                          {isDeleting ? (
                            <span className="flex items-center gap-1.5">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
                            </span>
                          ) : (
                            'Confirm Permanent Deletion'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Footer Bar */}
          <div className="p-4 px-6 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
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
              className="text-xs font-bold rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900"
            >
              Done
            </Button>
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
