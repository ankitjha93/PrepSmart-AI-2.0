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
import React, { useState, useRef } from 'react';
import { 
  Calendar, 
  Briefcase, 
  ArrowUpRight, 
  BarChart3, 
  Sparkles, 
  Trash2, 
  AlertTriangle, 
  Loader2 
} from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/utils/db';
import { MockInterview, UserAnswer } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import gsap from 'gsap';

function InterviewItemCard({ interview, onDelete }) {
    const router = useRouter();
    const cardRef = useRef(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

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
            rotationY: x * 6,
            rotationX: -y * 6,
            y: -4,
            transformPerspective: 800,
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
        const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
        gsap.to(btn, { x, y, duration: 0.2, ease: "power2.out" });
    };

    const handleBtnMouseLeave = (e) => {
        gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1.1, 0.35)" });
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

            // 3. Smooth card exit animation
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
                className='interview-card group relative p-0 overflow-hidden bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow rounded-3xl'
            >
                {/* Top gradient highlight on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <CardHeader className="p-6 pb-3">
                    <div className='flex items-start justify-between gap-2'>
                        <div className='flex items-center gap-2.5 min-w-0'>
                            <div className='w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-900/60 shadow-sm group-hover:scale-105 transition-transform flex-shrink-0'>
                                <Briefcase className='w-4 h-4' />
                            </div>
                            <div className='min-w-0'>
                                <CardTitle className='font-bold text-base text-slate-900 dark:text-white tracking-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors' title={interview?.jobPosition}>
                                    {interview?.jobPosition}
                                </CardTitle>
                            </div>
                        </div>

                        {/* Right: Badge & Delete Option */}
                        <div className="flex items-center gap-1.5 shrink-0">
                            <Badge variant="blue" className="text-[11px] font-semibold">
                                {interview?.jobExperience} Yrs Exp
                            </Badge>

                            {/* Delete Button */}
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

                <CardContent className="px-6 py-2">
                    <div className='flex items-center gap-4 text-xs text-slate-400'>
                        <div className="flex items-center gap-1.5">
                            <Calendar className='w-3.5 h-3.5' />
                            <span>{interview?.createdAt || 'Recently created'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <Sparkles className="w-3 h-3" />
                            <span>AI Ready</span>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className='p-6 pt-3 flex items-center gap-2.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20'>
                    <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full text-xs font-semibold rounded-xl hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
                        onClick={onFeedbackPress}
                    >
                        <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Feedback</span>
                    </Button>
                    <Button 
                        size="sm" 
                        onMouseMove={handleBtnMouseMove}
                        onMouseLeave={handleBtnMouseLeave}
                        className="w-full text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        onClick={onStart}
                    >
                        <span>Start Mock</span>
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