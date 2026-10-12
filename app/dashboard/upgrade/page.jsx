"use client"
import React, { useRef } from 'react'
import planData from '@/utils/planData'
import PlanItemCard from './_components/PlanItemCard'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Sparkles } from 'lucide-react'

function Upgrade() {
    const containerRef = useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from(".upgrade-header", { y: -25, opacity: 0, duration: 0.7 })
          .from(".plan-card", { y: 40, opacity: 0, stagger: 0.15, duration: 0.8 }, "-=0.3");
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className='p-6 md:p-12 max-w-6xl mx-auto'>
            <div className='upgrade-header text-center mb-10'>
                <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3'>
                    <Sparkles className='w-4 h-4' /> Premium Access
                </div>
                <h1 className='font-extrabold text-3xl md:text-5xl text-gray-900 dark:text-white tracking-tight mb-3'>
                    Upgrade Your Practice
                </h1>
                <p className='text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm md:text-base'>
                    Unlock unlimited mock interviews, detailed AI speech reports, and deep question breakdowns.
                </p>
            </div>

            <div className="mx-auto max-w-4xl px-4 py-4">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-stretch">
                    {planData.map((plan, index) => (
                        <PlanItemCard plan={plan} key={index} />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Upgrade