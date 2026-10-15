"use client";
import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function UpgradeFAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'How does Ollama AI evaluate my interview responses?',
      a: 'PrepSmart AI 2.0 connects with your local or cloud Ollama engine running Meta’s Llama 3.3. It analyzes your spoken transcripts against verified FAANG engineering rubrics, scoring architectural tradeoffs, code efficiency, communication clarity, and STAR-method structure with zero data harvesting.',
    },
    {
      q: 'Can I switch between monthly and annual billing at any time?',
      a: 'Yes, absolutely. You can upgrade, downgrade, or switch between monthly and annual billing anytime directly from your Account Settings dialog. Any unused prorated balance will be credited toward your new billing cycle automatically.',
    },
    {
      q: 'What happens if I reach the 3 free mock interviews on the Starter plan?',
      a: 'You can retake and practice your existing 3 mock interview rounds as many times as you like for free. When you are ready to generate new targeted roles, tech stacks, or unlock unlimited rounds, upgrading to Pro takes less than 30 seconds.',
    },
    {
      q: 'Is my payment processed securely?',
      a: 'All transactions are handled directly through Stripe’s bank-grade 256-bit encrypted checkout. We never store or transmit your raw credit card numbers or banking information on our servers.',
    },
    {
      q: 'Can I export my mock evaluations and audio performance reports?',
      a: 'Yes! Pro and Executive members can export comprehensive PDF performance evaluation dossiers, complete with scoring breakdowns, verbatim transcripts, and personalized actionable improvement steps to share with mentors.',
    },
  ];

  return (
    <div className="mt-16 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
          <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
          <span>Frequently Asked Questions</span>
        </div>
        <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Common Questions About Upgrading
        </h3>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden transition-all shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between p-4 md:p-5 text-left text-xs md:text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-blue-500' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 md:px-5 md:pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3 animate-in fade-in duration-150">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
