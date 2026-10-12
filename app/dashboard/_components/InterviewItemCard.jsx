import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import React from 'react'
import { Calendar, Briefcase, Award, ArrowUpRight } from 'lucide-react'

function InterviewItemCard({ interview }) {
    const router = useRouter();

    const onStart = () => {
        router.push('/dashboard/interview/' + interview?.mockId);
    };

    const onFeedbackPress = () => {
        router.push('/dashboard/interview/' + interview?.mockId + "/feedback");
    };
    
    return (
        <div className='interview-card group relative p-5 rounded-2xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between'>
            <div>
                {/* Header with Experience badge */}
                <div className='flex items-start justify-between gap-2 mb-3'>
                    <div className='flex items-center gap-2'>
                        <div className='p-2 rounded-xl bg-primary/10 text-primary'>
                            <Briefcase className='w-4 h-4' />
                        </div>
                        <h3 className='font-bold text-lg text-gray-900 dark:text-white tracking-tight line-clamp-1 group-hover:text-primary transition-colors'>
                            {interview?.jobPosition}
                        </h3>
                    </div>
                    <span className='inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-primary border'>
                        {interview?.jobExperience} Yrs Exp
                    </span>
                </div>

                {/* Date */}
                <div className='flex items-center gap-1.5 text-xs text-gray-400 mb-5'>
                    <Calendar className='w-3.5 h-3.5' />
                    <span>Created on {interview?.createdAt || 'Recently'}</span>
                </div>
            </div>

            {/* Actions */}
            <div className='flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-700/50'>
                <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={onFeedbackPress}
                >
                    Feedback
                </Button>
                <Button 
                    size="sm" 
                    className="w-full text-xs font-semibold rounded-xl bg-primary text-white hover:shadow-md flex items-center justify-center gap-1"
                    onClick={onStart}
                >
                    Start <ArrowUpRight className='w-3.5 h-3.5' />
                </Button>
            </div>
        </div>
    )
}

export default InterviewItemCard