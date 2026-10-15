"use client";

import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { useAuth } from '@/context/AuthContext';
import { desc, eq } from 'drizzle-orm';
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import InterviewItemCard from './InterviewItemCard';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { History, Sparkles, Search, X } from 'lucide-react';

function InterviewList() {
    const { user } = useAuth();
    const [interviewList, setInterviewList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
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

    // Filter interviews based on search query
    const filteredInterviews = useMemo(() => {
        if (!searchQuery.trim()) return interviewList;
        const q = searchQuery.toLowerCase().trim();
        return interviewList.filter((item) =>
            (item.jobPosition || '').toLowerCase().includes(q) ||
            (item.jobDesc || '').toLowerCase().includes(q) ||
            (item.createdAt || '').toLowerCase().includes(q)
        );
    }, [interviewList, searchQuery]);

    // Animate cards on initial load with clearProps
    useGSAP(() => {
        if (!loading && filteredInterviews?.length > 0 && !hasAnimatedRef.current) {
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
    }, { dependencies: [loading, filteredInterviews], scope: containerRef });

    // Handle instant removal on delete
    const handleDeleteInterview = (deletedMockId) => {
        setInterviewList((prev) => prev.filter((item) => item.mockId !== deletedMockId));
    };

    return (
        <div ref={containerRef} className="space-y-4">
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                <div className='flex items-center gap-2.5'>
                    <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
                        <History className='w-4 h-4' />
                    </div>
                    <div>
                        <h2 className='font-black text-xl text-slate-900 dark:text-white tracking-tight flex items-center gap-2'>
                            <span>Previous Mock Interviews</span>
                            {interviewList?.length > 0 && (
                                <span className='text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'>
                                    {interviewList.length} Sessions
                                </span>
                            )}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Review your past technical questions, spoken answers, and AI feedback reports
                        </p>
                    </div>
                </div>

                {/* Real-time search filter */}
                {interviewList?.length > 0 && (
                    <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by role or tech..."
                            className="w-full text-xs font-medium pl-8 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-sm"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1'>
                {loading && interviewList.length === 0 ? (
                    [1, 2, 3].map((item, index) => (
                        <div 
                            key={index} 
                            className='h-[175px] w-full bg-slate-100 dark:bg-slate-800/60 animate-pulse rounded-3xl border border-slate-200/60 dark:border-slate-800'
                        />
                    ))
                ) : filteredInterviews?.length > 0 ? (
                    filteredInterviews.map((interview, index) => (
                        <InterviewItemCard 
                            interview={interview}
                            key={interview.mockId || index}
                            onDelete={handleDeleteInterview}
                        />
                    ))
                ) : searchQuery ? (
                    <div className='col-span-full p-8 text-center bg-slate-50 dark:bg-slate-900/60 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-2'>
                        <Search className="w-8 h-8 text-slate-400 mx-auto opacity-70" />
                        <p className='text-sm font-bold text-slate-700 dark:text-slate-300'>No interviews matched &quot;{searchQuery}&quot;</p>
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                            Clear search filter
                        </button>
                    </div>
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