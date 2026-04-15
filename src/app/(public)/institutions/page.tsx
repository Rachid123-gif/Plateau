import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import {
  GraduationCap,
  Buildings,
  Television,
  Broadcast,
  ArrowUpRight,
  MapPin,
  GlobeSimple,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Institutions partenaires",
  description:
    "Écoles, organismes et partenaires institutionnels du cinéma marocain : CCM, ISADAC, ISMAC, ESAV Marrakech, SNRT, 2M.",
};

const ICONS: Record<string, typeof GraduationCap> = {
  SCHOOL: GraduationCap,
  UNIVERSITY: GraduationCap,
  ORGANIZATION: Buildings,
  ASSOCIATION: Broadcast,
  OTHER: Television,
};

const TYPE_LABELS: Record<string, string> = {
  SCHOOL: "École",
  UNIVERSITY: "Université",
  ORGANIZATION: "Organisme",
  ASSOCIATION: "Association",
  OTHER: "Autre",
};

export default async function InstitutionsPage() {
  const institutions = await prisma.institution.findMany({
    where: { isActive: true },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  return (
    <div className="bg-zinc-950 text-zinc-50 min-h-[80vh]">
      {/* Hero */}
      <section className="border-b border-zinc-800 py-20 lg:py-28">
        <div className="container mx-auto max-w-[1380px] px-6 lg:px-10">
          <div className="eyebrow mb-6">// Institutions — MMXXVI</div>
          <h1 className="text-display-sm max-w-4xl">
            Les acteurs officiels du{" "}
            <span className="font-editorial text-amber-500">
              cinéma marocain.
            </span>
          </h1>
          <p className="mt-8 text-lg text-zinc-400 leading-[1.6] max-w-2xl">
            Écoles, universités, organismes publics et télévisions partenaires
            de Plateau. Ensemble, nous structurons l&rsquo;écosystème du cinéma
            et de l&rsquo;audiovisuel au Maroc.
          </p>
        </div>
      </section>

      {/* Institutions grid */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto max-w-[1380px] px-6 lg:px-10">
          {institutions.length === 0 ? (
            <p className="text-zinc-500">Aucune institution référencée.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {institutions.map((inst, i) => {
                const Icon = ICONS[inst.type] ?? Buildings;
                return (
                  <article
                    key={inst.id}
                    className="group rounded-3xl border border-zinc-800 bg-zinc-900 p-8 hover:border-amber-500 hover:bg-gradient-to-br hover:from-amber-500/10 hover:to-amber-500/5 transition-all duration-300 hover:-translate-y-1 reveal"
                    style={{
                      ["--reveal-delay" as string]: `${i * 60}ms`,
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 border border-zinc-800 group-hover:border-amber-500/40 transition-colors">
                        <Icon
                          weight="duotone"
                          className="h-7 w-7 text-amber-500"
                        />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 group-hover:text-amber-500 transition-colors">
                        {TYPE_LABELS[inst.type] ?? inst.type}
                      </span>
                    </div>

                    <h2 className="mt-8 text-xl lg:text-2xl font-medium tracking-tight text-zinc-50 leading-tight">
                      {inst.name}
                    </h2>

                    <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono uppercase tracking-wider text-zinc-500">
                      {inst.city && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin weight="regular" className="h-3.5 w-3.5" />
                          {inst.city}
                        </span>
                      )}
                      {inst.website && (
                        <a
                          href={inst.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-amber-500 hover:text-amber-400 transition-colors"
                        >
                          <GlobeSimple weight="regular" className="h-3.5 w-3.5" />
                          Site officiel
                          <ArrowUpRight weight="bold" className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-800 py-20">
        <div className="container mx-auto max-w-[1380px] px-6 lg:px-10 text-center">
          <div className="eyebrow mb-6">// Partenariat</div>
          <h2 className="text-display-sm mb-8 max-w-2xl mx-auto">
            Vous représentez une institution&thinsp;?
          </h2>
          <p className="text-lg text-zinc-400 leading-[1.6] max-w-2xl mx-auto mb-10">
            Rejoignez Plateau pour valoriser vos lauréats, promouvoir vos
            formations et participer à la structuration du secteur.
          </p>
          <Link
            href="/inscription"
            className="inline-flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 px-6 py-3 text-sm font-semibold transition-all hover:-translate-y-[1px]"
          >
            Devenir partenaire
            <ArrowUpRight weight="bold" className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
