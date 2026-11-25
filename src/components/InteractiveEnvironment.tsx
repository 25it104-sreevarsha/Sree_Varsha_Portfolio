"use client";

import React, { useEffect, useState } from "react";

interface InteractiveEnvironmentProps {
  theme: "dark" | "light";
}

/**
 * MODEL B chrome layer — cursor glow + branded preloader.
 * The interactive particle field is now a real WebGL scene
 * (WebGLBackdropCanvas); this layer keeps pointer ambience.
 */
export function InteractiveEnvironment({ theme }: InteractiveEnvironmentProps) {
  const [cursorPos, setCursorPos] = useState({ x: -200, y: -200 });
  const [cursorHovering, setCursorHovering] = useState(false);
  const [isDesktopPointer, setIsDesktopPointer] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowPreloader(false), 620);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(pointer: fine)");
    setIsDesktopPointer(mediaQuery.matches);

    const handleMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest(
          "button, a, input, select, textarea, [data-interactive='true']"
        );
        setCursorHovering(Boolean(interactive));
      }
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <>
      {/* Desktop Subtle Interactive Cursor Glow */}
      {isDesktopPointer && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none fixed z-30 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-150 ease-out"
            style={{
              left: `${cursorPos.x}px`,
              top: `${cursorPos.y}px`,
              width: cursorHovering ? "38px" : "24px",
              height: cursorHovering ? "38px" : "24px",
              border: cursorHovering
                ? "1.5px solid rgba(6, 182, 212, 0.7)"
                : "1px solid rgba(167, 139, 250, 0.45)",
              backgroundColor: cursorHovering
                ? "rgba(124, 58, 237, 0.12)"
                : "transparent",
              boxShadow: cursorHovering
                ? "0 0 24px rgba(6, 182, 212, 0.35)"
                : "none",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none fixed z-0 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-opacity duration-300"
            style={{
              left: `${cursorPos.x}px`,
              top: `${cursorPos.y}px`,
              width: "360px",
              height: "360px",
              background:
                theme === "dark"
                  ? "radial-gradient(circle, rgba(124,58,237,0.11) 0%, rgba(6,182,212,0.06) 45%, transparent 70%)"
                  : "radial-gradient(circle, rgba(124,58,237,0.07) 0%, rgba(2,132,199,0.05) 45%, transparent 70%)",
            }}
          />
        </>
      )}

      {/* Elegant Signature Preloader */}
      {showPreloader && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07080C] text-[#F8FAFC] transition-opacity duration-500"
        >
          <div className="relative flex flex-col items-center gap-4 px-6 text-center">
            <div className="flex items-center gap-2.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 font-mono text-xs tracking-[0.22em] text-violet-300 uppercase">
              <span className="h-2 w-2 animate-ping rounded-full bg-cyan-400" />
              Portfolio // MODEL B
            </div>
            <div className="h-1 w-48 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-full origin-left animate-pulse bg-gradient-to-r from-violet-500 via-cyan-400 to-violet-400" />
            </div>
            <p className="font-mono text-[11px] tracking-widest text-slate-400">
              CALIBRATING DEEP-SPACE RENDERER...
            </p>
          </div>
        </div>
      )}
    </>
  );
}
