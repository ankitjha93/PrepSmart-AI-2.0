"use client";

import React, { useState, useEffect } from 'react';
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
  Sparkles, 
  Brain, 
  Code2, 
  Database, 
  Cpu, 
  Cloud, 
  ArrowRight, 
  CheckCircle2, 
  Briefcase 
} from "lucide-react";

const TARGET_ROLES = [
  { id: 'fullstack', label: 'Full Stack Engineer', desc: 'React, Node.js, PostgreSQL & API Architecture', icon: Code2, defaultTech: 'React, Node.js, PostgreSQL' },
  { id: 'frontend', label: 'Frontend Specialist', desc: 'Next.js, TypeScript, Tailwind CSS & Web Performance', icon: Brain, defaultTech: 'Next.js, React, TypeScript, Tailwind CSS' },
  { id: 'backend', label: 'Backend Architect', desc: 'Go, Microservices, Distributed Caching & Kafka', icon: Database, defaultTech: 'Node.js, Express, PostgreSQL, Redis' },
  { id: 'ai', label: 'AI / ML Engineer', desc: 'PyTorch, Gemini, RAG Pipelines & Vector Databases', icon: Cpu, defaultTech: 'Python, PyTorch, Gemini API, Vector DBs' },
  { id: 'devops', label: 'Cloud & DevOps Architect', desc: 'Kubernetes, Docker, CI/CD & Terraform', icon: Cloud, defaultTech: 'Docker, Kubernetes, AWS, GitHub Actions' },
];

const EXPERIENCE_LEVELS = [
  { id: '0-2', label: 'Early Career', desc: '0–2 years experience' },
  { id: '3-5', label: 'Mid-Level', desc: '3–5 years experience' },
  { id: '5+', label: 'Senior / Staff', desc: '5+ years experience' },
];

export default function CandidateOnboardingDialog({ onComplete }) {
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(TARGET_ROLES[0]);
  const [selectedExp, setSelectedExp] = useState(EXPERIENCE_LEVELS[1]);
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const completed = localStorage.getItem('prepsmart_onboarding_completed');
    if (!completed && user) {
      // Show onboarding modal for first-time candidate
      setOpen(true);
    }
  }, [user]);

  const handleFinish = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('prepsmart_onboarding_completed', 'true');
      localStorage.setItem('prepsmart_candidate_prefs', JSON.stringify({
        role: selectedRole.label,
        techStack: selectedRole.defaultTech,
        experience: selectedExp.id,
      }));
    }
    setOpen(false);
    toast.success(`Welcome aboard, ${user?.fullName?.split(' ')[0] || 'Candidate'}! Preferences saved.`);
    if (onComplete) {
      onComplete({
        role: selectedRole.label,
        techStack: selectedRole.defaultTech,
        experience: selectedExp.id,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">
                  Welcome to PrepSmart AI 2.0!
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Let’s calibrate your AI mock interviewer to match your career goals.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-5">
          {/* Step 1: Target Role */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              1. Choose Your Target Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TARGET_ROLES.map((role) => {
                const isSelected = selectedRole.id === role.id;
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {role.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      {role.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Experience Level */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              2. Experience Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {EXPERIENCE_LEVELS.map((exp) => {
                const isSelected = selectedExp.id === exp.id;
                return (
                  <button
                    key={exp.id}
                    type="button"
                    onClick={() => setSelectedExp(exp)}
                    className={`py-2 px-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs block">{exp.label}</span>
                    <span className={`text-[10px] block opacity-80 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>{exp.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <Button
              onClick={handleFinish}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 group text-sm"
            >
              <span>Save & Enter Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
