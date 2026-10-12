"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * Modern High-Performance Mouse & Click Experience
 * Features:
 * - Fluid dual-ring cursor: precision center dot + trailing elastic halo
 * - Soft radial ambient spotlight that illuminates the background grid
 * - Contextual hover states: morphs & expands when hovering clickable elements or titles
 * - Modern click shockwave: expanding bioluminescent halo ring from click origin
 * - Radial spark fountain: 6-8 luminous micro-sparks dispersing in 360-degree trajectories
 * - Tactile micro-spring physics on clicked buttons, titles, cards, and interactive elements
 * - Hardware accelerated with translate3d and lerp damping; completely non-blocking (pointer-events-none)
 */
export default function MouseEffect() {
  const dotRef = useRef(null);
  const haloRef = useRef(null);
  const spotlightRef = useRef(null);
  const clickContainerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Modern neon color palette for sparks
  const sparkColors = ["#3B82F6", "#8B5CF6", "#F59E0B", "#10B981", "#EC4899", "#06B6D4"];

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isTouchDevice = !window.matchMedia("(hover: hover)").matches;
    const dot = dotRef.current;
    const halo = haloRef.current;
    const spotlight = spotlightRef.current;
    const clickContainer = clickContainerRef.current;

    let mouseX = -100;
    let mouseY = -100;
    let haloX = -100;
    let haloY = -100;
    let animationFrameId;

    // --- 1. MOUSE MOVE TRACKING (Desktop only) ---
    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) setIsVisible(true);

      if (dot) {
        gsap.to(dot, {
          x: mouseX,
          y: mouseY,
          duration: 0.08,
          ease: "power2.out",
        });
      }

      if (spotlight) {
        gsap.to(spotlight, {
          x: mouseX,
          y: mouseY,
          duration: 0.35,
          ease: "power2.out",
        });
      }
    };

    // Smooth elastic trailing physics for outer halo ring
    const render = () => {
      if (!isTouchDevice && halo) {
        const speed = 0.16;
        haloX += (mouseX - haloX) * speed;
        haloY += (mouseY - haloY) * speed;

        gsap.set(halo, {
          x: haloX,
          y: haloY,
        });
      }
      animationFrameId = requestAnimationFrame(render);
    };

    // --- 2. CONTEXTUAL HOVER DETECTION ---
    const onMouseOver = (e) => {
      const target = e.target;
      if (!target) return;

      const isInteractive =
        target.closest("button") ||
        target.closest("a") ||
        target.closest("h1, h2, h3, h4, h5, h6") ||
        target.closest("[role='button']") ||
        target.closest(".cursor-pointer") ||
        target.closest("input, select, textarea") ||
        target.closest("[data-clickable='true']");

      setIsHovered(!!isInteractive);
    };

    // --- 3. MODERN CLICK EFFECT (SHOCKWAVE + SPARK FOUNTAIN + TACTILE BOUNCE) ---
    const handleClick = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      if (!clickContainer || x === undefined || y === undefined) return;

      const target = e.target;
      const clickableElement =
        target &&
        (target.closest("button") ||
          target.closest("a") ||
          target.closest("h1, h2, h3, h4, h5, h6") ||
          target.closest("[role='button']") ||
          target.closest(".cursor-pointer") ||
          target.closest(".interactive-card") ||
          target.closest("input, select, textarea"));

      // A. Tactile Spring Squish on Clicked Element (if interactive)
      if (clickableElement) {
        gsap.fromTo(
          clickableElement,
          { scale: 0.965 },
          {
            scale: 1,
            duration: 0.35,
            ease: "elastic.out(1.2, 0.35)",
            clearProps: "transform",
          }
        );
      }

      // B. Expanding Bioluminescent Shockwave Ring
      const shockwave = document.createElement("div");
      shockwave.className =
        "pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-blue-500/80 shadow-[0_0_15px_rgba(59,130,246,0.6),0_0_30px_rgba(139,92,246,0.4)]";
      shockwave.style.left = `${x}px`;
      shockwave.style.top = `${y}px`;
      shockwave.style.width = clickableElement ? "24px" : "16px";
      shockwave.style.height = clickableElement ? "24px" : "16px";
      clickContainer.appendChild(shockwave);

      gsap.fromTo(
        shockwave,
        { scale: 0.3, opacity: 0.95, borderWidth: 3 },
        {
          scale: clickableElement ? 3.4 : 2.5,
          opacity: 0,
          borderWidth: 0.5,
          duration: 0.55,
          ease: "power2.out",
          onComplete: () => {
            if (shockwave.parentNode) shockwave.parentNode.removeChild(shockwave);
          },
        }
      );

      // C. Radial Spark Burst Fountain (6-8 luminous micro-sparks)
      const sparkCount = clickableElement ? 8 : 5;
      for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement("div");
        const color = sparkColors[Math.floor(Math.random() * sparkColors.length)];
        const size = Math.random() * 3.5 + 2.5; // 2.5px to 6px
        const angle = (i * (360 / sparkCount) + (Math.random() * 30 - 15)) * (Math.PI / 180);
        const distance = Math.random() * 45 + 35; // 35px to 80px
        const targetX = Math.cos(angle) * distance;
        const targetY = Math.sin(angle) * distance;

        spark.className = "pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full";
        spark.style.left = `${x}px`;
        spark.style.top = `${y}px`;
        spark.style.width = `${size}px`;
        spark.style.height = `${size}px`;
        spark.style.backgroundColor = color;
        spark.style.boxShadow = `0 0 10px ${color}, 0 0 16px ${color}`;
        clickContainer.appendChild(spark);

        gsap.fromTo(
          spark,
          { x: 0, y: 0, scale: 1.2, opacity: 1 },
          {
            x: targetX,
            y: targetY,
            scale: 0,
            opacity: 0,
            duration: Math.random() * 0.25 + 0.4,
            ease: "power3.out",
            onComplete: () => {
              if (spark.parentNode) spark.parentNode.removeChild(spark);
            },
          }
        );
      }
    };

    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);
    const onMouseLeaveWindow = () => setIsVisible(false);

    window.addEventListener("pointerdown", handleClick, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    if (!isTouchDevice) {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
      document.addEventListener("mouseover", onMouseOver, { passive: true });
      document.addEventListener("mouseleave", onMouseLeaveWindow);
      render();
    }

    return () => {
      window.removeEventListener("pointerdown", handleClick);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      if (!isTouchDevice) {
        window.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseover", onMouseOver);
        document.removeEventListener("mouseleave", onMouseLeaveWindow);
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isVisible]);

  return (
    <>
      {/* 1. Global High-Speed Click Shockwave & Sparks Container */}
      <div
        ref={clickContainerRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none"
      />

      {/* 2. Desktop Bioluminescent Cursor & Spotlight (Hidden on touch devices) */}
      <div className="hidden md:block pointer-events-none fixed inset-0 z-40 overflow-hidden select-none">
        {/* Ambient Bioluminescent Radial Spotlight */}
        <div
          ref={spotlightRef}
          className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full transition-opacity duration-500 pointer-events-none ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background:
              "radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, rgba(139, 92, 246, 0.04) 40%, rgba(249, 115, 22, 0.015) 65%, transparent 80%)",
          }}
        />

        {/* Trailing Elastic Halo Ring */}
        <div
          ref={haloRef}
          className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-200 pointer-events-none flex items-center justify-center ${
            isVisible ? "opacity-100" : "opacity-0"
          } ${
            isHovered
              ? "w-12 h-12 border-blue-500/70 bg-blue-500/10 backdrop-blur-[1px] shadow-[0_0_20px_rgba(37,99,235,0.35)] scale-125"
              : isClicked
              ? "w-8 h-8 border-violet-500/90 bg-violet-500/20 scale-90"
              : "w-9 h-9 border-blue-500/40 bg-blue-500/5 shadow-sm"
          }`}
        >
          {isHovered && (
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-violet-500 animate-ping opacity-75" />
          )}
        </div>

        {/* Center Precision Dot */}
        <div
          ref={dotRef}
          className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-all duration-150 ${
            isVisible ? "opacity-100" : "opacity-0"
          } ${
            isHovered
              ? "w-2.5 h-2.5 bg-gradient-to-r from-orange-500 via-amber-400 to-violet-600 shadow-[0_0_8px_rgba(249,115,22,0.8)] scale-110"
              : isClicked
              ? "w-2 h-2 bg-violet-600 shadow-[0_0_8px_rgba(139,92,246,0.9)] scale-75"
              : "w-2 h-2 bg-blue-600 shadow-[0_0_6px_rgba(37,99,235,0.7)]"
          }`}
        />
      </div>
    </>
  );
}
