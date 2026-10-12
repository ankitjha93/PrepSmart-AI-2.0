"use client";

import React, { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import gsap from "gsap";

/**
 * Modern Scroll Progress Tracker & Floating Back-To-Top Experience
 * Features:
 * - Ultra-sleek top multi-stop gradient progress line (0% to 100%) with glowing tip
 * - Floating glassmorphic Back-to-Top capsule with circular SVG progress meter
 * - Smooth scroll physics on click
 */
export default function ScrollEffects() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(Math.max(currentProgress, 0), 100));
      }

      if (window.scrollY > 280) {
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
    const btn = e.currentTarget;
    gsap.to(btn, {
      y: -4,
      scale: 1.08,
      boxShadow: "0 20px 25px -5px rgba(37, 99, 235, 0.35)",
      duration: 0.25,
      ease: "power2.out",
    });
    const icon = btn.querySelector(".back-to-top-icon");
    if (icon) {
      gsap.to(icon, { y: -2, duration: 0.2, ease: "power2.out" });
    }
  };

  const handleMouseLeave = (e) => {
    const btn = e.currentTarget;
    gsap.to(btn, {
      y: 0,
      scale: 1,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      duration: 0.4,
      ease: "elastic.out(1.1, 0.4)",
    });
    const icon = btn.querySelector(".back-to-top-icon");
    if (icon) {
      gsap.to(icon, { y: 0, duration: 0.25 });
    }
  };

  // Circular gauge circumference for radius = 18
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <>
      {/* 1. TOP VIEWPORT MULTI-STOP GRADIENT SCROLL PROGRESS LINE */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-[100] pointer-events-none bg-slate-200/20 dark:bg-slate-800/20">
        <div
          className="h-full bg-gradient-to-r from-orange-500 via-rose-500 via-blue-600 to-violet-600 transition-all duration-75 relative"
          style={{ width: `${scrollProgress}%` }}
        >
          {/* Luminous Glowing Tip */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#FF5722,0_0_18px_#3B82F6]" />
        </div>
      </div>

      {/* 2. FLOATING GLASSMORPHIC BACK-TO-TOP CAPSULE */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          showBackToTop
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-6 pointer-events-none"
        }`}
      >
        <button
          onClick={scrollToTop}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          aria-label="Scroll back to top"
          className="relative w-12 h-12 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl flex items-center justify-center group cursor-pointer"
        >
          {/* Circular SVG Progress Ring */}
          <svg className="w-12 h-12 -rotate-90 absolute inset-0 pointer-events-none" viewBox="0 0 44 44">
            <circle
              cx="22"
              cy="22"
              r={radius}
              className="text-slate-200/60 dark:text-slate-800/80 stroke-current"
              strokeWidth="2.5"
              fill="transparent"
            />
            <circle
              cx="22"
              cy="22"
              r={radius}
              className="stroke-current transition-all duration-100"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ stroke: "url(#scrollGradient)" }}
            />
            <defs>
              <linearGradient id="scrollGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6B00" />
                <stop offset="50%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>
            </defs>
          </svg>

          {/* Upward Chevron Icon */}
          <ChevronUp className="back-to-top-icon w-5 h-5 text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors relative z-10" />
        </button>
      </div>
    </>
  );
}
