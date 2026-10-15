"use client";
import React from 'react';
import { Check, Minus, Sparkles } from 'lucide-react';

export default function FeatureMatrix() {
  const matrixRows = [
    {
      category: 'AI Inference & Engine',
      features: [
        { name: 'Ollama Llama 3.3 Engine', starter: 'Local / Cloud', pro: 'Local / Cloud', exec: 'Priority Queue (Sub-sec)' },
        { name: 'Monthly Mock Interview Sessions', starter: '3 Rounds', pro: 'Unlimited', exec: 'Unlimited' },
        { name: 'On-Demand AI Question Synthesis', starter: false, pro: true, exec: true },
        { name: 'Interview Session Retakes', starter: 'Unlimited', pro: 'Unlimited', exec: 'Unlimited' },
      ],
    },
    {
      category: 'Audio, Speech & Real-Time Feedback',
      features: [
        { name: 'Real-Time Voice Speech-to-Text', starter: true, pro: true, exec: true },
        { name: '16-Band Audio Spectrum Visualizer', starter: false, pro: true, exec: true },
        { name: 'Words-Per-Minute & Pacing Diagnostics', starter: false, pro: true, exec: true },
        { name: 'Text-to-Speech Question Reader', starter: true, pro: true, exec: true },
      ],
    },
    {
      category: 'Evaluation Rubrics & Reporting',
      features: [
        { name: 'Staff Engineer Scoring Rubrics', starter: 'Standard (1-10)', pro: 'FAANG Rubrics', exec: 'FAANG + Custom' },
        { name: 'Company-Specific Rubrics (Google, Meta)', starter: false, pro: false, exec: true },
        { name: 'Exportable PDF Performance Reports', starter: false, pro: true, exec: true },
        { name: 'STAR Behavioral Framework Analysis', starter: 'Basic', pro: 'Advanced', exec: 'Comprehensive' },
      ],
    },
    {
      category: 'Persona Calibration & Career Acceleration',
      features: [
        { name: 'Candidate Persona Calibration', starter: 'Basic Presets', pro: 'Full Cockpit', exec: 'Custom Personas' },
        { name: '1-on-1 Resume & Technical Review', starter: false, pro: false, exec: true },
        { name: 'Executive Offer Negotiation Playbook', starter: false, pro: false, exec: true },
        { name: 'Two-Factor Authentication & Cloud Sync', starter: true, pro: true, exec: true },
      ],
    },
  ];

  const renderValue = (val, isPro = false) => {
    if (typeof val === 'boolean') {
      return val ? (
        <span className={`inline-flex items-center justify-center p-1 rounded-full ${isPro ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'}`}>
          <Check className="w-3.5 h-3.5" />
        </span>
      ) : (
        <span className="text-slate-300 dark:text-slate-700">
          <Minus className="w-3.5 h-3.5 mx-auto" />
        </span>
      );
    }
    return <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">{val}</span>;
  };

  return (
    <div className="mt-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-xl">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          Compare All Features Side-by-Side
        </h3>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
          Transparent capabilities designed to give every engineer the competitive edge they need.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-4 px-4 font-bold text-slate-500 uppercase tracking-wider w-2/5">
                Feature Breakdown
              </th>
              <th className="py-4 px-4 font-bold text-slate-900 dark:text-white text-center w-1/5">
                Starter (Free)
              </th>
              <th className="py-4 px-4 font-extrabold text-blue-600 dark:text-blue-400 text-center w-1/5 bg-blue-50/50 dark:bg-blue-950/20 rounded-t-2xl">
                Pro Candidate
              </th>
              <th className="py-4 px-4 font-bold text-slate-900 dark:text-white text-center w-1/5">
                Executive
              </th>
            </tr>
          </thead>
          <tbody>
            {matrixRows.map((section, sIdx) => (
              <React.Fragment key={sIdx}>
                <tr className="bg-slate-50/60 dark:bg-slate-800/40">
                  <td colSpan={4} className="py-2.5 px-4 font-extrabold text-[11px] uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {section.category}
                  </td>
                </tr>
                {section.features.map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition">
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {row.name}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {renderValue(row.starter)}
                    </td>
                    <td className="py-3 px-4 text-center bg-blue-50/30 dark:bg-blue-950/10 font-bold">
                      {renderValue(row.pro, true)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {renderValue(row.exec)}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
