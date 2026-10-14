"use client";

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { 
  Lightbulb, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  Layers, 
  Target, 
  Brain, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  PenLine, 
  Gauge, 
  Zap, 
  BookOpen, 
  Keyboard,
  ArrowRight,
  ArrowLeft,
  Quote,
  ShieldCheck,
  CheckCircle
} from 'lucide-react';
import gsap from 'gsap';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

/**
 * Intelligent helper to categorize question topic, seniority, and key talking points
 */
function analyzeQuestion(question = '', answer = '') {
  const text = `${question} ${answer}`.toLowerCase();
  
  let category = "Full Stack Core";
  let topic = "System Architecture";
  let color = "from-blue-600 to-indigo-600";
  let difficulty = "FAANG Senior";
  let idealTime = "90-120s";
  
  if (text.includes('react') || text.includes('hook') || text.includes('useeffect') || text.includes('usestate') || text.includes('jsx')) {
    category = "Frontend Engineering";
    topic = "React & Component Lifecycle";
    color = "from-cyan-500 to-blue-600";
    difficulty = "Core React Internals";
  } else if (text.includes('database') || text.includes('sql') || text.includes('index') || text.includes('postgres') || text.includes('query')) {
    category = "Database Engineering";
    topic = "Storage, Indexing & Query Plans";
    color = "from-emerald-500 to-teal-600";
    difficulty = "High Scale Data";
  } else if (text.includes('security') || text.includes('auth') || text.includes('xss') || text.includes('csrf') || text.includes('token')) {
    category = "Application Security";
    topic = "Identity & Attack Mitigation";
    color = "from-rose-500 to-amber-600";
    difficulty = "Enterprise Security";
  } else if (text.includes('system') || text.includes('scale') || text.includes('cache') || text.includes('distributed') || text.includes('latency')) {
    category = "System Design";
    topic = "Distributed Systems & Scalability";
    color = "from-purple-500 to-indigo-600";
    difficulty = "L5 / Staff Bar";
  } else if (text.includes('api') || text.includes('rest') || text.includes('graphql') || text.includes('endpoint')) {
    category = "API Architecture";
    topic = "Service Contracts & Performance";
    color = "from-blue-500 to-violet-600";
    difficulty = "Microservices Standard";
  } else if (text.includes('challenge') || text.includes('tell me') || text.includes('conflict') || text.includes('team') || text.includes('deadline')) {
    category = "Behavioral Leadership";
    topic = "STAR Framework & Cultural Alignment";
    color = "from-amber-500 to-orange-600";
    difficulty = "Executive Competency";
  }

  // Derive actionable talking points to guide candidate's answer
  const talkingPoints = [];
  if (text.includes('useeffect') || text.includes('dependency')) {
    talkingPoints.push(
      "Mount vs Update vs Unmount Cycles", 
      "Object Reference Identity & Stale State", 
      "Clean-up Functions & Memory Leak Prevention", 
      "Avoiding Unintentional Infinite Renders"
    );
  } else if (text.includes('ssr') || text.includes('csr') || text.includes('ssg')) {
    talkingPoints.push(
      "TTFB vs First Contentful Paint (FCP)", 
      "SEO & Dynamic Pre-rendering", 
      "Hydration Overhead on Mobile Clients", 
      "Edge Caching & Incremental Revalidation"
    );
  } else if (text.includes('index') || text.includes('database')) {
    talkingPoints.push(
      "B-Tree vs Hash Index Trade-offs", 
      "Write Overhead on High-Volume Inserts", 
      "EXPLAIN ANALYZE Cost & Scan Inspection", 
      "Composite Index Leading Column Rules"
    );
  } else if (text.includes('xss') || text.includes('csrf')) {
    talkingPoints.push(
      "HttpOnly & Strict SameSite Cookie Policies", 
      "React Automated JSX Output Escaping", 
      "Content Security Policy (CSP) Directives", 
      "Anti-CSRF Tokens & Origin Verification"
    );
  } else if (text.includes('challenge') || text.includes('star')) {
    talkingPoints.push(
      "Situation Context & Business Urgency", 
      "Technical Decisions & Alternatives Evaluated", 
      "Quantifiable Results (% speedup, uptime)", 
      "Post-Mortem & Preventative Safeguards"
    );
  } else {
    // Generate intelligent default anchor points from the answer text
    const sentences = answer.split('.').filter(s => s.trim().length > 10).slice(0, 3);
    if (sentences.length > 0) {
      sentences.forEach(s => {
        const words = s.trim().replace(/[^\w\s]/gi, '').split(/\s+/).slice(0, 4).join(' ');
        if (words && words.length > 5) talkingPoints.push(words);
      });
    }
    if (talkingPoints.length === 0) {
      talkingPoints.push(
        "Architectural Trade-offs", 
        "Edge Cases & Failure Recovery", 
        "Runtime Complexity & Scalability", 
        "Testing & Maintainability"
      );
    }
  }

  return { category, topic, color, difficulty, idealTime, talkingPoints };
}

function QuestionsSection({ 
  mockInterviewQuestion = [], 
  activeQuestionIndex = 0, 
  setActiveQuestionIndex,
  answeredIndices = new Set(),
  loading = false 
}) {
  const questionBoxRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [isCopied, setIsCopied] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [scratchNotes, setScratchNotes] = useState({});

  // Dynamic question metadata analysis
  const currentQ = mockInterviewQuestion[activeQuestionIndex];
  const questionText = currentQ?.question || currentQ?.Question || 'Question prompt not found.';
  const answerText = currentQ?.answer || currentQ?.Answer || '';
  
  const analysis = useMemo(() => {
    return analyzeQuestion(questionText, answerText);
  }, [questionText, answerText]);

  // Smooth slide & fade transition whenever activeQuestionIndex changes
  useEffect(() => {
    if (questionBoxRef.current && mockInterviewQuestion.length > 0) {
      gsap.fromTo(
        ".question-text-box",
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, ease: "power3.out" }
      );
    }
  }, [activeQuestionIndex, mockInterviewQuestion.length]);

  // Global Keyboard Navigation: Arrow Left/Right and Number Keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger keyboard shortcuts when typing in the scratchpad or input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (activeQuestionIndex < mockInterviewQuestion.length - 1) {
          setActiveQuestionIndex?.(activeQuestionIndex + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (activeQuestionIndex > 0) {
          setActiveQuestionIndex?.(activeQuestionIndex - 1);
        }
      } else if (e.key >= '1' && e.key <= '9') {
        const targetIndex = parseInt(e.key, 10) - 1;
        if (targetIndex < mockInterviewQuestion.length) {
          setActiveQuestionIndex?.(targetIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeQuestionIndex, mockInterviewQuestion.length, setActiveQuestionIndex]);

  // Helper to pick natural English voice
  const getNaturalVoice = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Premium'))) ||
      voices.find(v => v.lang.startsWith('en')) ||
      null
    );
  };

  // Text to Speech playback with speed support
  const textToSpeech = (text) => {
    if (typeof window === 'undefined') return;

    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance(text);
      speech.rate = speechRate;
      speech.pitch = 1.0;
      const naturalVoice = getNaturalVoice();
      if (naturalVoice) speech.voice = naturalVoice;

      speech.onstart = () => setIsSpeaking(true);
      speech.onend = () => setIsSpeaking(false);
      speech.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(speech);
    } else {
      toast.error('Your browser does not support speech synthesis.');
    }
  };

  // Cycle speech playback speed
  const cycleSpeechRate = () => {
    const rates = [1.0, 1.25, 0.85];
    const nextIdx = (rates.indexOf(speechRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setSpeechRate(nextRate);
    toast.success(`Voice speed set to ${nextRate}x`);
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Stop speech synthesis if question changes or unmounts
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [activeQuestionIndex]);

  // Clipboard copy question
  const handleCopyQuestion = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(questionText);
      setIsCopied(true);
      toast.success('Question prompt copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Loading skeleton fallback while interview session is loading
  if (loading) {
    return (
      <div className="p-6 md:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-xl space-y-6 animate-pulse">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-6 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
        <div className="h-24 bg-slate-100 dark:bg-slate-800/50 rounded-2xl" />
      </div>
    );
  }

  // Graceful empty state fallback if no questions are available
  if (!mockInterviewQuestion || mockInterviewQuestion.length === 0) {
    return (
      <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-800 dark:text-white text-base">Questions Initializing...</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Preparing your AI-evaluated questions. If this takes longer than expected, refresh to reload the round.
        </p>
      </div>
    );
  }

  const answeredCount = answeredIndices.size;
  const totalCount = mockInterviewQuestion.length;
  const completionPercentage = Math.round((answeredCount / totalCount) * 100);

  return (
    <div 
      ref={questionBoxRef} 
      className="p-6 md:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden transition-all duration-300"
    >
      {/* Ambient gradient aura */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-500/15 via-indigo-500/5 to-transparent pointer-events-none rounded-full blur-2xl" />

      <div>
        {/* TOP STEPPER HEADER WITH COMPLETION TELEMETRY */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              Round Questions
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {answeredCount}/{totalCount} Answered
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
            <Keyboard className="w-3 h-3 text-slate-400" />
            <span>Use <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[9px]">←</kbd> <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[9px]">→</kbd> or numbers</span>
          </div>
        </div>

        {/* INTERACTIVE QUESTION STEPPER PILLS */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {mockInterviewQuestion.map((_, index) => {
            const isActive = activeQuestionIndex === index;
            const isAnswered = answeredIndices.has(index);

            return (
              <button
                key={index}
                type="button"
                onClick={() => setActiveQuestionIndex && setActiveQuestionIndex(index)}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105 ring-2 ring-blue-500/40 ring-offset-1 dark:ring-offset-slate-900'
                    : isAnswered
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={`Jump to Question #${index + 1}`}
              >
                {isAnswered ? (
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-500'}`} />
                ) : (
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-slate-300 dark:bg-slate-600'}`} />
                )}
                <span>Q #{index + 1}</span>
              </button>
            );
          })}
        </div>

        {/* MAIN QUESTION DISPLAY CARD */}
        <div className="question-text-box min-h-[160px] space-y-4">
          
          {/* Question Telemetry Header: Category Tag & Meta Badges */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-2.5 py-0.5">
                <Sparkles className="w-3 h-3 mr-1 text-blue-500 inline" />
                {analysis.category}
              </Badge>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 hidden sm:inline">•</span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {analysis.topic}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] font-bold border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60">
                <Gauge className="w-3 h-3 mr-1 text-indigo-500 inline" />
                {analysis.difficulty}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-bold border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 hidden md:inline-flex">
                <Clock className="w-3 h-3 mr-1 text-amber-500 inline" />
                {analysis.idealTime}
              </Badge>
            </div>
          </div>

          {/* Active Question Prompt with Left Accent Gradient */}
          <div className="relative pl-4 border-l-4 border-gradient-to-b border-blue-600 dark:border-blue-500 py-1">
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-relaxed tracking-tight">
              {questionText}
            </h2>
          </div>

          {/* INTERACTION ACTION BAR: TTS VOICE, SPEED CONTROLLER, COPY, & SCRATCHPAD */}
          <div className="flex items-center flex-wrap gap-2 pt-2">
            {/* Primary TTS Read Aloud Button */}
            <button
              type="button"
              onClick={() => textToSpeech(questionText)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all duration-200 cursor-pointer shadow-sm ${
                isSpeaking
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30'
                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40'
              }`}
              title={isSpeaking ? "Pause speech reading" : "Read question aloud using AI voice"}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4 text-white" />
                  <span>Pause Reading</span>
                  {/* Dynamic Equalizer Spectrum Animation */}
                  <span className="flex items-end gap-0.5 h-3 ml-1">
                    <span className="w-0.5 bg-white rounded-full animate-[bounce_0.8s_infinite] h-1.5" />
                    <span className="w-0.5 bg-white rounded-full animate-[bounce_0.5s_infinite_0.2s] h-3" />
                    <span className="w-0.5 bg-white rounded-full animate-[bounce_0.7s_infinite_0.4s] h-2" />
                    <span className="w-0.5 bg-white rounded-full animate-[bounce_0.6s_infinite_0.1s] h-2.5" />
                  </span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-blue-500" />
                  <span>Read Aloud</span>
                </>
              )}
            </button>

            {/* Speech Rate Controller Toggle */}
            <button
              type="button"
              onClick={cycleSpeechRate}
              className="px-2.5 py-2 rounded-2xl text-xs font-bold font-mono border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:border-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Cycle speech playback speed (1.0x, 1.25x, 0.85x)"
            >
              {speechRate}x
            </button>

            {/* Copy Question to Clipboard */}
            <button
              type="button"
              onClick={handleCopyQuestion}
              className="p-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:border-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Copy question text"
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            {/* Quick Notes Scratchpad Toggle */}
            <button
              type="button"
              onClick={() => setShowScratchpad(prev => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold border transition-colors cursor-pointer ${
                showScratchpad
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
              }`}
              title="Open quick bullet points scratchpad"
            >
              <PenLine className="w-3.5 h-3.5 text-indigo-500" />
              <span>{showScratchpad ? "Hide Scratchpad" : "Quick Notes"}</span>
            </button>

            {/* AI Coaching Hints Drawer Toggle */}
            <button
              type="button"
              onClick={() => setShowHints(prev => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold border transition-colors cursor-pointer ${
                showHints
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300'
                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
              }`}
              title="Toggle AI hints and key talking points"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>{showHints ? "Hide AI Hints" : "AI Talking Points"}</span>
              {showHints ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* CANDIDATE SCRATCHPAD ACCORDION (Quick bullet points before recording) */}
          {showScratchpad && (
            <div className="p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                <span className="flex items-center gap-1.5">
                  <PenLine className="w-3.5 h-3.5" />
                  Your Scratchpad (Question #{activeQuestionIndex + 1})
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Private to you • Not evaluated</span>
              </div>
              <textarea
                value={scratchNotes[activeQuestionIndex] || ''}
                onChange={(e) => setScratchNotes(prev => ({ ...prev, [activeQuestionIndex]: e.target.value }))}
                placeholder="Jot down 2-3 key bullet points before speaking (e.g. STAR outline, metric impact)..."
                rows={3}
                className="w-full text-xs p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none font-sans"
              />
            </div>
          )}

          {/* EXPANDABLE AI COACH HINTS & TALKING POINTS */}
          {showHints && (
            <div className="p-4 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-amber-500" />
                  Key Concepts Evaluated by AI
                </span>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">FAANG Rubric</span>
              </div>

              {/* Dynamic Talking Point Chips */}
              <div className="flex flex-wrap gap-1.5">
                {analysis.talkingPoints.map((point, pIdx) => (
                  <span 
                    key={pIdx}
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 shadow-2xs"
                  >
                    <CheckCircle className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>{point}</span>
                  </span>
                ))}
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                <strong>Tip:</strong> Mention these anchors naturally in your spoken answer. High-scoring candidates state core trade-offs explicitly and quantify impact.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* FOOTER: DYNAMIC FAANG STRATEGY COACH BANNER */}
      <div className="p-4 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-white dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-slate-900 space-y-2 mt-4 relative overflow-hidden shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-black text-xs uppercase tracking-wide">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
            <span>FAANG Strategy Coach</span>
          </div>
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100/60 dark:bg-blue-900/60 px-2 py-0.5 rounded-full">
            STAR Method
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          Frame your answer with <strong>Situation</strong>, <strong>Task</strong>, <strong>Action</strong>, and <strong>Result</strong>. Articulate trade-offs clearly, discuss edge cases, and reason out loud as you solve.
        </p>

        {/* Quick Question Stepper Links at the bottom of the card */}
        <div className="flex items-center justify-between pt-1 border-t border-blue-100 dark:border-blue-900/40 text-[11px] font-bold text-slate-500 dark:text-slate-400">
          <button
            type="button"
            disabled={activeQuestionIndex === 0}
            onClick={() => setActiveQuestionIndex?.(activeQuestionIndex - 1)}
            className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <span className="text-[10px] text-slate-400 font-mono">
            Question {activeQuestionIndex + 1} of {totalCount}
          </span>

          <button
            type="button"
            disabled={activeQuestionIndex === totalCount - 1}
            onClick={() => setActiveQuestionIndex?.(activeQuestionIndex + 1)}
            className="inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <span>Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}

export default QuestionsSection;