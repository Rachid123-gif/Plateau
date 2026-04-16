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
    <aside className="w-64 min-h-screen border-r border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-6 px-2">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-zinc-300 mb-6 transition-colors"
        >
          <ArrowLeft weight="regular" className="h-3.5 w-3.5" />
          Retour au site
        </Link>
        <h2 className="text-xs uppercase tracking-[0.18em] font-mono text-amber-500 font-medium">
          // Administration
        </h2>
        <p className="text-sm text-zinc-400 mt-2">Backoffice</p>
      </div>

      <nav className="space-y-0.5">
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
                  ? "bg-amber-500 text-zinc-950 font-semibold"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-50"
              )}
            >
              <Icon weight={isActive ? "duotone" : "regular"} className="h-4 w-4 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
