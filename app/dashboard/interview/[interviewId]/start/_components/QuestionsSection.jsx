"use client";

import React, { useRef, useState, useEffect } from 'react';
import { 
  Lightbulb, 
  Volume2, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  Layers, 
  VolumeX, 
  Target,
  Brain,
  Quote
} from 'lucide-react';
import gsap from 'gsap';
import { Badge } from '@/components/ui/badge';

function QuestionsSection({ 
  mockInterviewQuestion = [], 
  activeQuestionIndex = 0, 
  setActiveQuestionIndex,
  answeredIndices = new Set(),
  loading = false 
}) {
  const questionBoxRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Smooth slide & fade transition whenever activeQuestionIndex changes
  useEffect(() => {
    if (questionBoxRef.current && mockInterviewQuestion.length > 0) {
      gsap.fromTo(
        ".question-text-box",
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" }
      );
    }
  }, [activeQuestionIndex, mockInterviewQuestion.length]);

  // Text to Speech playback
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
      speech.rate = 0.95;
      speech.pitch = 1.0;
      speech.onstart = () => setIsSpeaking(true);
      speech.onend = () => setIsSpeaking(false);
      speech.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(speech);
    } else {
      alert('Your browser does not support speech synthesis.');
    }
  };

  // Stop speech synthesis if question changes or unmounts
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [activeQuestionIndex]);

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

  const currentQ = mockInterviewQuestion[activeQuestionIndex];
  const questionText = currentQ?.question || currentQ?.Question || 'Question prompt not found.';

  return (
    <div 
      ref={questionBoxRef} 
      className="p-6 md:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden"
    >
      {/* Ambient gradient aura */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-500/10 via-transparent to-transparent pointer-events-none" />

      <div>
        {/* QUESTION STEPPER TABS */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Interview Questions
          </span>
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
            Click to jump to any question
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
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
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105 ring-2 ring-blue-500/40'
                    : isAnswered
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {isAnswered && (
                  <CheckCircle2 className={`w-3 h-3 ${isActive ? 'text-white' : 'text-emerald-500'}`} />
                )}
                <span>Q #{index + 1}</span>
              </button>
            );
          })}
        </div>

        {/* ANIMATED QUESTION BODY */}
        <div className="question-text-box min-h-[160px] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>Question {activeQuestionIndex + 1} of {mockInterviewQuestion.length}</span>
            </div>

            <Badge variant="outline" className="text-[10px] font-bold border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
              FAANG Evaluation
            </Badge>
          </div>

          <div className="relative">
            <Quote className="w-8 h-8 text-blue-500/10 absolute -top-3 -left-3 pointer-events-none" />
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-relaxed tracking-tight pl-2">
              {questionText}
            </h2>
          </div>

          {/* AI Text to Speech Speaker Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => textToSpeech(questionText)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold border transition-all duration-200 cursor-pointer ${
                isSpeaking
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/30'
                  : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>Pause Reading</span>
                  <span className="flex items-end gap-0.5 h-3 ml-1">
                    <span className="w-0.5 bg-white rounded-full animate-[bounce_0.8s_infinite] h-1.5" />
                    <span className="w-0.5 bg-white rounded-full animate-[bounce_0.5s_infinite_0.2s] h-3" />
                    <span className="w-0.5 bg-white rounded-full animate-[bounce_0.7s_infinite_0.4s] h-2" />
                  </span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-blue-500" />
                  <span>Read Aloud with AI Voice</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* FAANG STRATEGY COACHING TIP CARD */}
      <div className="p-4 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-white dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-slate-900 space-y-2 mt-4">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-xs uppercase tracking-wide">
          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
          <span>FAANG Strategy Coach</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          Structure your response using the <strong>STAR method</strong> (Situation, Task, Action, Result). State trade-offs explicitly, highlight edge cases, and articulate your reasoning step-by-step.
        </p>
      </div>

    </div>
  );
}

export default QuestionsSection;