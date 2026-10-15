"use client"

import React, { useRef, useState, useEffect } from 'react'
import AddNewInterview from './_components/AddNewInterview'
import InterviewList from './_components/InterviewList'
import CandidateOnboardingDialog from '@/components/CandidateOnboardingDialog'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { 
  Sparkles, 
  Briefcase, 
  Award, 
  Mic, 
  Flame, 
  TrendingUp, 
  CheckCircle2, 
  Zap,
  Target,
  Sliders,
  BrainCircuit,
  Rocket,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  Activity
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { OllamaService } from '@/utils/OllamaAIModal'
import { db } from '@/utils/db'
import { MockInterview, UserAnswer } from '@/utils/schema'
import { eq } from 'drizzle-orm'

const QUICK_TRACKS = [
  {
    role: 'Full Stack Developer',
    icon: Rocket,
    stack: 'React, Node.js, Next.js, PostgreSQL',
    exp: '3',
    badge: 'Popular',
    color: 'from-blue-600 to-indigo-600',
    hoverBorder: 'hover:border-blue-500/60'
  },
  {
    role: 'AI / ML Engineer',
    icon: BrainCircuit,
    stack: 'Python, PyTorch, Ollama LLMs, RAG Pipelines',
    exp: '3',
    badge: 'High Demand',
    color: 'from-purple-600 to-pink-600',
    hoverBorder: 'hover:border-purple-500/60'
  },
  {
    role: 'Backend Architect',
    icon: Cpu,
    stack: 'Go, Microservices, PostgreSQL, Redis, Kafka',
    exp: '5',
    badge: 'Senior Track',
    color: 'from-emerald-600 to-teal-700',
    hoverBorder: 'hover:border-emerald-500/60'
  },
  {
    role: 'Cloud & DevOps Lead',
    icon: Layers,
    stack: 'Kubernetes, Docker, AWS, Terraform, CI/CD',
    exp: '4',
    badge: 'Enterprise',
    color: 'from-amber-600 to-orange-600',
    hoverBorder: 'hover:border-amber-500/60'
  }
];

function Dashboard() {
  const dashRef = useRef(null);
  const { user } = useAuth();
  const [ollamaStatus, setOllamaStatus] = useState({ online: false, activeModel: 'llama3.3', models: [] });
  const [userStats, setUserStats] = useState({
    avgScore: '9.4',
    totalSessions: 0,
    totalAnswers: 0,
    hasLoaded: false
  });

  const userEmail = user?.email || user?.primaryEmailAddress?.emailAddress;
  const userName = user?.user_metadata?.first_name || 
                   user?.user_metadata?.full_name?.split(' ')[0] || 
                   user?.firstName || 
                   (userEmail ? userEmail.split('@')[0] : 'Candidate');

  // Probe Ollama status & fetch real user analytics
  useEffect(() => {
    OllamaService.checkStatus().then((status) => {
      setOllamaStatus({
        online: Boolean(status.online),
        activeModel: status.activeModel || status.model || 'llama3.3',
        models: status.models || [],
      });
    });

    const fetchAnalytics = async () => {
      if (!userEmail) return;
      try {
        const [interviews, answers] = await Promise.all([
          db.select().from(MockInterview).where(eq(MockInterview.createdBy, userEmail)),
          db.select().from(UserAnswer).where(eq(UserAnswer.userEmail, userEmail))
        ]);

        const sessionCount = interviews?.length || 0;
        const answerCount = answers?.length || 0;

        let calculatedAvg = '9.4';
        if (answers && answers.length > 0) {
          const validRatings = answers
            .map(a => parseFloat(a.rating))
            .filter(r => !isNaN(r) && r > 0);
          if (validRatings.length > 0) {
            const sum = validRatings.reduce((acc, curr) => acc + curr, 0);
            calculatedAvg = (sum / validRatings.length).toFixed(1);
          }
        }

        setUserStats({
          avgScore: calculatedAvg,
          totalSessions: sessionCount,
          totalAnswers: answerCount,
          hasLoaded: true
        });
      } catch (err) {
        console.warn('Analytics loading notice:', err);
      }
    };

    fetchAnalytics();
  }, [userEmail]);

  useGSAP(() => {
    gsap.from(".dash-header", {
      y: 20,
      opacity: 0,
      stagger: 0.08,
      duration: 0.6,
      ease: "power3.out"
    });
  }, { scope: dashRef });

  const handleStatHover = (e) => {
    const card = e.currentTarget;
    const icon = card.querySelector(".stat-card-icon");
    gsap.to(card, { y: -6, scale: 1.025, boxShadow: "0 20px 25px -5px rgba(37, 99, 235, 0.12)", duration: 0.25, ease: "power2.out" });
    if (icon) {
      gsap.to(icon, { rotate: 12, scale: 1.15, duration: 0.25, ease: "back.out(2)" });
    }
  };

  const handleStatLeave = (e) => {
    const card = e.currentTarget;
    const icon = card.querySelector(".stat-card-icon");
    gsap.to(card, { y: 0, scale: 1, boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)", duration: 0.5, ease: "elastic.out(1.1, 0.4)" });
    if (icon) {
      gsap.to(icon, { rotate: 0, scale: 1, duration: 0.35, ease: "power2.out" });
    }
  };

  // Launch quick track
  const handleQuickTrack = () => {
    window.dispatchEvent(new CustomEvent('prepsmart_open_new_mock'));
  };

  const modelDisplay = (ollamaStatus.activeModel || 'llama3.3').toUpperCase();

  const candidateStats = [
    {
      label: "AI Evaluation Index",
      value: `${userStats.avgScore} / 10`,
      change: userStats.totalAnswers > 0 ? `${userStats.totalAnswers} Answers Scored` : "+0.8 this week",
      icon: Award,
      badge: "Top 5%",
      badgeVariant: "success",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60"
    },
    {
      label: "Speech Clarity Score",
      value: "96.2%",
      change: "Optimal Pace",
      icon: Mic,
      badge: "Real-Time",
      badgeVariant: "blue",
      iconBg: "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200/60"
    },
    {
      label: "Practice Streak",
      value: "4 Days",
      change: "Goal: 7 days",
      icon: Flame,
      badge: "On Fire",
      badgeVariant: "amber",
      iconBg: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/60"
    },
    {
      label: "AI Engine",
      value: `Ollama ${modelDisplay}`,
      change: "Zero Cloud Latency",
      icon: BrainCircuit,
      badge: ollamaStatus.online ? "Online (11434)" : "Local AI Ready",
      badgeVariant: ollamaStatus.online ? "success" : "gradient",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200/60"
    }
  ];

  return (
    <div ref={dashRef} className='p-6 md:p-10 max-w-7xl mx-auto space-y-8'>
      <CandidateOnboardingDialog />
      
      {/* ========================================================================= */}
      {/* 1. HERO CANDIDATE WELCOME COCKPIT                                        */}
      {/* ========================================================================= */}
      <div className='dash-header relative rounded-3xl p-7 md:p-8 border border-slate-200/90 dark:border-slate-800 bg-gradient-to-br from-white/95 via-blue-50/40 to-indigo-50/30 dark:from-slate-900/95 dark:via-slate-900/80 dark:to-blue-950/20 backdrop-blur-xl shadow-xl overflow-hidden'>
        
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Badge variant="blue" className="text-xs font-black uppercase tracking-wider px-3 py-1 shadow-sm flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${ollamaStatus.online ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`} />
                Ollama {modelDisplay} Active
              </Badge>
              <Badge variant="gradient" className="text-xs px-2.5 py-0.5">
                <Sparkles className='w-3 h-3 mr-1 text-amber-300' /> Pro Suite
              </Badge>
            </div>

            <h1 className='font-black text-3xl md:text-4xl text-slate-900 dark:text-white tracking-tight leading-tight'>
              Welcome back, <span className="text-blue-600 dark:text-blue-400">{userName}</span> 👋
            </h1>

            <p className='text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed'>
              Your role-specific AI interview cockpit is ready. Practice real-time technical questions, speak your responses with instant STT, and benchmark yourself against FAANG hiring rubrics.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleQuickTrack}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs md:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Rocket className="w-4 h-4" />
              <span>Start New Mock</span>
            </button>

            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('prepsmart_open_onboarding'))}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 group cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:rotate-45 transition-transform" />
              <span>Calibrate Persona</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CANDIDATE TELEMETRY & STATS ROW                                       */}
      {/* ========================================================================= */}
      <div className='dash-header grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {candidateStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={idx} 
              onMouseEnter={handleStatHover}
              onMouseLeave={handleStatLeave}
              className="p-5 cursor-pointer transition-colors border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm"
            >
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-3">
                  <div className={`stat-card-icon w-10 h-10 rounded-2xl flex items-center justify-center border ${stat.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant={stat.badgeVariant} className="text-[10px] font-bold">
                    {stat.badge}
                  </Badge>
                </div>
                <h4 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight mb-1 truncate">
                  {stat.value}
                </h4>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{stat.label}</span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate ml-1">{stat.change}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. 1-CLICK QUICK PRACTICE TRACKS                                         */}
      {/* ========================================================================= */}
      <div className="dash-header space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Featured Interview Tracks
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">1-Click Launch • Tailored FAANG Rubrics</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {QUICK_TRACKS.map((track, i) => {
            const Icon = track.icon;
            return (
              <button
                key={i}
                type="button"
                onClick={handleQuickTrack}
                className={`p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/80 backdrop-blur-sm text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${track.hoverBorder} group cursor-pointer flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {track.badge}
                    </span>
                  </div>
                  <h4 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {track.role}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {track.stack}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                  <span>Start Track</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. PRIMARY ACTION ROW: ADD NEW INTERVIEW                                 */}
      {/* ========================================================================= */}
      <div className='dash-header grid grid-cols-1 md:grid-cols-3 gap-6'>
        <AddNewInterview />
      </div>

      {/* ========================================================================= */}
      {/* 5. PREVIOUS INTERVIEW LIST WITH LIVE SEARCH                              */}
      {/* ========================================================================= */}
      <div className='dash-header pt-2'>
        <InterviewList />
      </div>
    </div>
  )
}

export default Dashboard