"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { FilmReel } from "@phosphor-icons/react";

/**
 * Interactive hero visual: film reel + sprocket strip + floating credits.
 * - 3D tilt follows cursor via Framer useMotionValue (no React re-renders).
 * - Ambient amber glow pulses on hover.
 */
export function HeroFilmVisual() {
  const ref = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-7deg", "7deg"]);
  const smoothRotateX = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const smoothRotateY = useSpring(rotateY, { stiffness: 150, damping: 20 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <div
      className="relative"
      style={{ perspective: "1400px" }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: smoothRotateX,
          rotateY: smoothRotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative aspect-[3/4] w-full max-w-[420px] ml-auto rounded-[1.75rem] overflow-hidden border border-zinc-800"
      >
        {/* Gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-amber-950/40" />

        {/* Amber ambient wash */}
        <div
          className="absolute -top-20 -right-20 h-80 w-80 rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(245,158,11,0.5) 0%, transparent 70%)",
          }}
        />

        {/* Sprocket holes column - left */}
        <div className="absolute left-0 top-0 h-full w-10 flex flex-col items-center gap-3 py-6 bg-zinc-950/80 border-r border-amber-500/20 overflow-hidden">
          <div className="flex flex-col gap-3 animate-filmstrip">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="h-5 w-5 rounded-sm bg-zinc-950 border border-zinc-700 shrink-0"
              />
            ))}
          </div>
        </div>

        {/* Sprocket holes column - right */}
        <div className="absolute right-0 top-0 h-full w-10 flex flex-col items-center gap-3 py-6 bg-zinc-950/80 border-l border-amber-500/20 overflow-hidden">
          <div className="flex flex-col gap-3 animate-filmstrip">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="h-5 w-5 rounded-sm bg-zinc-950 border border-zinc-700 shrink-0"
              />
            ))}
          </div>
        </div>

        {/* Film reel, large, slowly spinning */}
        <div className="absolute inset-0 flex items-center justify-center pl-6">
          <FilmReel
            weight="duotone"
            className="h-48 w-48 text-amber-500/80 animate-reel"
            style={{ transform: "translateZ(40px)" }}
          />
        </div>

        {/* Floating credits - production style */}
        <div
          className="absolute top-8 right-14 text-right"
          style={{ transform: "translateZ(60px)" }}
        >
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-500/90">
            Scène 04
          </div>
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500 mt-0.5">
            Take 12
          </div>
        </div>

        <div
          className="absolute bottom-24 left-14"
          style={{ transform: "translateZ(60px)" }}
        >
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-400">
            Dir. de la photo
          </div>
          <div className="text-sm font-medium text-zinc-100 mt-1">
            A. El Fassi
          </div>
        </div>

        <div
          className="absolute bottom-8 right-14 text-right"
          style={{ transform: "translateZ(60px)" }}
        >
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-zinc-500">
            REC
          </div>
          <div className="flex items-center gap-1.5 mt-1 justify-end">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-blink" />
            <span className="text-xs font-mono text-zinc-300 tabular-nums">
              01:42:37:14
            </span>
          </div>
        </div>

        {/* Corner registration marks */}
        <div className="absolute top-14 left-14 flex flex-col gap-0.5 opacity-50">
          <div className="h-3 w-px bg-amber-500" />
          <div className="h-px w-3 bg-amber-500" />
        </div>
        <div className="absolute top-14 right-14 flex flex-col items-end gap-0.5 opacity-50">
          <div className="h-3 w-px bg-amber-500" />
          <div className="h-px w-3 bg-amber-500" />
        </div>
      </motion.div>

      {/* Caption below */}
      <div className="mt-6 flex items-center justify-between text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">
        <span>EXT. — CASABLANCA / NUIT</span>
        <span className="text-amber-500">REEL 01 / 03</span>
      </div>
    </div>
  );
}
