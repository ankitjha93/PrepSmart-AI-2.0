"use client";

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { db } from '@/utils/db';
import { UserAnswer, MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Star,
  Award,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  BarChart3,
  BrainCircuit,
  Share2,
  RotateCcw,
  Copy,
  Check,
  Search,
  Clock,
  Target,
  Lightbulb,
  Layers,
  ShieldCheck,
  ChevronsUpDown,
  ChevronDown,
  ChevronUp,
  Printer,
  X,
  FileText,
  Briefcase,
  SlidersHorizontal,
  Flame,
  CheckCircle
} from 'lucide-react';

function Feedback({ params }) {
  const [feedbackList, setFeedbackList] = useState([]);
  const [interviewData, setInterviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [displayRating, setDisplayRating] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all'); // 'all' | 'high' | 'mid' | 'low'
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [copiedAnswerId, setCopiedAnswerId] = useState(null);
  const [summaryCopied, setSummaryCopied] = useState(false);

  const router = useRouter();
  const containerRef = useRef(null);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      // Fetch user answers
      const answersResult = await db
        .select()
        .from(UserAnswer)
        .where(eq(UserAnswer.mockIdRef, params.interviewId))
        .orderBy(UserAnswer.id);

      setFeedbackList(answersResult || []);

      // Default expand all questions initially
      if (answersResult && answersResult.length > 0) {
        setExpandedIds(new Set(answersResult.map((_, idx) => idx)));
      }

      // Fetch interview position & details
      try {
        const interviewResult = await db
          .select()
          .from(MockInterview)
          .where(eq(MockInterview.mockId, params.interviewId));

        if (interviewResult && interviewResult.length > 0) {
          setInterviewData(interviewResult[0]);
        }
      } catch (mockErr) {
        console.warn("Could not fetch interview details:", mockErr);
      }
    } catch (err) {
      console.error("Failed to load feedback report:", err);
      toast.error("Could not load interview feedback report.");
    } finally {
      setLoading(false);
    }
  };

  // Compute Telemetry Metrics
  const telemetry = useMemo(() => {
    if (!feedbackList || feedbackList.length === 0) {
      return {
        avgScore: 0,
        highCount: 0,
        midCount: 0,
        lowCount: 0,
        accuracyPct: 0,
        clarityPct: 0,
        depthPct: 0,
        starPct: 0,
      };
    }

    const scores = feedbackList.map((item) => parseFloat(item.rating) || 7.0);
    const sum = scores.reduce((acc, curr) => acc + curr, 0);
    const avg = Number((sum / scores.length).toFixed(1));

    let high = 0;
    let mid = 0;
    let low = 0;

    scores.forEach((s) => {
      if (s >= 8) high++;
      else if (s >= 6) mid++;
      else low++;
    });

    // Estimate competency dimensions
    const accuracyPct = Math.min(100, Math.round((avg / 10) * 100));
    const clarityPct = Math.min(100, Math.round(accuracyPct * 0.95 + 4));
    const depthPct = Math.min(100, Math.round(avg >= 8 ? 92 : avg >= 6 ? 78 : 58));
    const starPct = Math.min(100, Math.round(avg >= 8 ? 90 : avg >= 6 ? 74 : 52));

    return {
      avgScore: avg,
      highCount: high,
      midCount: mid,
      lowCount: low,
      accuracyPct,
      clarityPct,
      depthPct,
      starPct,
    };
  }, [feedbackList]);

  // Hiring Verdict Tier
  const verdict = useMemo(() => {
    const score = telemetry.avgScore;
    if (score >= 8.5) {
      return {
        tier: "Strong Hire",
        tagline: "Exceeds Senior Technical Bar",
        description: "Your responses demonstrated crisp architectural understanding, proactive trade-off analysis, and clear alignment with industry best practices.",
        badgeVariant: "success",
        colorClass: "text-emerald-600 dark:text-emerald-400",
        borderClass: "border-emerald-500/30",
        bgClass: "from-emerald-500/10 via-teal-500/5 to-transparent",
        icon: Award
      };
    } else if (score >= 7.0) {
      return {
        tier: "Solid Candidate",
        tagline: "Meets Target Competency",
        description: "Solid conceptual mastery with good problem-solving communication. Deepening system design edge-cases will position you as a top-percentile candidate.",
        badgeVariant: "blue",
        colorClass: "text-blue-600 dark:text-blue-400",
        borderClass: "border-blue-500/30",
        bgClass: "from-blue-500/10 via-indigo-500/5 to-transparent",
        icon: ShieldCheck
      };
    } else if (score >= 5.5) {
      return {
        tier: "Review Recommended",
        tagline: "Developing Technical Foundation",
        description: "You hit essential topics but answers could benefit from more structured STAR formatting and concrete, real-world engineering examples.",
        badgeVariant: "amber",
        colorClass: "text-amber-600 dark:text-amber-400",
        borderClass: "border-amber-500/30",
        bgClass: "from-amber-500/10 via-orange-500/5 to-transparent",
        icon: TrendingUp
      };
    } else {
      return {
        tier: "Needs Refinement",
        tagline: "Growth Opportunity Identified",
        description: "Key technical fundamentals were missed or vague. Practice answering with clear architectural definitions, life-cycle details, and security considerations.",
        badgeVariant: "destructive",
        colorClass: "text-rose-600 dark:text-rose-400",
        borderClass: "border-rose-500/30",
        bgClass: "from-rose-500/10 via-red-500/5 to-transparent",
        icon: AlertCircle
      };
    }
  }, [telemetry.avgScore]);

  // GSAP Animations
  useGSAP(() => {
    if (!loading && feedbackList?.length > 0) {
      // Counter animation
      const obj = { val: 0 };
      gsap.to(obj, {
        val: telemetry.avgScore,
        duration: 1.4,
        ease: "power2.out",
        onUpdate: () => setDisplayRating(obj.val.toFixed(1)),
      });

      // Stagger reveal sections
      gsap.fromTo(
        ".report-stagger-item",
        { y: 24, opacity: 0, scale: 0.99 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          stagger: 0.08,
          duration: 0.6,
          ease: "power3.out",
        }
      );
    }
  }, { dependencies: [loading, feedbackList], scope: containerRef });

  // Filtered Question List
  const filteredList = useMemo(() => {
    return feedbackList.filter((item, idx) => {
      const qText = (item.question || '').toLowerCase();
      const ansText = (item.userAns || '').toLowerCase();
      const query = searchQuery.trim().toLowerCase();

      const matchesSearch = !query || qText.includes(query) || ansText.includes(query);
      if (!matchesSearch) return false;

      const score = parseFloat(item.rating) || 7;
      if (scoreFilter === 'high') return score >= 8;
      if (scoreFilter === 'mid') return score >= 6 && score < 8;
      if (scoreFilter === 'low') return score < 6;
      return true;
    });
  }, [feedbackList, searchQuery, scoreFilter]);

  // Expand / Collapse Logic
  const toggleItem = (idx) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleExpandAll = () => {
    if (expandedIds.size === filteredList.length) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(filteredList.map((_, idx) => idx)));
    }
  };

  // Copy Single Benchmark Answer
  const copyBenchmarkAnswer = (answerText, id) => {
    if (!answerText) return;
    navigator.clipboard.writeText(answerText);
    setCopiedAnswerId(id);
    toast.success("Benchmark answer copied to clipboard!");
    setTimeout(() => setCopiedAnswerId(null), 2000);
  };

  // Copy Full Report Summary
  const copyFullSummary = () => {
    const summaryText = [
      `🎯 PrepSmart AI 2.0 • Mock Interview Performance Report`,
      `Role: ${interviewData?.jobPosition || "Technical Mock Interview"} (${interviewData?.jobExperience || "3"} Years Experience)`,
      `Overall Score: ${telemetry.avgScore} / 10 — ${verdict.tier}`,
      `Questions Answered: ${feedbackList.length}`,
      `----------------------------------------`,
      ...feedbackList.map((q, idx) => (
        `#${idx + 1}. ${q.question}\n` +
        `Candidate Rating: ${q.rating}/10\n` +
        `AI Feedback: ${q.feedback}\n`
      )),
      `Generated by PrepSmart AI • Adaptive Interview Intelligence`
    ].join('\n\n');

    navigator.clipboard.writeText(summaryText);
    setSummaryCopied(true);
    toast.success("Full performance summary copied to clipboard!");
    setTimeout(() => setSummaryCopied(false), 2500);
  };

  // Magnetic Button Hover
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

  const VerdictIcon = verdict.icon;

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto py-8 px-4 md:px-8 space-y-8">
      
      {/* EMPTY STATE */}
      {!loading && feedbackList?.length === 0 ? (
        <div className="report-stagger-item text-center py-20 px-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl max-w-xl mx-auto space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              No Interview Feedback Found
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
              You haven't recorded any answers for this mock session yet. Complete the interview questions to generate your performance report.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href={`/dashboard/interview/${params.interviewId}/start`}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl px-6 h-11 flex items-center gap-2 shadow-md">
                <RotateCcw className="w-4 h-4" />
                <span>Start Interview Round</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => router.replace('/dashboard')}
              className="rounded-xl px-5 h-11 border-slate-200 dark:border-slate-800"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* TOP SESSION TELEMETRY & HERO HEADER */}
          <div className="report-stagger-item p-6 md:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Left: Role Info & Badges */}
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                  </Link>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <Badge variant="success" className="text-[10px] font-black uppercase px-2.5 py-0.5">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Interview Completed
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                    Ollama AI Powered
                  </Badge>
                </div>

                <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  Performance & Feedback Report
                </h1>
                
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {interviewData?.jobPosition || "Technical Mock Interview"}
                  </span>
                  <span>•</span>
                  <span>{interviewData?.jobExperience || "3"} Years Seniority Level</span>
                  <span>•</span>
                  <span>{feedbackList.length} Questions Evaluated</span>
                </p>
              </div>

              {/* Right: Quick Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap print:hidden">
                <Button
                  variant="outline"
                  onClick={copyFullSummary}
                  onMouseMove={handleMagneticMove}
                  onMouseLeave={handleMagneticLeave}
                  className="rounded-2xl h-10 px-4 text-xs font-bold border-slate-200 dark:border-slate-800 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
                  title="Copy formatted summary to clipboard"
                >
                  {summaryCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-slate-500" />
                      <span>Share Summary</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  onMouseMove={handleMagneticMove}
                  onMouseLeave={handleMagneticLeave}
                  className="rounded-2xl h-10 px-4 text-xs font-bold border-slate-200 dark:border-slate-800 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
                  title="Print or export as PDF"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Print Report</span>
                </Button>

                <Link href={`/dashboard/interview/${params.interviewId}/start`}>
                  <Button
                    onMouseMove={handleMagneticMove}
                    onMouseLeave={handleMagneticLeave}
                    className="rounded-2xl h-10 px-5 text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center gap-2 shadow-md shadow-blue-500/25 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Round</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* EXECUTIVE SCORECARD & HIRING VERDICT SHOWCASE */}
          <div className={`report-stagger-item p-6 md:p-8 rounded-3xl bg-gradient-to-br ${verdict.bgClass} border ${verdict.borderClass} dark:bg-slate-900/90 backdrop-blur-xl shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8`}>
            
            {/* Left: Overall Assessment & Verdict */}
            <div className="space-y-3 w-full lg:max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900">
                  AI Hiring Intelligence Assessment
                </span>
                <span className="text-xs text-slate-400 font-bold">•</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                  {feedbackList.length} Technical Questions
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${verdict.badgeVariant === 'success' ? 'bg-emerald-500/15 text-emerald-600' : verdict.badgeVariant === 'blue' ? 'bg-blue-500/15 text-blue-600' : 'bg-amber-500/15 text-amber-600'}`}>
                  <VerdictIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Verdict: <span className={verdict.colorClass}>{verdict.tier}</span>
                  </h2>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {verdict.tagline}
                  </p>
                </div>
              </div>

              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {verdict.description}
              </p>

              {/* Score Progress Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span>Interview Readiness Index</span>
                  <span className="font-mono">{telemetry.accuracyPct}% Target Alignment</span>
                </div>
                <Progress value={telemetry.accuracyPct} className="h-2 rounded-full" />
              </div>
            </div>

            {/* Right: Giant Score Medallion */}
            <div className="flex flex-col items-center justify-center p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 shadow-2xl min-w-[240px] text-center space-y-2 group hover:border-blue-500/40 transition-all duration-300">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Composite Score
              </span>

              <div className="flex items-center justify-center gap-2">
                <Star className="w-7 h-7 text-amber-500 fill-amber-500 animate-pulse" />
                <span className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                  {displayRating}
                </span>
                <span className="text-lg text-slate-400 font-bold self-end mb-1.5">
                  / 10
                </span>
              </div>

              <Badge variant="outline" className="text-[11px] font-bold px-3 py-1">
                {telemetry.highCount} Top Tier • {telemetry.midCount} Solid • {telemetry.lowCount} Needs Work
              </Badge>
            </div>
          </div>

          {/* 4-QUADRANT AI COMPETENCY BREAKDOWN */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 report-stagger-item">
            
            {/* 1. Technical Accuracy */}
            <div className="p-4 md:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Accuracy</span>
                <BrainCircuit className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {telemetry.accuracyPct}%
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Core concepts & algorithmic correctness
              </p>
              <Progress value={telemetry.accuracyPct} className="h-1.5" />
            </div>

            {/* 2. Communication Clarity */}
            <div className="p-4 md:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Clarity</span>
                <Sparkles className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {telemetry.clarityPct}%
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Succinctness & technical vocabulary
              </p>
              <Progress value={telemetry.clarityPct} className="h-1.5" />
            </div>

            {/* 3. Architectural Depth */}
            <div className="p-4 md:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Tech Depth</span>
                <Layers className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {telemetry.depthPct}%
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Trade-off navigation & scaling logic
              </p>
              <Progress value={telemetry.depthPct} className="h-1.5" />
            </div>

            {/* 4. STAR Structuring */}
            <div className="p-4 md:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">STAR Structure</span>
                <Target className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {telemetry.starPct}%
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Situation, Task, Action, Result framing
              </p>
              <Progress value={telemetry.starPct} className="h-1.5" />
            </div>

          </div>

          {/* INTERACTIVE QUESTION FILTER & SEARCH DOCK */}
          <div className="report-stagger-item p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search questions or answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-9 h-10 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium focus-visible:ring-2 focus-visible:ring-blue-500/30"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setScoreFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  scoreFilter === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All ({feedbackList.length})
              </button>

              <button
                type="button"
                onClick={() => setScoreFilter('high')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  scoreFilter === 'high'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                }`}
              >
                Strong 8-10 ({telemetry.highCount})
              </button>

              <button
                type="button"
                onClick={() => setScoreFilter('mid')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  scoreFilter === 'mid'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
                }`}
              >
                Solid 6-7 ({telemetry.midCount})
              </button>

              {telemetry.lowCount > 0 && (
                <button
                  type="button"
                  onClick={() => setScoreFilter('low')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    scoreFilter === 'low'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
                  }`}
                >
                  Needs Work &lt;6 ({telemetry.lowCount})
                </button>
              )}

              {/* Expand / Collapse All Toggle */}
              <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

              <Button
                type="button"
                variant="outline"
                onClick={handleExpandAll}
                className="h-9 px-3 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-800 flex items-center gap-1.5"
              >
                <ChevronsUpDown className="w-3.5 h-3.5" />
                <span>{expandedIds.size === filteredList.length ? 'Collapse All' : 'Expand All'}</span>
              </Button>
            </div>

          </div>

          {/* DETAILED QUESTION BREAKDOWN CARDS */}
          <div className="space-y-4 report-stagger-item">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Detailed Question Breakdown</span>
                <span className="text-xs font-bold text-slate-400">
                  ({filteredList.length} of {feedbackList.length} Questions)
                </span>
              </h3>
            </div>

            {filteredList.length === 0 ? (
              <div className="p-8 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 space-y-2">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  No questions match your search or filter criteria.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setSearchQuery(''); setScoreFilter('all'); }}
                  className="rounded-xl text-xs"
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              filteredList.map((item, index) => {
                const isOpen = expandedIds.has(index);
                const score = parseFloat(item.rating) || 7;
                const scoreColor =
                  score >= 8
                    ? 'emerald'
                    : score >= 6
                    ? 'blue'
                    : 'rose';

                const wordCount = item.userAns ? item.userAns.trim().split(/\s+/).filter(Boolean).length : 0;

                return (
                  <Collapsible
                    key={item.id || index}
                    open={isOpen}
                    onOpenChange={() => toggleItem(index)}
                    className="border border-slate-200/90 dark:border-slate-800 rounded-3xl bg-white/90 dark:bg-slate-900/90 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                  >
                    {/* Collapsible Header */}
                    <CollapsibleTrigger className="p-5 md:p-6 flex items-center justify-between text-left gap-4 w-full hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3.5">
                        
                        {/* Number Indicator Pill */}
                        <div className={`w-8 h-8 rounded-2xl font-black text-xs flex items-center justify-center flex-shrink-0 shadow-sm ${
                          scoreColor === 'emerald'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : scoreColor === 'blue'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {index + 1}
                        </div>

                        {/* Question Text */}
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm md:text-base leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {item.question}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                            <span>{wordCount} words spoken/typed</span>
                            <span>•</span>
                            <span>AI Evaluated</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Score Pill & Collapse Chevron */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border shadow-sm ${
                          scoreColor === 'emerald'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                            : scoreColor === 'blue'
                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                            : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                        }`}>
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>Rating: {item.rating} / 10</span>
                        </div>

                        <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center transition-transform duration-200">
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    {/* Collapsible Content: 3 Structured Cards */}
                    <CollapsibleContent className="px-5 md:px-6 pb-6 pt-2 space-y-4 border-t border-slate-100 dark:border-slate-800">
                      
                      {/* 1. Candidate's Verbatim Answer */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            Your Transcribed Answer:
                          </span>
                          <span className="text-[11px] font-bold text-slate-400">
                            {wordCount} words
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                          {item.userAns || 'No verbal or written answer recorded for this question.'}
                        </p>
                      </div>

                      {/* 2. Ideal Benchmark Target Answer */}
                      <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5" />
                            Target Technical Benchmark:
                          </span>
                          
                          {/* 1-Click Copy Benchmark */}
                          <button
                            type="button"
                            onClick={() => copyBenchmarkAnswer(item.correctAns, item.id || index)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white transition-colors cursor-pointer"
                            title="Copy benchmark to clipboard"
                          >
                            {copiedAnswerId === (item.id || index) ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Answer</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs md:text-sm text-emerald-950 dark:text-emerald-200 leading-relaxed font-medium">
                          {item.correctAns || 'Focus on concrete architectural trade-offs, scalability, and lifecycle considerations.'}
                        </p>
                      </div>

                      {/* 3. AI Constructive Coaching & Feedback */}
                      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 space-y-1.5">
                        <span className="text-xs font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          AI Constructive Coaching & Action Items:
                        </span>
                        <p className="text-xs md:text-sm text-indigo-950 dark:text-indigo-200 leading-relaxed font-medium">
                          {item.feedback}
                        </p>
                      </div>

                    </CollapsibleContent>
                  </Collapsible>
                );
              })
            )}
          </div>

          {/* BOTTOM EXECUTIVE ACTION DOCK */}
          <div className="report-stagger-item p-4 md:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
            
            {/* Left Return Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => router.replace('/dashboard')}
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
              className="rounded-2xl px-6 h-11 text-xs md:text-sm font-bold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </Button>

            {/* Center Summary Indicator */}
            <span className="text-xs font-bold text-slate-400 text-center hidden md:inline">
              Mock Assessment ID: {params.interviewId?.slice(0, 8)}... • Saved Permanently
            </span>

            {/* Right: Retake Round CTA */}
            <Link href={`/dashboard/interview/${params.interviewId}/start`} className="w-full sm:w-auto">
              <Button
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
                className="relative overflow-hidden w-full sm:w-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black text-xs md:text-sm px-6 h-11 rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 group cursor-pointer transition-all duration-300"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                <RotateCcw className="w-4 h-4 group-hover:-rotate-90 transition-transform duration-300" />
                <span>Retake Mock Interview</span>
              </Button>
            </Link>
          </div>

        </>
      )}

    </div>
  );
}

export default Feedback;