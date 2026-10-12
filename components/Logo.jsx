"use client";

import React, { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";

/**
 * PrepSmart AI Neural Logo Component
 * Combines the human profile + neural constellation mesh with interactive micro-animations.
 */
export default function Logo({ size = 38, className = "" }) {
  const logoRef = useRef(null);

  const handleMouseEnter = () => {
    if (logoRef.current) {
      gsap.to(logoRef.current, {
        scale: 1.1,
        rotate: 4,
        duration: 0.3,
        ease: "back.out(2)",
      });
    }
  };

  const handleMouseLeave = () => {
    if (logoRef.current) {
      gsap.to(logoRef.current, {
        scale: 1,
        rotate: 0,
        duration: 0.4,
        ease: "elastic.out(1.1, 0.4)",
      });
    }
  };

  return (
    <div
      ref={logoRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-flex items-center justify-center shrink-0 cursor-pointer ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-orange-500/25 via-pink-500/20 to-purple-600/30 blur-sm scale-110 -z-10 transition-all duration-300" />
      <Image
        src="/logo.svg"
        alt="PrepSmart AI Neural Logo"
        width={size}
        height={size}
        priority
        className="w-full h-full object-contain drop-shadow-md rounded-2xl"
      />
    </div>
  );
}
