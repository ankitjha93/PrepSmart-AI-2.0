"use client";

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { db } from '@/utils/db';
import { MockInterview, UserAnswer } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import QuestionsSection from './_components/QuestionsSection';
import RecordAnswerSection from './_components/RecordAnswerSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Award, 
  Radio, 
  ChevronRight, 
  ChevronLeft,
  X,
  Layers,
  BrainCircuit,
  Flame,
  Zap
} from 'lucide-react';

function StartInterview({ params }) {
  const [interviewData, setInterviewData] = useState(null);
  const [mockInterviewQuestion, setMockInterviewQuestion] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [answeredIndices, setAnsweredIndices] = useState(new Set());
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const studioRef = useRef(null);

  useEffect(() => {
    GetInterviewDetails();
  }, []);

  // Live session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format seconds to MM:SS
  const formattedTime = useMemo(() => {
    const mins = Math.floor(sessionSeconds / 60).toString().padStart(2, '0');
    const secs = (sessionSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }, [sessionSeconds]);

  // Fetch interview record and safely parse JSON
  const GetInterviewDetails = async () => {
    try {
      const result = await db
        .select()
        .from(MockInterview)
        .where(eq(MockInterview.mockId, params.interviewId));

      if (result && result.length > 0) {
        setInterviewData(result[0]);

        let questions = [];
        try {
          let raw = result[0].jsonMockResp || '';
          raw = raw.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            questions = parsed;
          } else if (parsed?.questions && Array.isArray(parsed.questions)) {
            questions = parsed.questions;
          } else if (parsed?.interviewQuestions && Array.isArray(parsed.interviewQuestions)) {
            questions = parsed.interviewQuestions;
          } else {
            questions = [parsed];
          }
        } catch (parseErr) {
          console.warn("JSON parse fallback:", parseErr);
        }

        setMockInterviewQuestion(questions);

        // Fetch already submitted answers for this mock session
        try {
          const savedAnswers = await db
            .select()
            .from(UserAnswer)
            .where(eq(UserAnswer.mockIdRef, params.interviewId));

          if (savedAnswers && savedAnswers.length > 0) {
            const answeredSet = new Set();
            savedAnswers.forEach((ans) => {
              const idx = questions.findIndex((q) => q.question === ans.question);
              if (idx !== -1) answeredSet.add(idx);
            });
            setAnsweredIndices(answeredSet);
          }
        } catch (ansErr) {
          console.warn("Could not fetch user answers:", ansErr);
        }
      }
    } catch (err) {
      console.error("Failed to fetch interview:", err);
    } finally {
      setLoading(false);
    }
  };

  // Callback when candidate saves an answer
  const handleAnswerSaved = (questionIndex) => {
    setAnsweredIndices((prev) => new Set(prev).add(questionIndex));
  };

  // GSAP entrance cascade
  useEffect(() => {
    if (!loading && studioRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".interview-studio-anim",
          { opacity: 0, y: 18, scale: 0.99 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.05,
            duration: 0.45,
            ease: "power3.out",
          }
        );
      }, studioRef);

      return () => ctx.revert();
    }
  }, [loading]);

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

  const totalQuestions = mockInterviewQuestion.length || 5;
  const progressPercent = Math.min(100, Math.round(((activeQuestionIndex + 1) / totalQuestions) * 100));

  return (
    <div ref={studioRef} className="max-w-7xl mx-auto py-6 px-4 md:px-8 space-y-6">
      
      {/* TOP STUDIO TELEMETRY HEADER */}
      <div className="interview-studio-anim p-4 md:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Left: Role Info & Breadcrumb */}
          <div className="flex items-center gap-3">
            <Link 
              href={`/dashboard/interview/${params.interviewId}`}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
              title="Return to Calibration"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate max-w-xs md:max-w-md">
                  {interviewData?.jobPosition || "Technical Mock Interview"}
                </h1>
                <Badge variant="gradient" className="text-[9px] font-black uppercase px-2 py-0.5">
                  Live Round
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {interviewData?.jobExperience || "3"} Years Seniority • Evaluated by Gemini 3.5 AI
              </p>
            </div>
          </div>

          {/* Right: Live Telemetry Badges (Timer, Progress, Recording indicator) */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-black">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>LIVE INTERVIEW</span>
            </div>

            {/* Session Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold font-mono">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>{formattedTime}</span>
            </div>

            {/* Question Progress Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-black">
              <Layers className="w-3.5 h-3.5" />
              <span>Question {activeQuestionIndex + 1} of {totalQuestions}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 transition-all duration-500 rounded-full shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 2-COLUMN MAIN STUDIO INTERFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: QUESTIONS & AI COPILOT COACH (5 cols) */}
        <div className="lg:col-span-5 w-full">
          <QuestionsSection 
            mockInterviewQuestion={mockInterviewQuestion}
            activeQuestionIndex={activeQuestionIndex}
            setActiveQuestionIndex={setActiveQuestionIndex}
            answeredIndices={answeredIndices}
            loading={loading}
          />
        </div>

        {/* RIGHT COLUMN: VIDEO & AUDIO TRANSCRIPTION RECORDER (7 cols) */}
        <div className="lg:col-span-7 w-full">
          <RecordAnswerSection
            mockInterviewQuestion={mockInterviewQuestion}
            activeQuestionIndex={activeQuestionIndex}
            interviewData={interviewData}
            onAnswerSaved={() => handleAnswerSaved(activeQuestionIndex)}
          />
        </div>
      </div>

      {/* BOTTOM ACTION DOCK */}
      <div className="interview-studio-anim p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-lg flex items-center justify-between gap-4">
        
        {/* Previous Question Button */}
        <Button
          type="button"
          variant="outline"
          disabled={activeQuestionIndex === 0}
          onClick={() => setActiveQuestionIndex((prev) => Math.max(0, prev - 1))}
          className="rounded-2xl px-5 h-11 text-xs font-bold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 flex items-center gap-2 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous Question</span>
          <span className="sm:hidden">Prev</span>
        </Button>

        {/* Center Progress Telemetry */}
        <div className="text-center hidden md:block">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {answeredIndices.size} of {totalQuestions} Questions Answered
          </span>
        </div>

        {/* Next Question or End Interview CTA */}
        {activeQuestionIndex < totalQuestions - 1 ? (
          <Button
            type="button"
            onClick={() => setActiveQuestionIndex((prev) => prev + 1)}
            onMouseMove={handleMagneticMove}
            onMouseLeave={handleMagneticLeave}
            className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black text-xs md:text-sm px-6 h-11 rounded-2xl shadow-lg shadow-blue-500/25 flex items-center gap-2 group cursor-pointer transition-all duration-300"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            <span>Next Question</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        ) : (
          <Link href={`/dashboard/interview/${interviewData?.mockId || params.interviewId}/feedback`}>
            <Button
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
              className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs md:text-sm px-6 h-11 rounded-2xl shadow-xl shadow-emerald-500/30 flex items-center gap-2 group cursor-pointer transition-all duration-300 hover:shadow-emerald-500/50"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
              <Award className="w-4 h-4 text-emerald-200" />
              <span>Complete Interview & View Report</span>
            </Button>
          </Link>
        )}
      </div>

    </div>
  );
}

export default StartInterview;