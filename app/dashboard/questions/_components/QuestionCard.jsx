"use client";
import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Bookmark, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Play, 
  Copy, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  Building2 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function QuestionCard({ 
  item, 
  isBookmarked, 
  isMastered, 
  onToggleBookmark, 
  onToggleMastered 
}) {
  const [expanded, setExpanded] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Text-to-Speech Audio Playback
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      toast.error('Text-to-speech is not supported by your browser.');
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(item.question);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Copy Question to Clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(item.question);
    setCopied(true);
    toast.success('Question copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  // 1-Click Launch into AI Mock Round
  const handlePracticeInMock = () => {
    const detailPayload = {
      jobPosition: `${item.techStack?.[0] || 'Software'} Engineer`,
      jobDesc: `Targeted practice topic: ${item.question}. Tech Stack: ${item.techStack?.join(', ') || 'Fullstack'}`,
      jobExperience: item.difficulty === 'Junior' ? '1' : item.difficulty === 'Mid-Level' ? '3' : '6',
    };

    window.dispatchEvent(new CustomEvent('prepsmart_open_new_mock', { detail: detailPayload }));
    toast.info(`Pre-filling AI Mock Interview for: ${detailPayload.jobPosition}`);
  };

  // Difficulty Badge Colors
  const getDifficultyBadge = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'junior':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'mid-level':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'senior':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'staff / architect':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className={`relative rounded-3xl border transition-all duration-300 p-5 md:p-6 shadow-sm hover:shadow-xl ${
      isMastered 
        ? 'bg-slate-50/80 dark:bg-slate-900/40 border-emerald-200/60 dark:border-emerald-900/40' 
        : 'bg-white/95 dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800/80 hover:border-blue-400 dark:hover:border-blue-500'
    }`}>
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty Badge */}
          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(item.difficulty)}`}>
            {item.difficulty || 'All Levels'}
          </span>

          {/* Category Chip */}
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            {item.category?.replace('-', ' ')}
          </span>

          {/* Company Archetypes */}
          {item.companyTags?.slice(0, 3).map((comp, idx) => (
            <span 
              key={idx} 
              className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full"
            >
              <Building2 className="w-2.5 h-2.5 text-blue-500" />
              <span>{comp}</span>
            </span>
          ))}
        </div>

        {/* Action Icons Strip */}
        <div className="flex items-center gap-1">
          {/* Audio Button */}
          <button
            onClick={handleToggleSpeech}
            className={`p-1.5 rounded-xl border transition cursor-pointer ${
              speaking 
                ? 'bg-blue-600 text-white border-blue-600 animate-pulse' 
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-blue-600 hover:border-blue-300'
            }`}
            title={speaking ? 'Stop speaking' : 'Listen to question'}
            aria-label="Read question aloud"
          >
            {speaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-blue-600 hover:border-blue-300 transition cursor-pointer"
            title="Copy question text"
            aria-label="Copy question"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Bookmark Button */}
          <button
            onClick={() => onToggleBookmark(item.id)}
            className={`p-1.5 rounded-xl border transition cursor-pointer ${
              isBookmarked
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-amber-500 hover:border-amber-300'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark question'}
            aria-label="Bookmark question"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-white' : ''}`} />
          </button>

          {/* Mastered Button */}
          <button
            onClick={() => onToggleMastered(item.id)}
            className={`p-1.5 rounded-xl border transition cursor-pointer ${
              isMastered
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-emerald-600 hover:border-emerald-300'
            }`}
            title={isMastered ? 'Mark as unmastered' : 'Mark as mastered'}
            aria-label="Mark question as mastered"
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${isMastered ? 'fill-white' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Question Heading */}
      <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-snug tracking-tight mb-3">
        {item.question}
      </h3>

      {/* Tech Stack Chips */}
      {item.techStack && item.techStack.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {item.techStack.map((tech, idx) => (
            <span 
              key={idx}
              className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Footer Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition cursor-pointer"
        >
          <span>{expanded ? 'Hide Model Solution & Rubrics' : 'View Model Solution & Rubrics'}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <button
          onClick={handlePracticeInMock}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <Play className="w-3 h-3 fill-white" />
          <span>Practice in AI Mock</span>
        </button>
      </div>

      {/* Collapsible Solution & Rubric Breakdown Drawer */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Ideal Answer Section */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Ideal Model Answer (Staff Engineer Standard)
              </h4>
            </div>
            <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-normal">
              {item.idealAnswer}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Key Rubrics Checklist */}
            {item.rubrics && item.rubrics.length > 0 && (
              <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40">
                <div className="flex items-center gap-1.5 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h5 className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    What Interviewers Look For
                  </h5>
                </div>
                <ul className="space-y-1.5">
                  {item.rubrics.map((rubric, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{rubric}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Red Flags / Pitfalls */}
            {item.redFlags && item.redFlags.length > 0 && (
              <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-200/60 dark:border-rose-900/40">
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <h5 className="text-[11px] font-black uppercase tracking-wider text-rose-800 dark:text-rose-300">
                    Common Candidate Pitfalls
                  </h5>
                </div>
                <ul className="space-y-1.5">
                  {item.redFlags.map((flag, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                      <span className="text-rose-500 font-bold">✗</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
