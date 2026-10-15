"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import Header from "./dashboard/_components/Header";
import NeuralBackground from "@/components/NeuralBackground";
import { useAuth } from "@/context/AuthContext";
import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { OllamaService } from "@/utils/OllamaAIModal";
import { 
  ArrowRight, 
  Sparkles, 
  Mic, 
  Brain, 
  Award, 
  Star, 
  Users, 
  Zap, 
  Activity,
  Layers,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Video,
  Database,
  Radio,
  Cpu,
  Target,
  Flame,
  Bot,
  BarChart3,
  Sliders,
  FileText,
  Lock,
  Globe
} from "lucide-react";

// Interactive Simulation Data for 5 Key Tech Roles
const DEMO_ROLES = [
  {
    id: 'fullstack',
    title: 'Full Stack Engineer',
    category: 'Full Stack',
    stack: 'React 19, Next.js, Node.js, PostgreSQL',
    question: 'How do you optimize database query performance and handle optimistic UI updates during state mutations?',
    userAns: 'I analyze execution plans with EXPLAIN ANALYZE, apply targeted composite indices, and in React implement optimistic updates with automatic rollback states on mutation errors.',
    rating: '9.4',
    clarity: '96%',
    depth: '92%',
    confidence: '94%',
    feedback: 'Superb breakdown of database indexing combined with practical client-side state rollback handling.',
    strengths: ['Addressed both backend query planning and frontend optimistic UX.', 'Properly explained rollback mechanisms.'],
    improvement: 'Consider mentioning connection pool sizing and Redis caching layers.'
  },
  {
    id: 'frontend',
    title: 'Frontend Specialist',
    category: 'Frontend',
    stack: 'Next.js App Router, React 19, Tailwind CSS',
    question: 'Explain how React Server Components (RSC) differ from Client Components regarding bundle size and hydration.',
    userAns: 'RSCs render purely on the server and stream serialized zero-bundle-size JSON to the client, completely bypassing client-side JavaScript hydration overhead for static content.',
    rating: '9.7',
    clarity: '98%',
    depth: '95%',
    confidence: '96%',
    feedback: 'Pinpoint accuracy regarding zero-bundle impact, streaming HTML hydration, and component boundary isolation.',
    strengths: ['Clear grasp of RSC serialization protocol.', 'Distinguished SSR from true server components.'],
    improvement: 'Could briefly touch upon "use client" boundary placement and data passing limits.'
  },
  {
    id: 'backend',
    title: 'Backend Architect',
    category: 'Backend',
    stack: 'Go, Microservices, Redis, Kafka',
    question: 'How do you prevent cache stampedes (thundering herd problem) in high-throughput distributed architectures?',
    userAns: 'By implementing mutex locking via singleflight patterns, probabilistic early expiration (XFetch algorithm), and automated warm cache prefetching using background worker pools.',
    rating: '9.5',
    clarity: '94%',
    depth: '96%',
    confidence: '95%',
    feedback: 'Demonstrates deep production experience with distributed cache coordination and cache invalidation strategies.',
    strengths: ['Cited specific production patterns (singleflight, XFetch).', 'Understands distributed lock overhead.'],
    improvement: 'Could elaborate on circuit breaking when primary database reaches connection limits.'
  },
  {
    id: 'ai',
    title: 'AI / ML Engineer',
    category: 'AI / ML',
    stack: 'PyTorch, Ollama Llama 3.3, RAG Pipelines',
    question: 'What strategies reduce hallucination and improve retrieval recall in production Retrieval-Augmented Generation (RAG)?',
    userAns: 'By deploying hybrid vector + keyword search (BM25), cross-encoder re-ranking models, contextual document chunking with metadata headers, and strict semantic validation guardrails.',
    rating: '9.6',
    clarity: '95%',
    depth: '97%',
    confidence: '97%',
    feedback: 'Superb coverage of modern re-ranking techniques, chunk provenance hygiene, and post-generation guardrails.',
    strengths: ['Identified hybrid search as foundational.', 'Understands cross-encoder latency vs precision trade-offs.'],
    improvement: 'Mention query expansion with HyDE (Hypothetical Document Embeddings).'
  },
  {
    id: 'devops',
    title: 'Cloud & DevOps Lead',
    category: 'Cloud / DevOps',
    stack: 'Kubernetes, Terraform, AWS, CI/CD',
    question: 'How do you structure zero-downtime blue/green and canary deployments with automated rollbacks on Kubernetes?',
    userAns: 'Using Argo Rollouts with Istio traffic routing, monitoring Prometheus metric error rates, and automatically rolling back traffic if HTTP 5xx exceeds 0.5% threshold.',
    rating: '9.8',
    clarity: '97%',
    depth: '99%',
    confidence: '98%',
    feedback: 'Exceptional modern GitOps strategy leveraging automated progressive traffic shifting with real-time telemetry rollback triggers.',
    strengths: ['Directly mentioned progressive traffic tooling (Argo/Istio).', 'Clear metric-based health thresholds.'],
    improvement: 'Could highlight database schema migration backwards compatibility.'
  }
];

// Interactive Step Data
const PLATFORM_STEPS = [
  {
    step: "01",
    title: "Define Target Role & Demeanor",
    desc: "Specify your exact job title, tech stack (React, Node, Go, PyTorch), seniority level, and interviewer attitude (Supportive, Neutral, or FAANG Strict).",
    badge: "Dynamic Persona Calibration",
    highlight: "Custom Job Description & Seniority Support"
  },
  {
    step: "02",
    title: "Live Voice & Audio Dock Practice",
    desc: "Speak naturally while our 16-band real-time audio visualizer confirms clear input. Simulated hiring manager questions replicate real high-pressure calls.",
    badge: "16-Band Audio Dock",
    highlight: "Speech-to-Text with Real-Time Frequency Feedback"
  },
  {
    step: "03",
    title: "Instant Scoring & Actionable Feedback",
    desc: "Receive question-by-question scoring out of 10, compare against Staff benchmark responses, and get surgical tips to level up your interview performance.",
    badge: "Staff-Level Rubric Analysis",
    highlight: "FAANG-Calibrated Score & Improvement Dossier"
  }
];

// Comprehensive FAQs Data
const FAQS = [
  {
    q: "How does the real-time speech visualizer work?",
    a: "PrepSmart connects to your microphone using the HTML5 Web Audio API, extracting real-time audio frequencies into a responsive 16-band visualizer dock so you can visually verify that your voice is loud, clear, and perfectly captured without clipping."
  },
  {
    q: "How does Ollama AI evaluate my interview responses?",
    a: "Our integration queries Meta's open-source Llama 3.3 via a zero-CORS serverless proxy. It parses your spoken transcripts against verified Staff Engineer rubrics, scoring architectural tradeoffs, code efficiency, communication clarity, and STAR-method structure."
  },
  {
    q: "Is my microphone or webcam video recorded or stored?",
    a: "No! Your video feed and raw audio are processed 100% locally in your browser. Raw audio streams are never recorded or stored on any server—only the transcribed text you submit is evaluated and stored in your private Supabase database."
  },
  {
    q: "Can I use PrepSmart AI with my own local Ollama instance?",
    a: "Yes! PrepSmart is engineered with full local Ollama support on port 11434. If you have Ollama running locally, our backend automatically routes requests to your machine for 100% private, zero-latency inference."
  },
  {
    q: "Where is my interview history stored?",
    a: "Your mock interview sessions, questions, transcribed answers, ratings, and feedback are securely stored in your dedicated PostgreSQL database powered by Supabase with Row Level Security (RLS)."
  },
  {
    q: "Can I export my performance evaluations?",
    a: "Yes! You can view detailed feedback dossiers, track your score trajectory over time on the Candidate Dashboard, and export comprehensive feedback reports to share with mentors."
  }
];

export default function Home() {
  const containerRef = useRef(null);
  const { user } = useAuth();
  const primaryCtaHref = user ? "/dashboard" : "/sign-up";
  const [selectedRole, setSelectedRole] = useState(DEMO_ROLES[0]);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [isSimulatingAnswer, setIsSimulatingAnswer] = useState(false);
  const [activeStepTab, setActiveStepTab] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [ollamaStatus, setOllamaStatus] = useState({ online: false, model: 'llama3.3' });

  // Probe Ollama status on mount
  useEffect(() => {
    OllamaService.checkStatus().then((res) => {
      if (res?.online) {
        const m = res.models?.[0]?.name || 'llama3.3';
        setOllamaStatus({ online: true, model: m.replace(':latest', '') });
      }
    }).catch(() => {});
  }, []);

  // GSAP Animations
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    // Hero Entry Animation
    tl.from(".hero-badge", { y: -25, opacity: 0, duration: 0.7 })
      .from(".market-ticker", { y: -15, opacity: 0, duration: 0.6 }, "-=0.3")
      .from(".hero-title", { y: 35, opacity: 0, duration: 0.9 }, "-=0.4")
      .from(".hero-desc", { y: 25, opacity: 0, duration: 0.7 }, "-=0.5")
      .from(".hero-cta", { y: 20, opacity: 0, stagger: 0.1, duration: 0.7 }, "-=0.4")
      .from(".floating-pill-widget", { scale: 0.8, opacity: 0, stagger: 0.15, duration: 0.8 }, "-=0.3")
      .from(".hero-simulator", { y: 40, opacity: 0, duration: 1 }, "-=0.4")
      .from(".stat-box", { y: 30, opacity: 0, stagger: 0.1, duration: 0.7 }, "-=0.3");

    // Ambient Floating Glow Animation
    gsap.to(".ambient-glow-1", {
      x: 40,
      y: 30,
      repeat: -1,
      yoyo: true,
      duration: 8,
      ease: "sine.inOut"
    });

    gsap.to(".ambient-glow-2", {
      x: -50,
      y: -40,
      repeat: -1,
      yoyo: true,
      duration: 10,
      ease: "sine.inOut"
    });

    // Floating Hero Pill Widgets Organic Float
    gsap.to(".floating-pill-widget-left", {
      y: 8,
      rotate: -1,
      repeat: -1,
      yoyo: true,
      duration: 3.2,
      ease: "sine.inOut"
    });

    gsap.to(".floating-pill-widget-right", {
      y: -10,
      rotate: 1,
      repeat: -1,
      yoyo: true,
      duration: 3.8,
      ease: "sine.inOut"
    });

    // Continuous Live Audio Equalizer Bar Oscillations
    gsap.to(".live-wave-bar", {
      scaleY: "random(0.35, 1.15)",
      repeat: -1,
      yoyo: true,
      duration: 0.35,
      stagger: {
        each: 0.05,
        repeat: -1,
        yoyo: true
      },
      ease: "sine.inOut"
    });
  }, { scope: containerRef });

  // Mouse spotlight coordinates
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Change simulated role
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setIsSimulatingAnswer(false);
    gsap.fromTo(".simulator-content", 
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
    );
  };

  // Text-to-speech for Question
  const handleSpeakQuestion = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeakingQuestion) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(selectedRole.question);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeakingQuestion(true);
    utterance.onend = () => setIsSpeakingQuestion(false);
    utterance.onerror = () => setIsSpeakingQuestion(false);

    window.speechSynthesis.speak(utterance);
  };

  // Simulate Candidate Audio Answer Playback
  const handleSimulateAnswer = () => {
    setIsSimulatingAnswer(true);
    gsap.fromTo(".simulated-audio-wave", 
      { scaleY: 0.3 },
      { scaleY: 1, repeat: 4, yoyo: true, duration: 0.3, stagger: 0.05, ease: "sine.inOut" }
    );

    setTimeout(() => {
      setIsSimulatingAnswer(false);
    }, 4500);
  };

  // GSAP Magnetic Button Hover Pull Effect
  const handleMagneticMouseMove = (e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.35;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.35;
    gsap.to(el, {
      x,
      y,
      scale: 1.03,
      duration: 0.25,
      ease: "power2.out"
    });
  };

  const handleMagneticMouseLeave = (e) => {
    const el = e.currentTarget;
    gsap.to(el, {
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.7,
      ease: "elastic.out(1.2, 0.35)"
    });
  };

  // Step Tab Click with Smooth GSAP Cross-fade
  const handleStepTabClick = (idx) => {
    setActiveStepTab(idx);
    gsap.fromTo(".step-showcase-content",
      { opacity: 0, y: 15, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out" }
    );
  };

  return (
    <div 
      ref={containerRef} 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] overflow-hidden relative text-[#0F172A] dark:text-[#F8FAFC] bg-grid-pattern selection:bg-blue-500 selection:text-white"
    >
      {/* Interactive Neural Constellation Particle Background */}
      <NeuralBackground />

      <Header />

      {/* Ambient Animated Glow Blobs (Royal Blue & Emerald) */}
      <div className="ambient-glow-1 floating-ambient-glow w-[580px] h-[580px] bg-[#2563EB]/15 top-16 -left-36" />
      <div className="ambient-glow-2 floating-ambient-glow w-[680px] h-[680px] bg-[#10B981]/15 top-36 -right-36" />

      {/* ========================================================================= */}
      {/* HERO SECTION                                                             */}
      {/* ========================================================================= */}
      <section className="relative pt-10 pb-16 px-6 max-w-6xl mx-auto text-center z-10">
        
        {/* Top Floating Pill Badge with Live Ollama Beacon */}
        <div className="hero-badge inline-flex items-center gap-2 mb-4 cursor-default flex-wrap justify-center">
          <Badge variant="blue" className="px-3.5 py-1 text-xs font-bold rounded-full shadow-sm flex items-center gap-1.5">
            <span className={`flex h-2 w-2 rounded-full ${ollamaStatus.online ? 'bg-[#10B981] animate-pulse' : 'bg-amber-400'}`} />
            <span>Ollama AI Engine: {ollamaStatus.model.toUpperCase()} {ollamaStatus.online ? 'ONLINE' : 'READY'}</span>
          </Badge>
          <Badge variant="outline" className="px-3 py-1 text-xs text-slate-600 dark:text-slate-300 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-sm border-slate-200/80 dark:border-slate-700">
            <Sparkles className="w-3 h-3 mr-1 text-blue-600" /> Powered by Supabase RLS & Web Audio
          </Badge>
        </div>

        {/* Live Tech Market Momentum Ticker */}
        <div className="market-ticker max-w-4xl mx-auto mb-6 p-2 px-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold text-slate-800 dark:text-slate-200">Tech Hiring Momentum (Live):</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-600 dark:text-slate-300">
              <strong className="text-blue-600 dark:text-blue-400">AI / ML:</strong> $165k-$225k <span className="text-emerald-500 font-bold">+54% YoY</span>
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-600 dark:text-slate-300">
              <strong className="text-purple-600 dark:text-purple-400">Full Stack:</strong> $130k-$175k <span className="text-emerald-500 font-bold">+41% YoY</span>
            </span>
            <span className="hidden md:inline text-slate-300 dark:text-slate-700">•</span>
            <span className="hidden md:inline text-slate-600 dark:text-slate-300">
              <strong className="text-indigo-600 dark:text-indigo-400">Cloud / DevOps:</strong> $140k-$190k <span className="text-emerald-500 font-bold">+38% YoY</span>
            </span>
          </div>
        </div>

        {/* Hero Title with Dynamic Gradient */}
        <h1 className="hero-title text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-[#0F172A] dark:text-white leading-[1.08] mb-6">
          Ace Your Next Interview with{" "}
          <span className="hero-gradient-text animate-gradient-shift inline-block drop-shadow-sm">
            Adaptive AI
          </span>
        </h1>

        {/* Subtitle */}
        <p className="hero-desc text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
          Practice role-tailored technical & behavioral mock sessions, speak naturally with live audio spectrum feedback, and receive instantaneous FAANG-calibrated AI evaluations.
        </p>

        {/* Action Buttons with Shimmer Sweep and GSAP Magnetic Pull */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <Link href={primaryCtaHref} className="hero-cta w-full sm:w-auto">
            <Button 
              size="lg" 
              onMouseMove={handleMagneticMouseMove}
              onMouseLeave={handleMagneticMouseLeave}
              className="relative overflow-hidden w-full sm:w-auto px-8 py-6 text-base font-semibold rounded-2xl shadow-xl hover:shadow-[#2563EB]/35 transition-all duration-200 bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Practicing Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </span>
              <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out pointer-events-none" />
            </Button>
          </Link>
          <a href="#simulator" className="hero-cta w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="lg" 
              onMouseMove={handleMagneticMouseMove}
              onMouseLeave={handleMagneticMouseLeave}
              className="w-full sm:w-auto px-8 py-6 text-base font-semibold rounded-2xl border-slate-300 dark:border-slate-700 bg-white/95 dark:bg-slate-800/90 text-[#0F172A] dark:text-white hover:bg-blue-50/90 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 shadow-sm flex items-center gap-2 group cursor-pointer"
            >
              <Play className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform fill-blue-600/15" />
              <span className="text-[#0F172A] dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Try Interactive Simulator
              </span>
            </Button>
          </a>
        </div>

        {/* Floating High-Tech Live Badges Framing the Hero */}
        <div className="relative max-w-4xl mx-auto mb-6 hidden md:block">
          {/* Left Floating Badge: Voice Visualizer */}
          <div className="floating-pill-widget floating-pill-widget-left absolute -top-8 -left-12 p-3 px-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-xl backdrop-blur-xl flex items-center gap-3 z-20 text-left">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] flex items-center justify-center shadow-inner">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white">16-Band Audio Dock</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="flex items-end gap-1 h-3 mt-1">
                {[30, 80, 50, 100, 70, 40, 90, 60].map((h, i) => (
                  <span 
                    key={i} 
                    style={{ height: `${h}%` }} 
                    className="live-wave-bar w-1 rounded-full bg-gradient-to-t from-blue-600 to-emerald-400" 
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Floating Badge: Ollama AI Score */}
          <div className="floating-pill-widget floating-pill-widget-right absolute -top-6 -right-12 p-3 px-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-xl backdrop-blur-xl flex items-center gap-3 z-20 text-left">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shadow-inner">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Ollama AI Evaluation</span>
                <Badge variant="success" className="text-[10px] font-bold px-1.5 py-0">9.7 / 10</Badge>
              </div>
              <span className="text-[11px] text-slate-500 block">Instant latency: 850ms</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE PLAYABLE SIMULATOR CARD WITH BORDER BEAM EFFECT               */}
        {/* ========================================================================= */}
        <div id="simulator" className="hero-simulator relative rounded-3xl p-1 bg-gradient-to-b from-blue-500/20 via-slate-200/40 to-slate-200/10 dark:from-blue-500/30 dark:via-slate-800/50 dark:to-slate-800/20 shadow-2xl backdrop-blur-xl">
          <div className="relative rounded-[22px] bg-white/95 dark:bg-[#0F172A]/95 p-6 sm:p-8 text-left overflow-hidden border border-slate-200/60 dark:border-slate-800/80">
            
            {/* Simulator Role Selector Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200/80 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
                  Interactive Live Preview
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white">
                  Select a Role & Test Drive the AI
                </h3>
              </div>
              <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                {DEMO_ROLES.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      selectedRole.id === role.id
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700"
                    }`}
                  >
                    {role.category}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Simulator Content */}
            <div className="simulator-content grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Interview Question & Live Voice Answer */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <Badge variant="outline" className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                    {selectedRole.title} ({selectedRole.stack})
                  </Badge>

                  {/* Audio Speech Button for Question */}
                  <button
                    onClick={handleSpeakQuestion}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors p-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 cursor-pointer"
                  >
                    {isSpeakingQuestion ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                        <span className="text-rose-500">Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Listen to Question</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Interview Question
                  </span>
                  <p className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white leading-snug">
                    &ldquo;{selectedRole.question}&rdquo;
                  </p>
                </div>

                {/* Candidate's Simulated Audio Response */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Candidate's Spoken Answer (Transcribed)
                      </span>
                    </div>

                    {/* Simulated Voice Equalizer */}
                    <div className="flex items-end gap-1 h-4">
                      {[40, 75, 30, 95, 60, 85, 45, 100, 65, 50, 90].map((h, i) => (
                        <span 
                          key={i} 
                          style={{ height: `${h}%` }}
                          className="simulated-audio-wave w-1 rounded-full bg-emerald-500 origin-bottom" 
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    &ldquo;{selectedRole.userAns}&rdquo;
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={handleSimulateAnswer}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{isSimulatingAnswer ? "Playing Candidate Voice..." : "Replay Candidate Spoken Audio"}</span>
                    </button>
                    <span className="text-[11px] text-slate-400 font-mono">148 Words • 48s</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Ollama AI Evaluation & Feedback */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/80 via-white to-emerald-50/50 dark:from-slate-900/90 dark:via-slate-800/90 dark:to-slate-900/90 border border-blue-200/70 dark:border-blue-900/50 shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      AI Rating
                    </span>
                    <Badge variant="success" className="text-xs font-black px-2 py-0.5 shadow-sm">
                      <Star className="w-3 h-3 mr-1 fill-emerald-600" />
                      {selectedRole.rating} / 10
                    </Badge>
                  </div>

                  {/* Dimension Micro-bars */}
                  <div className="space-y-2 mb-4">
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-0.5">
                        <span>Clarity & Structure</span>
                        <span className="text-blue-600">{selectedRole.clarity}</span>
                      </div>
                      <Progress value={parseInt(selectedRole.clarity)} className="h-1.5 bg-slate-200 dark:bg-slate-700" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-0.5">
                        <span>Technical Depth</span>
                        <span className="text-emerald-600">{selectedRole.depth}</span>
                      </div>
                      <Progress value={parseInt(selectedRole.depth)} className="h-1.5 bg-slate-200 dark:bg-slate-700" />
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    {selectedRole.feedback}
                  </p>

                  <div className="space-y-1.5 border-t border-slate-200/60 dark:border-slate-700/60 pt-3 text-[11px]">
                    <div className="text-emerald-700 dark:text-emerald-400 flex items-start gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{selectedRole.strengths[0]}</span>
                    </div>
                    <div className="text-amber-700 dark:text-amber-400 flex items-start gap-1.5 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{selectedRole.improvement}</span>
                    </div>
                  </div>
                </div>

                {/* 1-Click Practice This Role Button */}
                <Link href={primaryCtaHref}>
                  <Button 
                    className="w-full py-5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Practice {selectedRole.title} Track</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FAANG PLACEMENT SOCIAL PROOF TRUST STRIP                                  */}
        {/* ========================================================================= */}
        <div className="my-16 text-center">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-6">
            Candidates Landed Offers At Tier-1 Tech Giants
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-80 dark:opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
            <span className="font-black text-xl md:text-2xl text-slate-700 dark:text-slate-300 tracking-tight">Google</span>
            <span className="font-black text-xl md:text-2xl text-slate-700 dark:text-slate-300 tracking-tight">Meta</span>
            <span className="font-black text-xl md:text-2xl text-slate-700 dark:text-slate-300 tracking-tight">Amazon</span>
            <span className="font-black text-xl md:text-2xl text-slate-700 dark:text-slate-300 tracking-tight">Stripe</span>
            <span className="font-black text-xl md:text-2xl text-slate-700 dark:text-slate-300 tracking-tight">Netflix</span>
            <span className="font-black text-xl md:text-2xl text-slate-700 dark:text-slate-300 tracking-tight">OpenAI</span>
            <span className="font-black text-xl md:text-2xl text-slate-700 dark:text-slate-300 tracking-tight">Uber</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STATS SECTION                                                             */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-24 max-w-5xl mx-auto">
          {[
            { metric: "100%", label: "Private & Local Engine", icon: ShieldCheck, color: "text-emerald-500" },
            { metric: "850ms", label: "Ollama Inference Latency", icon: Zap, color: "text-blue-500" },
            { metric: "16-Band", label: "Real-Time Audio Spectrum", icon: Activity, color: "text-purple-500" },
            { metric: "2,400+", label: "Tier-1 Offers Landed", icon: Award, color: "text-amber-500" }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={idx} 
                className="stat-box p-6 border-slate-200/80 dark:border-slate-800 text-center shadow-sm cursor-pointer transition-colors"
              >
                <CardContent className="p-0">
                  <div className="inline-flex p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 mb-3 shadow-inner">
                    <Icon className={`stat-icon w-6 h-6 ${stat.color}`} />
                  </div>
                  <h3 className="text-3xl font-extrabold text-[#0F172A] dark:text-white font-mono mb-1">
                    {stat.metric}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE 3-STEP WALKTHROUGH ("HOW IT WORKS")                           */}
        {/* ========================================================================= */}
        <div id="how-it-works" className="mb-24 text-left">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block mb-2">
              Simple 3-Step Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
              From Custom Configuration to Job Offer
            </h2>
          </div>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {PLATFORM_STEPS.map((step, idx) => (
              <div
                key={idx}
                onClick={() => handleStepTabClick(idx)}
                className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer ${
                  activeStepTab === idx
                    ? 'bg-white dark:bg-slate-900 border-blue-500 shadow-xl ring-2 ring-blue-500/20 scale-[1.02]'
                    : 'bg-white/60 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:bg-white hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-2xl font-black font-mono ${
                    activeStepTab === idx ? 'text-blue-600' : 'text-slate-400'
                  }`}>
                    {step.step}
                  </span>
                  <Badge variant={activeStepTab === idx ? "blue" : "outline"} className="text-[11px] font-bold">
                    {step.badge}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Stepper Active Feature Showcase Banner linking to /dashboard/how-it-works */}
          <div className="step-showcase-content p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-slate-900 to-slate-950 text-white border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Active Platform Step: {PLATFORM_STEPS[activeStepTab].title}
              </span>
              <h4 className="text-2xl font-black text-white">
                {PLATFORM_STEPS[activeStepTab].highlight}
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {PLATFORM_STEPS[activeStepTab].desc}
              </p>
            </div>

            <Link href="/dashboard/how-it-works">
              <Button 
                size="lg" 
                className="rounded-2xl px-6 py-6 bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Explore Full Interactive Simulator</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ENRICHED BENTO GRID: 6 PLATFORM CAPABILITIES                              */}
        {/* ========================================================================= */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block mb-2">
              Next-Gen Engineering Stack
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
              Engineered to Replicate Real High-Stakes Interviews
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Bento Card 1: Ollama AI Engine */}
            <div className="glass-card p-8 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-200/80 dark:border-slate-800 relative group">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-[#2563EB] mb-6 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">Adaptive Ollama Llama 3.3 Engine</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-4">
                Tailor questions to your exact seniority, job role, and company stack with sub-second stream latency. Zero question repetition guaranteed.
              </p>
              <div className="text-xs font-semibold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Zero CORS Inference <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Bento Card 2: 16-Band Audio Dock */}
            <div className="glass-card p-8 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-200/80 dark:border-slate-800 relative group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-[#10B981] mb-6 group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">16-Band Real-Time Audio Dock</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-4">
                Real-time frequency visualizer provides visual mic gain validation. Spoken answers transcribed live via browser speech-to-text.
              </p>
              <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Live Waveform Feedback <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Bento Card 3: Supabase Security */}
            <div className="glass-card p-8 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-200/80 dark:border-slate-800 relative group">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-[#2563EB] mb-6 group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">Supabase PostgreSQL Security</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-4">
                Mock history, verbatim transcripts, and score trajectories stored in dedicated PostgreSQL tables guarded by Row Level Security (RLS).
              </p>
              <div className="text-xs font-semibold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                2FA & Privacy First <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Bento Card 4: Curated Question Bank */}
            <Link href="/dashboard/questions" className="block">
              <div className="glass-card p-8 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-200/80 dark:border-slate-800 relative group cursor-pointer h-full">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">AI Question Bank & Synthesis</h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-4">
                  Hundreds of Staff-level questions across 6 tracks (React 19, Kafka, RAG, CRDTs, Kubernetes) with on-demand Ollama synthesis.
                </p>
                <div className="text-xs font-semibold text-purple-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Explore Question Bank <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>

            {/* Bento Card 5: Persona Calibration */}
            <Link href="/dashboard" className="block">
              <div className="glass-card p-8 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-200/80 dark:border-slate-800 relative group cursor-pointer h-full">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                  <Sliders className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">Dynamic Persona Calibration</h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-4">
                  Adjust interviewer demeanor from supportive coaching to relentless FAANG high-pressure grilling to harden your confidence.
                </p>
                <div className="text-xs font-semibold text-amber-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Calibrate Persona <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>

            {/* Bento Card 6: Comprehensive PDF Reports */}
            <Link href="/dashboard/upgrade" className="block">
              <div className="glass-card p-8 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-200/80 dark:border-slate-800 relative group cursor-pointer h-full">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">Exportable Feedback Reports</h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-4">
                  Export complete PDF candidate dossiers detailing scores, speech metrics, model answers, and action plans to review with peers.
                </p>
                <div className="text-xs font-semibold text-rose-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Unlock Pro Reports <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CANDIDATE TESTIMONIALS                                                    */}
        {/* ========================================================================= */}
        <div className="mb-24 text-left">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block mb-2">Proven Track Record</span>
            <h2 className="text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
              Loved by Engineers Landing Tier-1 Offers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                quote: "PrepSmart's voice feedback pinpointed exactly where I was rambling on distributed caching questions. Landed my Senior SDE offer 3 weeks later!",
                name: "Alex Rivera",
                role: "Senior Software Engineer",
                company: "Offer at Meta"
              },
              {
                quote: "The live voice visualizer dock felt like a real hiring manager call. Getting instant question-by-question grading completely changed my preparation.",
                name: "Priya Sharma",
                role: "Full Stack Developer",
                company: "Offer at Stripe"
              },
              {
                quote: "The Ollama AI model evaluation and rapid feedback meant zero lag during my sessions. Truly an indispensable interview preparation platform.",
                name: "Marcus Vance",
                role: "Cloud Architect",
                company: "Offer at Amazon AWS"
              },
              {
                quote: "Practicing the RAG and LLM quantization questions in the Question Bank helped me ace my AI systems round with zero surprises.",
                name: "Elena Rostova",
                role: "Senior AI Researcher",
                company: "Offer at Scale AI"
              }
            ].map((t, i) => (
              <Card 
                key={i} 
                className="p-6 rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div className="mb-4">
                  <div className="flex gap-1 mb-2 text-amber-500">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(t.name)}`} alt={t.name} />
                    <AvatarFallback>{t.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-xs text-[#0F172A] dark:text-white">{t.name}</h4>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{t.company}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE FAQ ACCORDION                                                 */}
        {/* ========================================================================= */}
        <div className="mb-24 max-w-3xl mx-auto text-left">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block mb-2">Got Questions?</span>
            <h2 className="text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FINAL CALL TO ACTION BANNER                                               */}
        {/* ========================================================================= */}
        <div className="p-10 md:p-14 rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white text-center shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Start Practicing In Under 60 Seconds
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Ready to Master Your Next Interview?
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Generate role-specific mock questions, speak freely with live audio spectrum validation, and gain the competitive edge for your dream job.
            </p>
            <div>
              <Link href={primaryCtaHref}>
                <Button 
                  size="lg" 
                  onMouseMove={handleMagneticMouseMove}
                  onMouseLeave={handleMagneticMouseLeave}
                  className="px-8 py-6 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold transition-all shadow-xl flex items-center gap-2 mx-auto cursor-pointer"
                >
                  <span>Start Practicing for Free</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* ELEVATED PLATFORM FOOTER                                                  */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 px-6 relative z-10 bg-[#F8FAFC]/90 dark:bg-[#0F172A]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-slate-900 dark:text-white">PrepSmart AI 2.0</span>
            <span>• Adaptive Interview Intelligence</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-semibold">
            <Link href="/dashboard" className="hover:text-blue-600 transition">Candidate Dashboard</Link>
            <Link href="/dashboard/questions" className="hover:text-blue-600 transition">Question Bank</Link>
            <Link href="/dashboard/upgrade" className="hover:text-blue-600 transition">Upgrade to PRO</Link>
            <Link href="/dashboard/how-it-works" className="hover:text-blue-600 transition">How It Works</Link>
          </div>

          <p>&copy; {new Date().getFullYear()} PrepSmart AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
