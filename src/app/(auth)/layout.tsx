import type { Metadata } from "next";
import Link from "next/link";
import { SealCheck } from "@phosphor-icons/react/dist/ssr";
import { Logo } from "@/components/shared/logo";

export const metadata: Metadata = {
  title: {
    default: "Authentification",
    template: "%s | Plateau",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] grid grid-cols-1 md:grid-cols-2 bg-zinc-950">
      {/* ── Left visual panel (hidden on mobile) ── */}
      <div className="hidden md:flex flex-col justify-between p-12 border-r border-zinc-800/60 relative overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 30% 60%, rgba(245,158,11,0.07) 0%, transparent 60%)",
          }}
        />

        {/* Logo */}
        <Link href="/" className="relative z-10 w-fit">
          <Logo size="lg" />
        </Link>

        {/* Central composition */}
        <div className="relative z-10 flex flex-col gap-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-mono text-amber-500 mb-5">
              // Plateau
            </p>
            <blockquote className="text-4xl tracking-[-0.03em] font-medium leading-[1.1] text-zinc-50">
              Le cinéma marocain<br />a besoin de<br />
              <span className="text-zinc-500">ses talents.</span>
            </blockquote>
          </div>

          {/* Values */}
          <div className="space-y-3">
            {[
              "Annuaire de professionnels vérifiés",
              "Matching talents · productions",
              "Disponibilités en temps réel",
              "Réseau cinéma 100% marocain",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <SealCheck weight="fill" className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-sm text-zinc-400">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="relative z-10">
          <p className="text-xs text-zinc-700 font-mono">
            © {new Date().getFullYear()} Plateau
          </p>
        </div>

        {/* Vertical amber line on right edge */}
        <div className="absolute right-0 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-amber-500/30 to-transparent" />
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-col min-h-[100dvh] md:min-h-0">
        {/* Mobile logo */}
        <div className="md:hidden flex items-center justify-center pt-8 pb-4">
          <Link href="/">
            <Logo size="sm" />
          </Link>
        </div>

        {/* Form area */}
        <main className="flex flex-1 items-center justify-center px-6 py-10">
          {children}
        </main>

        {/* Footer */}
        <footer className="flex items-center justify-center py-6 gap-4 text-xs text-zinc-600 border-t border-zinc-800/40">
          <Link href="/mentions-legales" className="hover:text-zinc-400 transition-colors">
            Mentions légales
          </Link>
          <span className="text-zinc-800">·</span>
          <Link href="/confidentialite" className="hover:text-zinc-400 transition-colors">
            Confidentialité
          </Link>
          <span className="text-zinc-800">·</span>
          <span>© {new Date().getFullYear()} Plateau</span>
        </footer>
      </div>
    </div>
  );
}
