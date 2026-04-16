export const revalidate = 300;

import Link from "next/link";
import {
  FilmStrip,
  UsersThree,
  ArrowUpRight,
  Camera,
  Megaphone,
  PaintBrush,
  PencilSimpleLine,
  Microphone,
  MaskHappy,
  MapPin,
  SealCheck,
  FilmSlate,
  Buildings,
} from "@phosphor-icons/react/dist/ssr";
import { HeroFilmVisual } from "@/components/shared/hero-film-visual";
import { LinkMagneticCTA } from "@/components/shared/magnetic-cta";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";

function BentoTile({
  href,
  icon: Icon,
  scn,
  title,
  desc,
  count,
  span,
  small = false,
}: {
  href: string;
  icon: PhosphorIcon;
  scn: string;
  title: string;
  desc: string;
  count: string;
  span: string;
  small?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`${span} rounded-3xl border border-zinc-800 bg-zinc-900 p-6 lg:p-8 transition-all duration-300 hover:bg-gradient-to-br hover:from-amber-500/10 hover:to-amber-500/5 hover:border-amber-500 hover:-translate-y-1 group relative overflow-hidden`}
    >
      <div
        aria-hidden
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-amber-500/0 group-hover:bg-amber-500/15 blur-3xl transition-all duration-500"
      />
      <div className="relative flex items-start justify-between">
        <Icon
          weight="duotone"
          className={`${
            small ? "h-10 w-10" : "h-12 w-12"
          } text-amber-500 group-hover:scale-110 transition-transform duration-300`}
        />
        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.25em] group-hover:text-amber-500 transition-colors">
          {scn}
        </span>
      </div>
      <div className={`relative ${small ? "mt-8" : "mt-10"}`}>
        <h3
          className={`${
            small ? "text-lg lg:text-xl" : "text-xl lg:text-2xl"
          } font-medium tracking-tight text-zinc-50`}
        >
          {title}
        </h3>
        <p
          className={`mt-2 ${
            small ? "text-xs lg:text-sm" : "text-sm"
          } text-zinc-400 leading-relaxed`}
        >
          {desc}
        </p>
      </div>
      <div className="relative mt-6 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs text-amber-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Voir
          <ArrowUpRight weight="bold" className="h-3.5 w-3.5" />
        </span>
        <span className="text-xs font-mono text-zinc-500 tabular-nums">
          {count}
        </span>
      </div>
    </Link>
  );
}

// Current year in Roman numerals
const ROMAN_YEAR = "MMXXVI";

const PROFESSIONS_MARQUEE = [
  "Acteurs",
  "Réalisateurs",
  "Scénaristes",
  "Monteurs",
  "Directeurs photo",
  "Ingénieurs son",
  "Casting",
  "Costumiers",
  "Maquilleurs",
  "Scénographes",
  "Producteurs",
  "Compositeurs",
  "Étalonneurs",
  "VFX",
  "Régisseurs",
];

export default function HomePage() {
  return (
    <div className="flex flex-col bg-zinc-950 text-zinc-50">
      {/* ═══════════════════════════════════════════════
          1. HERO
          ═══════════════════════════════════════════════ */}
      <section className="relative min-h-[100dvh] flex items-center border-b border-zinc-800 overflow-hidden">
        {/* Grid background */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

        <div className="container mx-auto max-w-[1380px] px-6 lg:px-10 relative w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center py-10 lg:py-14">
            {/* LEFT — 7 cols */}
            <div className="lg:col-span-7 space-y-7">
              <div
                className="flex items-center gap-4 reveal"
                style={{ ["--reveal-delay" as string]: "0ms" }}
              >
                <span className="eyebrow">// {ROMAN_YEAR} — Plateau</span>
                <span className="h-px flex-1 bg-zinc-800 max-w-20" />
                <span className="text-xs font-mono text-zinc-600 tabular-nums">
                  01 / 05
                </span>
              </div>

              <h1
                className="text-display reveal"
                style={{ ["--reveal-delay" as string]: "150ms" }}
              >
                Le cinéma marocain,
                <br />
                enfin à{" "}
                <span className="font-editorial text-amber-500">
                  l&rsquo;écran.
                </span>
              </h1>

              <p
                className="text-base lg:text-lg text-zinc-300 leading-[1.6] max-w-[48ch] reveal"
                style={{ ["--reveal-delay" as string]: "300ms" }}
              >
                L&rsquo;annuaire professionnel qui connecte acteurs,
                réalisateurs, techniciens et productions à travers tout le
                Royaume.
              </p>

              <div
                className="flex flex-wrap items-center gap-3 reveal"
                style={{ ["--reveal-delay" as string]: "450ms" }}
              >
                <LinkMagneticCTA href="/annuaire" variant="primary">
                  Explorer l&rsquo;annuaire
                  <ArrowUpRight weight="bold" className="h-4 w-4" />
                </LinkMagneticCTA>
                <LinkMagneticCTA href="/inscription" variant="secondary">
                  Rejoindre la plateforme
                </LinkMagneticCTA>
              </div>

              {/* Inline metrics */}
              <div
                className="pt-6 border-t border-zinc-800 grid grid-cols-3 gap-4 reveal"
                style={{ ["--reveal-delay" as string]: "600ms" }}
              >
                {[
                  { n: "1 247", l: "Professionnels" },
                  { n: "23", l: "Métiers" },
                  { n: "14", l: "Régions" },
                ].map((m, i) => (
                  <div
                    key={i}
                    className={i > 0 ? "pl-4 border-l border-zinc-800" : ""}
                  >
                    <div className="text-2xl lg:text-3xl font-mono font-medium text-zinc-50 tabular-nums">
                      {m.n}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      {m.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — 5 cols - Interactive 3D film visual */}
            <div
              className="lg:col-span-5 reveal"
              style={{ ["--reveal-delay" as string]: "750ms" }}
            >
              <HeroFilmVisual />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          2. MARQUEE BAND
          ═══════════════════════════════════════════════ */}
      <section
        aria-hidden
        className="py-10 border-b border-zinc-800 overflow-hidden bg-zinc-950"
      >
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(3)].map((_, round) => (
            <div key={round} className="flex items-center shrink-0">
              {PROFESSIONS_MARQUEE.map((p, i) => (
                <span
                  key={`${round}-${i}`}
                  className={`text-5xl lg:text-6xl font-mono font-medium tracking-tight mx-8 ${
                    i % 5 === 2 ? "text-amber-500" : "text-zinc-800"
                  }`}
                >
                  {p}
                  <span className="mx-8 text-zinc-900">·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          3. PROFESSIONS BENTO
          ═══════════════════════════════════════════════ */}
      <section className="py-32 lg:py-40 border-b border-zinc-800">
        <div className="container mx-auto max-w-[1480px] px-6 lg:px-10">
          <div className="flex items-end justify-between mb-12 gap-10 flex-wrap">
            <div className="max-w-xl">
              <div className="eyebrow mb-4">// Les métiers — 02</div>
              <h2 className="text-display-sm">
                Chaque talent,
                <br />
                <span className="font-editorial text-amber-500">
                  sa propre scène.
                </span>
              </h2>
            </div>
            <p className="text-base text-zinc-400 leading-relaxed max-w-sm">
              Huit catégories qui reflètent la réalité des plateaux marocains
              et internationaux.
            </p>
          </div>

          {/* Bento: asymmetric 12-col grid — every tile is a clickable Link */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-auto">
            {/* Featured — col-span-7, Interprétation */}
            <Link
              href="/annuaire?profession=acteur-comedien"
              className="md:col-span-7 md:row-span-2 rounded-3xl border border-zinc-800 bg-zinc-900 p-8 lg:p-10 transition-all duration-300 hover:bg-gradient-to-br hover:from-amber-500/10 hover:to-amber-500/5 hover:border-amber-500 hover:-translate-y-1 group relative overflow-hidden"
            >
              <div
                aria-hidden
                className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-amber-500/0 group-hover:bg-amber-500/20 blur-3xl transition-all duration-500"
              />
              <div className="relative flex items-start justify-between">
                <MaskHappy
                  weight="duotone"
                  className="h-12 w-12 text-amber-500 group-hover:scale-110 transition-transform duration-300"
                />
                <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.25em] group-hover:text-amber-500 transition-colors">
                  SCN 01
                </span>
              </div>
              <div className="relative mt-10 lg:mt-14">
                <h3 className="text-2xl lg:text-3xl font-medium tracking-tight text-zinc-50">
                  Interprétation
                </h3>
                <p className="mt-3 text-sm lg:text-base text-zinc-400 leading-relaxed max-w-md">
                  Acteurs, comédiens, figurants, doublage voix. Du théâtre
                  classique à la fiction contemporaine.
                </p>
                <div className="mt-6 flex flex-wrap gap-1.5">
                  {[
                    "Acteur",
                    "Comédien",
                    "Figurant",
                    "Doublage",
                    "Mime",
                  ].map((s) => (
                    <span
                      key={s}
                      className="text-xs px-2.5 py-1 rounded-full border border-zinc-700 text-zinc-300 group-hover:border-amber-500/60 group-hover:text-zinc-50 transition-colors"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="mt-8 flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm text-amber-500 font-medium">
                    Voir les profils
                    <ArrowUpRight
                      weight="bold"
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                    />
                  </span>
                  <span className="text-xs font-mono text-zinc-500 tabular-nums">
                    342 profils
                  </span>
                </div>
              </div>
            </Link>

            {/* Réalisation — col-span-5 */}
            <BentoTile
              href="/annuaire?profession=realisateur"
              icon={Megaphone}
              scn="SCN 02"
              title="Réalisation & Production"
              desc="Réalisateurs, producteurs, assistants, directeurs de casting."
              count="187 profils"
              span="md:col-span-5"
            />

            {/* Image — col-span-5 */}
            <BentoTile
              href="/annuaire?profession=operateur-image"
              icon={Camera}
              scn="SCN 03"
              title="Technique Image"
              desc="Opérateurs image, ingénieurs lumière, photographes de plateau."
              count="156 profils"
              span="md:col-span-5"
            />

            {/* Son — col-span-4 */}
            <BentoTile
              href="/annuaire?profession=operateur-son"
              icon={Microphone}
              scn="SCN 04"
              title="Technique Son"
              desc="Prise de son, mixage, post-production audio."
              count="94 profils"
              span="md:col-span-4"
              small
            />

            {/* Écriture — col-span-4 */}
            <BentoTile
              href="/annuaire?profession=scenariste"
              icon={PencilSimpleLine}
              scn="SCN 05"
              title="Écriture & Scénographie"
              desc="Scénaristes et scénographes, du premier jet au plateau."
              count="78 profils"
              span="md:col-span-4"
              small
            />

            {/* Post-production — col-span-4 */}
            <BentoTile
              href="/annuaire?profession=monteur"
              icon={FilmStrip}
              scn="SCN 06"
              title="Post-production"
              desc="Monteurs, étalonneurs, compositeurs, techniciens VFX."
              count="112 profils"
              span="md:col-span-4"
              small
            />

            {/* Décoration/Costume — col-span-12 wide */}
            <Link
              href="/annuaire?profession=decorateur"
              className="md:col-span-12 rounded-3xl border border-zinc-800 bg-zinc-900 p-8 lg:p-10 transition-all duration-300 hover:bg-gradient-to-r hover:from-amber-500/10 hover:to-amber-500/5 hover:border-amber-500 hover:-translate-y-1 flex flex-col md:flex-row md:items-center md:justify-between gap-6 group"
            >
              <div className="flex items-center gap-6">
                <PaintBrush
                  weight="duotone"
                  className="h-12 w-12 text-amber-500 shrink-0 group-hover:scale-110 transition-transform duration-300"
                />
                <div>
                  <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.25em] group-hover:text-amber-500 transition-colors mb-1">
                    SCN 07
                  </div>
                  <h3 className="text-xl lg:text-2xl font-medium tracking-tight text-zinc-50">
                    Décoration, Costume & Maquillage
                  </h3>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed max-w-xl">
                    Les artisans de l&rsquo;image&thinsp;: décorateurs,
                    costumiers, maquilleurs.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 text-sm text-amber-500 font-medium whitespace-nowrap">
                Parcourir
                <ArrowUpRight
                  weight="bold"
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          4. SPLIT CTA
          ═══════════════════════════════════════════════ */}
      <section className="py-32 lg:py-40 border-b border-zinc-800">
        <div className="container mx-auto max-w-[1480px] px-6 lg:px-10">
          <div className="eyebrow mb-6">// Deux entrées — 03</div>
          <h2 className="text-display-sm mb-20 max-w-3xl">
            Un plateau
            <br />
            <span className="font-editorial text-amber-500">pour chacun.</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Professionals — dark */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10 lg:p-14 relative overflow-hidden group">
              <FilmSlate
                weight="duotone"
                className="absolute top-8 right-8 h-24 w-24 text-zinc-800 group-hover:text-amber-500/20 transition-colors"
              />
              <div className="eyebrow">// Pour les talents</div>
              <h3 className="mt-6 text-3xl lg:text-4xl font-medium tracking-tight leading-[1.1]">
                Faites-vous
                <br />
                <span className="font-editorial text-amber-500">
                  remarquer.
                </span>
              </h3>
              <p className="mt-6 text-lg text-zinc-400 leading-relaxed max-w-md">
                Un profil complet, un agenda partagé, des demandes structurées.
              </p>
              <ul className="mt-10 space-y-4">
                {[
                  "Portfolio riche : photos, vidéos, extraits",
                  "Agenda de disponibilité consultable",
                  "Validation CCM pour la crédibilité",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <SealCheck
                      weight="duotone"
                      className="h-5 w-5 text-amber-500 mt-0.5 shrink-0"
                    />
                    <span className="text-base text-zinc-300">{t}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/inscription"
                className="mt-12 inline-flex items-center gap-2 rounded-full border border-zinc-700 hover:border-amber-500 hover:bg-amber-500 hover:text-zinc-950 text-zinc-50 px-7 py-4 text-base font-semibold transition-all"
              >
                Créer mon profil
                <ArrowUpRight weight="bold" className="h-5 w-5" />
              </Link>
            </div>

            {/* Recruiters — amber */}
            <div className="rounded-3xl bg-amber-500 text-zinc-950 p-10 lg:p-14 relative overflow-hidden group">
              <UsersThree
                weight="duotone"
                className="absolute top-8 right-8 h-24 w-24 text-amber-700/30"
              />
              <div className="text-xs uppercase tracking-[0.18em] font-mono font-medium">
                // Pour les productions
              </div>
              <h3 className="mt-6 text-3xl lg:text-4xl font-medium tracking-tight leading-[1.1]">
                Trouvez le bon
                <br />
                <span className="italic font-editorial font-normal">
                  profil.
                </span>
              </h3>
              <p className="mt-6 text-lg text-zinc-900 leading-relaxed max-w-md">
                Recherche multicritère, disponibilité en temps réel, contact
                direct.
              </p>
              <ul className="mt-10 space-y-4">
                {[
                  "Filtres métier, région, langue, niveau",
                  "Agenda consultable avant contact",
                  "Demandes de contact tracées",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <SealCheck
                      weight="duotone"
                      className="h-5 w-5 text-zinc-950 mt-0.5 shrink-0"
                    />
                    <span className="text-base text-zinc-950">{t}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/inscription"
                className="mt-12 inline-flex items-center gap-2 rounded-full bg-zinc-950 hover:bg-zinc-800 text-amber-500 px-7 py-4 text-base font-semibold transition-all"
              >
                Accéder à la recherche
                <ArrowUpRight weight="bold" className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          5. INSTITUTIONS
          ═══════════════════════════════════════════════ */}
      <section className="py-24 border-b border-zinc-800">
        <div className="container mx-auto max-w-[1480px] px-6 lg:px-10">
          <div className="flex items-center gap-6 mb-10">
            <Buildings weight="duotone" className="h-6 w-6 text-amber-500" />
            <span className="eyebrow">// Institutions partenaires — 04</span>
            <span className="h-px flex-1 bg-zinc-800" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {[
              "CCM",
              "ISADAC",
              "ISMAC",
              "ESAV Marrakech",
              "SNRT",
              "2M",
            ].map((inst) => (
              <div
                key={inst}
                className="text-center text-xl lg:text-2xl font-mono tracking-tight text-zinc-500 hover:text-zinc-50 transition-colors"
              >
                {inst}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          6. FOOTER CTA
          ═══════════════════════════════════════════════ */}
      <section className="relative py-40 lg:py-56 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(245,158,11,0.2) 0%, transparent 60%)",
          }}
        />
        <div className="container mx-auto max-w-[1480px] px-6 lg:px-10 relative text-center">
          <div className="eyebrow mb-10">// Action — 05</div>
          <h2 className="text-display mb-16">
            Prêts à faire
            <br />
            du cinéma{" "}
            <span className="font-editorial text-amber-500">ensemble</span>
            &nbsp;?
          </h2>
          <LinkMagneticCTA href="/inscription" variant="primary">
            Créer mon profil
            <ArrowUpRight weight="bold" className="h-6 w-6" />
          </LinkMagneticCTA>
          <div className="mt-16 flex items-center justify-center gap-4 text-sm font-mono text-zinc-600">
            <MapPin weight="duotone" className="h-4 w-4" />
            <span>RABAT — CASABLANCA — MARRAKECH — OUARZAZATE</span>
          </div>
        </div>
      </section>
    </div>
  );
}
