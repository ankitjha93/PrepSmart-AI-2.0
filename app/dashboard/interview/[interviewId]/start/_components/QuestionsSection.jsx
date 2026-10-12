"use client"
import { Lightbulb, Volume2, Sparkles, HelpCircle } from 'lucide-react'
import React, { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

function QuestionsSection({ mockInterviewQuestion, activeQuestionIndex }) {
    const questionBoxRef = useRef(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    useGSAP(() => {
        // Smooth slide & fade transition whenever the question index changes
        gsap.fromTo(".question-text-box", 
            { y: 18, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" }
        );
    }, { dependencies: [activeQuestionIndex], scope: questionBoxRef });

    const textToSpeech = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // cancel any active speech
            const speech = new SpeechSynthesisUtterance(text);
            speech.rate = 0.95;
            speech.onstart = () => setIsSpeaking(true);
            speech.onend = () => setIsSpeaking(false);
            speech.onerror = () => setIsSpeaking(false);
            window.speechSynthesis.speak(speech);
        } else {
            alert('Sorry, your browser does not support text-to-speech.');
        }
    };

    return mockInterviewQuestion && (
        <div ref={questionBoxRef} className='p-6 md:p-8 border border-gray-200/80 dark:border-gray-800 rounded-3xl my-6 bg-white dark:bg-gray-900 shadow-sm flex flex-col justify-between'>
            <div>
                {/* Question selector tabs */}
                <div className='flex flex-wrap gap-2.5 mb-6'>
                    {mockInterviewQuestion.map((_, index) => (
                        <span 
                            key={index}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-300 ${
                                activeQuestionIndex === index
                                    ? 'bg-primary text-white shadow-md scale-105'
                                    : 'bg-secondary text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                            }`}
                        >
                            Q #{index + 1}
                        </span>
                    ))}
                </div>

                {/* Animated Question Body */}
                <div className='question-text-box min-h-[140px]'>
                    <div className='flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-2'>
                        <HelpCircle className='w-4 h-4' />
                        Question {activeQuestionIndex + 1} of {mockInterviewQuestion.length}
                    </div>

                    <h2 className='text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-relaxed mb-4'>
                        {mockInterviewQuestion[activeQuestionIndex]?.question}
                    </h2>

                    {/* Speaker Listen Button */}
                    <button 
                        type="button"
                        onClick={() => textToSpeech(mockInterviewQuestion[activeQuestionIndex]?.question)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            isSpeaking 
                                ? 'bg-primary/10 border-primary text-primary animate-pulse' 
                                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary'
                        }`}
                        title="Listen to question"
                    >
                        <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce' : ''}`} />
                        <span>{isSpeaking ? 'Playing Audio...' : 'Read Aloud'}</span>
                    </button>
                </div>
            </div>

            {/* Note Callout Card */}
            <div className='border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-4 bg-gradient-to-br from-indigo-50/70 to-blue-50/50 dark:from-indigo-950/30 dark:to-blue-950/20 mt-8'>
                <div className='flex gap-2 items-center text-primary font-semibold text-xs uppercase tracking-wide mb-1'>
                    <Lightbulb className='w-4 h-4 text-amber-500' />
                    <span>Interview Tip</span>
                </div>
                <p className='text-xs text-gray-600 dark:text-gray-400 leading-relaxed'>
                    {process.env.NEXT_PUBLIC_QUESTION_NOTE || 'Click on Record Answer when you want to respond. At the end, you will receive AI rating and feedback.'}
                </p>
            </div>
        </div>
    )
}

export default QuestionsSection