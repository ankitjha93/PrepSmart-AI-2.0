"use client"

import React, { useRef, useState, useEffect, useCallback } from 'react'
import AddNewInterview from './_components/AddNewInterview'
import InterviewList from './_components/InterviewList'
import CandidateOnboardingDialog from '@/components/CandidateOnboardingDialog'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import moment from 'moment'
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
  Activity,
  RefreshCw
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
    avgScore: '0.0',
    totalSessions: 0,
    totalAnswers: 0,
    totalWords: 0,
    avgWords: 0,
    currentStreak: 0,
    hasLoaded: false,
    isRefreshing: false
  });
  const [marketDemand, setMarketDemand] = useState({
    loading: true,
    totalPostings: '15,800+',
    tracks: {}
  });

  // Fetch real-time tech market demand metrics
  useEffect(() => {
    fetch('/api/market-demand')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.tracks) {
          setMarketDemand({
            loading: false,
            totalPostings: data.totalActiveMarketPostings || '15,800+',
            tracks: data.tracks,
            lastUpdated: data.lastUpdated,
          });
        }
      })
      .catch((err) => {
        console.warn('Market demand fetch notice:', err);
      });
  }, []);

  const userEmail = user?.email || user?.primaryEmailAddress?.emailAddress;
  const userName = user?.user_metadata?.first_name || 
                   user?.user_metadata?.full_name?.split(' ')[0] || 
                   user?.firstName || 
                   (userEmail ? userEmail.split('@')[0] : 'Candidate');

  // Normalize heterogeneous date formats (DD-MM-YYYY, YYYY-MM-DD, ISO) into YYYY-MM-DD
  const normalizeToDateKey = (dateStr) => {
    if (!dateStr) return null;
    const m = moment(dateStr, ['DD-MM-YYYY', 'YYYY-MM-DD', 'DD/MM/YYYY', moment.ISO_8601], true);
    if (m.isValid()) return m.format('YYYY-MM-DD');
    const fallback = moment(dateStr);
    if (fallback.isValid()) return fallback.format('YYYY-MM-DD');
    return null;
  };

  // Instant real-time analytics fetcher
  const fetchAnalytics = useCallback(async (isManualRefresh = false) => {
    if (!userEmail) {
      setUserStats(prev => ({ ...prev, hasLoaded: true, isRefreshing: false }));
      return;
    }

    if (isManualRefresh) {
      setUserStats(prev => ({ ...prev, isRefreshing: true }));
    }

    try {
      const [interviews, answers] = await Promise.all([
        db.select().from(MockInterview).where(eq(MockInterview.createdBy, userEmail)),
        db.select().from(UserAnswer).where(eq(UserAnswer.userEmail, userEmail))
      ]);

      const sessionCount = interviews?.length || 0;
      const answerCount = answers?.length || 0;

      // 1. Calculate true average score
      let calculatedAvg = '0.0';
      if (answers && answers.length > 0) {
        const validRatings = answers
          .map(a => parseFloat(a.rating))
          .filter(r => !isNaN(r) && r > 0);
        if (validRatings.length > 0) {
          const sum = validRatings.reduce((acc, curr) => acc + curr, 0);
          calculatedAvg = (sum / validRatings.length).toFixed(1);
        }
      }

      // 2. Real Transcribed Word Count & Articulation Depth
      let totalWords = 0;
      (answers || []).forEach(a => {
        if (a.userAns && typeof a.userAns === 'string') {
          const words = a.userAns.trim().split(/\s+/).filter(Boolean).length;
          totalWords += words;
        }
      });
      const avgWords = answerCount > 0 ? Math.round(totalWords / answerCount) : 0;

      // 3. True Calendar Day Consecutive Streak Calculation
      const activeDatesSet = new Set();
      (answers || []).forEach(a => {
        const k = normalizeToDateKey(a.createdAt);
        if (k) activeDatesSet.add(k);
      });
      (interviews || []).forEach(i => {
        const k = normalizeToDateKey(i.createdAt);
        if (k) activeDatesSet.add(k);
      });

      const todayKey = moment().format('YYYY-MM-DD');
      const yesterdayKey = moment().subtract(1, 'day').format('YYYY-MM-DD');

      let streak = 0;
      let checkDate = null;
      if (activeDatesSet.has(todayKey)) {
        checkDate = moment();
      } else if (activeDatesSet.has(yesterdayKey)) {
        checkDate = moment().subtract(1, 'day');
      }

      if (checkDate) {
        while (activeDatesSet.has(checkDate.format('YYYY-MM-DD'))) {
          streak++;
          checkDate.subtract(1, 'day');
        }
      }

      setUserStats({
        avgScore: calculatedAvg,
        totalSessions: sessionCount,
        totalAnswers: answerCount,
        totalWords,
        avgWords,
        currentStreak: streak,
        hasLoaded: true,
        isRefreshing: false
      });
    } catch (err) {
      console.warn('Analytics loading notice:', err);
      setUserStats(prev => ({ ...prev, hasLoaded: true, isRefreshing: false }));
    }
  }, [userEmail]);

  // Probe Ollama status & fetch real user analytics on load, custom event, or window focus
  useEffect(() => {
    OllamaService.checkStatus().then((status) => {
      setOllamaStatus({
        online: Boolean(status.online),
        activeModel: status.activeModel || status.model || 'llama3.3',
        models: status.models || [],
      });
    });

    fetchAnalytics(false);

    const handleRefresh = () => {
      fetchAnalytics(false);
    };

    window.addEventListener('prepsmart_refresh_interviews', handleRefresh);
    window.addEventListener('focus', handleRefresh);

    return () => {
      window.removeEventListener('prepsmart_refresh_interviews', handleRefresh);
      window.removeEventListener('focus', handleRefresh);
    };
  }, [userEmail, fetchAnalytics]);

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

  // Launch quick track pre-filled with role, tech stack, and experience
  const handleQuickTrack = (track) => {
    window.dispatchEvent(new CustomEvent('prepsmart_open_new_mock', {
      detail: {
        role: track?.role || '',
        stack: track?.stack || '',
        exp: track?.exp || '3',
      }
    }));
  };

  const modelDisplay = (ollamaStatus.activeModel || 'llama3.3').toUpperCase();
  const numScore = parseFloat(userStats.avgScore) || 0;

  // 1. Dynamic AI Evaluation Tier
  let evalBadge = "No Data Yet";
  let evalBadgeVariant = "secondary";
  let evalIconBg = "bg-slate-50 dark:bg-slate-900 text-slate-500 border-slate-200/60";

  if (userStats.totalAnswers > 0) {
    if (numScore >= 8.5) {
      evalBadge = "Top 5% • Elite";
      evalBadgeVariant = "success";
      evalIconBg = "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60";
    } else if (numScore >= 7.0) {
      evalBadge = "Top 15% • Senior";
      evalBadgeVariant = "blue";
      evalIconBg = "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200/60";
    } else if (numScore >= 5.5) {
      evalBadge = "Competent";
      evalBadgeVariant = "indigo";
      evalIconBg = "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200/60";
    } else {
      evalBadge = "Developing";
      evalBadgeVariant = "amber";
      evalIconBg = "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/60";
    }
  }

  // 2. Dynamic Spoken Articulation & Depth
  let depthBadge = "Ready to Speak";
  let depthBadgeVariant = "secondary";
  let depthPacing = "No Audio Recorded";
  let depthIconBg = "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200/60";

  if (userStats.totalAnswers > 0) {
    if (userStats.avgWords >= 50) {
      depthBadge = "STAR Depth";
      depthBadgeVariant = "success";
      depthPacing = "Optimal Depth";
      depthIconBg = "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200/60";
    } else if (userStats.avgWords >= 25) {
      depthBadge = "Good Pace";
      depthBadgeVariant = "blue";
      depthPacing = "Clear & Concise";
      depthIconBg = "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200/60";
    } else if (userStats.avgWords > 0) {
      depthBadge = "Brief Answers";
      depthBadgeVariant = "amber";
      depthPacing = "Needs More Detail";
      depthIconBg = "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/60";
    }
  }

  // 3. Dynamic Practice Streak
  let streakBadge = "Day 1 Awaits 🚀";
  let streakBadgeVariant = "blue";
  let streakIconBg = "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/60";

  if (userStats.currentStreak >= 3) {
    streakBadge = "On Fire 🔥";
    streakBadgeVariant = "amber";
    streakIconBg = "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/60";
  } else if (userStats.currentStreak >= 1) {
    streakBadge = "Active Streak ⚡";
    streakBadgeVariant = "success";
    streakIconBg = "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60";
  } else if (userStats.totalSessions > 0) {
    streakBadge = "Resume Today 🎯";
    streakBadgeVariant = "indigo";
    streakIconBg = "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200/60";
  }

  const candidateStats = [
    {
      label: "AI Evaluation Index",
      value: !userStats.hasLoaded ? "—" : (userStats.totalAnswers > 0 ? `${userStats.avgScore} / 10` : "— / 10"),
      change: !userStats.hasLoaded ? "Loading scores..." : (userStats.totalAnswers > 0 ? `${userStats.totalAnswers} Answers Scored` : "0 Answers Scored"),
      icon: Award,
      badge: evalBadge,
      badgeVariant: evalBadgeVariant,
      iconBg: evalIconBg
    },
    {
      label: "Speech Clarity & Depth",
      value: !userStats.hasLoaded ? "—" : (userStats.totalAnswers > 0 ? `${userStats.avgWords} Words / Ans` : "0 Words"),
      change: !userStats.hasLoaded ? "Calculating pace..." : (userStats.totalWords > 0 ? `${userStats.totalWords.toLocaleString()} Spoken Words` : depthPacing),
      icon: Mic,
      badge: depthBadge,
      badgeVariant: depthBadgeVariant,
      iconBg: depthIconBg
    },
    {
      label: "Practice Streak",
      value: !userStats.hasLoaded ? "—" : `${userStats.currentStreak} Day${userStats.currentStreak === 1 ? '' : 's'}`,
      change: !userStats.hasLoaded ? "Calculating..." : `${userStats.totalSessions} Session${userStats.totalSessions === 1 ? '' : 's'} Created`,
      icon: Flame,
      badge: streakBadge,
      badgeVariant: streakBadgeVariant,
      iconBg: streakIconBg
    },
    {
      label: "AI Engine",
      value: `Ollama ${modelDisplay}`,
      change: ollamaStatus.online ? "Port 11434 • Zero Cloud Latency" : "Local AI Ready • Fallback",
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
      <div className='dash-header space-y-3'>
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Live Candidate Telemetry
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
              Real-Time Sync
            </span>
          </div>
          <button
            type="button"
            onClick={() => fetchAnalytics(true)}
            title="Refresh candidate statistics"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors cursor-pointer group"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${userStats.isRefreshing ? 'animate-spin text-blue-600' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            <span className="font-semibold hidden sm:inline">Sync Now</span>
          </button>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
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
      </div>

      {/* ========================================================================= */}
      {/* 3. REAL-TIME ROLE DEMAND & FEATURED INTERVIEW TRACKS                     */}
      {/* ========================================================================= */}
      <div className="dash-header space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Tech Role Demand • Live Job Market
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse mr-1.5" />
              Live Market Feed ({marketDemand.totalPostings})
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            1-Click Launch • Pre-Calibrated FAANG Rubrics
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_TRACKS.map((track, i) => {
            const Icon = track.icon;
            const liveMetric = marketDemand.tracks?.[track.role] || {
              openings: '3,200+ Active Roles',
              growth: '+28% YoY',
              salary: '$135k - $185k',
              demandScore: 94,
              demandBadge: track.badge,
              badgeVariant: 'blue',
              hiringVelocity: 'High Demand'
            };

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickTrack(track)}
                className={`p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 hover:bg-slate-50/90 dark:hover:bg-slate-800/90 backdrop-blur-md text-left transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl ${track.hoverBorder} group cursor-pointer flex flex-col justify-between relative overflow-hidden`}
              >
                {/* Top ambient color glow */}
                <div className={`absolute -top-12 -right-12 w-28 h-28 rounded-full bg-gradient-to-br ${track.color} opacity-[0.06] group-hover:opacity-20 transition-opacity blur-xl pointer-events-none`} />

                <div>
                  {/* Top Badges & Icon */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                      <Icon className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <Badge variant={liveMetric.badgeVariant || "blue"} className="text-[10px] font-bold px-2 py-0.5 shadow-sm">
                      {liveMetric.demandBadge || track.badge}
                    </Badge>
                  </div>

                  {/* Role Title */}
                  <h4 className="text-sm md:text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
                    {track.role}
                  </h4>

                  {/* Live Market Demand Metrics Card */}
                  <div className="mt-3 mb-3 p-2.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-500 dark:text-slate-400">Market Openings:</span>
                      <span className="text-slate-800 dark:text-slate-200 font-mono font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {liveMetric.openings}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-500 dark:text-slate-400">Market Band:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{liveMetric.salary}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">YoY Momentum:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{liveMetric.growth}</span>
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {track.stack}
                  </p>
                </div>

                {/* Bottom Action CTA */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                  <span>Practice Role Track</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
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