"use client"
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import Header from "./dashboard/_components/Header";
import React, { useRef, useState } from "react";
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
  ShieldCheck
} from "lucide-react";

// Interactive Demo Role Data
const DEMO_ROLES = [
  {
    id: 'fullstack',
    title: 'Full Stack Engineer',
    stack: 'React, Node.js, PostgreSQL',
    question: 'How do you optimize database query performance and handle optimistic UI updates during state changes?',
    userAns: 'I analyze query execution plans using EXPLAIN ANALYZE, apply targeted composite indices, and in React use optimistic updates with rollback states on error.',
    rating: '9.4',
    clarity: '96%',
    depth: '92%',
    feedback: 'Excellent breakdown of database indexing combined with practical client-side state rollback handling.'
  },
  {
    id: 'frontend',
    title: 'Frontend Specialist',
    stack: 'Next.js, React, Tailwind CSS',
    question: 'Explain how React Server Components (RSC) differ from Client Components regarding bundle size and hydration.',
    userAns: 'RSCs render purely on the server and send serialized zero-bundle-size JSON to the client, avoiding client-side hydration overhead completely.',
    rating: '9.7',
    clarity: '98%',
    depth: '95%',
    feedback: 'Pinpoint accuracy regarding zero-bundle impact and streaming SSR hydration benefits.'
  },
  {
    id: 'backend',
    title: 'Backend Architect',
    stack: 'Go, Microservices, Redis',
    question: 'How do you prevent cache stampedes (thundering herd problem) in high-throughput distributed architectures?',
    userAns: 'By implementing mutex locking with singleflight patterns, probabilistic early expiration (XFetch), and warm cache prefetching in background workers.',
    rating: '9.5',
    clarity: '94%',
    depth: '96%',
    feedback: 'Demonstrates deep production experience with distributed cache coordination and cache invalidation strategies.'
  },
  {
    id: 'ai',
    title: 'AI / ML Engineer',
    stack: 'PyTorch, LLMs, RAG Pipelines',
    question: 'What strategies reduce hallucination and improve retrieval recall in production Retrieval-Augmented Generation (RAG)?',
    userAns: 'Using hybrid vector + keyword search (BM25), cross-encoder re-ranking, contextual chunk headers, and strict semantic guardrails.',
    rating: '9.6',
    clarity: '95%',
    depth: '97%',
    feedback: 'Superb coverage of modern re-ranking techniques and contextual retrieval pipeline hygiene.'
  }
];

export default function Home() {
  const containerRef = useRef(null);
  const [selectedRole, setSelectedRole] = useState(DEMO_ROLES[0]);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    // Hero Entry Animation
    tl.from(".hero-badge", { y: -25, opacity: 0, duration: 0.7 })
      .from(".hero-title", { y: 35, opacity: 0, duration: 0.9 }, "-=0.4")
      .from(".hero-desc", { y: 25, opacity: 0, duration: 0.7 }, "-=0.5")
      .from(".hero-cta", { y: 20, opacity: 0, stagger: 0.1, duration: 0.7 }, "-=0.4")
      .from(".hero-simulator", { y: 40, opacity: 0, duration: 1 }, "-=0.3")
      .from(".stat-box", { y: 30, opacity: 0, stagger: 0.1, duration: 0.7 }, "-=0.4");

    // Ambient Floating Glow Animation (Blue and Emerald)
    gsap.to(".ambient-glow-1", {
      x: 35,
      y: 25,
      repeat: -1,
      yoyo: true,
      duration: 8,
      ease: "sine.inOut"
    });

    gsap.to(".ambient-glow-2", {
      x: -45,
      y: -35,
      repeat: -1,
      yoyo: true,
      duration: 10,
      ease: "sine.inOut"
    });
  }, { scope: containerRef });

  // 3D Card Tilt Effect on Mouse Move
  const handleCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(card, {
      rotationY: x * 0.06,
      rotationX: -y * 0.06,
      transformPerspective: 800,
      ease: "power1.out",
      duration: 0.3
    });
  };

  const handleCardMouseLeave = (e) => {
    const card = e.currentTarget;
    gsap.to(card, {
      rotationY: 0,
      rotationX: 0,
      ease: "power2.out",
      duration: 0.5
    });
  };

  // Change simulated role
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    gsap.fromTo(".simulator-content", 
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
    );
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] overflow-hidden relative text-[#0F172A] dark:text-[#F8FAFC]">
      <Header />

      {/* Ambient Animated Glow Blobs (Royal Blue & Emerald) */}
      <div className="ambient-glow-1 floating-ambient-glow w-[550px] h-[550px] bg-[#2563EB]/15 top-20 -left-40" />
      <div className="ambient-glow-2 floating-ambient-glow w-[650px] h-[650px] bg-[#10B981]/15 top-40 -right-40" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-6 max-w-6xl mx-auto text-center z-10">
        {/* Pill Badge */}
        <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/25 backdrop-blur-md mb-8 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-xs font-semibold text-[#2563EB] dark:text-blue-400 uppercase tracking-wider">Next-Gen Interview AI</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">• Powered by Gemini 3.5 AI</span>
        </div>

        {/* Hero Title */}
        <h1 className="hero-title text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-[#0F172A] dark:text-white leading-[1.08] mb-6">
          Ace Your Next Interview with{" "}
          <span className="hero-gradient-text">Adaptive AI</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-desc text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
          Practice tailored mock interviews for your exact role, speak naturally with real-time voice analysis, and receive instant comprehensive rating and expert feedback.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/dashboard" className="hero-cta w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-base font-semibold rounded-2xl shadow-xl hover:shadow-[#2563EB]/25 hover:scale-105 transition-all duration-300 bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center justify-center gap-2 group">
              Start Practicing Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <a href="#simulator" className="hero-cta w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-6 text-base font-medium rounded-2xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white hover:bg-slate-100 dark:hover:bg-slate-750 transition-all duration-300">
              Try Interactive Demo
            </Button>
          </a>
        </div>

        {/* INTERACTIVE LIVE DEMO SIMULATOR */}
        <div id="simulator" className="hero-simulator max-w-4xl mx-auto text-left rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-[#0F172A]/95 shadow-2xl backdrop-blur-xl p-6 md:p-8 mb-20 relative overflow-hidden">
          {/* Top Bar with Role Switchers */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] dark:text-blue-400 uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4 text-[#10B981]" /> Interactive Simulation Preview
              </div>
              <h2 className="text-xl font-bold text-[#0F172A] dark:text-white">
                Select a Role to Preview Questions
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
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-[#0F172A] dark:hover:text-white'
                  }`}
                >
                  {role.title.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Simulator Body */}
          <div className="simulator-content pt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left: Question & Answer (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-300 border border-blue-200/60">
                <Brain className="w-3.5 h-3.5" />
                <span>{selectedRole.title} ({selectedRole.stack})</span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Question</span>
                <p className="text-base font-semibold text-[#0F172A] dark:text-white leading-snug">
                  "{selectedRole.question}"
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Transcribed Spoken Response:</span>
                <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  "{selectedRole.userAns}"
                </p>
              </div>

              {/* Animated Waveform Visualizer Mock (Blue to Emerald) */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-end gap-1 h-6">
                  {[40, 85, 60, 100, 75, 45, 90, 65, 30, 80, 50, 95].map((h, i) => (
                    <span 
                      key={i} 
                      style={{ height: `${h}%` }} 
                      className="w-1.5 rounded-full bg-gradient-to-t from-[#2563EB] to-[#10B981] animate-pulse" 
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-[#10B981] flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 animate-spin" /> Speech Analyzed by Gemini AI
                </span>
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

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 block">Clarity</span>
                  <span className="text-sm font-bold text-[#0F172A] dark:text-white font-mono">{selectedRole.clarity}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 block">Tech Depth</span>
                  <span className="text-sm font-bold text-[#0F172A] dark:text-white font-mono">{selectedRole.depth}</span>
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

              <Link href="/dashboard" className="pt-1">
                <Button size="sm" className="w-full rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-sm">
                  Practice This Role Now <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* STATS & METRICS COUNTER BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-24 max-w-5xl mx-auto">
          {[
            { metric: '15,000+', label: 'Mock Interviews Taken', icon: Users, color: 'text-[#2563EB]' },
            { metric: '94%', label: 'Candidate Offer Rate', icon: TrendingUp, color: 'text-[#10B981]' },
            { metric: '100+', label: 'Tech Stacks Supported', icon: Layers, color: 'text-[#2563EB]' },
            { metric: '< 2.5s', label: 'AI Evaluation Latency', icon: Zap, color: 'text-[#10B981]' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div 
                key={i} 
                className="stat-box p-6 rounded-2xl glass-card border border-slate-200/80 dark:border-slate-800 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <Icon className={`w-6 h-6 ${stat.color} mx-auto mb-3`} />
                <h3 className="text-3xl font-extrabold text-[#0F172A] dark:text-white font-mono mb-1">
                  {stat.metric}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* 3D TILT FEATURE CARDS */}
        <div id="how-it-works" className="mb-24">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block mb-2">Core Platform Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
              Engineered to Replicate Real High-Stakes Interviews
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Card 1 */}
            <div 
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              className="feature-card perspective-1000 glass-card p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-500 border border-slate-200/80 dark:border-slate-800 relative group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-[#2563EB] mb-6 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-3">Custom Role AI Generator</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Enter your targeted job position, tech stack, and years of experience. Gemini generates authentic, high-relevance interview questions tailored to your profile.
              </p>
            </div>

            {/* Card 2 */}
            <div 
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              className="feature-card perspective-1000 glass-card p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-500 border border-slate-200/80 dark:border-slate-800 relative group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-[#10B981] mb-6 group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-3">Real-Time Voice Visualizer</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Experience dynamic audio feedback with a 16-band real-time sound visualizer dock. Speak naturally just like a real video interview.
              </p>
            </div>

            {/* Card 3 */}
            <div 
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              className="feature-card perspective-1000 glass-card p-8 rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-500 border border-slate-200/80 dark:border-slate-800 relative group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-[#2563EB] mb-6 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-3">Instant Detailed Feedback</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Get comprehensive question-by-question scoring, compare your answer against ideal benchmarks, and discover concrete steps for improvement.
              </p>
            </div>
          </div>
        </div>

        {/* CANDIDATE TESTIMONIALS */}
        <div className="mb-24 text-left">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider block mb-2">Proven Track Record</span>
            <h2 className="text-3xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
              Loved by Engineers Landing Top Offers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "PrepSmart's voice feedback pinpointed exactly where I was rambling on system design questions. Landed my Senior SDE offer 3 weeks later!",
                name: "Alex Rivera",
                role: "Senior Software Engineer",
                company: "Tech Lead"
              },
              {
                quote: "The live voice visualizer dock felt like a real hiring manager call. Getting instant question-by-question grading completely changed my interview prep.",
                name: "Priya Sharma",
                role: "Full Stack Developer",
                company: "Fintech Startup"
              },
              {
                quote: "The AI model failover and fast responses meant zero lag during my practice sessions. Truly an indispensable interview preparation platform.",
                name: "Marcus Vance",
                role: "Cloud Architect",
                company: "Enterprise SaaS"
              }
            ].map((t, i) => (
              <div key={i} className="p-7 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="mb-6">
                  <div className="flex gap-1 mb-3 text-amber-500">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0F172A] dark:text-white">{t.name}</h4>
                  <p className="text-xs text-slate-500">{t.role} • {t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FINAL CALL TO ACTION BANNER (Dark Slate with Blue Highlights) */}
        <div className="p-10 md:p-14 rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white text-center shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
              Start Practicing for Your Dream Job Today
            </h2>
            <p className="text-slate-300 text-sm md:text-base mb-8">
              Generate custom mock interview sessions in seconds and gain the competitive edge.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="px-8 py-6 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold hover:scale-105 transition-all shadow-lg">
                Get Started for Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-6 text-center text-sm text-slate-500 dark:text-slate-400 relative z-10 bg-[#F8FAFC] dark:bg-[#0F172A]">
        <p>© 2026 PrepSmart AI 2.0. Master your interview skills with confidence.</p>
      </footer>
    </div>
  );
}
