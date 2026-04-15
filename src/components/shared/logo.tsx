import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "mark" | "wordmark";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  invert?: boolean;
}

const SIZES = {
  sm: { mark: "h-4", text: "text-sm", gap: "gap-2" },
  md: { mark: "h-5", text: "text-base", gap: "gap-2.5" },
  lg: { mark: "h-7", text: "text-xl", gap: "gap-3" },
  xl: { mark: "h-10", text: "text-3xl", gap: "gap-4" },
};

/**
 * Plateau. — premium wordmark.
 * Mark: 3 vertical bars of varied heights (film slate motif).
 * Word: "Plateau" in Geist + amber period.
 */
export function Logo({
  variant = "full",
  size = "md",
  className,
  invert = false,
}: LogoProps) {
  const s = SIZES[size];
  const textColor = invert ? "text-zinc-950" : "text-zinc-50";
  const accentColor = "text-amber-500";

  const Mark = (
    <span
      className={cn("inline-flex items-end", s.mark)}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-full w-auto"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 3 vertical bars evoking a film slate / level indicator */}
        <rect
          x="2"
          y="10"
          width="4"
          height="14"
          rx="1"
          className={cn(invert ? "fill-zinc-950" : "fill-zinc-50")}
        />
        <rect
          x="10"
          y="4"
          width="4"
          height="20"
          rx="1"
          className={cn(invert ? "fill-zinc-950" : "fill-zinc-50")}
        />
        <rect
          x="18"
          y="14"
          width="4"
          height="10"
          rx="1"
          className="fill-amber-500"
        />
      </svg>
    </span>
  );

  const Wordmark = (
    <span
      className={cn(
        "font-medium tracking-[-0.02em] leading-none",
        s.text,
        textColor
      )}
    >
      Plateau<span className={accentColor}>.</span>
    </span>
  );

  if (variant === "mark") {
    return <span className={cn("inline-flex", className)}>{Mark}</span>;
  }

  if (variant === "wordmark") {
    return <span className={cn("inline-flex", className)}>{Wordmark}</span>;
  }

  return (
    <span className={cn("inline-flex items-center", s.gap, className)}>
      {Mark}
      {Wordmark}
    </span>
  );
}
