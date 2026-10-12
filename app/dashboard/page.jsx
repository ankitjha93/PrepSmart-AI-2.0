"use client"
import React, { useRef } from 'react'
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
  Target
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function Dashboard() {
  const dashRef = useRef(null);

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

  const candidateStats = [
    {
      label: "AI Evaluation Index",
      value: "9.4 / 10",
      change: "+0.8 this week",
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
      value: "Gemini 3.5",
      change: "Instant Latency",
      icon: Zap,
      badge: "Active",
      badgeVariant: "gradient",
      iconBg: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200/60"
    }
  ];

  return (
    <div ref={dashRef} className='p-6 md:p-10 max-w-7xl mx-auto'>
      <CandidateOnboardingDialog />
      
      {/* Top Header Section */}
      <div className='dash-header flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
        <div>
          <div className='flex items-center gap-2.5 mb-1.5'>
            <h1 className='font-black text-3xl md:text-4xl text-slate-900 dark:text-white tracking-tight'>
              Candidate Dashboard
            </h1>
            <Badge variant="gradient" className="text-xs px-2.5 py-0.5">
              <Sparkles className='w-3 h-3 mr-1 text-amber-300' /> Pro Suite
            </Badge>
          </div>
          <p className='text-slate-500 dark:text-slate-400 text-sm md:text-base'>
            Design, simulate, and review your role-specific AI mock interviews in real time.
          </p>
        </div>
      </div>

      {/* Candidate Quick Stats Row */}
      <div className='dash-header grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
        {candidateStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={idx} 
              onMouseEnter={handleStatHover}
              onMouseLeave={handleStatLeave}
              className="p-5 cursor-pointer transition-colors border-slate-200/80 dark:border-slate-800"
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
                <h4 className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight mb-1">
                  {stat.value}
                </h4>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{stat.label}</span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{stat.change}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Primary Action Row: Add New Interview */}
      <div className='dash-header grid grid-cols-1 md:grid-cols-3 my-5 gap-6'>
        <AddNewInterview />
      </div>

      {/* Previous Interview List */}
      <div className='dash-header mt-10'>
        <InterviewList />
      </div>
    </div>
  )
}

export default Dashboard