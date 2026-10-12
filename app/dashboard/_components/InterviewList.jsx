"use client"
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { useAuth } from '@/context/AuthContext';
import { desc, eq } from 'drizzle-orm';
import React, { useEffect, useState, useRef } from 'react'
import InterviewItemCard from './InterviewItemCard';
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { History, Sparkles } from 'lucide-react';

function InterviewList() {
    const { user } = useAuth();
    const [interviewList, setInterviewList] = useState([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);

    useEffect(() => {
        if (user) {
            GetInterviewList();
        } else {
            setLoading(false);
        }
    }, [user]);

    useGSAP(() => {
        if (interviewList?.length > 0) {
            gsap.from(".interview-card", {
                y: 30,
                opacity: 0,
                stagger: 0.08,
                duration: 0.6,
                ease: "power3.out"
            });
        }
    }, { dependencies: [interviewList], scope: containerRef });

    const GetInterviewList = async () => {
        setLoading(true);
        try {
            const userEmail = user?.email || user?.primaryEmailAddress?.emailAddress;
            if (!userEmail) {
                setLoading(false);
                return;
            }

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
    };

    return (
        <div ref={containerRef}>
            <div className='flex items-center gap-2 mb-4'>
                <History className='w-5 h-5 text-blue-600' />
                <h2 className='font-bold text-xl text-gray-900 dark:text-white'>
                    Previous Mock Interviews
                </h2>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-3'>
                {loading ? (
                    [1, 2, 3].map((item, index) => (
                        <div 
                            key={index} 
                            className='h-[160px] w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl border border-slate-200/60'
                        />
                    ))
                ) : interviewList?.length > 0 ? (
                    interviewList.map((interview, index) => (
                        <InterviewItemCard 
                            interview={interview}
                            key={interview.mockId || index} 
                        />
                    ))
                ) : (
                    <div className='col-span-full p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl'>
                        <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-2 opacity-60" />
                        <p className='text-sm font-medium text-slate-600'>No mock interviews created yet.</p>
                        <p className='text-xs text-slate-400 mt-1'>Click &quot;+ Add New&quot; above to generate your first AI mock session.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default InterviewList