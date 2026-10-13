"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  ShieldCheck,
  ShieldAlert,
  QrCode,
  Key,
  Copy,
  CheckCircle2,
  Loader2,
  Smartphone,
  Trash2,
} from "lucide-react";

export default function TwoFactorAuthDialog({ open, onOpenChange }) {
  const { getMfaFactors, enrollTotp, verifyTotp, unenrollTotp, isConfigured } = useAuth();
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("list"); // 'list' | 'enroll'
  const [enrollData, setEnrollData] = useState(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [backupCopied, setBackupCopied] = useState(false);

  useEffect(() => {
    if (open) {
      loadFactors();
      // Load saved backup codes if any
      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem("prepsmart_mfa_backup_codes");
          if (saved) setBackupCodes(JSON.parse(saved));
        } catch {}
      }
    } else {
      setStep("list");
      setEnrollData(null);
      setVerifyCode("");
    }
  }, [open]);

  const generateBackupCodes = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const codes = [];
    for (let i = 0; i < 8; i++) {
      let codePart1 = "";
      let codePart2 = "";
      for (let j = 0; j < 4; j++) {
        codePart1 += chars.charAt(Math.floor(Math.random() * chars.length));
        codePart2 += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      codes.push(`${codePart1}-${codePart2}`);
    }
    setBackupCodes(codes);
    if (typeof window !== "undefined") {
      localStorage.setItem("prepsmart_mfa_backup_codes", JSON.stringify(codes));
    }
    return codes;
  };

  const loadFactors = async () => {
    setLoading(true);
    try {
      const res = await getMfaFactors();
      const all = res.data?.all || res.data?.totp || [];
      setFactors(all.filter((f) => f.status === "verified"));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleStartEnroll = async () => {
    setLoading(true);
    try {
      const res = await enrollTotp("PrepSmart Authenticator");
      if (res.error) {
        toast.error("Enrollment failed: " + res.error.message);
        return;
      }
      setEnrollData(res.data);
      setStep("enroll");
    } catch (err) {
      toast.error("Error starting MFA enrollment");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEnroll = async (e) => {
    e.preventDefault();
    if (!verifyCode || verifyCode.trim().length !== 6) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }

    setVerifying(true);
    try {
      const res = await verifyTotp(enrollData.id, verifyCode.trim());
      if (res.error) {
        toast.error(res.error.message || "Invalid verification code.");
        return;
      }
      toast.success("Two-Factor Authentication activated successfully!");
      generateBackupCodes();
      setStep("backup_codes");
      setEnrollData(null);
      setVerifyCode("");
      loadFactors();
    } catch (err) {
      toast.error("Failed to verify 2FA code.");
    } finally {
      setVerifying(false);
    }
  };

  const handleUnenroll = async (factorId) => {
    if (!confirm("Are you sure you want to disable Two-Factor Authentication?")) return;
    setLoading(true);
    try {
      const res = await unenrollTotp(factorId);
      if (res.error) {
        toast.error(res.error.message || "Failed to remove factor.");
        return;
      }
      toast.success("Two-Factor Authentication factor removed.");
      if (typeof window !== "undefined") {
        localStorage.removeItem("prepsmart_mfa_backup_codes");
      }
      setBackupCodes([]);
      loadFactors();
    } catch {
      toast.error("Error removing factor");
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    if (enrollData?.totp?.secret) {
      navigator.clipboard.writeText(enrollData.totp.secret);
      setCopied(true);
      toast.success("Secret key copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyBackupCodes = () => {
    if (backupCodes.length > 0) {
      navigator.clipboard.writeText(backupCodes.join("\n"));
      setBackupCopied(true);
      toast.success("Backup recovery codes copied to clipboard!");
      setTimeout(() => setBackupCopied(false), 2000);
    }
  };

  const downloadBackupCodes = () => {
    if (backupCodes.length === 0) return;
    const content = `PREPSMART AI - 2FA EMERGENCY BACKUP CODES\nGenerated: ${new Date().toISOString()}\n\nEach code can be used once if you lose access to your authenticator app:\n\n${backupCodes.map((c, i) => `${i + 1}. ${c}`).join("\n")}\n\nKeep these codes in a secure, offline location.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prepsmart-2fa-recovery-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Backup codes downloaded as .txt");
  };

  const hasVerifiedFactor = factors.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-slate-50 to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/20 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
                Two-Factor Authentication (2FA)
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Protect your PrepSmart AI candidate profile using TOTP authenticator apps.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <span className="text-xs">Loading security factors...</span>
            </div>
          ) : step === "list" ? (
            <div className="space-y-4">
              {hasVerifiedFactor ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          Authenticator App
                        </span>
                        <Badge variant="success" className="text-[10px] py-0 px-1.5">
                          Active (AAL2)
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Your account requires a 6-digit TOTP code during sensitive logins.
                      </p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleUnenroll(factors[0].id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 shrink-0 h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-200/70 dark:bg-slate-700/60 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                        Authenticator App (TOTP)
                      </span>
                      <Badge variant="outline" className="text-[10px] py-0">
                        Disabled (AAL1)
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Use Google Authenticator, 1Password, or Authy to secure sign-in.
                    </p>
                  </div>
                </div>
              )}

              {hasVerifiedFactor && (
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Emergency Backup Codes
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-indigo-600 dark:text-indigo-400">
                      8 Single-Use Codes
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Use these backup codes to regain access if you lose your authenticator app.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (backupCodes.length === 0) generateBackupCodes();
                      setStep("backup_codes");
                    }}
                    className="w-full text-xs font-bold rounded-xl border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/50 dark:hover:bg-indigo-950/40"
                  >
                    View Emergency Backup Codes
                  </Button>
                </div>
              )}

              {!hasVerifiedFactor && (
                <Button
                  onClick={handleStartEnroll}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-bold py-5 shadow-lg shadow-indigo-600/20"
                >
                  <QrCode className="w-4 h-4 mr-2" /> Set Up Authenticator App
                </Button>
              )}
            </div>
          ) : step === "backup_codes" ? (
            /* Backup Codes Step */
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                  <Key className="w-3.5 h-3.5" /> Save Your Emergency Backup Codes
                </span>
                <p className="text-[11px] leading-relaxed text-amber-700/90 dark:text-amber-300/80">
                  Store these recovery codes in a secure, offline password manager. Each code can be redeemed once if you lose access to your device.
                </p>
              </div>

              {/* 8 Codes Grid */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                {backupCodes.map((code, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center font-mono text-xs font-bold tracking-wider text-slate-800 dark:text-slate-100 select-all"
                  >
                    <span className="text-[10px] text-slate-400 mr-1.5 font-normal">{idx + 1}.</span>
                    {code}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyBackupCodes}
                  className="rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  {backupCopied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy All Codes
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={downloadBackupCodes}
                  className="rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                >
                  Download .txt
                </Button>
              </div>

              <Button
                type="button"
                onClick={() => setStep("list")}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold py-2.5 mt-2"
              >
                I Have Safely Saved These Codes
              </Button>
            </div>
          ) : (
            /* Enrollment Step */
            <form onSubmit={handleVerifyEnroll} className="space-y-4">
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <span className="font-semibold text-slate-900 dark:text-white">
                  Step 1: Scan this QR Code
                </span>
                <p>
                  Open your authenticator app and scan the barcode below to register your account.
                </p>
              </div>

              {enrollData?.totp?.qr_code && (
                <div className="flex justify-center p-3 bg-white rounded-2xl border border-slate-200 shadow-inner w-fit mx-auto">
                  <img
                    src={enrollData.totp.qr_code}
                    alt="2FA QR Code"
                    className="w-44 h-44 object-contain"
                  />
                </div>
              )}

              {enrollData?.totp?.secret && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                  <div className="overflow-hidden">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Manual Secret Key
                    </span>
                    <code className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate block">
                      {enrollData.totp.secret}
                    </code>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={copySecret}
                    className="h-8 px-2 text-xs shrink-0"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              )}

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-900 dark:text-white">
                  Step 2: Enter 6-Digit Code
                </label>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                  className="text-center font-mono text-lg tracking-widest h-11 rounded-xl"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("list")}
                  className="w-1/2 rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={verifying || verifyCode.length !== 6}
                  className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                >
                  {verifying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Verify & Activate"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
