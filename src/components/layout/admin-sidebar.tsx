"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChartBar,
  Users,
  Briefcase,
  Wrench,
  Buildings,
  UserCheck,
  House,
  ArrowLeft,
  Newspaper,
} from "@phosphor-icons/react";
import { ThemeToggle } from "./theme-toggle";

const adminLinks = [
  { href: "/admin", label: "Tableau de bord", icon: House, exact: true },
  { href: "/admin/profils", label: "Profils à valider", icon: UserCheck },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
  { href: "/admin/metiers", label: "Métiers", icon: Briefcase },
  { href: "/admin/competences", label: "Compétences", icon: Wrench },
  { href: "/admin/institutions", label: "Institutions", icon: Buildings },
  { href: "/admin/statistiques", label: "Statistiques", icon: ChartBar },
  { href: "/admin/journal", label: "Journal", icon: Newspaper },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4 flex flex-col">
      <div className="mb-6 px-2">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-200 mb-6 transition-colors"
        >
          <ArrowLeft weight="regular" className="h-3.5 w-3.5" />
          Retour au site
        </Link>
        <h2 className="text-xs uppercase tracking-[0.18em] font-mono text-amber-600 dark:text-amber-500 font-medium">
          // Administration
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
          Backoffice
        </p>
      </div>

      <nav className="space-y-0.5 flex-1">
        {adminLinks.map((link) => {
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                isActive
                  ? "bg-zinc-950 dark:bg-amber-500 text-white dark:text-zinc-950 font-semibold"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-zinc-50"
              )}
            >
              <Icon
                weight={isActive ? "duotone" : "regular"}
                className="h-4 w-4 shrink-0"
              />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <ThemeToggle />
      </div>
    </aside>
  );
}
