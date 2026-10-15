import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import React, { useState, useRef, useMemo } from 'react';
import { 
  Calendar, 
  Briefcase, 
  ArrowUpRight, 
  BarChart3, 
  Sparkles, 
  Trash2, 
  AlertTriangle, 
  Loader2,
  Code2,
  Server,
  BrainCircuit,
  Cloud,
  Layers,
  Star,
  CheckCircle2,
  Clock,
  RotateCcw,
  Play
} from 'lucide-react';
import { toast } from 'sonner';
import gsap from 'gsap';

// Helper to assign a dynamic role icon based on job position title
const getRoleTheme = (roleTitle = '') => {
  const title = roleTitle.toLowerCase();
  if (title.includes('frontend') || title.includes('react') || title.includes('web')) {
    return {
      icon: Code2,
      iconBg: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border-cyan-200/60',
      accentColor: 'from-cyan-500 to-blue-600'
    };
  }
  if (title.includes('ai') || title.includes('machine learning') || title.includes('data') || title.includes('ml')) {
    return {
      icon: BrainCircuit,
      iconBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200/60',
      accentColor: 'from-purple-500 to-indigo-600'
    };
  }
  if (title.includes('backend') || title.includes('system') || title.includes('architect') || title.includes('api')) {
    return {
      icon: Server,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60',
      accentColor: 'from-emerald-500 to-teal-600'
    };
  }
  if (title.includes('cloud') || title.includes('devops') || title.includes('infra')) {
    return {
      icon: Cloud,
      iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/60',
      accentColor: 'from-amber-500 to-orange-600'
    };
  }
  return {
    icon: Code2,
    iconBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200/60',
    accentColor: 'from-blue-600 to-indigo-600'
  };
};

function InterviewItemCard({ interview, answerStats, onDelete }) {
    const router = useRouter();
    const cardRef = useRef(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Extract total question count
    const totalQuestions = useMemo(() => {
        try {
            const parsed = JSON.parse(interview?.jsonMockResp);
            if (Array.isArray(parsed)) return parsed.length;
        } catch (e) {}
        return 5;
    }, [interview?.jsonMockResp]);

    // Parse tech stack tags
    const techTags = useMemo(() => {
        if (!interview?.jobDesc) return [];
        return interview.jobDesc
            .split(/[,|/]/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0 && s.length <= 25);
    }, [interview?.jobDesc]);

    const theme = getRoleTheme(interview?.jobPosition);
    const RoleIcon = theme.icon;

    const answersCompleted = answerStats?.count || 0;
    const avgScore = answerStats?.avgRating;
    const isCompleted = answersCompleted > 0;

    const onStart = () => {
        router.push('/dashboard/interview/' + interview?.mockId);
    };

    const onFeedbackPress = () => {
        router.push('/dashboard/interview/' + interview?.mockId + "/feedback");
    };

    const handleCardMouseMove = (e) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        gsap.to(card, {
            rotationY: x * 5,
            rotationX: -y * 5,
            y: -4,
            transformPerspective: 900,
            duration: 0.25,
            ease: "power2.out"
        });
    };

    const handleCardMouseLeave = () => {
        if (!cardRef.current) return;
        gsap.to(cardRef.current, {
            rotationY: 0,
            rotationX: 0,
            y: 0,
            duration: 0.5,
            ease: "elastic.out(1.1, 0.4)"
        });
    };

    const handleBtnMouseMove = (e) => {
        const btn = e.currentTarget;
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.25;
        gsap.to(btn, { x, y, duration: 0.2, ease: "power2.out" });
    };

    const handleBtnMouseLeave = (e) => {
        gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.4, ease: "elastic.out(1, 0.35)" });
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        const targetMockId = interview?.mockId;
        if (!targetMockId) {
            toast.error("Invalid interview ID");
            setIsDeleting(false);
            return;
        }

        try {
            const res = await fetch('/api/interview/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mockId: targetMockId }),
            });

            const data = await res.json();
            if (!res.ok || data.error) {
                throw new Error(data.error || 'Failed to delete interview');
            }

            setDeleteDialogOpen(false);

            if (cardRef.current) {
                gsap.to(cardRef.current, {
                    scale: 0.88,
                    opacity: 0,
                    y: -10,
                    duration: 0.25,
                    ease: "power2.in",
                    onComplete: () => {
                        if (onDelete) onDelete(targetMockId);
                        toast.success("Mock interview deleted successfully");
                    }
                });
            } else {
                if (onDelete) onDelete(targetMockId);
                toast.success("Mock interview deleted successfully");
            }
        } catch (err) {
            console.error("Delete failed:", err);
            toast.error("Failed to delete interview: " + (err?.message || "Please try again"));
            setIsDeleting(false);
        }
    };
    
    return (
        <>
            <Card 
                ref={cardRef}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                className='interview-card group relative p-0 overflow-hidden bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl flex flex-col justify-between'
            >
                {/* Top dynamic gradient highlight line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.accentColor} opacity-70 group-hover:opacity-100 transition-opacity`} />

                <div>
                    {/* Header */}
                    <CardHeader className="p-5 pb-3">
                        <div className='flex items-start justify-between gap-3'>
                            <div className='flex items-center gap-3 min-w-0'>
                                <div className={`w-10 h-10 rounded-2xl ${theme.iconBg} flex items-center justify-center border shadow-sm group-hover:scale-110 transition-transform shrink-0`}>
                                    <RoleIcon className='w-5 h-5' />
                                </div>
                                <div className='min-w-0'>
                                    <CardTitle className='font-black text-base text-slate-900 dark:text-white tracking-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors' title={interview?.jobPosition}>
                                        {interview?.jobPosition}
                                    </CardTitle>
                                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                        <Calendar className='w-3 h-3 text-slate-400 shrink-0' />
                                        <span>{interview?.createdAt || 'Recent session'}</span>
                                        <span>•</span>
                                        <span className="font-semibold text-slate-600 dark:text-slate-300">{totalQuestions} Qs</span>
                                    </p>
                                </div>
                            </div>

                            {/* Badges & Actions */}
                            <div className="flex items-center gap-1.5 shrink-0">
                                <Badge variant="blue" className="text-[10px] font-bold px-2 py-0.5">
                                    {interview?.jobExperience} Yrs Exp
                                </Badge>

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteDialogOpen(true);
                                    }}
                                    className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors flex items-center justify-center cursor-pointer opacity-70 hover:opacity-100"
                                    title="Delete mock interview"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </CardHeader>

                    {/* Content: Tech Stack Chips & Evaluation Metrics */}
                    <CardContent className="px-5 py-2 space-y-3">
                        {/* Tech Stack Chips */}
                        {techTags.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {techTags.slice(0, 3).map((tag, i) => (
                                    <span 
                                        key={i} 
                                        className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 truncate max-w-[120px]"
                                    >
                                        {tag}
                                    </span>
                                ))}
                                {techTags.length > 3 && (
                                    <span className="text-[10px] font-bold text-slate-400 px-1">
                                        +{techTags.length - 3} more
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Progress Status Bar / Score */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/70 flex items-center justify-between text-xs">
                            {isCompleted ? (
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-black text-xs shadow-xs">
                                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                        <span>{avgScore ? `${avgScore}/10` : 'Evaluated'}</span>
                                    </div>
                                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                        {answersCompleted}/{totalQuestions} Answered
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-xs">
                                    <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                                    <span>Ready to Simulate</span>
                                </div>
                            )}

                            <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>~{totalQuestions * 5} min</span>
                            </div>
                        </div>
                    </CardContent>
                </div>

                {/* Footer Buttons */}
                <CardFooter className='p-5 pt-3 flex items-center gap-2.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/30'>
                    <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-1/2 h-9 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        onClick={onFeedbackPress}
                    >
                        <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Feedback</span>
                    </Button>

                    <Button 
                        size="sm" 
                        onMouseMove={handleBtnMouseMove}
                        onMouseLeave={handleBtnMouseLeave}
                        className={`w-1/2 h-9 text-xs font-bold rounded-xl text-white shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isCompleted 
                                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-indigo-500/20'
                                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-blue-500/25'
                        }`}
                        onClick={onStart}
                    >
                        <span>{isCompleted ? 'Retake Mock' : 'Start Mock'}</span>
                        <ArrowUpRight className='w-3.5 h-3.5' />
                    </Button>
                </CardFooter>
            </Card>

            {/* DELETE CONFIRMATION MODAL */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl p-6 border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl">
                    <DialogHeader className="space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-900 shadow-inner mx-auto sm:mx-0">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                                Delete Mock Interview?
                            </DialogTitle>
                            <DialogDescription className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                Are you sure you want to delete <span className="font-bold text-slate-800 dark:text-slate-200">{interview?.jobPosition}</span>? This will permanently remove this session and all recorded AI performance feedback.
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <DialogFooter className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isDeleting}
                            onClick={() => setDeleteDialogOpen(false)}
                            className="rounded-xl px-4 h-10 text-xs font-bold border-slate-200 dark:border-slate-800 w-full sm:w-auto cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={handleConfirmDelete}
                            className="rounded-xl px-5 h-10 text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/25 flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Deleting...</span>
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete Interview</span>
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default InterviewItemCard;