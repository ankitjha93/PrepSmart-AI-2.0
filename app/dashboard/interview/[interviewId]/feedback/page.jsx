"use client"
import { db } from '@/utils/db'
import { UserAnswer } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import React, { useEffect, useState, useRef } from 'react'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronsUpDown, CheckCircle, Award, ArrowLeft, Star, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

function Feedback({ params }) {
    const [feedbackList, setFeedbackList] = useState([]);
    const [displayRating, setDisplayRating] = useState(0);
    const router = useRouter();
    const containerRef = useRef(null);

    useEffect(() => {
        GetFeedback();
    }, []);

    const GetFeedback = async () => {
        const result = await db.select()
            .from(UserAnswer)
            .where(eq(UserAnswer.mockIdRef, params.interviewId))
            .orderBy(UserAnswer.id);

        setFeedbackList(result);
    };

    // Calculate average rating
    const avgScore = feedbackList?.length > 0
        ? (feedbackList.reduce((acc, cur) => acc + (parseFloat(cur.rating) || 6), 0) / feedbackList.length).toFixed(1)
        : 7.0;

    useGSAP(() => {
        if (feedbackList?.length > 0) {
            // Animate rating counter
            const obj = { val: 0 };
            gsap.to(obj, {
                val: avgScore,
                duration: 1.5,
                ease: "power2.out",
                onUpdate: () => setDisplayRating(obj.val.toFixed(1))
            });

            // Stagger reveal feedback cards
            gsap.from(".feedback-item", {
                y: 35,
                opacity: 0,
                stagger: 0.1,
                duration: 0.7,
                ease: "power3.out"
            });
        }
    }, { dependencies: [feedbackList], scope: containerRef });

    return (
        <div ref={containerRef} className='p-6 md:p-12 max-w-5xl mx-auto'>
            {feedbackList?.length === 0 ? (
                <div className='text-center py-20'>
                    <AlertCircle className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                    <h2 className='font-bold text-2xl text-gray-600 mb-2'>No Interview Feedback Record Found</h2>
                    <p className='text-sm text-gray-400 mb-6'>No responses have been submitted for this session yet.</p>
                    <Button onClick={() => router.replace('/dashboard')}>Return to Dashboard</Button>
                </div>
            ) : (
                <>
                    {/* Header */}
                    <div className='mb-8'>
                        <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-semibold mb-3'>
                            <CheckCircle className='w-4 h-4' /> Interview Completed
                        </div>
                        <h1 className='text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2'>
                            Performance & Feedback Report
                        </h1>
                        <p className='text-gray-500 text-sm md:text-base'>
                            Review your answers compared against target benchmarks, with detailed AI ratings and action items.
                        </p>
                    </div>

                    {/* Overall Score Card */}
                    <div className='p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-200/60 dark:border-indigo-800/60 mb-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm'>
                        <div>
                            <span className='text-xs font-bold text-primary uppercase tracking-wider block mb-1'>Overall Assessment</span>
                            <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                                Candidate Interview Score
                            </h2>
                            <p className='text-xs text-gray-500 mt-1'>Calculated across all answered technical questions</p>
                        </div>

                        <div className='flex items-baseline gap-2 bg-white dark:bg-gray-800 px-6 py-4 rounded-2xl shadow-md border'>
                            <Star className='w-6 h-6 text-amber-500 fill-amber-500' />
                            <span className='text-4xl font-black text-gray-900 dark:text-white font-mono'>
                                {displayRating}
                            </span>
                            <span className='text-base text-gray-400 font-semibold'>/ 10</span>
                        </div>
                    </div>

                    {/* Feedback Items List */}
                    <div className='space-y-4 mb-10'>
                        <h3 className='font-bold text-lg text-gray-800 dark:text-gray-200 mb-4'>
                            Detailed Question Breakdown ({feedbackList.length} Questions)
                        </h3>

                        {feedbackList.map((item, index) => (
                            <Collapsible key={item.id || index} className='feedback-item border border-gray-200/80 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-sm overflow-hidden transition-all duration-300'>
                                <CollapsibleTrigger className='p-5 flex items-center justify-between text-left gap-4 w-full hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors'>
                                    <div className='flex items-center gap-3'>
                                        <span className='w-7 h-7 rounded-full bg-secondary font-bold text-xs flex items-center justify-center text-primary flex-shrink-0'>
                                            {index + 1}
                                        </span>
                                        <span className='font-semibold text-gray-900 dark:text-gray-100 text-sm md:text-base'>
                                            {item.question}
                                        </span>
                                    </div>
                                    <div className='flex items-center gap-3 flex-shrink-0'>
                                        <span className='text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border'>
                                            Rating: {item.rating}
                                        </span>
                                        <ChevronsUpDown className='h-4 w-4 text-gray-400' />
                                    </div>
                                </CollapsibleTrigger>

                                <CollapsibleContent className='px-5 pb-5 pt-1 space-y-3 border-t border-gray-100 dark:border-gray-800'>
                                    {/* User's Answer */}
                                    <div className='p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50'>
                                        <span className='text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1'>Your Answer:</span>
                                        <p className='text-sm text-gray-800 dark:text-gray-200 leading-relaxed'>{item.userAns || 'No answer recorded.'}</p>
                                    </div>

                                    {/* Correct Answer */}
                                    <div className='p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50'>
                                        <span className='text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide block mb-1'>Ideal Key Points:</span>
                                        <p className='text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed'>{item.correctAns}</p>
                                    </div>

                                    {/* Feedback */}
                                    <div className='p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/50'>
                                        <span className='text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide block mb-1'>AI Constructive Feedback:</span>
                                        <p className='text-sm text-blue-950 dark:text-blue-200 leading-relaxed'>{item.feedback}</p>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        ))}
                    </div>

                    <div className='flex justify-end'>
                        <Button 
                            onClick={() => router.replace('/dashboard')}
                            className='px-6 py-5 rounded-xl text-sm font-semibold flex items-center gap-2'
                        >
                            <ArrowLeft className='w-4 h-4' /> Back to Dashboard
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}

export default Feedback