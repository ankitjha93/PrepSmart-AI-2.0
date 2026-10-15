"use client";
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import PLAN_TIERS from '@/utils/planData';
import PlanItemCard from './_components/PlanItemCard';
import FeatureMatrix from './_components/FeatureMatrix';
import UpgradeFAQ from './_components/UpgradeFAQ';
import { 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Zap, 
  Award, 
  Star, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Upgrade() {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState('annual'); // Default to annual for best discount

  return (
    <div className="py-8 md:py-14 max-w-7xl mx-auto px-2 sm:px-4 space-y-12 animate-in fade-in duration-300">
      {/* =================================================================== */}
      {/* HERO HEADER & TITLE                                                 */}
      {/* =================================================================== */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider border border-blue-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PrepSmart Pro Acceleration</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Supercharge Your Tech Career
        </h1>

        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Level up from basic practice to authentic FAANG-level mock evaluations, real-time speech analytics, 
          and AI question synthesis with Meta’s Llama 3.3.
        </p>

        {/* =============================================================== */}
        {/* BILLING CYCLE SWITCHER                                          */}
        {/* =============================================================== */}
        <div className="pt-4 flex items-center justify-center">
          <div className="inline-flex items-center p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-emerald-500 text-white font-black px-1.5 py-0.5 rounded-full uppercase">
                Save 25%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3-TIER PRICING CARDS GRID                                           */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto">
        {PLAN_TIERS.map((plan) => (
          <PlanItemCard
            key={plan.id}
            plan={plan}
            billingCycle={billingCycle}
            user={user}
          />
        ))}
      </div>

      {/* =================================================================== */}
      {/* SOCIAL PROOF & GUARANTEE STRIP                                      */}
      {/* =================================================================== */}
      <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200/80 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 text-center max-w-5xl mx-auto">
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
            14-Day Money-Back Guarantee
          </h4>
          <p className="text-[11px] text-slate-500 max-w-xs">
            If you aren’t 100% satisfied with your interview score improvement, receive an immediate refund.
          </p>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
            Bank-Grade 256-Bit Stripe Security
          </h4>
          <p className="text-[11px] text-slate-500 max-w-xs">
            All checkouts encrypted via Stripe. Cancel anytime with a single click.
          </p>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
            FAANG & Tier-1 Offers Landed
          </h4>
          <p className="text-[11px] text-slate-500 max-w-xs">
            Over 2,400+ candidates placed at Meta, Google, Stripe, Amazon, and OpenAI.
          </p>
        </div>
      </div>

      {/* =================================================================== */}
      {/* FEATURE COMPARISON MATRIX                                            */}
      {/* =================================================================== */}
      <FeatureMatrix />

      {/* =================================================================== */}
      {/* FREQUENTLY ASKED QUESTIONS                                          */}
      {/* =================================================================== */}
      <UpgradeFAQ />

      {/* =================================================================== */}
      {/* BOTTOM CALL TO ACTION BANNER                                        */}
      {/* =================================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-8 md:p-12 text-center shadow-2xl max-w-5xl mx-auto">
        <div className="relative z-10 max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            Ready to Land Your Dream Offer?
          </h2>
          <p className="text-blue-100 text-xs md:text-sm">
            Join thousands of software engineers practicing with PrepSmart AI 2.0. Start free or upgrade for unlimited high-pressure mock rounds.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://buy.stripe.com/test_28o9EjbkvgfQ8VOeUV"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="px-6 py-5 rounded-2xl bg-white text-blue-600 hover:bg-blue-50 font-bold text-xs shadow-lg gap-2 cursor-pointer">
                <span>Upgrade to Pro Candidate</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}