"use client";

import React from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

/**
 * Standard FormMessage component matching Supabase with-supabase template.
 * Displays formatted error, success, or informational feedback banners.
 */
export default function FormMessage({ message }) {
  if (!message) return null;

  const errorMessage = typeof message === "string" ? message : message.error;
  const successMessage = message.success;
  const infoMessage = message.message && !message.error && !message.success ? message.message : null;

  if (errorMessage) {
    return (
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span className="leading-relaxed">{errorMessage}</span>
      </div>
    );
  }

  if (successMessage) {
    return (
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          {typeof successMessage === "string" ? successMessage : message.message || "Operation completed successfully."}
        </span>
      </div>
    );
  }

  if (infoMessage) {
    return (
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <span className="leading-relaxed">{infoMessage}</span>
      </div>
    );
  }

  return null;
}
