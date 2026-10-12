"use client";

import React, { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import gsap from "gsap";

/**
 * Modern Scroll Progress Tracker with Real-Time Telemetry & Floating Metric Gauge
 * Features:
 * - Multi-stop gradient top progress line with luminous glowing head
 * - Real-time floating telemetry pill badge displaying exact reading depth (XX% Read)
 * - Glassmorphic floating Back-to-Top HUD with circular SVG progress meter & live numeric % counter
 * - Seamless hover morphing between live percentage counter and animated upward chevron
 * - Micro-spring physics and smooth scroll restoration
 */
export default function ScrollEffects() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(Math.max(currentProgress, 0), 100));
      }

      if (window.scrollY > 200) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleMouseEnter = (e) => {
    setIsHovered(true);
    const btn = e.currentTarget;
    gsap.to(btn, {
      y: -4,
      scale: 1.08,
      boxShadow: "0 20px 25px -5px rgba(37, 99, 235, 0.35)",
      duration: 0.25,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = (e) => {
    setIsHovered(false);
    const btn = e.currentTarget;
    gsap.to(btn, {
      y: 0,
      scale: 1,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      duration: 0.4,
      ease: "elastic.out(1.1, 0.4)",
    });
  };

  // Circular gauge circumference for radius = 19
  const radius = 19;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;
  const roundedProgress = Math.round(scrollProgress);

  return (
    <>
      {/* 1. TOP VIEWPORT MULTI-STOP GRADIENT SCROLL PROGRESS LINE & FLOATING TELEMETRY BADGE */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-[100] pointer-events-none bg-slate-200/25 dark:bg-slate-800/25">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 via-violet-500 to-amber-500 transition-all duration-75 relative"
          style={{ width: `${scrollProgress}%` }}
        >
          {/* Luminous Glowing Tip */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_#3B82F6,0_0_18px_#8B5CF6]" />
        </div>

        {/* Floating Telemetry Metric Pill (Positioned cleanly below the progress line inside visible viewport) */}
        {scrollProgress > 2 && (
          <div
            className="absolute top-2.5 transform -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white text-[10px] font-mono font-bold tracking-tight shadow-xl border border-white/20 select-none pointer-events-none transition-all duration-150"
            style={{
              left: `clamp(45px, ${scrollProgress}%, calc(100% - 45px))`,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{roundedProgress}%</span>
            <span className="text-slate-400 text-[8px] font-sans font-medium uppercase tracking-wider">read</span>
          </div>
        )}
      </div>

      {/* 2. FLOATING GLASSMORPHIC BACK-TO-TOP CAPSULE WITH LIVE METRIC HUD */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          showBackToTop
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-6 pointer-events-none"
        }`}
      >
        {/* Floating companion tooltip on hover */}
        <div
          className={`absolute bottom-full right-0 mb-2.5 px-3 py-1 rounded-lg bg-slate-900/90 dark:bg-slate-950/90 text-white text-xs font-medium tracking-wide shadow-xl border border-white/10 backdrop-blur-md flex items-center gap-1.5 whitespace-nowrap transition-all duration-200 pointer-events-none ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span>Top</span>
          <span className="text-slate-400 text-[10px] font-mono">({roundedProgress}% read)</span>
        </div>

        <button
          onClick={scrollToTop}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          aria-label={`Scroll back to top (${roundedProgress}% scrolled)`}
          className="relative w-13 h-13 w-[52px] h-[52px] rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-xl flex items-center justify-center group cursor-pointer overflow-hidden transition-colors"
        >
          {/* Circular SVG Progress Ring */}
          <svg className="w-[52px] h-[52px] -rotate-90 absolute inset-0 pointer-events-none" viewBox="0 0 48 48">
            <circle
              cx="24"
              cy="24"
              r={radius}
              className="text-slate-200/70 dark:text-slate-800/80 stroke-current"
              strokeWidth="2.8"
              fill="transparent"
            />
            <circle
              cx="24"
              cy="24"
              r={radius}
              className="stroke-current transition-all duration-100"
              strokeWidth="2.8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ stroke: "url(#scrollProgressGradient)" }}
            />
            <defs>
              <linearGradient id="scrollProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#FF6B00" />
              </linearGradient>
            </defs>
          </svg>

          {/* Metric Presentation: Displays live percentage when idle, morphs to ChevronUp on hover */}
          <div className="relative z-10 flex items-center justify-center w-full h-full">
            {/* Live Percentage Counter (Default) */}
            <div
              className={`absolute flex flex-col items-center justify-center transition-all duration-200 ${
                isHovered ? "opacity-0 scale-75 -translate-y-2 pointer-events-none" : "opacity-100 scale-100 translate-y-0"
              }`}
            >
              <span className="text-[11px] font-black font-mono tracking-tighter text-slate-800 dark:text-slate-100 leading-none">
                {roundedProgress}
                <span className="text-[8px] font-bold text-blue-600 dark:text-blue-400">%</span>
              </span>
            </div>

            {/* Bouncy Chevron Up (Active on Hover) */}
            <div
              className={`absolute flex items-center justify-center transition-all duration-200 ${
                isHovered ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-75 translate-y-2 pointer-events-none"
              }`}
            >
              <ChevronUp className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-bounce" />
            </div>
          </div>
        </button>
      </div>
    </>
  );
}
