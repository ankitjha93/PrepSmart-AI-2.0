import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import React from 'react'
import { Calendar, Briefcase, Award, ArrowUpRight, BarChart3, Clock, Sparkles } from 'lucide-react'

function InterviewItemCard({ interview }) {
    const router = useRouter();

    const onStart = () => {
        router.push('/dashboard/interview/' + interview?.mockId);
    };

    const onFeedbackPress = () => {
        router.push('/dashboard/interview/' + interview?.mockId + "/feedback");
    };
    
    return (
        <Card className='interview-card group relative p-0 overflow-hidden bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between rounded-3xl'>
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
                    className="w-full text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-1.5"
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