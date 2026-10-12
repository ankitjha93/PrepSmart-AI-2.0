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
import MouseEffect from "@/components/MouseEffect";
import ScrollEffects from "@/components/ScrollEffects";
import { useAuth } from "@/context/AuthContext";
import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
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
  BarChart3
} from "lucide-react";

// Interactive Simulation Data for 5 Key Tech Roles
const DEMO_ROLES = [
  {
    id: 'fullstack',
    title: 'Full Stack Engineer',
    category: 'Full Stack',
    stack: 'React, Node.js, PostgreSQL',
    question: 'How do you optimize database query performance and handle optimistic UI updates during state changes?',
    userAns: 'I analyze query execution plans using EXPLAIN ANALYZE, apply targeted composite indices, and in React implement optimistic updates with automatic rollback states on mutation errors.',
    rating: '9.4',
    clarity: '96%',
    depth: '92%',
    confidence: '94%',
    feedback: 'Excellent breakdown of database indexing combined with practical client-side state rollback handling.',
    strengths: ['Addressed both backend query planning and frontend optimistic UX.', 'Properly explained rollback mechanisms.'],
    improvement: 'Consider mentioning connection pool sizing and Redis caching layers.'
  },
  {
    id: 'frontend',
    title: 'Frontend Specialist',
    category: 'Frontend',
    stack: 'Next.js 14, React, Tailwind CSS',
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
    stack: 'PyTorch, Gemini 3.5, RAG Pipelines',
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
    userAns: 'Using Argo Rollouts or Flagger with Istio traffic routing, monitoring Prometheus metric error rates, and automatically rolling back traffic if HTTP 5xx exceeds 0.5% threshold.',
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
    title: "Define Your Target Role",
    desc: "Specify your exact job title, tech stack (e.g., React, Go, PyTorch), and seniority level. Gemini 3.5 creates authentic technical & behavioral questions in seconds.",
    badge: "Tailored AI Generator",
    highlight: "Custom Job Description & Stack Support"
  },
  {
    step: "02",
    title: "Live Voice & Webcam Practice",
    desc: "Speak naturally while our 16-band real-time audio visualizer confirms clear input. Simulated hiring manager questions replicate real high-pressure calls.",
    badge: "16-Band Audio Dock",
    highlight: "Speech-to-Text with Real-Time Feedback"
  },
  {
    step: "03",
    title: "Instant Scoring & Actionable Feedback",
    desc: "Receive question-by-question scoring out of 10, compare against ideal benchmark responses, and get surgical tips to level up your interview performance.",
    badge: "Comprehensive Report",
    highlight: "FAANG-Calibrated Rubric Analysis"
  }
];

// FAQs Data
const FAQS = [
  {
    q: "How does the real-time speech visualizer work?",
    a: "PrepSmart connects to your microphone using the HTML5 Web Audio API, extracting real-time audio frequencies into a responsive 16-band visualizer dock so you can visually verify that your voice is loud, clear, and perfectly captured."
  },
  {
    q: "Does PrepSmart record or store my webcam video?",
    a: "No! Your webcam video feed is processed 100% locally in your browser. Video streams are never recorded or stored on any server. You can also turn off your camera at any point during your interview."
  },
  {
    q: "What types of interview questions are generated?",
    a: "Our Google Gemini multi-model engine generates authentic technical, algorithmic, system design, and behavioral questions tailored directly to your target company, role, tech stack, and years of experience."
  },
  {
    q: "Where is my interview history stored?",
    a: "Your mock interview sessions, questions, transcribed answers, ratings, and feedback are securely stored in your dedicated PostgreSQL database powered by Supabase with Row Level Security (RLS)."
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

  // GSAP Animations
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    // Hero Entry Animation
    tl.from(".hero-badge", { y: -25, opacity: 0, duration: 0.7 })
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

  // Button 1: Test Voice Simulation Hover Interaction
  const handleVoiceSimEnter = (e) => {
    const btn = e.currentTarget;
    const micIcon = btn.querySelector('.voice-sim-mic');
    if (micIcon) {
      gsap.to(micIcon, {
        scale: 1.35,
        rotate: -12,
        duration: 0.25,
        ease: "back.out(2.5)"
      });
    }
    if (!isSimulatingAnswer) {
      gsap.to(".simulated-audio-wave", {
        scaleY: () => Math.random() * 0.7 + 0.4,
        stagger: 0.02,
        duration: 0.25,
        ease: "power2.out"
      });
    }
  };

  const handleVoiceSimLeave = (e) => {
    const btn = e.currentTarget;
    const micIcon = btn.querySelector('.voice-sim-mic');
    if (micIcon) {
      gsap.to(micIcon, {
        scale: 1,
        rotate: 0,
        duration: 0.35,
        ease: "power2.out"
      });
    }
    if (!isSimulatingAnswer) {
      gsap.to(".simulated-audio-wave", {
        scaleY: 0.25,
        duration: 0.35,
        ease: "power2.out"
      });
    }
  };

  // Button 2: Practice This Role Now Hover Interaction
  const handlePracticeButtonEnter = (e) => {
    const btn = e.currentTarget;
    const arrow = btn.querySelector('.practice-btn-arrow');
    const spark = btn.querySelector('.practice-btn-spark');
    if (arrow) {
      gsap.to(arrow, {
        x: 6,
        scale: 1.15,
        duration: 0.25,
        ease: "back.out(2)"
      });
    }
    if (spark) {
      gsap.to(spark, {
        rotate: 45,
        scale: 1.25,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  const handlePracticeButtonLeave = (e) => {
    const btn = e.currentTarget;
    const arrow = btn.querySelector('.practice-btn-arrow');
    const spark = btn.querySelector('.practice-btn-spark');
    if (arrow) {
      gsap.to(arrow, {
        x: 0,
        scale: 1,
        duration: 0.35,
        ease: "power2.out"
      });
    }
    if (spark) {
      gsap.to(spark, {
        rotate: 0,
        scale: 1,
        duration: 0.3
      });
    }
  };

  // Elevated 3D Card Tilt Effect with Dynamic Shadow Bloom
  const handleCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(card, {
      rotationY: (x / rect.width) * 16,
      rotationX: (-y / rect.height) * 16,
      scale: 1.025,
      boxShadow: "0 20px 40px -15px rgba(37, 99, 235, 0.18)",
      transformPerspective: 1000,
      ease: "power2.out",
      duration: 0.3
    });
  };

  const handleCardMouseLeave = (e) => {
    const card = e.currentTarget;
    gsap.to(card, {
      rotationY: 0,
      rotationX: 0,
      scale: 1,
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
      ease: "elastic.out(1, 0.4)",
      duration: 0.8
    });
  };

  // Stat Box GSAP Hover Interaction with Icon Bounce
  const handleStatBoxEnter = (e) => {
    const box = e.currentTarget;
    const icon = box.querySelector(".stat-icon");
    gsap.to(box, { y: -8, scale: 1.03, duration: 0.25, ease: "power2.out" });
    if (icon) {
      gsap.to(icon, { rotate: 15, scale: 1.25, duration: 0.3, ease: "back.out(2)" });
    }
  };

  const handleStatBoxLeave = (e) => {
    const box = e.currentTarget;
    const icon = box.querySelector(".stat-icon");
    gsap.to(box, { y: 0, scale: 1, duration: 0.6, ease: "elastic.out(1.1, 0.4)" });
    if (icon) {
      gsap.to(icon, { rotate: 0, scale: 1, duration: 0.35, ease: "power2.out" });
    }
  };

  // Step Tab Click with Smooth GSAP Cross-fade
  const handleStepTabClick = (idx) => {
    setActiveStepTab(idx);
    gsap.fromTo(".step-showcase-content",
      { opacity: 0, y: 15, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out" }
    );
  };

  // Testimonial Hover Lift
  const handleTestimonialEnter = (e) => {
    gsap.to(e.currentTarget, { y: -6, scale: 1.02, duration: 0.3, ease: "power2.out" });
  };

  const handleTestimonialLeave = (e) => {
    gsap.to(e.currentTarget, { y: 0, scale: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" });
  };

  return (
    <div 
      ref={containerRef} 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] overflow-hidden relative text-[#0F172A] dark:text-[#F8FAFC] bg-grid-pattern selection:bg-blue-500 selection:text-white"
    >
      {/* Modern & Attractive Mouse Follower & Bioluminescent Spotlight */}
      <MouseEffect />

      {/* Modern & Attractive Scroll Progress Tracker & Back-To-Top Gauge */}
      <ScrollEffects />

      {/* Interactive Neural Constellation Particle Background */}
      <NeuralBackground />

      <Header />

      {/* Ambient Animated Glow Blobs (Royal Blue & Emerald) */}
      <div className="ambient-glow-1 floating-ambient-glow w-[580px] h-[580px] bg-[#2563EB]/15 top-16 -left-36" />
      <div className="ambient-glow-2 floating-ambient-glow w-[680px] h-[680px] bg-[#10B981]/15 top-36 -right-36" />

      {/* ========================================================================= */}
      {/* HERO SECTION                                                             */}
      {/* ========================================================================= */}
      <section className="relative pt-12 pb-16 px-6 max-w-6xl mx-auto text-center z-10">
        
        {/* Top Floating Pill Badge */}
        <div className="hero-badge inline-flex items-center gap-2 mb-6 cursor-default flex-wrap justify-center">
          <Badge variant="blue" className="px-3.5 py-1 text-xs font-bold rounded-full shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-[#10B981] animate-pulse mr-1.5" />
            PrepSmart AI 2.0 Live
          </Badge>
          <Badge variant="outline" className="px-3 py-1 text-xs text-slate-600 dark:text-slate-300 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-sm border-slate-200/80 dark:border-slate-700">
            <Sparkles className="w-3 h-3 mr-1.5 text-blue-600" /> Powered by Gemini 3.5 & Supabase
          </Badge>
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

          {/* Right Floating Badge: Gemini 3.5 AI Score */}
          <div className="floating-pill-widget floating-pill-widget-right absolute -top-6 -right-12 p-3 px-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-xl backdrop-blur-xl flex items-center gap-3 z-20 text-left">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shadow-inner">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Gemini 3.5 Evaluation</span>
                <Badge variant="success" className="text-[10px] font-bold px-1.5 py-0">9.7 / 10</Badge>
              </div>
              <span className="text-[11px] text-slate-500 block">Instant latency: 1.2s</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE PLAYABLE SIMULATOR CARD WITH BORDER BEAM EFFECT               */}
        {/* ========================================================================= */}
        <div 
          id="simulator" 
          className="hero-simulator border-beam-effect max-w-4xl mx-auto text-left rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-[#0F172A]/95 shadow-2xl backdrop-blur-2xl p-6 md:p-8 mb-20 relative overflow-hidden"
        >
          {/* Subtle Top Ambient Gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

          {/* Top Bar with Role Switchers */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] dark:text-blue-400 uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4 text-[#10B981]" /> Interactive Live Preview
              </div>
              <h2 className="text-xl font-bold text-[#0F172A] dark:text-white">
                Select a Role & Test Drive the AI
              </h2>
            </div>

            {/* Role Pills */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              {DEMO_ROLES.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    selectedRole.id === role.id
                      ? 'bg-[#2563EB] text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:text-[#0F172A] dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {role.category}
                </button>
              ))}
            </div>
          </div>

          {/* Simulator Body */}
          <div className="simulator-content pt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Left: Question, Audio TTS, and Spoken Answer (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-300 border border-blue-200/60">
                  <Brain className="w-3.5 h-3.5" />
                  <span>{selectedRole.title} ({selectedRole.stack})</span>
                </div>

                {/* Question Audio TTS Button */}
                <button
                  onClick={handleSpeakQuestion}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all border ${
                    isSpeakingQuestion 
                      ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300' 
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                  title="Listen to question via synthesized speech"
                >
                  {isSpeakingQuestion ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                      <span>Speaking Question...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Listen to Question</span>
                    </>
                  )}
                </button>
              </div>

              {/* Question Box */}
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Interview Question
                </span>
                <p className="text-base font-semibold text-[#0F172A] dark:text-white leading-snug">
                  &ldquo;{selectedRole.question}&rdquo;
                </p>
              </div>

              {/* Candidate Response Transcript */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Transcribed Spoken Answer:
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Speech Confirmed
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  &ldquo;{selectedRole.userAns}&rdquo;
                </p>
              </div>

              {/* Interactive Audio Simulation Trigger */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50">
                <div className="flex items-center gap-3">
                  {/* Dynamic 12-band equalizer */}
                  <div className="flex items-end gap-1 h-6">
                    {[40, 85, 60, 100, 75, 45, 90, 65, 30, 80, 50, 95].map((h, i) => (
                      <span 
                        key={i} 
                        style={{ height: `${h}%` }} 
                        className={`simulated-audio-wave w-1.5 rounded-full bg-gradient-to-t from-[#2563EB] to-[#10B981] ${
                          isSimulatingAnswer ? 'animate-pulse' : ''
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-[#10B981] flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" /> 16-Band Live Visualizer
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSimulateAnswer}
                  disabled={isSimulatingAnswer}
                  onMouseMove={handleMagneticMouseMove}
                  onMouseEnter={handleVoiceSimEnter}
                  onMouseLeave={(e) => {
                    handleMagneticMouseLeave(e);
                    handleVoiceSimLeave(e);
                  }}
                  className="group relative overflow-hidden w-full sm:w-auto text-xs font-bold border border-blue-200/90 dark:border-blue-800/80 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 hover:text-white hover:border-transparent rounded-2xl shadow-sm hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 cursor-pointer px-4 py-2"
                >
                  {/* Sliding Hover Gradient Backdrop */}
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0" />

                  {/* Pulsing Ripple Aura on Hover */}
                  <span className="absolute -inset-1 rounded-2xl bg-blue-500/20 scale-0 group-hover:scale-100 transition-transform duration-300 pointer-events-none" />

                  <span className="relative z-10 flex items-center justify-center gap-1.5">
                    {isSimulatingAnswer ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 animate-spin mr-1 text-white" />
                        <span>Simulating Speech...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="voice-sim-mic w-3.5 h-3.5 text-blue-600 group-hover:text-white transition-colors" />
                        <span>Test Voice Simulation</span>
                      </>
                    )}
                  </span>
                </Button>
              </div>
            </div>

            {/* Right: Instant Score & Feedback Badge (5 cols) */}
            <div className="md:col-span-5 p-5 rounded-2xl bg-gradient-to-br from-[#2563EB]/10 via-[#F8FAFC] to-[#10B981]/10 dark:from-slate-800 dark:to-slate-900 border border-blue-200/70 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">AI Rating</span>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] text-xs font-bold border border-[#10B981]/30">
                  <Star className="w-3.5 h-3.5 fill-[#10B981]" />
                  <span>{selectedRole.rating} / 10</span>
                </div>
              </div>

              {/* Three Metrics with Animated Progress Bars */}
              <div className="space-y-2.5 p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500 font-medium">Clarity</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{selectedRole.clarity}</span>
                  </div>
                  <Progress value={parseInt(selectedRole.clarity) || 94} className="h-1.5" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500 font-medium">Tech Depth</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{selectedRole.depth}</span>
                  </div>
                  <Progress value={parseInt(selectedRole.depth) || 91} className="h-1.5" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500 font-medium">Confidence</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{selectedRole.confidence}</span>
                  </div>
                  <Progress value={parseInt(selectedRole.confidence) || 95} className="h-1.5" />
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-[#2563EB] dark:text-blue-400 uppercase tracking-wide block mb-1">
                  AI Feedback Highlight:
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedRole.feedback}
                </p>
              </div>

              <div className="space-y-1.5 pt-1 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{selectedRole.strengths[0]}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <span>{selectedRole.improvement}</span>
                </div>
              </div>

              <Link href="/dashboard" className="pt-2">
                <Button
                  size="sm"
                  onMouseMove={handleMagneticMouseMove}
                  onMouseEnter={handlePracticeButtonEnter}
                  onMouseLeave={(e) => {
                    handleMagneticMouseLeave(e);
                    handlePracticeButtonLeave(e);
                  }}
                  className="group relative overflow-hidden w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-600 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
                >
                  {/* Diagonal Shimmer Light Sweep Reflection */}
                  <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12 -translate-x-[150%] group-hover:translate-x-[350%] transition-transform duration-1000 ease-out pointer-events-none" />

                  {/* Button Content with Micro Sparkle and Gliding Arrow */}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Sparkles className="practice-btn-spark w-4 h-4 text-amber-300 shrink-0" />
                    <span>Practice This Role Now</span>
                    <ChevronRight className="practice-btn-arrow w-4 h-4 shrink-0 transition-transform" />
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STATS & METRICS COUNTER BAR                                              */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-24 max-w-5xl mx-auto">
          {[
            { metric: '15,000+', label: 'Mock Sessions Completed', icon: Users, color: 'text-[#2563EB]' },
            { metric: '94%', label: 'Offer Conversion Rate', icon: TrendingUp, color: 'text-[#10B981]' },
            { metric: '100+', label: 'Supported Tech Roles', icon: Layers, color: 'text-[#2563EB]' },
            { metric: '< 1.8s', label: 'Gemini AI Response Time', icon: Zap, color: 'text-[#10B981]' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={i} 
                onMouseEnter={handleStatBoxEnter}
                onMouseLeave={handleStatBoxLeave}
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

          {/* Stepper Active Feature Showcase Banner */}
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

            <Link href="/dashboard">
              <Button 
                size="lg" 
                onMouseMove={handleMagneticMouseMove}
                onMouseLeave={handleMagneticMouseLeave}
                className="rounded-2xl px-6 py-6 bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Start Step {PLATFORM_STEPS[activeStepTab].step} Now</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BENTO GRID: CORE PLATFORM CAPABILITIES                                    */}
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
            {/* Bento Card 1 */}
            <div 
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              className="feature-card perspective-1000 glass-card p-8 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-200/80 dark:border-slate-800 relative group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-[#2563EB] mb-6 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-3">Adaptive Role AI Generator</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                Tailor questions to your exact seniority, job role, and company stack. Multi-model failover ensures 100% uptime with zero question repetition.
              </p>
              <div className="text-xs font-semibold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Explore Generator <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Bento Card 2 */}
            <div 
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              className="feature-card perspective-1000 glass-card p-8 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-200/80 dark:border-slate-800 relative group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-[#10B981] mb-6 group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-3">16-Band Real-Time Audio Dock</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                Real-time frequency visualizer gives immediate confirmation of voice clarity. Audio responses are transcribed via Gemini multimodal intelligence.
              </p>
              <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Test Voice Engine <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Bento Card 3 */}
            <div 
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              className="feature-card perspective-1000 glass-card p-8 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-slate-200/80 dark:border-slate-800 relative group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-[#2563EB] mb-6 group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-3">Supabase PostgreSQL Storage</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                Session history, question rubrics, and feedback reports are stored securely in PostgreSQL with Row Level Security for complete privacy.
              </p>
              <div className="text-xs font-semibold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                View Architecture <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "PrepSmart's voice feedback pinpointed exactly where I was rambling on distributed caching questions. Landed my Senior SDE offer 3 weeks later!",
                name: "Alex Rivera",
                role: "Senior Software Engineer",
                company: "Tech Lead at Scale"
              },
              {
                quote: "The live voice visualizer dock felt like a real hiring manager call. Getting instant question-by-question grading completely changed my preparation.",
                name: "Priya Sharma",
                role: "Full Stack Developer",
                company: "Fintech Unicorn"
              },
              {
                quote: "The Gemini AI model failover and rapid evaluation meant zero lag during my sessions. Truly an indispensable interview preparation platform.",
                name: "Marcus Vance",
                role: "Cloud Architect",
                company: "Enterprise SaaS"
              }
            ].map((t, i) => (
              <Card 
                key={i} 
                onMouseEnter={handleTestimonialEnter}
                onMouseLeave={handleTestimonialLeave}
                className="p-7 rounded-3xl border-slate-200/80 dark:border-slate-800 shadow-sm cursor-pointer flex flex-col justify-between"
              >
                <div className="mb-6">
                  <div className="flex gap-1 mb-3 text-amber-500">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(t.name)}`} alt={t.name} />
                    <AvatarFallback>{t.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-sm text-[#0F172A] dark:text-white">{t.name}</h4>
                    <p className="text-xs text-slate-500">{t.role} • {t.company}</p>
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

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800">
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

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-6 text-center text-sm text-slate-500 dark:text-slate-400 relative z-10 bg-[#F8FAFC]/80 dark:bg-[#0F172A]/80 backdrop-blur-md">
        <p>&copy; {new Date().getFullYear()} PrepSmart AI 2.0. Master your interview skills with confidence.</p>
      </footer>
    </div>
  );
}
