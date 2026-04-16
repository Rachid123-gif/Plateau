export const revalidate = 30;

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

const PAGE_SIZE = 20;

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

  // Sort: AVAILABLE first, then verified, then most viewed
  const orderBy = params.disponibilite
    ? [{ viewCount: "desc" as const }, { updatedAt: "desc" as const }]
    : [
        { availabilityStatus: "asc" as const },
        { verificationStatus: "asc" as const },
        { viewCount: "desc" as const },
      ];

  const [profiles, total] = await Promise.all([
    prisma.profile.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      orderBy,
      include: {
        primaryProfession: { select: { id: true, name: true, slug: true } },
        skills: {
          include: { skill: { select: { id: true, name: true } } },
          take: 3,
        },
        languages: {
          include: { language: { select: { id: true, name: true, code: true } } },
          take: 3,
        },
        _count: { select: { portfolio: true } },
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
      {/* ── Hero compact ── */}
      <section className="border-b border-zinc-800 py-12 lg:py-16">
        <div className="container mx-auto px-6 max-w-[1480px]">
          <div className="flex items-baseline justify-between mb-6 gap-4 flex-wrap">
            <div className="eyebrow">// Annuaire — MMXXVI</div>
            <span className="text-sm font-mono text-zinc-500 tabular-nums">
              {total.toLocaleString("fr-FR")} profil{total !== 1 ? "s" : ""} référencé{total !== 1 ? "s" : ""}
            </span>
          </div>
          <h1 className="text-display-sm max-w-4xl text-zinc-50">
            Trouvez le talent pour votre{" "}
            <span className="font-editorial text-amber-500">prochaine production.</span>
          </h1>

          {/* Search form — prominent */}
          <form action="/annuaire" method="GET" className="flex gap-0 max-w-3xl mt-10">
            {sp.profession && <input type="hidden" name="profession" value={sp.profession} />}
            {sp.ville && <input type="hidden" name="ville" value={sp.ville} />}
            {sp.disponibilite && <input type="hidden" name="disponibilite" value={sp.disponibilite} />}
            {sp.niveau && <input type="hidden" name="niveau" value={sp.niveau} />}
            {sp.langue && <input type="hidden" name="langue" value={sp.langue} />}

            <div className="relative flex-1">
              <MagnifyingGlass
                weight="bold"
                className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none"
              />
              <input
                name="q"
                defaultValue={sp.q}
                placeholder="Nom, métier, compétence..."
                className="w-full h-16 bg-zinc-900 border border-zinc-800 focus:border-amber-500/50 text-zinc-50 placeholder-zinc-500 rounded-full rounded-r-none pl-14 pr-4 text-lg outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full rounded-l-none bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-8 h-16 text-base transition-colors shrink-0"
            >
              Rechercher
            </button>
          </form>
        </div>
      </section>

      {/* ── Sticky filters bar ── */}
      <div className="sticky top-20 z-40 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800">
        <div className="container mx-auto px-6 max-w-[1480px] py-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
            {/* DISPO NOW — leading chip */}
            <Link
              href={buildUrl(currentFilters, {
                disponibilite: sp.disponibilite === "AVAILABLE" ? undefined : "AVAILABLE",
                page: undefined,
              })}
              className={`shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${
                sp.disponibilite === "AVAILABLE"
                  ? "bg-amber-500 text-zinc-950 shadow-[0_0_0_3px_rgba(245,158,11,0.15)]"
                  : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${
                sp.disponibilite === "AVAILABLE" ? "bg-zinc-950" : "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.25)]"
              }`} />
              Disponible maintenant
            </Link>

            <span className="h-6 w-px bg-zinc-800 mx-2 shrink-0" />

            {/* Profession dropdown-like select */}
            <select
              defaultValue={sp.profession ?? ""}
              onChange={undefined}
              className="shrink-0 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-sm rounded-full px-4 py-2 font-medium transition-colors focus:border-amber-500/60 outline-none cursor-pointer"
              name="profession"
              form="filter-form"
            >
              <option value="">Tous métiers</option>
              {professions.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              defaultValue={sp.ville ?? ""}
              className="shrink-0 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-sm rounded-full px-4 py-2 font-medium transition-colors focus:border-amber-500/60 outline-none cursor-pointer"
              name="ville"
              form="filter-form"
            >
              <option value="">Toutes villes</option>
              {MOROCCAN_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              defaultValue={sp.niveau ?? ""}
              className="shrink-0 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-sm rounded-full px-4 py-2 font-medium transition-colors focus:border-amber-500/60 outline-none cursor-pointer"
              name="niveau"
              form="filter-form"
            >
              <option value="">Tous niveaux</option>
              {EXPERIENCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <select
              defaultValue={sp.langue ?? ""}
              className="shrink-0 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-sm rounded-full px-4 py-2 font-medium transition-colors focus:border-amber-500/60 outline-none cursor-pointer"
              name="langue"
              form="filter-form"
            >
              <option value="">Toutes langues</option>
              {LANGUAGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <form id="filter-form" action="/annuaire" method="GET" className="shrink-0">
              {sp.q && <input type="hidden" name="q" value={sp.q} />}
              {sp.disponibilite && <input type="hidden" name="disponibilite" value={sp.disponibilite} />}
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-full bg-zinc-50 hover:bg-zinc-200 text-zinc-950 text-sm font-semibold px-4 py-2 transition-colors"
              >
                Appliquer
              </button>
            </form>

            {hasActiveFilters && (
              <Link
                href="/annuaire"
                className="shrink-0 text-sm text-zinc-500 hover:text-zinc-200 font-medium px-3 py-2 transition-colors"
              >
                Effacer
              </Link>
            )}
          </div>

          {/* Active chips row */}
          {activeChips.length > 0 && (
            <div className="flex items-center gap-2 pt-3 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
              <span className="text-[11px] uppercase tracking-[0.15em] font-mono text-zinc-500 shrink-0">
                Filtres actifs —
              </span>
              {activeChips.map((chip) => (
                <Link
                  key={chip.removeKey}
                  href={buildUrl(currentFilters, { [chip.removeKey]: undefined, page: undefined })}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs px-3 py-1 hover:bg-amber-500/20 transition-colors whitespace-nowrap"
                >
                  {chip.label}
                  <X weight="bold" className="w-3 h-3" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      <div className="container mx-auto px-6 max-w-[1480px] py-10">
          <div className="col-span-12 w-full">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {profiles.map((profile, i) => (
                      <div
                        key={profile.id}
                        className="reveal"
                        style={{ ["--reveal-delay" as string]: `${i * 40}ms` }}
                      >
                        <ProfileCard profile={profile} priority={i < 4} />
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
