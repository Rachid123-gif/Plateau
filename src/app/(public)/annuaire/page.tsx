import { Suspense } from "react";
import Link from "next/link";
import {
  MagnifyingGlass,
  Binoculars,
  CaretLeft,
  CaretRight,
  X,
} from "@phosphor-icons/react/dist/ssr";
import { ProfileCard } from "@/components/shared/profile-card";
import { prisma } from "@/lib/prisma";
import type { SearchResult } from "@/types";

type AvailabilityStatus = "AVAILABLE" | "BUSY" | "UNAVAILABLE";
type ExperienceLevel = "STUDENT" | "JUNIOR" | "INTERMEDIATE" | "SENIOR" | "EXPERT";

const PAGE_SIZE = 12;

const AVAILABILITY_OPTIONS: { value: string; label: string }[] = [
  { value: "AVAILABLE", label: "Disponible" },
  { value: "BUSY", label: "Occupé" },
  { value: "UNAVAILABLE", label: "Non disponible" },
];

const EXPERIENCE_OPTIONS: { value: string; label: string }[] = [
  { value: "STUDENT", label: "Étudiant" },
  { value: "JUNIOR", label: "Junior" },
  { value: "INTERMEDIATE", label: "Intermédiaire" },
  { value: "SENIOR", label: "Senior" },
  { value: "EXPERT", label: "Expert" },
];

const LANGUAGE_OPTIONS = [
  { value: "ar", label: "Arabe" },
  { value: "fr", label: "Français" },
  { value: "en", label: "Anglais" },
  { value: "es", label: "Espagnol" },
];

const MOROCCAN_CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Fès",
  "Tanger",
  "Agadir",
  "Meknès",
  "Oujda",
  "Tétouan",
  "Ouarzazate",
];

interface AnnuairePageProps {
  searchParams: Promise<{
    q?: string;
    profession?: string;
    ville?: string;
    disponibilite?: string;
    niveau?: string;
    langue?: string;
    page?: string;
  }>;
}

async function getProfiles(params: Awaited<AnnuairePageProps["searchParams"]>): Promise<SearchResult> {
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    isPublic: true,
    verificationStatus: { not: "REJECTED" },
  };

  if (params.q) {
    where.OR = [
      { firstName: { contains: params.q, mode: "insensitive" } },
      { lastName: { contains: params.q, mode: "insensitive" } },
      { artistName: { contains: params.q, mode: "insensitive" } },
      { bio: { contains: params.q, mode: "insensitive" } },
      { primaryProfession: { name: { contains: params.q, mode: "insensitive" } } },
    ];
  }

  if (params.ville) {
    where.city = { equals: params.ville, mode: "insensitive" };
  }

  if (params.disponibilite) {
    where.availabilityStatus = params.disponibilite as AvailabilityStatus;
  }

  if (params.niveau) {
    where.experienceLevel = params.niveau as ExperienceLevel;
  }

  if (params.profession) {
    where.OR = [
      ...(where.OR ?? []),
      { primaryProfession: { name: { contains: params.profession, mode: "insensitive" } } },
      {
        professions: {
          some: {
            profession: { name: { contains: params.profession, mode: "insensitive" } },
          },
        },
      },
    ];
  }

  if (params.langue) {
    where.languages = {
      some: {
        language: { code: params.langue },
      },
    };
  }

  const [profiles, total] = await Promise.all([
    prisma.profile.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      orderBy: [{ verificationStatus: "asc" }, { viewCount: "desc" }, { createdAt: "desc" }],
      include: {
        primaryProfession: true,
        skills: {
          include: { skill: { select: { id: true, name: true } } },
          take: 5,
        },
        languages: {
          include: { language: { select: { id: true, name: true, code: true } } },
        },
      },
    }) as unknown as import("@/types").ProfileCard[],
    prisma.profile.count({ where }),
  ]);

  return {
    profiles,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

type ProfessionOption = { id: string; name: string };

async function getProfessions(): Promise<ProfessionOption[]> {
  return prisma.profession.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  }) as unknown as ProfessionOption[];
}

function buildUrl(
  current: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>
): string {
  const merged = { ...current, ...overrides };
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }
  return `/annuaire?${params.toString()}`;
}

export default async function AnnuairePage(props: AnnuairePageProps) {
  const sp = await props.searchParams;
  const [result, professions] = await Promise.all([
    getProfiles(sp),
    getProfessions(),
  ]);

  const { profiles, total, page, totalPages } = result;

  const currentFilters: Record<string, string | undefined> = {
    q: sp.q,
    profession: sp.profession,
    ville: sp.ville,
    disponibilite: sp.disponibilite,
    niveau: sp.niveau,
    langue: sp.langue,
  };

  const hasActiveFilters = Object.values(currentFilters).some(Boolean);

  // Active filter chips
  const activeChips: { label: string; removeKey: string }[] = [];
  if (sp.q) activeChips.push({ label: `"${sp.q}"`, removeKey: "q" });
  if (sp.profession) activeChips.push({ label: sp.profession, removeKey: "profession" });
  if (sp.ville) activeChips.push({ label: sp.ville, removeKey: "ville" });
  if (sp.disponibilite) {
    const opt = AVAILABILITY_OPTIONS.find((o) => o.value === sp.disponibilite);
    if (opt) activeChips.push({ label: opt.label, removeKey: "disponibilite" });
  }
  if (sp.niveau) {
    const opt = EXPERIENCE_OPTIONS.find((o) => o.value === sp.niveau);
    if (opt) activeChips.push({ label: opt.label, removeKey: "niveau" });
  }
  if (sp.langue) {
    const opt = LANGUAGE_OPTIONS.find((o) => o.value === sp.langue);
    if (opt) activeChips.push({ label: opt.label, removeKey: "langue" });
  }

  return (
    <div className="bg-zinc-950 min-h-[100dvh]">
      {/* ── Hero ── */}
      <section className="border-b border-zinc-800 py-24 lg:py-32">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="eyebrow mb-8">// Annuaire — MMXXVI</div>
          <h1 className="text-display-sm max-w-4xl text-zinc-50">
            L&apos;index des professionnels{" "}
            <span className="font-editorial text-amber-500">du cinéma.</span>
          </h1>
          <p className="text-xl text-zinc-400 leading-[1.55] max-w-2xl mt-8 mb-10">
            Découvrez les talents du cinéma marocain — acteurs, réalisateurs, techniciens,
            scénaristes et bien plus. Filtrez par métier, ville ou disponibilité.
          </p>

          {/* Search form */}
          <form action="/annuaire" method="GET" className="flex gap-0 max-w-2xl">
            {sp.profession && <input type="hidden" name="profession" value={sp.profession} />}
            {sp.ville && <input type="hidden" name="ville" value={sp.ville} />}
            {sp.disponibilite && <input type="hidden" name="disponibilite" value={sp.disponibilite} />}
            {sp.niveau && <input type="hidden" name="niveau" value={sp.niveau} />}
            {sp.langue && <input type="hidden" name="langue" value={sp.langue} />}

            <div className="relative flex-1">
              <MagnifyingGlass
                weight="bold"
                className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none"
              />
              <input
                name="q"
                defaultValue={sp.q}
                placeholder="Rechercher par nom, métier…"
                className="w-full h-16 bg-zinc-900 border border-zinc-800 focus:border-amber-500/50 text-zinc-50 placeholder-zinc-500 rounded-full rounded-r-none pl-14 pr-4 text-lg outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full rounded-l-none bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-7 h-16 text-base transition-colors shrink-0"
            >
              Rechercher
            </button>
          </form>
        </div>
      </section>

      {/* ── Body ── */}
      <div className="container mx-auto px-6 max-w-7xl py-10">
        <div className="grid grid-cols-12 gap-8">
          {/* ── Sidebar ── */}
          <aside className="col-span-12 lg:col-span-3">
            <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-5 space-y-7 lg:sticky lg:top-24">
              {/* Section helper */}
              {[
                {
                  title: "Métier",
                  items: professions.map((p) => ({ value: p.name, label: p.name })),
                  filterKey: "profession" as const,
                  currentValue: sp.profession,
                  scrollable: true,
                },
                {
                  title: "Ville",
                  items: MOROCCAN_CITIES.map((c) => ({ value: c, label: c })),
                  filterKey: "ville" as const,
                  currentValue: sp.ville,
                  scrollable: false,
                },
                {
                  title: "Disponibilité",
                  items: AVAILABILITY_OPTIONS,
                  filterKey: "disponibilite" as const,
                  currentValue: sp.disponibilite,
                  scrollable: false,
                },
                {
                  title: "Niveau",
                  items: EXPERIENCE_OPTIONS,
                  filterKey: "niveau" as const,
                  currentValue: sp.niveau,
                  scrollable: false,
                },
                {
                  title: "Langue",
                  items: LANGUAGE_OPTIONS,
                  filterKey: "langue" as const,
                  currentValue: sp.langue,
                  scrollable: false,
                },
              ].map(({ title, items, filterKey, currentValue, scrollable }) => (
                <div key={title}>
                  <p className="eyebrow mb-4">{title}</p>
                  <div className={`space-y-0.5 ${scrollable ? "max-h-44 overflow-y-auto pr-1" : ""}`}>
                    {items.map((item) => {
                      const isActive = currentValue === item.value;
                      return (
                        <Link
                          key={item.value}
                          href={buildUrl(currentFilters, {
                            [filterKey]: isActive ? undefined : item.value,
                            page: undefined,
                          })}
                          className={`flex items-center gap-2 px-2 py-2 rounded-lg text-base transition-colors ${
                            isActive
                              ? "text-amber-500 font-medium"
                              : "text-zinc-300 hover:text-zinc-50"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              isActive ? "bg-amber-500" : "bg-zinc-700"
                            }`}
                          />
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {hasActiveFilters && (
                <Link
                  href="/annuaire"
                  className="block text-center text-sm font-mono text-zinc-500 hover:text-zinc-300 pt-3 border-t border-zinc-800 transition-colors"
                >
                  Réinitialiser les filtres
                </Link>
              )}
            </div>
          </aside>

          {/* ── Results ── */}
          <div className="col-span-12 lg:col-span-9">
            {/* Above-grid bar */}
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xl font-mono tabular-nums text-zinc-500">
                  {total.toLocaleString("fr-FR")} résultat{total !== 1 ? "s" : ""}
                </span>

                {activeChips.map((chip) => (
                  <Link
                    key={chip.removeKey}
                    href={buildUrl(currentFilters, { [chip.removeKey]: undefined, page: undefined })}
                    className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs px-3 py-1 hover:bg-amber-500/20 transition-colors"
                  >
                    {chip.label}
                    <X weight="bold" className="w-3 h-3" />
                  </Link>
                ))}
              </div>
            </div>

            <Suspense fallback={<ProfileGridSkeleton />}>
              {profiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-28 text-center">
                  <Binoculars weight="thin" style={{ width: 80, height: 80 }} className="text-zinc-700 mb-6" />
                  <h3 className="text-3xl font-medium text-zinc-50 tracking-tight mb-2">
                    Aucun résultat
                  </h3>
                  <p className="text-lg text-zinc-400 max-w-xs leading-relaxed mb-8">
                    Aucun profil ne correspond à vos critères. Essayez de modifier ou
                    supprimer certains filtres.
                  </p>
                  <Link
                    href="/annuaire"
                    className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 hover:border-zinc-500 bg-transparent text-zinc-50 px-5 py-3 text-base transition-colors"
                  >
                    Effacer tous les filtres
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {profiles.map((profile, i) => (
                      <div
                        key={profile.id}
                        className="reveal"
                        style={{ ["--reveal-delay" as string]: `${i * 50}ms` }}
                      >
                        <ProfileCard profile={profile} />
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-14">
                      {page > 1 && (
                        <Link
                          href={buildUrl(currentFilters, { page: String(page - 1) })}
                          className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 hover:border-zinc-500 bg-transparent text-zinc-50 px-5 py-3 text-base transition-colors"
                        >
                          <CaretLeft weight="bold" className="w-4 h-4" />
                        </Link>
                      )}

                      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                        const p = i + 1;
                        return (
                          <Link
                            key={p}
                            href={buildUrl(currentFilters, { page: String(p) })}
                            className={`inline-flex items-center justify-center w-12 h-12 rounded-xl border text-base font-mono transition-colors ${
                              p === page
                                ? "bg-amber-500 border-amber-500 text-zinc-950 font-semibold"
                                : "border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-50"
                            }`}
                          >
                            {p}
                          </Link>
                        );
                      })}

                      {page < totalPages && (
                        <Link
                          href={buildUrl(currentFilters, { page: String(page + 1) })}
                          className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 hover:border-zinc-500 bg-transparent text-zinc-50 px-5 py-3 text-base transition-colors"
                        >
                          <CaretRight weight="bold" className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  )}
                </>
              )}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden animate-pulse">
          <div className="aspect-[4/5] bg-zinc-800" />
          <div className="p-5 space-y-3">
            <div className="h-3 bg-zinc-800 rounded w-1/2" />
            <div className="h-5 bg-zinc-800 rounded w-3/4" />
            <div className="h-px bg-zinc-800 my-4" />
            <div className="h-3 bg-zinc-800 rounded w-1/3" />
            <div className="flex gap-1.5 mt-2">
              <div className="h-6 w-16 bg-zinc-800 rounded-full" />
              <div className="h-6 w-16 bg-zinc-800 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
