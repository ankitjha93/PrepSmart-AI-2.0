"use client";
import React, { useState, useEffect } from 'react';
import { 
  PlayCircle, 
  Sparkles, 
  Sliders, 
  Brain, 
  Mic, 
  ShieldCheck, 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  Cpu, 
  Database, 
  Terminal, 
  CheckCircle2, 
  Flame, 
  Award, 
  Layers,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(0);

  // Phase 1 (Persona) Simulator State
  const [simRole, setSimRole] = useState('Full Stack Engineer');
  const [simSeniority, setSimSeniority] = useState('Senior');
  const [simAttitude, setSimAttitude] = useState('FAANG Strict');

  // Sandbox Audio State
  const [speaking, setSpeaking] = useState(false);

  const sampleQuestion = "How do you architect an idempotent payment processing pipeline to prevent duplicate charges during network failures?";

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      toast.error('Text-to-speech is not supported in this browser.');
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(sampleQuestion);
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
    toast.info("Playing AI Interviewer voice prompt...");
  };

  const handleLaunchMock = () => {
    window.dispatchEvent(new CustomEvent('prepsmart_open_new_mock', {
      detail: {
        jobPosition: simRole,
        jobDesc: `Targeted practice for ${simRole} (${simSeniority} level). Mode: ${simAttitude}.`,
        jobExperience: simSeniority === 'Junior' ? '1' : simSeniority === 'Mid-Level' ? '3' : '6',
      }
    }));
    toast.success(`Launching AI Mock round for: ${simRole}`);
  };

  const STEPS = [
    {
      id: 'step-1',
      number: '01',
      title: 'Persona & Role Calibration',
      tagline: 'Tailor role, stack, seniority & interviewer attitude.',
      icon: Sliders,
      badge: 'Step 1: Configuration',
      summary: 'Define your exact job title, tech stack (React, Node, Go, Kubernetes), seniority level, and interviewer persona (Supportive, Neutral, or FAANG Strict/High-Pressure).',
    },
    {
      id: 'step-2',
      number: '02',
      title: 'Ollama AI Question Synthesis',
      tagline: 'Meta Llama 3.3 synthesizes authentic, unrepeated questions.',
      icon: Brain,
      badge: 'Step 2: AI Synthesis',
      summary: 'Our Ollama integration queries the latest Llama 3.3 model to generate tailored technical, architectural, and behavioral questions with Staff Engineer scoring rubrics.',
    },
    {
      id: 'step-3',
      number: '03',
      title: '16-Band Audio Spectrum & Live STT',
      tagline: 'Speak naturally while live audio waveforms validate input.',
      icon: Mic,
      badge: 'Step 3: Speech Capture',
      summary: 'Speak your answers freely. Our 16-band real-time audio visualizer confirms microphone clarity while Web Speech recognition transcribes your words in real time.',
    },
    {
      id: 'step-4',
      number: '04',
      title: 'FAANG Evaluation & Improvement Dossier',
      tagline: 'Instant 1-10 scoring, model answers & constructive tips.',
      icon: ShieldCheck,
      badge: 'Step 4: AI Feedback',
      summary: 'Within seconds, Ollama evaluates your answer against the ideal Staff solution, scoring communication clarity, architectural depth, and highlighting specific pitfalls.',
    },
  ];

  return (
    <div className="py-8 md:py-14 max-w-7xl mx-auto px-2 sm:px-4 space-y-16 animate-in fade-in duration-300">
      {/* =================================================================== */}
      {/* COCKPIT HERO HEADER                                                 */}
      {/* =================================================================== */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider border border-blue-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>End-to-End Interview Intelligence</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          How PrepSmart AI 2.0 Works
        </h1>

        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Discover how our local Ollama AI engine (Llama 3.3), 16-band audio visualizer, real-time speech-to-text, 
          and FAANG hiring rubrics replicate authentic tier-1 interview rounds.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={handleLaunchMock}
            className="rounded-2xl px-5 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-500/20 gap-2 cursor-pointer"
          >
            <span>Start Practice Round Now</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4-STEP INTERACTIVE WORKFLOW SIMULATOR                               */}
      {/* =================================================================== */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Interactive Platform Simulator
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            The 4 Stages of Every Mock Session
          </h2>
        </div>

        {/* Stepper Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === idx;
            return (
              <div
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={`p-5 rounded-3xl border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 border-blue-500 shadow-xl ring-2 ring-blue-500/20 scale-[1.02]'
                    : 'bg-white/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-2xl font-black font-mono ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                    {step.number}
                  </span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                  {step.tagline}
                </p>
              </div>
            );
          })}
        </div>

        {/* Active Stage Interactive Showcase Panel */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-2xl">
          {activeStep === 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-in fade-in duration-200">
              <div className="space-y-4">
                <Badge variant="blue" className="text-[10px] font-black uppercase">
                  Phase 1: Dynamic Persona Calibration
                </Badge>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Configure Your Dream Role & Interviewer Demeanor
                </h3>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  PrepSmart adjusts its prompts dynamically. Choose whether you want a supportive mentor 
                  guiding you through algorithms or a relentless FAANG hiring manager probing every single architectural tradeoff.
                </p>

                {/* Interactive Simulator Controls */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Target Role</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {['Full Stack Engineer', 'AI/ML Engineer', 'Cloud/DevOps', 'System Architect'].map((r) => (
                        <button
                          key={r}
                          onClick={() => setSimRole(r)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                            simRole === r 
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Seniority</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {['Junior', 'Mid-Level', 'Senior', 'Staff / Principal'].map((s) => (
                        <button
                          key={s}
                          onClick={() => setSimSeniority(s)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                            simSeniority === s 
                              ? 'bg-purple-600 text-white border-purple-600 shadow-sm' 
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Interviewer Attitude</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {['Supportive & Coaching', 'Neutral & Professional', 'FAANG Strict'].map((a) => (
                        <button
                          key={a}
                          onClick={() => setSimAttitude(a)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                            simAttitude === a 
                              ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Live Persona Payload Preview Card */}
              <div className="p-6 bg-slate-950 text-slate-200 rounded-3xl border border-slate-800 font-mono text-xs shadow-xl space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Generated Persona Ingress
                  </span>
                  <span className="text-[10px] text-slate-500">Ollama System Prompt</span>
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <p><span className="text-blue-400">ROLE_TARGET:</span> "{simRole}"</p>
                  <p><span className="text-purple-400">SENIORITY_LEVEL:</span> "{simSeniority}"</p>
                  <p><span className="text-amber-400">INTERVIEW_MODE:</span> "{simAttitude}"</p>
                  <p><span className="text-emerald-400">EVAL_RUBRIC:</span> "Tier-1 Big Tech Staff Standard"</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed font-sans">
                  "You are an expert interviewer evaluating a {simSeniority} {simRole}. Conduct the round in {simAttitude} style. Probe edge cases, memory bounds, and operational failure modes."
                </div>
              </div>
            </div>
          )}

          {activeStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-in fade-in duration-200">
              <div className="space-y-4">
                <Badge variant="blue" className="text-[10px] font-black uppercase">
                  Phase 2: Local & Cloud Ollama AI Synthesis
                </Badge>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Zero Question Repetition via Meta Llama 3.3
                </h3>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Unlike platforms that recycle static question lists from 2018, PrepSmart AI connects directly 
                  to Meta’s Llama 3.3 model via our low-latency Next.js backend proxy. It synthesizes real-world algorithmic, 
                  system design, and behavioral questions tailored to your exact stack in seconds.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-slate-400 font-bold uppercase text-[10px]">Model Architecture</p>
                    <p className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">Meta Llama 3.3 (8B/70B)</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-slate-400 font-bold uppercase text-[10px]">Inference Port</p>
                    <p className="font-extrabold text-emerald-500 mt-0.5">11434 (Zero CORS Proxy)</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-slate-400 font-bold uppercase text-[10px]">Average Latency</p>
                    <p className="font-extrabold text-blue-500 mt-0.5">Sub-second Stream (~850ms)</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-slate-400 font-bold uppercase text-[10px]">Data Privacy</p>
                    <p className="font-extrabold text-purple-500 mt-0.5">100% Private (Local Engine)</p>
                  </div>
                </div>
              </div>

              {/* Synthesized Output Simulation */}
              <div className="p-6 bg-slate-50 dark:bg-slate-950/80 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-blue-500" /> Synthesized Question Sample
                  </span>
                  <Badge variant="success" className="text-[10px] font-bold">Llama 3.3 Ready</Badge>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  "How would you handle cache stampedes across a distributed Redis cluster during sudden traffic surges?"
                </h4>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <p className="font-bold text-[11px] text-blue-600 dark:text-blue-400 uppercase">Ideal Evaluation Criteria:</p>
                  <p>• Mutex locking / probabilistic early expiration (XFetch algorithm).</p>
                  <p>• Background worker cache pre-warming.</p>
                  <p>• Circuit breakers and stale-while-revalidate fallback guarantees.</p>
                </div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-in fade-in duration-200">
              <div className="space-y-4">
                <Badge variant="blue" className="text-[10px] font-black uppercase">
                  Phase 3: Real-Time Audio & Speech Analytics
                </Badge>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  16-Band Visualizer & Live Speech Transcription
                </h3>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  During live mock interviews, the browser captures your voice through the Web Speech API and 
                  pipes it into our 16-band Web Audio Spectrum visualizer. You see your live decibel frequencies 
                  and live transcribed text in real time, guaranteeing you never talk into an inactive mic.
                </p>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-emerald-500 font-bold text-sm">✓</span>
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Continuous Speech Recognition with zero word loss</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-emerald-500 font-bold text-sm">✓</span>
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">16-Band FFT frequency visualizer confirming mic gain</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-emerald-500 font-bold text-sm">✓</span>
                    <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Instant text preview box for candidate validation</span>
                  </div>
                </div>
              </div>

              {/* Animated Equalizer Waveform & Live Transcription Simulation */}
              <div className="p-6 bg-slate-950 text-white rounded-3xl border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-xs font-bold text-slate-300">Live Audio Input Active</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">142 WPM • Optimal Pace</span>
                </div>

                {/* 16-Band Waveform Bars */}
                <div className="flex items-end justify-between h-20 px-4 py-2 bg-slate-900 rounded-2xl border border-slate-800">
                  {[45, 60, 30, 85, 95, 70, 40, 80, 100, 75, 55, 90, 65, 40, 80, 50].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className="w-1.5 bg-gradient-to-t from-blue-500 via-indigo-400 to-emerald-400 rounded-full animate-pulse"
                    />
                  ))}
                </div>

                {/* Live Transcribed Simulation Box */}
                <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed">
                  <span className="text-emerald-400 font-bold">Candidate: </span>
                  "To mitigate cache stampedes, I would introduce a distributed mutex lock in Redis using SETNX with a 5-second TTL. This ensures only a single application instance recalculates the cache while remaining threads wait..."
                </div>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-in fade-in duration-200">
              <div className="space-y-4">
                <Badge variant="blue" className="text-[10px] font-black uppercase">
                  Phase 4: FAANG Rubric Evaluation Dossier
                </Badge>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Comprehensive 1-10 Scoring & Actionable Feedback
                </h3>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Upon finishing your response, Ollama compares your verbatim answer against the Staff-level 
                  ideal answer. You receive an overall score, a breakdown of communication clarity, architectural 
                  rigor, and explicit constructive tips on how to elevate your response to land the offer.
                </p>

                <div className="space-y-2 pt-2">
                  <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40">
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Staff-Level Strength Highlight</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">Accurately addressed the race condition using SETNX distributed locking.</p>
                  </div>
                  <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-900/40">
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300">Constructive Improvement Vector</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">Mention probabilistic early expiration (XFetch algorithm) for higher seniority bonus.</p>
                  </div>
                </div>
              </div>

              {/* Score Dossier Preview Card */}
              <div className="p-6 bg-slate-50 dark:bg-slate-950/80 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Evaluation Dossier</span>
                  </div>
                  <Badge variant="success" className="text-xs font-black">Score: 9.4 / 10</Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Clarity</p>
                    <p className="font-extrabold text-blue-600 dark:text-blue-400 text-sm mt-0.5">96%</p>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Depth</p>
                    <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">9.2/10</p>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">STAR Model</p>
                    <p className="font-extrabold text-purple-600 dark:text-purple-400 text-sm mt-0.5">Strong</p>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  "Excellent response. You clearly articulated the core architectural bottleneck of simultaneous cache misses and proposed a production-grade distributed lock solution."
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* INTERACTIVE VOICE & EVALUATION SANDBOX                              */}
      {/* =================================================================== */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-10 border border-indigo-900/50 shadow-2xl space-y-6">
        <div className="max-w-2xl space-y-2">
          <Badge variant="blue" className="text-[10px] font-black uppercase">
            Test Drive Right Here
          </Badge>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Try Out the AI Interview Voice Engine
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Click below to hear the simulated interviewer read a real technical question aloud using the browser's speech synthesis engine.
          </p>
        </div>

        <div className="p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">Simulated Interview Question</p>
            <p className="text-xs md:text-sm font-semibold text-white">
              "{sampleQuestion}"
            </p>
          </div>

          <button
            onClick={handleToggleSpeech}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shrink-0 cursor-pointer ${
              speaking 
                ? 'bg-rose-600 text-white animate-pulse' 
                : 'bg-white text-slate-900 hover:bg-slate-100 shadow-md'
            }`}
          >
            {speaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-blue-600" />}
            <span>{speaking ? 'Stop Speaking' : 'Listen to AI Interviewer'}</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* SYSTEM ARCHITECTURE BLUEPRINT                                       */}
      {/* =================================================================== */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Enterprise Architecture
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            How the Technology Stack Connects
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">1. Client Runtime</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Next.js 15 App Router, Web Speech STT API, and 16-band Web Audio Spectrum Analyzer.
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">2. Serverless Proxy</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              API routes (/api/ollama/*) handling prompt sanitation, timeout guards, and eliminating CORS issues.
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">3. Ollama AI Daemon</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Local or cloud daemon (port 11434) executing Meta Llama 3.3 for question synthesis and answers.
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">4. PostgreSQL Datastore</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Supabase cloud database with Row Level Security, preserving candidate transcripts and ratings.
            </p>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* VALUE COMPARISON MATRIX                                             */}
      {/* =================================================================== */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-xl space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Why PrepSmart AI 2.0?
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Compare Against Alternative Practice Methods
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Capability</th>
                <th className="py-3 px-4 font-bold text-slate-400 text-center">Human Coaches</th>
                <th className="py-3 px-4 font-bold text-slate-400 text-center">Generic ChatGPT</th>
                <th className="py-3 px-4 font-extrabold text-blue-600 dark:text-blue-400 text-center bg-blue-50/50 dark:bg-blue-950/20 rounded-t-2xl">
                  PrepSmart AI 2.0
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">Cost per Hour</td>
                <td className="py-3.5 px-4 text-center text-slate-500">$150 - $300 / hr</td>
                <td className="py-3.5 px-4 text-center text-slate-500">$20 / month</td>
                <td className="py-3.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400 bg-blue-50/20 dark:bg-blue-950/10">Free Starter / $11 Pro</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">Audio Spectrum Waveform Validation</td>
                <td className="py-3.5 px-4 text-center text-slate-400">✗ (Zoom/Meet Only)</td>
                <td className="py-3.5 px-4 text-center text-slate-400">✗ None</td>
                <td className="py-3.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400 bg-blue-50/20 dark:bg-blue-950/10">✓ 16-Band Real-Time Visualizer</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">FAANG Staff Scoring Rubrics</td>
                <td className="py-3.5 px-4 text-center text-slate-600">Subjective to coach</td>
                <td className="py-3.5 px-4 text-center text-slate-400">Generic text feedback</td>
                <td className="py-3.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400 bg-blue-50/20 dark:bg-blue-950/10">✓ Calibrated 1-10 Rubrics</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">24/7 Availability & Retakes</td>
                <td className="py-3.5 px-4 text-center text-slate-400">Requires scheduling</td>
                <td className="py-3.5 px-4 text-center text-slate-600">Text only</td>
                <td className="py-3.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400 bg-blue-50/20 dark:bg-blue-950/10">✓ Instant On-Demand Retakes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* =================================================================== */}
      {/* FINAL LAUNCH CTA BANNER                                             */}
      {/* =================================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-8 md:p-12 text-center shadow-2xl max-w-5xl mx-auto">
        <div className="relative z-10 max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            Put the AI Engine to the Test
          </h2>
          <p className="text-blue-100 text-xs md:text-sm">
            Launch your customized interview round in 10 seconds. Pick your target company, tech stack, and seniority.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Button 
              onClick={handleLaunchMock}
              className="px-6 py-5 rounded-2xl bg-white text-blue-600 hover:bg-blue-50 font-bold text-xs shadow-lg gap-2 cursor-pointer"
            >
              <span>Launch Mock Interview Now</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
