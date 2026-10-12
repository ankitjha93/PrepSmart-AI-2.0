"use client"
import React, { useRef } from 'react'
import AddNewInterview from './_components/AddNewInterview'
import InterviewList from './_components/InterviewList'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { Sparkles } from 'lucide-react'

function Dashboard() {
  const dashRef = useRef(null);

  useGSAP(() => {
    gsap.from(".dash-header", {
      y: 20,
      opacity: 0,
      stagger: 0.1,
      duration: 0.7,
      ease: "power3.out"
    });
  }, { scope: dashRef });

  return (
    <div ref={dashRef} className='p-6 md:p-10 max-w-7xl mx-auto'>
      <div className='dash-header mb-8'>
        <div className='flex items-center gap-2 mb-1'>
          <h1 className='font-extrabold text-3xl md:text-4xl text-gray-900 dark:text-white tracking-tight'>
            Dashboard
          </h1>
          <Sparkles className='w-6 h-6 text-primary animate-pulse' />
        </div>
        <p className='text-gray-500 dark:text-gray-400 text-base'>
          Create, practice, and review your AI-driven mock interviews.
        </p>
      </div>

      <div className='dash-header grid grid-cols-1 md:grid-cols-3 my-5 gap-6'>
        <AddNewInterview />
      </div>

      {/* Previous Interview List */}
      <div className='dash-header mt-8'>
        <InterviewList />
      </div>
    </div>
  )
}

export default Dashboard