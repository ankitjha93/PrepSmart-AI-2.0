"use client";

import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { useAuth } from '@/context/AuthContext';
import { desc, eq } from 'drizzle-orm';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import InterviewItemCard from './InterviewItemCard';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { History, Sparkles } from 'lucide-react';

function InterviewList() {
    const { user } = useAuth();
    const [interviewList, setInterviewList] = useState([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);
    const hasAnimatedRef = useRef(false);

    const userEmail = user?.email || user?.primaryEmailAddress?.emailAddress;

    const GetInterviewList = useCallback(async (showSkeleton = true) => {
        if (!userEmail) {
            setLoading(false);
            return;
        }

        if (showSkeleton && interviewList.length === 0) {
            setLoading(true);
        }

        try {
            const result = await db.select()
                .from(MockInterview)
                .where(eq(MockInterview.createdBy, userEmail))
                .orderBy(desc(MockInterview.id));

            setInterviewList(result || []);
        } catch (error) {
            console.warn('Could not retrieve interview list:', error);
            setInterviewList([]);
        } finally {
            setLoading(false);
        }
    }, [userEmail, interviewList.length]);

    // Fetch on user email change
    useEffect(() => {
        if (userEmail) {
            GetInterviewList(true);
        } else {
            setLoading(false);
        }
    }, [userEmail]);

    // Listen for custom interview updates
    useEffect(() => {
        const handleRefresh = () => GetInterviewList(false);
        window.addEventListener('prepsmart_refresh_interviews', handleRefresh);
        return () => window.removeEventListener('prepsmart_refresh_interviews', handleRefresh);
    }, [GetInterviewList]);

    // Animate cards once on initial load with clearProps to prevent faded/stuck opacities
    useGSAP(() => {
        if (!loading && interviewList?.length > 0 && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true;
            gsap.fromTo(".interview-card", 
                { y: 20, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    stagger: 0.06,
                    duration: 0.45,
                    ease: "power2.out",
                    clearProps: "opacity,transform"
                }
            );
        }
    }, { dependencies: [loading, interviewList], scope: containerRef });

    // Handle instant removal on delete
    const handleDeleteInterview = (deletedMockId) => {
        setInterviewList((prev) => prev.filter((item) => item.mockId !== deletedMockId));
    };

    return (
        <div ref={containerRef}>
            <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                    <History className='w-5 h-5 text-blue-600 dark:text-blue-400' />
                    <h2 className='font-bold text-xl text-slate-900 dark:text-white tracking-tight'>
                        Previous Mock Interviews
                    </h2>
                </div>
                {interviewList?.length > 0 && (
                    <span className='text-xs font-bold text-slate-400'>
                        {interviewList.length} Sessions
                    </span>
                )}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-3'>
                {loading && interviewList.length === 0 ? (
                    [1, 2, 3].map((item, index) => (
                        <div 
                            key={index} 
                            className='h-[175px] w-full bg-slate-100 dark:bg-slate-800/60 animate-pulse rounded-3xl border border-slate-200/60 dark:border-slate-800'
                        />
                    ))
                ) : interviewList?.length > 0 ? (
                    interviewList.map((interview, index) => (
                        <InterviewItemCard 
                            interview={interview}
                            key={interview.mockId || index}
                            onDelete={handleDeleteInterview}
                        />
                    ))
                ) : (
                    <div className='col-span-full p-8 text-center bg-slate-50 dark:bg-slate-900/60 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-2'>
                        <Sparkles className="w-8 h-8 text-blue-500 mx-auto opacity-70" />
                        <p className='text-sm font-bold text-slate-700 dark:text-slate-300'>No mock interviews created yet.</p>
                        <p className='text-xs text-slate-400'>Click &quot;+ Add New&quot; above to generate your first AI mock session.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default InterviewList;