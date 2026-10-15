"use client";
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, Brain, CheckCircle2 } from 'lucide-react';
import { OllamaService } from '@/utils/OllamaAIModal';
import { toast } from 'sonner';

export default function QuestionSynthesisModal({ 
  open, 
  onOpenChange, 
  onQuestionsGenerated 
}) {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('backend');
  const [difficulty, setDifficulty] = useState('Senior');
  const [questionCount, setQuestionCount] = useState(3);
  const [loading, setLoading] = useState(false);

  const handleSynthesize = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast.error('Please enter a target topic or technology.');
      return;
    }

    setLoading(true);
    toast.loading('Synthesizing technical interview questions via Ollama AI...');

    try {
      const res = await OllamaService.generateQuestions({
        jobPosition: `${topic} Specialist`,
        jobDesc: `Synthesize ${questionCount} authentic, interview-ready questions with detailed answers, rubrics, and pitfalls for ${topic} at ${difficulty} seniority.`,
        jobExperience: difficulty === 'Junior' ? '1' : difficulty === 'Mid-Level' ? '3' : '6',
        questionCount: questionCount,
      });

      let rawQuestions = [];
      if (res && Array.isArray(res.questions)) {
        rawQuestions = res.questions;
      } else if (res?.rawJson) {
        try {
          const parsed = JSON.parse(res.rawJson);
          rawQuestions = Array.isArray(parsed) ? parsed : (parsed.questions || []);
        } catch {
          rawQuestions = [];
        }
      }

      if (!rawQuestions || rawQuestions.length === 0) {
        throw new Error('Ollama did not return structured questions. Try another topic.');
      }

      // Normalize into QuestionBank items
      const formattedQuestions = rawQuestions.map((q, idx) => ({
        id: `custom-${Date.now()}-${idx}`,
        question: q.question || q.questionText || `Technical question on ${topic}`,
        category: category,
        difficulty: difficulty,
        companyTags: ['Ollama AI Synthesized', 'Custom'],
        techStack: [topic, category],
        idealAnswer: q.answer || q.idealAnswer || q.solution || 'Model response synthesized by Ollama Llama 3.3.',
        rubrics: [
          'Demonstrates in-depth understanding of core architectural tradeoffs.',
          `Applies ${topic} best practices in production-grade environments.`,
          'Highlights reliability, scalability, and error boundaries.',
        ],
        redFlags: [
          'Superficial theoretical response without practical operational details.',
          'Ignoring failure modes and edge cases.',
        ],
        isCustom: true,
      }));

      onQuestionsGenerated(formattedQuestions);
      toast.dismiss();
      toast.success(`Successfully synthesized ${formattedQuestions.length} custom questions!`);
      setTopic('');
      onOpenChange(false);
    } catch (err) {
      toast.dismiss();
      console.error('Synthesis error:', err);
      toast.error(err.message || 'Failed to synthesize questions via Ollama.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-extrabold text-slate-900 dark:text-white">
                Ollama AI Question Synthesizer
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Generate tailored, real-time interview questions and rubrics with your local AI engine.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSynthesize} className="space-y-4">
          {/* Target Technology / Topic Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Target Framework, Tool, or Topic
            </label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., PostgreSQL Query Planner, React 19 Actions, Kubernetes CRDs..."
              className="text-xs rounded-2xl border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800/60"
              disabled={loading}
              required
            />
          </div>

          {/* Category & Seniority Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Domain Track
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
                className="w-full text-xs font-semibold px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="frontend">Frontend & Web</option>
                <option value="backend">Backend & Systems</option>
                <option value="system-design">System Design</option>
                <option value="ai-ml">AI & Machine Learning</option>
                <option value="devops">Cloud & DevOps</option>
                <option value="behavioral">Behavioral & Leadership</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Target Seniority
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={loading}
                className="w-full text-xs font-semibold px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Junior">Junior (0-2 yrs)</option>
                <option value="Mid-Level">Mid-Level (3-5 yrs)</option>
                <option value="Senior">Senior (6+ yrs)</option>
                <option value="Staff / Architect">Staff / Principal (8+ yrs)</option>
              </select>
            </div>
          </div>

          {/* Question Count Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Questions to Synthesize
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 3, 5].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setQuestionCount(cnt)}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    questionCount === cnt
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                  }`}
                >
                  {cnt} {cnt === 1 ? 'Question' : 'Questions'}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="text-xs font-bold rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !topic.trim()}
              className="text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing with Ollama...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Synthesize Questions</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
