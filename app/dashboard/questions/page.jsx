"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  Filter, 
  Bookmark, 
  CheckCircle2, 
  Brain, 
  Plus, 
  RotateCcw, 
  Layers, 
  Code, 
  Server, 
  Cpu, 
  Cloud, 
  Users, 
  X,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  INITIAL_QUESTION_BANK, 
  QUESTION_CATEGORIES, 
  QUESTION_DIFFICULTIES 
} from '@/utils/questionBankData';
import QuestionCard from './_components/QuestionCard';
import QuestionSynthesisModal from './_components/QuestionSynthesisModal';
import { OllamaService } from '@/utils/OllamaAIModal';

export default function QuestionsCockpitPage() {
  const [questions, setQuestions] = useState(INITIAL_QUESTION_BANK);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All Difficulties');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [onlyUnmastered, setOnlyUnmastered] = useState(false);

  // Persistence State
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [masteredIds, setMasteredIds] = useState([]);
  const [synthesisModalOpen, setSynthesisModalOpen] = useState(false);
  const [ollamaConnected, setOllamaConnected] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const savedBookmarks = localStorage.getItem('prepsmart_bookmarked_questions');
      if (savedBookmarks) {
        setBookmarkedIds(JSON.parse(savedBookmarks));
      }

      const savedMastered = localStorage.getItem('prepsmart_mastered_questions');
      if (savedMastered) {
        setMasteredIds(JSON.parse(savedMastered));
      }

      const savedCustom = localStorage.getItem('prepsmart_custom_questions');
      if (savedCustom) {
        const parsedCustom = JSON.parse(savedCustom);
        if (Array.isArray(parsedCustom) && parsedCustom.length > 0) {
          setQuestions([...parsedCustom, ...INITIAL_QUESTION_BANK]);
        }
      }
    } catch (e) {
      console.error('Failed to load local question preferences:', e);
    }

    // Probe Ollama status
    OllamaService.checkStatus().then((res) => {
      if (res?.online) {
        setOllamaConnected(true);
      }
    }).catch(() => setOllamaConnected(false));
  }, []);

  // Toggle Bookmark Handler
  const handleToggleBookmark = (id) => {
    setBookmarkedIds((prev) => {
      const updated = prev.includes(id) 
        ? prev.filter((item) => item !== id) 
        : [...prev, id];
      localStorage.setItem('prepsmart_bookmarked_questions', JSON.stringify(updated));
      return updated;
    });
  };

  // Toggle Mastered Handler
  const handleToggleMastered = (id) => {
    setMasteredIds((prev) => {
      const updated = prev.includes(id) 
        ? prev.filter((item) => item !== id) 
        : [...prev, id];
      localStorage.setItem('prepsmart_mastered_questions', JSON.stringify(updated));
      return updated;
    });
  };

  // Add Synthesized Questions
  const handleQuestionsGenerated = (newQuestions) => {
    setQuestions((prev) => {
      const combined = [...newQuestions, ...prev];
      try {
        const existingCustom = JSON.parse(localStorage.getItem('prepsmart_custom_questions') || '[]');
        localStorage.setItem('prepsmart_custom_questions', JSON.stringify([...newQuestions, ...existingCustom]));
      } catch (e) {
        console.error('Failed to save custom questions:', e);
      }
      return combined;
    });
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedDifficulty('All Difficulties');
    setSearchQuery('');
    setOnlyBookmarked(false);
    setOnlyUnmastered(false);
  };

  // Filter Logic
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Category Match
      if (selectedCategory !== 'all' && q.category !== selectedCategory) {
        return false;
      }

      // Difficulty Match
      if (selectedDifficulty !== 'All Difficulties' && q.difficulty !== selectedDifficulty) {
        return false;
      }

      // Bookmarked filter
      if (onlyBookmarked && !bookmarkedIds.includes(q.id)) {
        return false;
      }

      // Unmastered filter
      if (onlyUnmastered && masteredIds.includes(q.id)) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesQuestion = q.question?.toLowerCase().includes(query);
        const matchesAnswer = q.idealAnswer?.toLowerCase().includes(query);
        const matchesTags = q.techStack?.some((t) => t.toLowerCase().includes(query));
        const matchesCompany = q.companyTags?.some((c) => c.toLowerCase().includes(query));

        if (!matchesQuestion && !matchesAnswer && !matchesTags && !matchesCompany) {
          return false;
        }
      }

      return true;
    });
  }, [questions, selectedCategory, selectedDifficulty, searchQuery, onlyBookmarked, onlyUnmastered, bookmarkedIds, masteredIds]);

  // Category Icon Resolver
  const getCategoryIcon = (id) => {
    switch (id) {
      case 'frontend':
        return <Code className="w-3.5 h-3.5" />;
      case 'backend':
        return <Server className="w-3.5 h-3.5" />;
      case 'system-design':
        return <Cpu className="w-3.5 h-3.5" />;
      case 'ai-ml':
        return <Brain className="w-3.5 h-3.5" />;
      case 'devops':
        return <Cloud className="w-3.5 h-3.5" />;
      case 'behavioral':
        return <Users className="w-3.5 h-3.5" />;
      default:
        return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="py-6 md:py-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* =================================================================== */}
      {/* COCKPIT HEADER & TELEMETRY STRIP                                    */}
      {/* =================================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-10 shadow-2xl border border-indigo-900/50">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Technical & Behavioral Question Cockpit</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">
              FAANG & Tier-1 Interview Question Bank
            </h1>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              Master hundreds of production-grade interview questions with Staff-level model answers, 
              evaluator rubrics, audio playback, and on-demand synthesis powered by Ollama AI.
            </p>
          </div>

          {/* Quick Telemetry Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Total Questions</p>
              <p className="text-xl font-extrabold text-white mt-0.5">{questions.length}</p>
            </div>
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
              <p className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">Mastered</p>
              <p className="text-xl font-extrabold text-emerald-400 mt-0.5">{masteredIds.length}</p>
            </div>
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
              <p className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">Bookmarked</p>
              <p className="text-xl font-extrabold text-amber-400 mt-0.5">{bookmarkedIds.length}</p>
            </div>
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
              <p className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">Ollama Engine</p>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span className={`w-2 h-2 rounded-full ${ollamaConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-xs font-bold text-white">{ollamaConnected ? 'Online' : 'Ready'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* FILTER & SEARCH CONTROL SUITE                                       */}
      {/* =================================================================== */}
      <div className="space-y-4">
        {/* Search Bar & Primary Actions */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by question, tech stack (e.g. React, Kafka), or company..."
              className="pl-10 pr-9 text-xs rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Difficulty Selector */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              {QUESTION_DIFFICULTIES.map((diff) => (
                <option key={diff} value={diff}>
                  {diff}
                </option>
              ))}
            </select>

            {/* Synthesize with Ollama Button */}
            <Button
              onClick={() => setSynthesisModalOpen(true)}
              className="text-xs font-bold rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Synthesize with Ollama</span>
            </Button>
          </div>
        </div>

        {/* Category Filter Pills & Quick Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {QUESTION_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500'
                  }`}
                >
                  {getCategoryIcon(cat.id)}
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Toggles */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setOnlyBookmarked(!onlyBookmarked)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                onlyBookmarked
                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-300'
              }`}
            >
              <Bookmark className={`w-3 h-3 ${onlyBookmarked ? 'fill-white' : ''}`} />
              <span>Bookmarked ({bookmarkedIds.length})</span>
            </button>

            <button
              onClick={() => setOnlyUnmastered(!onlyUnmastered)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                onlyUnmastered
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Unmastered</span>
            </button>

            {(selectedCategory !== 'all' || selectedDifficulty !== 'All Difficulties' || searchQuery || onlyBookmarked || onlyUnmastered) && (
              <button
                onClick={handleResetFilters}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Reset all filters"
                aria-label="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* QUESTION CARDS GRID                                                 */}
      {/* =================================================================== */}
      {filteredQuestions.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredQuestions.map((item) => (
            <QuestionCard
              key={item.id}
              item={item}
              isBookmarked={bookmarkedIds.includes(item.id)}
              isMastered={masteredIds.includes(item.id)}
              onToggleBookmark={handleToggleBookmark}
              onToggleMastered={handleToggleMastered}
            />
          ))}
        </div>
      ) : (
        /* Empty Filter State */
        <div className="text-center py-16 px-4 bg-white/60 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            No Questions Match Your Current Filters
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
            Try adjusting your search keywords, switching tracks, or clearing your difficulty filter.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs font-bold rounded-xl"
            >
              Reset Filters
            </Button>
            <Button
              size="sm"
              onClick={() => setSynthesisModalOpen(true)}
              className="text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
            >
              Synthesize for This Topic
            </Button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* OLLAMA AI QUESTION SYNTHESIS MODAL                                  */}
      {/* =================================================================== */}
      <QuestionSynthesisModal
        open={synthesisModalOpen}
        onOpenChange={setSynthesisModalOpen}
        onQuestionsGenerated={handleQuestionsGenerated}
      />
    </div>
  );
}
