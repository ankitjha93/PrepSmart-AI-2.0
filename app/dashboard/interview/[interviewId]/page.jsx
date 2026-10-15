"use client";

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import Webcam from 'react-webcam';
import gsap from 'gsap';
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  WebcamIcon, 
  Lightbulb, 
  Sparkles, 
  ShieldCheck, 
  Briefcase, 
  Code2, 
  Clock, 
  CheckCircle2, 
  Rocket, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Radio, 
  Layers, 
  ArrowLeft, 
  ArrowRight,
  Flame,
  Zap,
  Award,
  Lock,
  Cpu,
  BrainCircuit,
  EyeOff
} from 'lucide-react';

function Interview({ params }) {
  const [interviewData, setInterviewData] = useState(null);
  const [webCamEnabled, setWebCamEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    GetInterviewDetails();
  }, []);

  const GetInterviewDetails = async () => {
    try {
      const result = await db
        .select()
        .from(MockInterview)
        .where(eq(MockInterview.mockId, params.interviewId));

      if (result && result.length > 0) {
        setInterviewData(result[0]);
      }
    } catch (err) {
      console.warn("Could not fetch interview record:", err);
    } finally {
      setLoading(false);
    }
  };

  // Staggered entrance animation on load
  useEffect(() => {
    if (!loading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".interview-setup-anim",
          { opacity: 0, y: 22, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.06,
            duration: 0.5,
            ease: "power3.out",
            delay: 0.05,
          }
        );
      }, containerRef);

      return () => ctx.revert();
    }
  }, [loading]);

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

  // Parse tech stack into individual badges
  const techStackBadges = useMemo(() => {
    if (!interviewData?.jobDesc) return [];
    return interviewData.jobDesc
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }, [interviewData?.jobDesc]);

  // Parse questions count from saved JSON
  const questionCount = useMemo(() => {
    if (!interviewData?.jsonMockResp) return 5;
    try {
      const parsed = JSON.parse(interviewData.jsonMockResp);
      return Array.isArray(parsed) ? parsed.length : 5;
    } catch {
      return 5;
    }
  }, [interviewData?.jsonMockResp]);

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto py-8 px-4 md:px-8 space-y-8">
      
      {/* TOP BREADCRUMB & HEADER */}
      <div className="interview-setup-anim flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            <Link href="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
            <span>/</span>
            <span>Mock Interviews</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-bold">Calibration & Setup</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Pre-Interview Hardware & AI Calibration
            </h1>
            <Badge variant="gradient" className="text-[10px] font-black uppercase tracking-wider hidden sm:inline-flex px-2.5 py-0.5">
              <Sparkles className="w-3 h-3 mr-1 text-amber-300" /> AI Round Ready
            </Badge>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Test and verify your camera, microphone, and AI question parameters before launching the session.
          </p>
        </div>

        {/* Live Engine Telemetry Pill */}
        <div className="self-start md:self-auto flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/80 shadow-sm text-xs">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </div>
          <span className="font-bold text-slate-700 dark:text-slate-300">Ollama AI Engine (Llama 3.3)</span>
          <span className="text-slate-400">•</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">{questionCount} FAANG Questions</span>
        </div>
      </div>

      {/* 2-COLUMN MAIN COCKPIT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: ROLE BLUEPRINT & SECURITY PROTOCOL (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* CARD 1: ROLE & COMPETENCY BLUEPRINT */}
          <div className="interview-setup-anim relative group p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl space-y-5 overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 via-transparent to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Interview Competency Blueprint
                  </h3>
                  <span className="text-[11px] text-slate-400">FAANG-calibrated session</span>
                </div>
              </div>
              <Badge variant="blue" className="text-[10px] font-black uppercase">
                Active
              </Badge>
            </div>

            {/* Role Position */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Target Role / Position
              </span>
              <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>{interviewData?.jobPosition || "Full Stack Developer"}</span>
              </p>
            </div>

            {/* Tech Stack Badges */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Assessed Tech Stack & Topics
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">{techStackBadges.length} Skills</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {techStackBadges.length > 0 ? (
                  techStackBadges.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-transform duration-200 hover:scale-105 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-300 cursor-default"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">{interviewData?.jobDesc || "General Technical Interview"}</span>
                )}
              </div>
            </div>

            {/* Experience & Round Telemetry Row */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Experience Tier
                </span>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    {interviewData?.jobExperience || "3"} Years
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Round Format
                </span>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    ~25 Mins
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: PRIVACY & EVALUATION PROTOCOL (REPLACING PLAIN YELLOW ALERT) */}
          <div className="interview-setup-anim relative p-5 rounded-3xl border border-emerald-500/20 dark:border-emerald-500/20 bg-gradient-to-br from-emerald-50/70 via-slate-50 to-white dark:from-emerald-950/20 dark:via-slate-900/90 dark:to-slate-900 shadow-lg space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                  Privacy & Evaluation Guarantee
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  PrepSmart AI Candidate Protection Protocol
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Zero Cloud Video Recording:</strong> Camera video is strictly processed locally in your browser for speech timing. Streams are never recorded or stored.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Real-Time Speech Transcription:</strong> Answers are spoken aloud, transcribed, and evaluated for technical accuracy, code design, and clarity.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Diagnostic Evaluation Report:</strong> At round completion, receive comprehensive scoring and model answers for every question.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STUDIO CAMERA HUD & AUDIO TESTING (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* CAMERA VIEWPORT HUD CHASSIS */}
          <div className="interview-setup-anim relative w-full aspect-video rounded-3xl bg-slate-950 border-2 border-slate-800/90 shadow-2xl overflow-hidden flex flex-col items-center justify-center group">
            
            {/* Ambient Background Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

            {webCamEnabled ? (
              /* LIVE CAMERA FEED */
              <div className="relative w-full h-full">
                <Webcam
                  onUserMedia={() => setWebCamEnabled(true)}
                  onUserMediaError={() => setWebCamEnabled(false)}
                  mirrored={true}
                  className="w-full h-full object-cover rounded-3xl"
                />

                {/* Live Feed HUD Overlay (Top-Left) */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="text-red-400 font-black">LIVE FEED</span>
                  <span className="text-white/40">•</span>
                  <span>1080p 30fps</span>
                </div>

                {/* AI Face Tracker Overlay (Top-Right) */}
                <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600/70 backdrop-blur-md border border-blue-400/30 text-white text-[11px] font-bold shadow-lg">
                  <BrainCircuit className="w-3.5 h-3.5 text-blue-200" />
                  <span>AI Face & Speech Calibrated</span>
                </div>

                {/* Simulated Live Audio Equalizer Meter (Bottom-Left) */}
                <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px]">
                  <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="text-slate-300 font-semibold text-[10px]">Mic Active:</span>
                  <div className="flex items-end gap-1 h-3.5">
                    <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.8s_infinite] h-2" />
                    <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.5s_infinite_0.2s] h-3.5" />
                    <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.7s_infinite_0.4s] h-2.5" />
                    <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite_0.1s] h-3" />
                  </div>
                </div>

                {/* Disable Camera Control Button (Bottom-Right) */}
                <button
                  type="button"
                  onClick={() => setWebCamEnabled(false)}
                  className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/15 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  <VideoOff className="w-3.5 h-3.5 text-red-400" />
                  <span>Disable Camera</span>
                </button>
              </div>
            ) : (
              /* STANDBY CAMERA VIEW WITH RADAR ANIMATION */
              <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center space-y-4">
                
                {/* Concentric Radar Lens Rings */}
                <div className="relative flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-blue-500/10 border border-blue-500/20 animate-ping opacity-30 absolute" />
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[2px] shadow-2xl shadow-blue-500/30">
                    <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-white">
                      <WebcamIcon className="w-9 h-9 text-blue-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-black text-white tracking-tight">
                    Studio Camera & Microphone Standby
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Enable your webcam and microphone to simulate authentic FAANG interview conditions.
                  </p>
                </div>

                {/* Action Buttons in Standby */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={() => setWebCamEnabled(true)}
                    onMouseMove={handleMagneticMove}
                    onMouseLeave={handleMagneticLeave}
                    className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-xs px-5 h-10 rounded-xl shadow-lg shadow-blue-500/30 flex items-center gap-2 group cursor-pointer transition-all duration-300 hover:scale-105"
                  >
                    {/* Shimmer sweep */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                    <Video className="w-3.5 h-3.5 text-white" />
                    <span>Enable Studio Camera & Mic</span>
                  </Button>

                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    (or proceed in audio-only mode)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* HARDWARE READINESS CHECK CHIPS */}
          <div className="interview-setup-anim grid grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <Video className={`w-3.5 h-3.5 ${webCamEnabled ? 'text-emerald-500' : 'text-slate-400'}`} />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Camera</span>
              </div>
              <span className={`text-[10px] font-semibold ${webCamEnabled ? 'text-emerald-500' : 'text-slate-400'}`}>
                {webCamEnabled ? 'Calibrated & Live' : 'Optional'}
              </span>
            </div>

            <div className="p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <Mic className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Microphone</span>
              </div>
              <span className="text-[10px] font-semibold text-blue-500">
                Ready to Record
              </span>
            </div>

            <div className="p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <Cpu className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">AI Engine</span>
              </div>
              <span className="text-[10px] font-semibold text-purple-500">
                Ollama AI Armed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER ACTION DOCK */}
      <div className="interview-setup-anim pt-6 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/dashboard" className="w-full sm:w-auto">
          <Button
            variant="ghost"
            className="w-full sm:w-auto rounded-xl px-5 h-11 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </Button>
        </Link>

        <Link href={`/dashboard/interview/${params.interviewId}/start`} className="w-full sm:w-auto">
          <Button
            onMouseMove={handleMagneticMove}
            onMouseLeave={handleMagneticLeave}
            className="relative overflow-hidden w-full sm:w-auto px-8 h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 group cursor-pointer transition-all duration-300 hover:shadow-blue-500/50"
          >
            {/* Shimmer sweep effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

            <span>Start Live Interview</span>
            <Rocket className="w-4 h-4 text-blue-200 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </Button>
        </Link>
      </div>

    </div>
  );
}

export default Interview;