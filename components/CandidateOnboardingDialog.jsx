"use client";

import React, { useState, useEffect, useRef } from 'react';
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
import gsap from "gsap";
import { 
  Sparkles, 
  Brain, 
  Code2, 
  Database, 
  Cpu, 
  Cloud, 
  ArrowRight, 
  CheckCircle2, 
  Briefcase,
  Zap,
  Award,
  Flame,
  Check,
  Compass,
  Sliders,
  ChevronRight
} from "lucide-react";

const TARGET_ROLES = [
  { 
    id: 'fullstack', 
    label: 'Full Stack Engineer', 
    desc: 'React, Node.js, PostgreSQL & API Architecture', 
    icon: Code2, 
    defaultTech: 'React, Node.js, PostgreSQL, REST APIs',
    gradient: 'from-blue-600 to-indigo-600',
    borderActive: 'border-blue-500 shadow-blue-500/20 ring-blue-500/30',
    tags: ['React', 'Node.js', 'Postgres', 'API']
  },
  { 
    id: 'frontend', 
    label: 'Frontend Specialist', 
    desc: 'Next.js, TypeScript, Tailwind CSS & Web Performance', 
    icon: Brain, 
    defaultTech: 'Next.js, React, TypeScript, Tailwind CSS',
    gradient: 'from-cyan-500 to-blue-600',
    borderActive: 'border-cyan-500 shadow-cyan-500/20 ring-cyan-500/30',
    tags: ['Next.js', 'TypeScript', 'Tailwind', 'Perf']
  },
  { 
    id: 'backend', 
    label: 'Backend Architect', 
    desc: 'Go, Microservices, Distributed Caching & Kafka', 
    icon: Database, 
    defaultTech: 'Go, Microservices, PostgreSQL, Redis, Kafka',
    gradient: 'from-emerald-500 to-teal-700',
    borderActive: 'border-emerald-500 shadow-emerald-500/20 ring-emerald-500/30',
    tags: ['Go', 'Microservices', 'Redis', 'Kafka']
  },
  { 
    id: 'ai', 
    label: 'AI / ML Engineer', 
    desc: 'PyTorch, Ollama LLMs, RAG Pipelines & Vector Databases', 
    icon: Cpu, 
    defaultTech: 'Python, PyTorch, Ollama LLMs, Vector DBs',
    gradient: 'from-purple-500 to-pink-600',
    borderActive: 'border-purple-500 shadow-purple-500/20 ring-purple-500/30',
    tags: ['PyTorch', 'Ollama', 'RAG', 'Vector DB']
  },
  { 
    id: 'devops', 
    label: 'Cloud & DevOps Architect', 
    desc: 'Kubernetes, Docker, CI/CD & Terraform', 
    icon: Cloud, 
    defaultTech: 'Docker, Kubernetes, AWS, Terraform, CI/CD',
    gradient: 'from-amber-500 to-orange-600',
    borderActive: 'border-amber-500 shadow-amber-500/20 ring-amber-500/30',
    tags: ['Kubernetes', 'Docker', 'Terraform', 'CI/CD']
  },
];

const EXPERIENCE_LEVELS = [
  { 
    id: '0-2', 
    label: 'Early Career', 
    desc: '0–2 years', 
    icon: Flame,
    color: 'from-amber-500 to-orange-500',
    subtitle: 'Core fundamentals & algorithms' 
  },
  { 
    id: '3-5', 
    label: 'Mid-Level', 
    desc: '3–5 years', 
    icon: Zap,
    color: 'from-blue-600 to-indigo-600',
    subtitle: 'System design & production architecture' 
  },
  { 
    id: '5+', 
    label: 'Senior / Staff', 
    desc: '5+ years', 
    icon: Award,
    color: 'from-purple-600 to-pink-600',
    subtitle: 'Distributed scaling & leadership' 
  },
];

export default function CandidateOnboardingDialog({ onComplete }) {
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(TARGET_ROLES[0]);
  const [selectedExp, setSelectedExp] = useState(EXPERIENCE_LEVELS[1]);
  const { user } = useAuth();
  const contentRef = useRef(null);

  // Check initial onboarding status
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const completed = localStorage.getItem('prepsmart_onboarding_completed');
    if (!completed && user) {
      setOpen(true);
    }

    // Support manual trigger from dashboard or settings
    const handleTrigger = () => setOpen(true);
    window.addEventListener('prepsmart_open_onboarding', handleTrigger);
    return () => window.removeEventListener('prepsmart_open_onboarding', handleTrigger);
  }, [user]);

  // Staggered entrance animation with GSAP
  useEffect(() => {
    if (open && contentRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".onboarding-stagger",
          { opacity: 0, y: 18, scale: 0.98 },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1, 
            stagger: 0.05, 
            duration: 0.45, 
            ease: "power3.out",
            delay: 0.08
          }
        );

        // Header neural icon pulse
        gsap.fromTo(
          ".header-neural-glow",
          { rotate: -15, scale: 0.8 },
          { rotate: 0, scale: 1, duration: 0.6, ease: "back.out(2)" }
        );
      }, contentRef);

      return () => ctx.revert();
    }
  }, [open]);

  // Magnetic CTA button hover effect
  const handleMagneticMove = (e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(btn, { x: x * 0.15, y: y * 0.15, duration: 0.2, ease: "power2.out" });
  };

  const handleMagneticLeave = (e) => {
    gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.4, ease: "elastic.out(1, 0.4)" });
  };

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
    toast.success(`AI Interviewer calibrated for ${selectedRole.label} (${selectedExp.label})!`);
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
      <DialogContent 
        ref={contentRef}
        className="max-w-2xl p-0 overflow-hidden rounded-[28px] border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl transition-all"
      >
        {/* Ambient Top Glow Plate */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

        {/* Dialog Header with Brand Badge */}
        <div className="relative p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="header-neural-glow relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[1.5px] shadow-lg shadow-blue-500/25">
                  <div className="w-full h-full rounded-[14px] bg-slate-950/80 flex items-center justify-center text-white backdrop-blur-sm">
                    <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-sm opacity-40 -z-10" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <DialogTitle className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      Welcome to PrepSmart AI 2.0!
                    </DialogTitle>
                    <Badge variant="gradient" className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 shadow-sm">
                      AI Calibrator
                    </Badge>
                  </div>
                  <DialogDescription className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Calibrate your AI mock interviewer engine to tailor questions and evaluation criteria.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Dialog Body */}
        <div className="p-6 md:p-7 space-y-6 max-h-[72vh] overflow-y-auto">
          
          {/* STEP 1: TARGET ROLE SELECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 text-[11px] font-black flex items-center justify-center">
                  1
                </span>
                <label className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Choose Your Target Career Role
                </label>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                5 FAANG Archetypes
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TARGET_ROLES.map((role) => {
                const isSelected = selectedRole.id === role.id;
                const Icon = role.icon;

                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`onboarding-stagger group relative p-3.5 rounded-2xl border text-left transition-all duration-300 cursor-pointer overflow-hidden ${
                      isSelected
                        ? `border-blue-500 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/10 -translate-y-0.5`
                        : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/70 hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-1 hover:shadow-md'
                    }`}
                  >
                    {/* Ambient selection tint */}
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/15 via-transparent to-transparent pointer-events-none" />
                    )}

                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110 ${
                          isSelected
                            ? `bg-gradient-to-br ${role.gradient} text-white shadow-blue-500/30`
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-xs font-bold transition-colors ${
                          isSelected 
                            ? 'text-blue-900 dark:text-blue-100' 
                            : 'text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
                        }`}>
                          {role.label}
                        </span>
                      </div>

                      {/* Selected Indicator Checkmark */}
                      <div className={`transition-all duration-200 shrink-0 ${
                        isSelected 
                          ? 'scale-100 opacity-100' 
                          : 'scale-75 opacity-0'
                      }`}>
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mb-2.5 line-clamp-2">
                      {role.desc}
                    </p>

                    {/* Skill Badges */}
                    <div className="flex flex-wrap gap-1">
                      {role.tags.map((tag, idx) => (
                        <span 
                          key={idx}
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md transition-colors ${
                            isSelected
                              ? 'bg-blue-100/90 dark:bg-blue-900/60 text-blue-700 dark:text-blue-200'
                              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200/70 dark:group-hover:bg-slate-700'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: EXPERIENCE LEVEL SELECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 text-[11px] font-black flex items-center justify-center">
                  2
                </span>
                <label className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Select Experience Seniority
                </label>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                Calibrates Difficulty
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {EXPERIENCE_LEVELS.map((exp) => {
                const isSelected = selectedExp.id === exp.id;
                const ExpIcon = exp.icon;

                return (
                  <button
                    key={exp.id}
                    type="button"
                    onClick={() => setSelectedExp(exp)}
                    className={`onboarding-stagger group relative p-3 rounded-2xl border text-center transition-all duration-300 cursor-pointer overflow-hidden ${
                      isSelected
                        ? 'border-blue-600 bg-gradient-to-b from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/25 -translate-y-1 ring-2 ring-blue-500/40'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110 ${
                        isSelected 
                          ? 'bg-white/20 text-white' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        <ExpIcon className="w-4 h-4" />
                      </div>
                      <span className={`text-xs font-black block tracking-tight ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        {exp.label}
                      </span>
                      <span className={`text-[10px] font-semibold block mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {exp.desc}
                      </span>
                      <span className={`text-[9px] block mt-1 line-clamp-1 ${isSelected ? 'text-blue-200/90' : 'text-slate-400 dark:text-slate-500'}`}>
                        {exp.subtitle}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TELEMETRY CALIBRATION PREVIEW BAR */}
          <div className="onboarding-stagger p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 truncate">
              <div className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </div>
              <div className="truncate">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Calibrated For: </span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedRole.label}</span>
                <span className="mx-1 text-slate-300 dark:text-slate-600">•</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">{selectedExp.label}</span>
              </div>
            </div>
            <Badge variant="outline" className="hidden sm:inline-flex text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
              Ready
            </Badge>
          </div>

          {/* ACTION BUTTON WITH SHIMMER & MAGNETIC HOVER */}
          <div className="onboarding-stagger pt-1">
            <Button
              onClick={handleFinish}
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
              className="relative w-full h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 group text-sm overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-blue-500/50"
            >
              {/* Shimmer sweep effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

              <span className="tracking-wide">Save & Enter Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
