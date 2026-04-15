"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  User,
  CalendarBlank,
  ChatCircle,
  Gear,
  SquaresFour,
  ImageSquare,
} from "@phosphor-icons/react";

const dashboardLinks = [
  { href: "/dashboard", label: "Tableau de bord", icon: SquaresFour, exact: true },
  { href: "/dashboard/profil", label: "Mon profil", icon: User },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: ImageSquare },
  { href: "/dashboard/agenda", label: "Disponibilité", icon: CalendarBlank },
  { href: "/dashboard/demandes", label: "Demandes", icon: ChatCircle },
  { href: "/dashboard/parametres", label: "Paramètres", icon: Gear },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen border-r border-zinc-200 bg-[#fafaf9] p-4">
      <div className="mb-6">
        <h2 className="text-base font-semibold text-zinc-950">Mon espace</h2>
        <p className="text-xs text-zinc-500">Gérez votre profil professionnel</p>
      </div>

      <nav className="space-y-0.5">
        {dashboardLinks.map((link) => {
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:-translate-y-[1px]",
                isActive
                  ? "bg-zinc-950 text-white"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
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
