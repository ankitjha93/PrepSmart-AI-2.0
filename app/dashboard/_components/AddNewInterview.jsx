"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { OllamaService } from '@/utils/OllamaAIModal';
import { 
  LoaderCircle, 
  Plus, 
  Sparkles, 
  BrainCircuit, 
  Rocket, 
  Briefcase, 
  Code2, 
  Award, 
  Clock, 
  Check, 
  Layers, 
  Zap, 
  Flame,
  Wand2,
  Sliders,
  ChevronRight
} from 'lucide-react';
import gsap from 'gsap';
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/context/AuthContext';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const ROLE_PRESETS = [
  {
    title: 'Full Stack Engineer',
    icon: '🚀',
    role: 'Full Stack Developer',
    tech: 'React, Node.js, Express, PostgreSQL, REST APIs',
    defaultExp: '3',
    gradient: 'from-blue-600 to-indigo-600',
  },
  {
    title: 'Frontend Specialist',
    icon: '🎨',
    role: 'Frontend Engineer',
    tech: 'Next.js, React, TypeScript, Tailwind CSS, Web Performance',
    defaultExp: '3',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    title: 'Backend Architect',
    icon: '⚙️',
    role: 'Backend Architect',
    tech: 'Go, Microservices, PostgreSQL, Redis, Kafka, Distributed Systems',
    defaultExp: '5',
    gradient: 'from-emerald-500 to-teal-700',
  },
  {
    title: 'AI / ML Engineer',
    icon: '🤖',
    role: 'AI / Machine Learning Engineer',
    tech: 'Python, PyTorch, Ollama LLMs, RAG Pipelines, Vector Databases',
    defaultExp: '3',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    title: 'Cloud & DevOps',
    icon: '☁️',
    role: 'DevOps / Cloud Architect',
    tech: 'Kubernetes, Docker, AWS, Terraform, CI/CD Pipelines',
    defaultExp: '4',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    title: 'Mobile Developer',
    icon: '📱',
    role: 'Mobile Engineer',
    tech: 'React Native, TypeScript, iOS/Android SDK, GraphQL',
    defaultExp: '3',
    gradient: 'from-rose-500 to-red-600',
  },
];

const EXPERIENCE_PRESETS = [
  { label: 'Junior', years: '1', desc: '0–2 yrs', icon: Flame },
  { label: 'Mid-Level', years: '3', desc: '3–5 yrs', icon: Zap },
  { label: 'Senior', years: '5', desc: '5–8 yrs', icon: Award },
  { label: 'Staff/Lead', years: '8', desc: '8+ yrs', icon: Sparkles },
];

const QUESTION_COUNT_OPTIONS = [
  { count: 3, label: 'Rapid Screen', time: '~10 min' },
  { count: 5, label: 'FAANG Standard', time: '~25 min', recommended: true },
  { count: 7, label: 'Deep Technical Dive', time: '~40 min' },
];

function AddNewInterview() {
  const [openDailog, setOpenDailog] = useState(false);
  const [jobPosition, setJobPosition] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobExperience, setJobExperience] = useState('3');
  const [questionCount, setQuestionCount] = useState(5);
  const [activePreset, setActivePreset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ollamaInfo, setOllamaInfo] = useState({ online: false, model: 'llama3.3' });
  const contentRef = useRef(null);
  const router = useRouter();
  const { user } = useAuth();

  // Probe Ollama local engine status
  useEffect(() => {
    OllamaService.checkStatus().then((status) => {
      setOllamaInfo({
        online: Boolean(status.online),
        model: status.activeModel || status.model || 'llama3.3',
        models: status.models || [],
      });
    });
  }, []);

  // Listen for global modal open triggers (e.g. from navbar "+ New Mock")
  useEffect(() => {
    const handleOpen = () => setOpenDailog(true);
    window.addEventListener('prepsmart_open_new_mock', handleOpen);
    return () => window.removeEventListener('prepsmart_open_new_mock', handleOpen);
  }, []);

  // GSAP staggered entrance cascade when dialog opens
  useEffect(() => {
    if (openDailog && contentRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".interview-stagger",
          { opacity: 0, y: 16, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.04,
            duration: 0.45,
            ease: "power3.out",
            delay: 0.06,
          }
        );

        // Header neural icon rotation & spring
        gsap.fromTo(
          ".modal-header-icon",
          { rotate: -20, scale: 0.75 },
          { rotate: 0, scale: 1, duration: 0.6, ease: "back.out(2.2)" }
        );
      }, contentRef);

      return () => ctx.revert();
    }
  }, [openDailog]);

  // Handle Preset Click
  const handleApplyPreset = (preset) => {
    setActivePreset(preset.title);
    setJobPosition(preset.role);
    setJobDesc(preset.tech);
    setJobExperience(preset.defaultExp);

    toast.info(`Filled preset: ${preset.title}`);
  };

  // Magnetic CTA Button Hover
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

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!jobPosition.trim() || !jobDesc.trim()) {
      toast.error('Please specify both the job position and tech stack.');
      return;
    }

    setLoading(true);

    try {
      const count = questionCount || process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT || 5;
      toast.loading(`Synthesizing questions via Ollama (${ollamaInfo.model || 'llama3.2'})...`);

      const genRes = await OllamaService.generateQuestions({
        jobPosition,
        jobDesc,
        jobExperience,
        questionCount: count,
        model: ollamaInfo.model || 'llama3.2',
      });
      toast.dismiss();

      const MockJsonResp = genRes?.rawJson || JSON.stringify(genRes?.questions || []);

      if (MockJsonResp) {
        const userEmail = user?.email || user?.primaryEmailAddress?.emailAddress || 'candidate@prepsmart.ai';
        const newMockId = uuidv4();

        try {
          const resp = await db
            .insert(MockInterview)
            .values({
              mockId: newMockId,
              jsonMockResp: MockJsonResp,
              jobPosition: jobPosition,
              jobDesc: jobDesc,
              jobExperience: jobExperience,
              createdBy: userEmail,
              createdAt: moment().format('DD-MM-yyyy'),
            })
            .returning({ mockId: MockInterview.mockId });

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('prepsmart_refresh_interviews'));
          }

          if (resp && resp[0]?.mockId) {
            setOpenDailog(false);
            router.push('/dashboard/interview/' + resp[0]?.mockId);
          } else {
            setOpenDailog(false);
            router.push('/dashboard/interview/' + newMockId);
          }
        } catch (dbErr) {
          console.warn('DB insert fallback:', dbErr);
          toast.success('Interview generated via Ollama! (Local preview mode)');
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('prepsmart_refresh_interviews'));
          }
          setOpenDailog(false);
          router.push('/dashboard/interview/' + newMockId);
        }
      } else {
        toast.error('AI response format was invalid. Please try again.');
      }
    } catch (err) {
      console.error('Failed to generate interview:', err);
      toast.dismiss();
      toast.error(err.message || 'Failed to generate interview questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardHover = (e) => {
    const card = e.currentTarget;
    const icon = card.querySelector('.plus-icon');
    gsap.to(card, { y: -6, scale: 1.02, boxShadow: '0 20px 30px -10px rgba(37, 99, 235, 0.15)', duration: 0.25, ease: 'power2.out' });
    if (icon) {
      gsap.to(icon, { rotate: 90, scale: 1.15, duration: 0.3, ease: 'back.out(2)' });
    }
  };

  const handleCardLeave = (e) => {
    const card = e.currentTarget;
    const icon = card.querySelector('.plus-icon');
    gsap.to(card, { y: 0, scale: 1, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)', duration: 0.5, ease: 'elastic.out(1.1, 0.4)' });
    if (icon) {
      gsap.to(icon, { rotate: 0, scale: 1, duration: 0.35, ease: 'power2.out' });
    }
  };

  return (
    <div>
      {/* Dashboard Trigger Card */}
      <div
        onMouseEnter={handleCardHover}
        onMouseLeave={handleCardLeave}
        className="group p-8 border-2 border-dashed border-[#2563EB]/40 hover:border-[#2563EB] rounded-3xl bg-gradient-to-br from-blue-50/50 via-white to-emerald-50/30 dark:from-blue-950/20 dark:via-slate-900 dark:to-emerald-950/10 cursor-pointer flex flex-col items-center justify-center gap-3.5 min-h-[180px] relative overflow-hidden transition-all duration-300"
        onClick={() => setOpenDailog(true)}
      >
        <div className="absolute top-3 right-3">
          <Badge variant="blue" className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${ollamaInfo.online ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            Ollama {ollamaInfo.model || 'llama3.3'}
          </Badge>
        </div>
        <div className="plus-icon w-12 h-12 rounded-2xl bg-blue-600/10 dark:bg-blue-600/20 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-colors shadow-sm">
          <Plus className="w-6 h-6" />
        </div>
        <div className="text-center">
          <h2 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            Create New Mock Interview
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-[210px]">
            Generate FAANG-tailored questions in seconds
          </p>
        </div>
      </div>

      {/* ENHANCED CONFIGURATION DIALOG */}
      <Dialog open={openDailog} onOpenChange={setOpenDailog}>
        <DialogContent 
          ref={contentRef}
          className="max-w-2xl p-0 overflow-hidden rounded-[28px] border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl transition-all"
        >
          {/* Ambient Top Glow Orbs */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

          {/* Modal Header */}
          <div className="relative p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="modal-header-icon relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[1.5px] shadow-lg shadow-blue-500/25 shrink-0">
                    <div className="w-full h-full rounded-[14px] bg-slate-950/80 flex items-center justify-center text-white backdrop-blur-sm">
                      <BrainCircuit className="w-6 h-6 text-blue-400 animate-pulse" />
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-sm opacity-40 -z-10" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <DialogTitle className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        Configure Your Mock Interview
                      </DialogTitle>
                      <Badge variant="gradient" className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 shadow-sm flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${ollamaInfo.online ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                        Ollama {ollamaInfo.model || 'llama3.2'}
                      </Badge>
                    </div>
                    <DialogDescription className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
                      Specify the target position, tech stack requirements, and your experience level.
                    </DialogDescription>
                  </div>
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* Form Content */}
          <form onSubmit={onSubmit} className="p-6 md:p-7 space-y-5 max-h-[72vh] overflow-y-auto">
            
            {/* ONE-CLICK ROLE PRESET CHIPS */}
            <div className="interview-stagger space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Quick Role Presets
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Auto-fills role & tech stack</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ROLE_PRESETS.map((preset, idx) => {
                  const isSelected = activePreset === preset.title;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`p-2.5 rounded-xl border text-left transition-all duration-200 text-xs flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 ring-2 ring-blue-500/30 text-blue-900 dark:text-blue-100 shadow-sm font-bold'
                          : 'border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:scale-[1.02]'
                      }`}
                    >
                      <span className="text-base leading-none">{preset.icon}</span>
                      <span className="truncate">{preset.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FIELD 1: JOB ROLE */}
            <div className="interview-stagger space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Target Job Role / Position
              </label>
              <div className="relative">
                <Input
                  required
                  placeholder="Ex. Senior Full Stack Engineer"
                  value={jobPosition}
                  onChange={(e) => {
                    setJobPosition(e.target.value);
                    setActivePreset(null);
                  }}
                  className="rounded-xl h-11 px-4 text-sm font-medium border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950 focus-visible:ring-2 focus-visible:ring-blue-500/40"
                />
              </div>
            </div>

            {/* FIELD 2: TECH STACK / DESCRIPTION */}
            <div className="interview-stagger space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Core Tech Stack & Topics (In Short)
              </label>
              <Textarea
                required
                rows={3}
                placeholder="Ex. React, Next.js, TypeScript, PostgreSQL, System Design, REST APIs"
                value={jobDesc}
                onChange={(e) => {
                  setJobDesc(e.target.value);
                  setActivePreset(null);
                }}
                className="rounded-xl p-3 text-sm font-medium border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950 focus-visible:ring-2 focus-visible:ring-blue-500/40 resize-none"
              />
            </div>

            {/* FIELD 3: YEARS OF EXPERIENCE & PRESETS */}
            <div className="interview-stagger space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  Experience Seniority
                </label>
                <span className="text-[11px] font-semibold text-slate-400">{jobExperience} Years</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {EXPERIENCE_PRESETS.map((item, idx) => {
                  const isSelected = jobExperience === item.years;
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setJobExperience(item.years)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20 scale-[1.02]'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-blue-500'}`} />
                        <span className="text-xs font-black">{item.years}y</span>
                      </div>
                      <span className={`text-[10px] block truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FIELD 4: INTERVIEW QUESTION DEPTH / COUNT */}
            <div className="interview-stagger space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                Round Question Count & Duration
              </label>

              <div className="grid grid-cols-3 gap-2">
                {QUESTION_COUNT_OPTIONS.map((opt) => {
                  const isSelected = questionCount === opt.count;
                  return (
                    <button
                      key={opt.count}
                      type="button"
                      onClick={() => setQuestionCount(opt.count)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/50 ring-2 ring-indigo-500/40 text-indigo-900 dark:text-indigo-200 font-bold'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs font-black">{opt.count} Questions</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{opt.time}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FOOTER ACTION BUTTONS */}
            <div className="interview-stagger flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpenDailog(false)}
                className="rounded-xl px-4 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={loading}
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
                className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black text-xs md:text-sm px-6 h-11 rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 group cursor-pointer transition-all duration-300 hover:shadow-blue-500/40"
              >
                {/* Shimmer sweep effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                {loading ? (
                  <>
                    <LoaderCircle className="w-4 h-4 animate-spin text-white" />
                    <span>Generating {questionCount} FAANG Questions...</span>
                  </>
                ) : (
                  <>
                    <span>Start Interview</span>
                    <Rocket className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-200 text-blue-200" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;