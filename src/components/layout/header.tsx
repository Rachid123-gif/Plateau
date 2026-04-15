"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  List,
  MagnifyingGlass,
  User as UserIcon,
  SignOut,
  Gear,
  Shield,
  SquaresFour,
  CaretDown,
  ArrowUpRight,
  Notepad,
} from "@phosphor-icons/react";
import { Logo } from "@/components/shared/logo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface HeaderUser {
  id: string;
  email: string;
  role: string;
  profile: {
    firstName: string;
    lastName: string;
    photoUrl: string | null;
    slug: string;
  } | null;
}

interface HeaderProps {
  user: HeaderUser | null;
}

const NAV_LINKS = [
  { href: "/annuaire", label: "Annuaire" },
  { href: "/blog", label: "Journal" },
  { href: "/institutions", label: "Institutions" },
];

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const initials = user?.profile
    ? `${user.profile.firstName[0]}${user.profile.lastName[0]}`
    : user?.email?.[0]?.toUpperCase() ?? "?";

  const isAdmin = user?.role === "ADMIN" || user?.role === "MODERATOR";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-zinc-950/85 backdrop-blur-xl border-b border-zinc-800/80 supports-[backdrop-filter]:bg-zinc-950/70"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="container mx-auto max-w-[1480px] flex h-16 items-center justify-between px-6 lg:px-10">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center shrink-0"
          aria-label="Plateau — Accueil"
        >
          <Logo size="md" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-5 py-2 text-[15px] font-medium rounded-lg transition-colors",
                  active
                    ? "text-zinc-50"
                    : "text-zinc-400 hover:text-zinc-50"
                )}
              >
                <span className="relative">
                  {link.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -bottom-1 left-0 h-px bg-amber-500 transition-all duration-300",
                      active ? "w-full" : "w-0 group-hover:w-full"
                    )}
                  />
                </span>
                {active && (
                  <span
                    aria-hidden
                    className="absolute left-1/2 -bottom-[9px] -translate-x-1/2 h-1 w-1 rounded-full bg-amber-500"
                  />
                )}
              </Link>
            );
          })}
          {isAdmin && (
            <>
              <span className="mx-1 h-4 w-px bg-zinc-800" />
              <Link
                href="/admin"
                className={cn(
                  "relative px-5 py-2 text-[15px] font-medium rounded-lg transition-colors inline-flex items-center gap-1.5",
                  pathname.startsWith("/admin")
                    ? "text-amber-500"
                    : "text-zinc-400 hover:text-amber-500"
                )}
              >
                <Shield weight="duotone" className="h-3.5 w-3.5" />
                Administration
              </Link>
            </>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          <Link
            href="/annuaire"
            aria-label="Rechercher"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-50 hover:bg-zinc-900 transition-colors"
          >
            <MagnifyingGlass weight="regular" className="h-4 w-4" />
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="group flex items-center gap-2 rounded-full pl-2 pr-3 py-1 border border-zinc-800 hover:border-amber-500/40 hover:bg-zinc-900 transition-all outline-none">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user.profile?.photoUrl ?? undefined} />
                  <AvatarFallback className="bg-amber-500/15 text-amber-500 text-[11px] font-mono font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <CaretDown
                  weight="bold"
                  className="h-3 w-3 text-zinc-500 group-hover:text-zinc-50 transition-colors"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-60 bg-zinc-950 border-zinc-800 text-zinc-50 rounded-xl shadow-2xl shadow-black/50 mt-2"
                align="end"
              >
                <div className="px-3 py-3 border-b border-zinc-800">
                  <p className="text-sm font-medium text-zinc-50 truncate">
                    {user.profile
                      ? `${user.profile.firstName} ${user.profile.lastName}`
                      : user.email}
                  </p>
                  <p className="text-xs text-zinc-500 truncate mt-0.5 font-mono">
                    {user.email}
                  </p>
                </div>
                <div className="py-1">
                  {user.role === "PROFESSIONAL" && (
                    <>
                      <DropdownMenuItem
                        onSelect={() => router.push("/dashboard")}
                        className="text-zinc-300 focus:bg-zinc-900 focus:text-zinc-50 rounded-lg mx-1 cursor-pointer"
                      >
                        <SquaresFour weight="regular" className="mr-2.5 h-4 w-4" />
                        Mon espace
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => router.push("/dashboard/profil")}
                        className="text-zinc-300 focus:bg-zinc-900 focus:text-zinc-50 rounded-lg mx-1 cursor-pointer"
                      >
                        <UserIcon weight="regular" className="mr-2.5 h-4 w-4" />
                        Mon profil
                      </DropdownMenuItem>
                      {user.profile?.slug && (
                        <DropdownMenuItem
                          onSelect={() =>
                            router.push(`/profil/${user.profile!.slug}`)
                          }
                          className="text-zinc-300 focus:bg-zinc-900 focus:text-zinc-50 rounded-lg mx-1 cursor-pointer"
                        >
                          <ArrowUpRight weight="regular" className="mr-2.5 h-4 w-4" />
                          Voir mon profil public
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                  {user.role === "RECRUITER" && (
                    <DropdownMenuItem
                      onSelect={() => router.push("/recruteur/recherche")}
                      className="text-zinc-300 focus:bg-zinc-900 focus:text-zinc-50 rounded-lg mx-1 cursor-pointer"
                    >
                      <MagnifyingGlass weight="regular" className="mr-2.5 h-4 w-4" />
                      Recherche
                    </DropdownMenuItem>
                  )}
                  {isAdmin && (
                    <DropdownMenuItem
                      onSelect={() => router.push("/admin")}
                      className="text-amber-500 focus:bg-amber-500/10 focus:text-amber-500 rounded-lg mx-1 cursor-pointer"
                    >
                      <Shield weight="duotone" className="mr-2.5 h-4 w-4" />
                      Administration
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onSelect={() => router.push("/dashboard/parametres")}
                    className="text-zinc-300 focus:bg-zinc-900 focus:text-zinc-50 rounded-lg mx-1 cursor-pointer"
                  >
                    <Gear weight="regular" className="mr-2.5 h-4 w-4" />
                    Paramètres
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem
                  onSelect={handleSignOut}
                  className="text-zinc-300 focus:bg-zinc-900 focus:text-zinc-50 rounded-lg mx-1 cursor-pointer"
                >
                  <SignOut weight="regular" className="mr-2.5 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-1.5 ml-1">
              <Link
                href="/connexion"
                className="px-4 py-2 text-[13px] font-medium text-zinc-300 hover:text-zinc-50 transition-colors rounded-lg"
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 px-4 py-2 text-[13px] font-semibold transition-all hover:-translate-y-[1px] shadow-[0_1px_0_0_rgba(255,255,255,0.2)_inset,0_8px_20px_-8px_rgba(245,158,11,0.5)]"
              >
                Inscription
                <ArrowUpRight weight="bold" className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger className="md:hidden p-2 text-zinc-400 hover:text-zinc-50 rounded-lg hover:bg-zinc-900 transition-colors">
            <List className="h-5 w-5" weight="regular" />
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[85vw] max-w-sm bg-zinc-950 border-zinc-800 text-zinc-50 p-0"
          >
            <div className="p-6 border-b border-zinc-800">
              <Logo size="md" />
            </div>
            <nav className="flex flex-col p-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between px-3 py-3 rounded-lg text-base font-medium text-zinc-200 hover:bg-zinc-900 hover:text-amber-500 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                  <ArrowUpRight weight="regular" className="h-4 w-4 text-zinc-500" />
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-3 py-3 rounded-lg text-base font-medium text-amber-500 hover:bg-amber-500/10 transition-colors mt-2 border-t border-zinc-800 pt-4"
                  onClick={() => setMobileOpen(false)}
                >
                  <Shield weight="duotone" className="h-4 w-4" />
                  Administration
                </Link>
              )}
              <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-3 py-3 rounded-lg text-base font-medium text-zinc-200 hover:bg-zinc-900 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      <SquaresFour weight="regular" className="h-4 w-4" />
                      Mon espace
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-3 rounded-lg text-base font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-50 transition-colors"
                    >
                      <SignOut weight="regular" className="h-4 w-4" />
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/connexion"
                      className="block px-3 py-3 rounded-lg text-base font-medium text-zinc-200 hover:bg-zinc-900 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/inscription"
                      className="flex items-center justify-center gap-2 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 px-4 py-3 text-sm font-semibold transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      Inscription
                      <ArrowUpRight weight="bold" className="h-4 w-4" />
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Bottom accent line — subtle amber pulse */}
      <div
        aria-hidden
        className={cn(
          "absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent transition-opacity duration-300",
          scrolled ? "opacity-100" : "opacity-0"
        )}
      />
    </header>
  );
}
