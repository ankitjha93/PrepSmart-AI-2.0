"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { OllamaService } from '@/utils/OllamaAIModal';
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { 
  FileText, 
  Sparkles, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Loader2, 
  Brain, 
  Layers, 
  ShieldCheck, 
  Target, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  RotateCcw,
  Zap,
  Building2,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const SAMPLE_RESUMES = {
  fullstack: {
    role: 'Senior Full Stack Engineer',
    targetJobDesc: 'React 19, Next.js, Node.js, PostgreSQL, Distributed Systems, High-Concurrency APIs, Redis, AWS',
    text: `ALEX RIVERA
Senior Full Stack Engineer | San Francisco, CA | alex.rivera@example.com

PROFESSIONAL EXPERIENCE:
ScaleTech Inc. — Senior Software Engineer (2022 – Present)
• Architected and deployed an event-driven payment processing pipeline handling 45,000 requests/sec with p99 latency under 45ms using Node.js, Redis, and PostgreSQL.
• Spearedheaded the migration of our customer-facing web application from legacy SPA to Next.js 14 App Router with React Server Components, cutting Largest Contentful Paint (LCP) by 48%.
• Implemented distributed locking (Redlock) and idempotency key patterns to eliminate duplicate checkout transactions during network partitions.
• Mentored 6 mid-level engineers, authored testing guidelines with 92% unit test coverage using Jest and Playwright.

CloudScale Solutions — Full Stack Developer (2019 – 2022)
• Built RESTful microservices in Go and TypeScript, orchestrating Docker containers via Kubernetes on AWS EKS.
• Optimized PostgreSQL database queries using composite indices and partition pruning, reducing database CPU load by 35%.
• Designed real-time collaboration canvas using WebSockets and client-side optimistic UI state rollbacks.

TECHNICAL SKILLS:
Languages: TypeScript, JavaScript, Go, Python, SQL, HTML5/CSS3
Frameworks & Libraries: React 19, Next.js, Node.js, Express, Tailwind CSS
Databases & Caching: PostgreSQL, MongoDB, Redis, DynamoDB
Infrastructure & Cloud: AWS (S3, Lambda, ECS, EKS), Docker, Kubernetes, CI/CD, Terraform`
  },
  aiml: {
    role: 'Staff AI / Machine Learning Engineer',
    targetJobDesc: 'PyTorch, Large Language Models (LLMs), RAG Architectures, Vector Databases, Cross-Encoder Rerankers, CUDA, vLLM',
    text: `ELENA ROSTOVA
Staff AI / ML Engineer | Seattle, WA | elena.rostova@example.com

PROFESSIONAL EXPERIENCE:
NeuralVector AI — Lead Machine Learning Engineer (2022 – Present)
• Designed and scaled an enterprise Retrieval-Augmented Generation (RAG) system across 20M technical documents using hybrid search (Dense Embeddings + BM25) and Cohere cross-encoder rerankers, boosting top-5 recall from 68% to 94%.
• Reduced LLM inference latency by 3.2x by deploying quantized 4-bit AWQ models on vLLM clusters with custom Triton inference kernels.
• Built continuous evaluation harness scoring LLM factual hallucination rates, integrating automated semantic guardrails that reduced ungrounded responses by 76%.

Cognitive Systems — Machine Learning Engineer (2020 – 2022)
• Fine-tuned open-source transformer models (Llama, Mistral) for code generation using QLoRA and DeepSpeed ZeRO-3 on 32x A100 GPU clusters.
• Implemented real-time vector indexing pipelines using Pinecone, Milvus, and Kafka streaming ingestion.

TECHNICAL SKILLS:
Frameworks: PyTorch, Hugging Face Transformers, LangChain, LlamaIndex, vLLM, TensorRT-LLM
Vector DBs: Pinecone, Qdrant, Milvus, pgvector
Infrastructure: CUDA, Triton, Docker, Kubernetes, Ray, AWS SageMaker`
  }
};

export default function ResumeScannerPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('Senior Full Stack Engineer');
  const [targetJobDesc, setTargetJobDesc] = useState('React, Next.js, Node.js, PostgreSQL, Distributed Systems, Redis, High Availability');
  const [loading, setLoading] = useState(false);
  const [creatingMock, setCreatingMock] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(0);

  // Analysis Result
  const [analysis, setAnalysis] = useState(null);

  // Load Preset Resume
  const handleLoadSample = (key) => {
    const sample = SAMPLE_RESUMES[key];
    if (sample) {
      setResumeText(sample.text);
      setTargetRole(sample.role);
      setTargetJobDesc(sample.targetJobDesc);
      toast.info(`Loaded sample resume: ${sample.role}`);
    }
  };

  // Handle File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (event) => {
        setResumeText(event.target?.result || '');
        toast.success(`Loaded ${file.name}`);
      };
      reader.readAsText(file);
    } else {
      // For PDF or other files, encourage text paste or provide sample
      toast.info(`Please copy and paste your resume text for highest extraction accuracy.`);
    }
  };

  // Run AI Resume Analysis
  const handleAnalyzeResume = async (e) => {
    if (e) e.preventDefault();
    if (!resumeText.trim() || resumeText.length < 50) {
      toast.error('Please paste or upload your resume text (minimum 50 characters).');
      return;
    }

    setLoading(true);
    setAnalysis(null);
    toast.loading('Analyzing resume against ATS rubrics with Ollama Llama 3.3...');

    try {
      const res = await OllamaService.analyzeResume({
        resumeText,
        targetRole,
        targetJobDesc,
      });

      setAnalysis(res);
      toast.dismiss();
      toast.success(`Analysis complete! ATS Match Score: ${res.atsScore}%`);
    } catch (err) {
      toast.dismiss();
      console.error('Resume analysis error:', err);
      toast.error(err.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Launch into Mock Interview with Tailored Questions
  const handleStartMockFromResume = async () => {
    if (!analysis || !analysis.tailoredQuestions || analysis.tailoredQuestions.length === 0) {
      toast.error('No tailored questions available. Run the analysis first.');
      return;
    }

    setCreatingMock(true);
    toast.loading('Initializing mock interview room with your project questions...');

    try {
      const questionsPayload = analysis.tailoredQuestions.map((q) => ({
        question: q.question,
        answer: q.answer,
      }));

      const newMockId = uuidv4();
      const userEmail = user?.email || 'candidate@prepsmart.ai';

      await db.insert(MockInterview).values({
        mockId: newMockId,
        jsonMockResp: JSON.stringify(questionsPayload),
        jobPosition: `${targetRole} (Resume-Tailored)`,
        jobDesc: `Tailored to candidate's real project achievements: ${targetJobDesc}`,
        jobExperience: '5',
        createdBy: userEmail,
        createdAt: moment().format('DD-MM-yyyy'),
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('prepsmart_refresh_interviews'));
      }

      toast.dismiss();
      toast.success('Mock round ready! Entering interview room...');
      router.push(`/dashboard/interview/${newMockId}`);
    } catch (err) {
      console.error('Mock creation error:', err);
      toast.dismiss();
      toast.error('Failed to create mock session. Try again.');
      setCreatingMock(false);
    }
  };

  return (
    <div className="py-8 md:py-12 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-300 px-2 sm:px-4">
      {/* =================================================================== */}
      {/* HEADER BANNER                                                       */}
      {/* =================================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-10 shadow-2xl border border-indigo-900/50">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>AI Resume-to-Mock Customizer</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">
              Resume Scanner & ATS Match Cockpit
            </h1>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              Audit your resume against any target engineering role, extract verified technical projects, 
              and synthesize mock interview rounds that directly test your real-world achievements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleLoadSample('fullstack')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/10 text-white transition cursor-pointer"
            >
              ⚡ Load Full Stack Sample
            </button>
            <button
              type="button"
              onClick={() => handleLoadSample('aiml')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/10 text-white transition cursor-pointer"
            >
              🧠 Load AI / ML Sample
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* INPUT CONFIGURATION DOCK                                            */}
      {/* =================================================================== */}
      <form onSubmit={handleAnalyzeResume} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Resume Text & Upload (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Candidate Resume Text
              </h2>
            </div>
            <label className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer flex items-center gap-1">
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Import .txt File</span>
              <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <Textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume content here (experience, bullet points, skills, past architecture decisions)..."
            rows={12}
            className="w-full text-xs font-mono p-4 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 leading-relaxed focus:ring-2 focus:ring-blue-500"
            required
          />

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Minimum 50 characters for realistic extraction</span>
            <span>{resumeText.length} characters</span>
          </div>
        </div>

        {/* Right Column: Target Job Requirements (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Target Job Specification
            </h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Target Job Title
            </label>
            <Input
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Full Stack Engineer, Staff Backend Architect"
              className="text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Target Company Stack / Job Description
            </label>
            <Textarea
              value={targetJobDesc}
              onChange={(e) => setTargetJobDesc(e.target.value)}
              placeholder="e.g., React 19, Next.js, Node.js, Distributed Systems, High Availability, PostgreSQL, AWS..."
              rows={4}
              className="text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 leading-relaxed"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !resumeText.trim()}
            className="w-full py-6 rounded-2xl font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Auditing with Ollama Llama 3.3...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Resume & Generate Questions</span>
              </>
            )}
          </Button>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 leading-relaxed">
            <span className="font-bold text-slate-700 dark:text-slate-300">100% Private:</span> Your resume is parsed locally in memory. We never sell or share candidate data with third-party advertisers.
          </div>
        </div>
      </form>

      {/* =================================================================== */}
      {/* INTERACTIVE ATS ANALYSIS REPORT                                     */}
      {/* =================================================================== */}
      {analysis && (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Top Row: Score & Key Findings */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* ATS Score Card (4 cols) */}
            <div className="md:col-span-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between text-center">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  ATS Match Index
                </span>
                <div className="my-4">
                  <div className="inline-flex items-baseline gap-1">
                    <span className="text-5xl md:text-6xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                      {analysis.atsScore}%
                    </span>
                  </div>
                  <Progress value={analysis.atsScore} className="h-2 mt-2 bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                {analysis.atsScore >= 80 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Strong Candidate Match for {targetRole}
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Good Baseline • Add missing keywords below
                  </span>
                )}
              </div>
            </div>

            {/* Matched vs Missing Keywords (8 cols) */}
            <div className="md:col-span-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
              {/* Matched Skills */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Verified Matched Skills ({analysis.matchedSkills?.length || 0})
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.matchedSkills?.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    >
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Keywords */}
              <div>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Recommended Keywords to Add ({analysis.missingKeywords?.length || 0})
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.missingKeywords?.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                    >
                      + {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Optimization Tips */}
              {analysis.resumeOptimizationTips && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    Recruiter Optimization Vectors
                  </p>
                  <ul className="space-y-1">
                    {analysis.resumeOptimizationTips.map((tip, idx) => (
                      <li key={idx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section: Hyper-Tailored Project-Specific Questions */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  <Brain className="w-4 h-4" /> Tailored Interview Questions
                </div>
                <h3 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
                  Questions Derived Directly from Your Resume Projects
                </h3>
              </div>

              <Button
                onClick={handleStartMockFromResume}
                disabled={creatingMock}
                className="py-5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 gap-2 cursor-pointer shrink-0"
              >
                {creatingMock ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Launching Session...</span>
                  </>
                ) : (
                  <>
                    <span>Start Mock with These Questions</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-4">
              {analysis.tailoredQuestions?.map((item, idx) => {
                const isExpanded = expandedQuestion === idx;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {item.question}
                        </h4>
                      </div>

                      <button
                        onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1.5 animate-in fade-in duration-150">
                        <p className="font-bold text-[11px] text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                          Expected Model Answer & Key Points:
                        </p>
                        <p className="leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
