import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import React from 'react'
import { Calendar, Briefcase, Award, ArrowUpRight, BarChart3, Clock, Sparkles } from 'lucide-react'
import gsap from 'gsap'

function InterviewItemCard({ interview }) {
    const router = useRouter();

    const onStart = () => {
        router.push('/dashboard/interview/' + interview?.mockId);
    };

    const onFeedbackPress = () => {
        router.push('/dashboard/interview/' + interview?.mockId + "/feedback");
    };

    const handleCardMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        gsap.to(card, {
            rotationY: x * 8,
            rotationX: -y * 8,
            y: -4,
            transformPerspective: 800,
            duration: 0.25,
            ease: "power2.out"
        });
    };

    const handleCardMouseLeave = (e) => {
        gsap.to(e.currentTarget, {
            rotationY: 0,
            rotationX: 0,
            y: 0,
            duration: 0.6,
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
    
    return (
        <Card 
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            className='interview-card group relative p-0 overflow-hidden bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-shadow rounded-3xl cursor-pointer'
        >
            {/* Top gradient highlight on hover */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />

            <CardHeader className="p-6 pb-3">
                <div className='flex items-start justify-between gap-2'>
                    <div className='flex items-center gap-2.5'>
                        <div className='w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-900/60 shadow-sm group-hover:scale-105 transition-transform'>
                            <Briefcase className='w-4 h-4' />
                        </div>
                        <div>
                            <CardTitle className='font-bold text-base text-slate-900 dark:text-white tracking-tight line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
                                {interview?.jobPosition}
                            </CardTitle>
                        </div>
                    </div>
                    <Badge variant="blue" className="text-[11px] font-semibold shrink-0">
                        {interview?.jobExperience} Yrs Exp
                    </Badge>
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
                    className="w-full text-xs font-semibold rounded-xl hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white transition flex items-center justify-center gap-1.5"
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
    )
}

export default InterviewItemCard