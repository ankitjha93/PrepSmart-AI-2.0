"use client";

import { db } from '@/utils/db';
import { MockInterview, UserAnswer } from '@/utils/schema';
import { useAuth } from '@/context/AuthContext';
import { desc, eq } from 'drizzle-orm';
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import InterviewItemCard from './InterviewItemCard';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { History, Sparkles, Search, X, CheckCircle2, Clock, ArrowUpDown, Filter } from 'lucide-react';

function InterviewList() {
    const { user } = useAuth();
    const [interviewList, setInterviewList] = useState([]);
    const [answerMap, setAnswerMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'completed' | 'unattempted'
    const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'
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
            const [interviews, answers] = await Promise.all([
                db.select()
                    .from(MockInterview)
                    .where(eq(MockInterview.createdBy, userEmail))
                    .orderBy(desc(MockInterview.id)),
                db.select()
                    .from(UserAnswer)
                    .where(eq(UserAnswer.userEmail, userEmail))
            ]);

            // Map user answers by mockIdRef
            const map = {};
            (answers || []).forEach((a) => {
                const id = a.mockIdRef;
                if (!map[id]) {
                    map[id] = { answers: [], count: 0, avgRating: null };
                }
                map[id].answers.push(a);
                map[id].count += 1;
            });

            // Compute average rating per mock
            Object.keys(map).forEach((id) => {
                const ratings = map[id].answers
                    .map((a) => parseFloat(a.rating))
                    .filter((r) => !isNaN(r) && r > 0);
                if (ratings.length > 0) {
                    const avg = ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length;
                    map[id].avgRating = avg.toFixed(1);
                }
            });

            setAnswerMap(map);
            setInterviewList(interviews || []);
        } catch (error) {
            console.warn('Could not retrieve interview list:', error);
            setInterviewList([]);
            setAnswerMap({});
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

    // Filter & Sort interviews
    const filteredInterviews = useMemo(() => {
        let list = [...interviewList];

        // 1. Text Search Filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter((item) =>
                (item.jobPosition || '').toLowerCase().includes(q) ||
                (item.jobDesc || '').toLowerCase().includes(q) ||
                (item.createdAt || '').toLowerCase().includes(q)
            );
        }

        // 2. Status Filter
        if (statusFilter === 'completed') {
            list = list.filter((item) => (answerMap[item.mockId]?.count || 0) > 0);
        } else if (statusFilter === 'unattempted') {
            list = list.filter((item) => !answerMap[item.mockId] || answerMap[item.mockId].count === 0);
        }

        // 3. Sorting
        if (sortOrder === 'oldest') {
            list.sort((a, b) => a.id - b.id);
        } else {
            list.sort((a, b) => b.id - a.id);
        }

        return list;
    }, [interviewList, searchQuery, statusFilter, sortOrder, answerMap]);

    // Count statistics
    const counts = useMemo(() => {
        const total = interviewList.length;
        const completed = interviewList.filter((item) => (answerMap[item.mockId]?.count || 0) > 0).length;
        const unattempted = total - completed;
        return { total, completed, unattempted };
    }, [interviewList, answerMap]);

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
            {/* Header & Subtitle */}
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-3'>
                <div className='flex items-center gap-3'>
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                        <History className='w-4 h-4' />
                    </div>
                    <div>
                        <h2 className='font-black text-xl md:text-2xl text-slate-900 dark:text-white tracking-tight flex items-center gap-2'>
                            <span>Previous Mock Interviews</span>
                            {counts.total > 0 && (
                                <span className='text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'>
                                    {counts.total} {counts.total === 1 ? 'Session' : 'Sessions'}
                                </span>
                            )}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Review your questions, live audio transcripts, and FAANG performance evaluations
                        </p>
                    </div>
                </div>

                {/* Search Bar */}
                {counts.total > 0 && (
                    <div className="relative w-full md:w-72">
                        <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by role or tech stack..."
                            className="w-full text-xs font-semibold pl-9 pr-8 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-sm transition-all"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Filter Tabs & Sorting Toolbar */}
            {counts.total > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 pb-1">
                    {/* Status Filter Tabs */}
                    <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 backdrop-blur-md">
                        <button
                            type="button"
                            onClick={() => setStatusFilter('all')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                statusFilter === 'all'
                                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            All ({counts.total})
                        </button>

                        <button
                            type="button"
                            onClick={() => setStatusFilter('completed')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                statusFilter === 'completed'
                                    ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>Completed ({counts.completed})</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setStatusFilter('unattempted')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                statusFilter === 'unattempted'
                                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <Clock className="w-3 h-3 text-blue-500" />
                            <span>Ready to Start ({counts.unattempted})</span>
                        </button>
                    </div>

                    {/* Sort Order Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">Sort:</span>
                        <div className="relative">
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="text-xs font-bold rounded-xl px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer shadow-sm"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Interviews Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-1'>
                {loading && counts.total === 0 ? (
                    [1, 2, 3].map((item, index) => (
                        <div 
                            key={index} 
                            className='h-[230px] w-full bg-slate-100 dark:bg-slate-800/60 animate-pulse rounded-3xl border border-slate-200/60 dark:border-slate-800'
                        />
                    ))
                ) : filteredInterviews?.length > 0 ? (
                    filteredInterviews.map((interview, index) => (
                        <InterviewItemCard 
                            interview={interview}
                            answerStats={answerMap[interview.mockId]}
                            key={interview.mockId || index}
                            onDelete={handleDeleteInterview}
                        />
                    ))
                ) : searchQuery || statusFilter !== 'all' ? (
                    <div className='col-span-full p-10 text-center bg-slate-50 dark:bg-slate-900/60 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-3'>
                        <Search className="w-8 h-8 text-slate-400 mx-auto opacity-70" />
                        <div>
                            <p className='text-sm font-bold text-slate-700 dark:text-slate-300'>No interviews match your filters</p>
                            <p className="text-xs text-slate-400 mt-0.5">Try clearing your search query or switching tabs</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                setStatusFilter('all');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm transition-all"
                        >
                            Reset All Filters
                        </button>
                    </div>
                ) : (
                    <div className='col-span-full p-12 text-center bg-slate-50/80 dark:bg-slate-900/60 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-3'>
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-sm">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <p className='text-base font-bold text-slate-900 dark:text-white'>No mock interviews created yet</p>
                            <p className='text-xs text-slate-400 max-w-sm mx-auto mt-1'>
                                Click &quot;Start New Mock&quot; or choose a role preset above to simulate your first FAANG interview session.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default InterviewList;