"use client";
import React from 'react';
import { Check, X, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function PlanItemCard({ plan, billingCycle = 'monthly', user }) {
  const isPaid = plan.monthlyCost > 0;
  const isPopular = plan.popular;
  const cost = billingCycle === 'annual' ? plan.annualCost : plan.monthlyCost;
  const annualTotal = plan.annualCost * 12;

  // Checkout Link Builder
  const getCheckoutUrl = () => {
    if (!plan.paymentLink) return '#';
    const emailParam = user?.email ? `?prefilled_email=${encodeURIComponent(user.email)}` : '';
    return `${plan.paymentLink}${emailParam}`;
  };

  const handleFreeAction = () => {
    toast.info("You are currently enjoying the Starter Community plan.");
  };

  return (
    <div
      className={`relative rounded-3xl p-6 md:p-8 transition-all duration-300 flex flex-col justify-between ${
        isPopular
          ? 'bg-gradient-to-b from-blue-600/10 via-white to-indigo-600/10 dark:from-blue-950/40 dark:via-slate-900 dark:to-indigo-950/40 border-2 border-blue-500 shadow-2xl shadow-blue-500/10 scale-100 lg:scale-105 z-10'
          : 'bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-lg hover:border-slate-400 dark:hover:border-slate-700'
      }`}
    >
      {/* Floating Popular / Seniority Badge */}
      {plan.badgeText && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span
            className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md ${
              isPopular
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/30'
                : 'bg-slate-800 text-slate-200 dark:bg-slate-700 dark:text-white border border-slate-600'
            }`}
          >
            {isPopular && <Sparkles className="w-3.5 h-3.5" />}
            <span>{plan.badgeText}</span>
          </span>
        </div>
      )}

      {/* Card Header & Pricing */}
      <div>
        <div className="text-center pt-2 mb-6">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1.5">
            {plan.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[32px] px-2">
            {plan.tagline}
          </p>

          {/* Price Numbers */}
          <div className="mt-4 flex items-baseline justify-center gap-1">
            <span className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              ${cost}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              /month
            </span>
          </div>

          {/* Annual Billing Subtext */}
          <div className="mt-1 h-5">
            {isPaid && billingCycle === 'annual' ? (
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                Billed annually (${annualTotal}/yr) • Save 25%
              </span>
            ) : isPaid ? (
              <span className="text-[11px] font-medium text-slate-400">
                Billed monthly • Cancel anytime
              </span>
            ) : (
              <span className="text-[11px] font-medium text-slate-400">
                No credit card required
              </span>
            )}
          </div>
        </div>

        {/* Feature Offering List */}
        <div className="py-4 border-t border-slate-100 dark:border-slate-800 mb-6">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
            What's Included
          </p>
          <ul className="space-y-2.5">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs">
                {feature.included ? (
                  <span className="p-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="p-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 shrink-0 mt-0.5">
                    <X className="w-3.5 h-3.5" />
                  </span>
                )}
                <span
                  className={
                    feature.included
                      ? 'text-slate-700 dark:text-slate-200 font-medium'
                      : 'text-slate-400 dark:text-slate-500 line-through'
                  }
                >
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CTA Button */}
      <div>
        {isPaid ? (
          <a
            href={getCheckoutUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full cursor-pointer"
          >
            <Button
              className={`w-full py-5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isPopular
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 hover:scale-[1.02]'
                  : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700'
              }`}
            >
              <span>{plan.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </a>
        ) : (
          <Button
            onClick={handleFreeAction}
            variant="outline"
            className="w-full py-5 rounded-2xl font-bold text-xs border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            {plan.ctaText}
          </Button>
        )}

        <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[10px] text-slate-400">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span>14-day risk-free money-back guarantee</span>
        </div>
      </div>
    </div>
  );
}