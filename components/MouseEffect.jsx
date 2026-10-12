"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * High-performance Bioluminescent Mouse Follower & Ambient Spotlight
 * Features:
 * - Fluid dual-ring cursor: precision center dot + trailing elastic halo
 * - Soft radial ambient spotlight that illuminates the background grid
 * - Contextual hover states: morphs & expands when hovering clickable elements
 * - Tactile click ripple contraction on mousedown
 * - Hardware-accelerated with translate3d and lerp damping (hidden on touch devices)
 */
export default function MouseEffect() {
  const dotRef = useRef(null);
  const haloRef = useRef(null);
  const spotlightRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only activate on devices that support hover (non-touch)
    if (typeof window === "undefined" || !window.matchMedia("(hover: hover)").matches) {
      return;
    }

    const dot = dotRef.current;
    const halo = haloRef.current;
    const spotlight = spotlightRef.current;
    if (!dot || !halo) return;

    let mouseX = -100;
    let mouseY = -100;
    let haloX = -100;
    let haloY = -100;
    let animationFrameId;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) setIsVisible(true);

      // Instant precision dot positioning via GSAP quickTo or style
      gsap.to(dot, {
        x: mouseX,
        y: mouseY,
        duration: 0.08,
        ease: "power2.out",
      });

      // Ambient spotlight follows cursor
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
      // Lerp damping factor
      const speed = 0.16;
      haloX += (mouseX - haloX) * speed;
      haloY += (mouseY - haloY) * speed;

      gsap.set(halo, {
        x: haloX,
        y: haloY,
      });

      animationFrameId = requestAnimationFrame(render);
    };

    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);

    // Detect hovering over clickable elements
    const onMouseOver = (e) => {
      const target = e.target;
      if (
        target.closest("button") ||
        target.closest("a") ||
        target.closest("[role='button']") ||
        target.closest(".cursor-pointer") ||
        target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA"
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const onMouseLeaveWindow = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseover", onMouseOver, { passive: true });
    document.addEventListener("mouseleave", onMouseLeaveWindow);

    render();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseleave", onMouseLeaveWindow);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible]);

  return (
    <div className="hidden md:block pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {/* 1. Large Ambient Bioluminescent Radial Spotlight */}
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

      {/* 2. Trailing Elastic Halo Ring */}
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

      {/* 3. Center Precision Dot */}
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
  );
}
