"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/**
 * Toggle Light/Dark mode for the backoffice.
 * Adds/removes "dark" class on <html>, persists in localStorage.
 * Uses Tailwind v4 dark: variants.
 */
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("plateau-theme");
    const prefersDark =
      saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("plateau-theme", next ? "dark" : "light");
  };

  if (!mounted) {
    return <div className="h-9 w-full rounded-lg bg-zinc-200 dark:bg-zinc-800" />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      className="group relative flex w-full items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-zinc-800 transition-all"
    >
      <span className="relative flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800 group-hover:bg-amber-100 dark:group-hover:bg-zinc-700 transition-colors">
        {isDark ? (
          <Moon weight="duotone" className="h-3.5 w-3.5 text-amber-500" />
        ) : (
          <Sun weight="duotone" className="h-3.5 w-3.5 text-amber-500" />
        )}
      </span>
      <span className="flex-1 text-left text-xs font-medium">
        {isDark ? "Mode sombre" : "Mode clair"}
      </span>
      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.1em]">
        {isDark ? "Dark" : "Light"}
      </span>
    </button>
  );
}
