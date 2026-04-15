"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticCTAProps {
  href: string;
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  className?: string;
}

/**
 * Magnetic CTA button — subtly pulls toward the cursor.
 * Uses useMotionValue so no React re-renders.
 */
export function MagneticCTA({
  href,
  variant = "primary",
  children,
  className,
}: MagneticCTAProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 15 });
  const springY = useSpring(y, { stiffness: 200, damping: 15 });

  function onMove(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.25);
    y.set((e.clientY - cy) * 0.25);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  const styles =
    variant === "primary"
      ? "bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_20px_40px_-15px_rgba(245,158,11,0.35)]"
      : "border border-zinc-700 hover:border-zinc-500 text-zinc-50 bg-transparent hover:bg-zinc-900";

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: springX, y: springY }}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full px-7 py-4 text-base font-semibold transition-colors",
        styles,
        className
      )}
    >
      {children}
    </motion.a>
  );
}

export function LinkMagneticCTA({
  href,
  variant = "primary",
  children,
  className,
}: MagneticCTAProps) {
  // Non-magnetic fallback for Link with internal nav
  const styles =
    variant === "primary"
      ? "bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_20px_40px_-15px_rgba(245,158,11,0.35)]"
      : "border border-zinc-700 hover:border-zinc-500 text-zinc-50 bg-transparent hover:bg-zinc-900";

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full px-7 py-4 text-base font-semibold transition-all hover:-translate-y-[2px]",
        styles,
        className
      )}
    >
      {children}
    </Link>
  );
}
