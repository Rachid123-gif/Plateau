import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  SealCheck,
  MapPin,
  GlobeSimple,
  ShareNetwork,
  PaperPlaneRight,
  Calendar,
  Translate,
  ArrowUpRight,
  CaretLeft,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import type {
  ProfileWithRelations,
  Profession,
  Experience,
  Education,
  PortfolioItem,
  Skill,
  Language,
} from "@/types";

// Local structural types used in callbacks
type ProfessionEntry = { profession: Profession };
type SkillEntry = { skill: Pick<Skill, "id" | "name"> };
type LanguageEntry = { language: Language; level: string };
type EducationWithInstitution = Education & { institution: { name: string } | null };

const AVAILABILITY_CONFIG: Record<
  string,
  { label: string; dot: string; pill: string }
> = {
  AVAILABLE: {
    label: "Disponible",
    dot: "bg-emerald-500",
    pill: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  },
  BUSY: {
    label: "Occupé",
    dot: "bg-amber-500",
    pill: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  },
  UNAVAILABLE: {
    label: "Non disponible",
    dot: "bg-zinc-600",
    pill: "bg-zinc-800 border-zinc-700 text-zinc-500",
  },
};

const LANGUAGE_LEVEL_LABELS: Record<string, string> = {
  NATIVE: "Natif",
  FLUENT: "Courant",
  CONVERSATIONAL: "Conversationnel",
  BASIC: "Notions",
};

const EXPERIENCE_LEVEL_LABELS: Record<string, string> = {
  STUDENT: "Étudiant",
  JUNIOR: "Junior",
  INTERMEDIATE: "Intermédiaire",
  SENIOR: "Senior",
  EXPERT: "Expert",
};

interface ProfilePageProps {
  params: Promise<{ slug: string }>;
}

async function getProfile(slug: string) {
  return prisma.profile.findUnique({
    where: { slug, isPublic: true },
    include: {
      user: { select: { id: true, email: true, role: true } },
      primaryProfession: true,
      professions: { include: { profession: true } },
      skills: { include: { skill: { select: { id: true, name: true } } } },
      experiences: { orderBy: [{ sortOrder: "asc" }, { year: "desc" }] },
      education: {
        include: { institution: true },
        orderBy: { endYear: "desc" },
      },
      portfolio: { orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] },
      languages: { include: { language: true } },
    },
  }) as unknown as ProfileWithRelations | null;
}

export default async function ProfilePage(props: ProfilePageProps) {
  const { slug } = await props.params;

  const [profile, currentUser] = await Promise.all([
    getProfile(slug),
    getCurrentUser(),
  ]);

  if (!profile) notFound();

  // Increment view count (fire-and-forget)
  prisma.profile
    .update({ where: { id: profile.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => null);

  const initials = `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
  const availability =
    AVAILABILITY_CONFIG[profile.availabilityStatus] ??
    AVAILABILITY_CONFIG.UNAVAILABLE;
  const isVerified = profile.verificationStatus === "VERIFIED";

  // Secondary professions (exclude primary)
  const secondaryProfessions = (profile.professions as ProfessionEntry[])
    .map((p: ProfessionEntry) => p.profession)
    .filter((p: Profession) => p.id !== profile.primaryProfessionId);

  // Portfolio split
  const portfolioImages = (profile.portfolio as PortfolioItem[]).filter(
    (p: PortfolioItem) => p.type === "IMAGE" && p.thumbnailUrl
  );
  const portfolioOthers = (profile.portfolio as PortfolioItem[]).filter(
    (p: PortfolioItem) => p.type !== "IMAGE" || !p.thumbnailUrl
  );

  return (
    <div className="bg-zinc-950 min-h-[100dvh]">
      {/* Back link */}
      <div className="container mx-auto px-6 max-w-7xl pt-8">
        <Link
          href="/annuaire"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-50 text-sm transition-colors"
        >
          <CaretLeft weight="bold" className="w-4 h-4" />
          Retour à l&apos;annuaire
        </Link>
      </div>

      {/* ── Hero header ── */}
      <header className="border-b border-zinc-800 mt-8 pb-16">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-12 gap-8">
            {/* Portrait */}
            <div className="col-span-12 md:col-span-4">
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-zinc-900">
                {profile.photoUrl ? (
                  <Image
                    src={profile.photoUrl}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      background:
                        "radial-gradient(ellipse at 60% 40%, rgba(245,158,11,0.15) 0%, transparent 70%)",
                    }}
                  >
                    <span className="text-8xl font-medium tracking-[-0.04em] text-zinc-400 select-none">
                      {initials}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="col-span-12 md:col-span-8 flex flex-col justify-center gap-5">
              {/* Eyebrow row */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="eyebrow">// Profil — SCN MMXXVI</div>
                {profile.primaryProfession && (
                  <span className="text-xs uppercase tracking-[0.2em] font-mono text-zinc-500">
                    {profile.primaryProfession.name}
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-mono ${availability.pill}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${availability.dot}`} />
                  {availability.label}
                </span>
                {isVerified && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-mono text-amber-400">
                    <SealCheck weight="fill" className="w-3.5 h-3.5" />
                    Vérifié
                  </span>
                )}
              </div>

              {/* Massive name */}
              <div>
                <h1 className="text-display font-medium leading-[0.9]">
                  <span className="text-zinc-50">{profile.firstName} </span>
                  <span className="font-editorial text-amber-500 italic">{profile.lastName}</span>
                </h1>
                {profile.artistName && (
                  <p className="mt-3 text-xl italic font-editorial text-zinc-300">
                    &ldquo;{profile.artistName}&rdquo;
                  </p>
                )}
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-xl text-zinc-300 leading-[1.6] max-w-2xl">
                  {profile.bio}
                </p>
              )}

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-base font-mono tracking-wide text-zinc-500 uppercase">
                {profile.city && (
                  <span className="flex items-center gap-1.5 normal-case">
                    <MapPin weight="bold" className="w-4 h-4 text-zinc-600" />
                    {profile.city}
                    {profile.region ? `, ${profile.region}` : ""}
                  </span>
                )}
                {profile.experienceLevel && (
                  <span>
                    {EXPERIENCE_LEVEL_LABELS[profile.experienceLevel] ?? profile.experienceLevel}
                  </span>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-50 transition-colors normal-case"
                  >
                    <GlobeSimple weight="bold" className="w-4 h-4" />
                    Site web
                    <ArrowUpRight weight="bold" className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {currentUser ? (
                  <Link
                    href={`/dashboard/messages/nouveau?destinataire=${profile.slug}`}
                    className="inline-flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-7 py-4 text-base transition-colors"
                  >
                    <PaperPlaneRight weight="bold" className="w-4 h-4" />
                    Demander un contact
                  </Link>
                ) : (
                  <Link
                    href={`/connexion?redirect=/profil/${profile.slug}`}
                    className="inline-flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-7 py-4 text-base transition-colors"
                  >
                    <PaperPlaneRight weight="bold" className="w-4 h-4" />
                    Se connecter pour contacter
                  </Link>
                )}
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-700 hover:border-zinc-500 bg-transparent text-zinc-50 px-7 py-4 text-base transition-colors"
                >
                  <ShareNetwork weight="bold" className="w-4 h-4" />
                  Partager
                </button>
              </div>
            </div>
          </div>

          {/* Scene break — secondary professions */}
          {secondaryProfessions.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2">
              {secondaryProfessions.map((p: Profession) => (
                <span
                  key={p.id}
                  className="font-mono text-xs uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border border-zinc-800 text-zinc-500"
                >
                  {p.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="container mx-auto px-6 max-w-7xl py-20 lg:py-28">
        <div className="grid grid-cols-12 gap-12">
          {/* ── Left 8 cols ── */}
          <div className="col-span-12 lg:col-span-8 space-y-20 lg:space-y-28">
            {/* Portfolio */}
            {profile.portfolio.length > 0 && (
              <section>
                <p className="eyebrow mb-4">// Portfolio</p>
                <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-50 mb-8">
                  Travaux &amp; <span className="font-editorial text-amber-500">extraits.</span>
                </h2>
                {/* Image grid */}
                {portfolioImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    {portfolioImages.map((item: PortfolioItem, idx: number) => (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`relative overflow-hidden rounded-2xl group block ${
                          idx === 0 ? "col-span-2 row-span-2 aspect-[4/3]" : "aspect-square"
                        }`}
                      >
                        <Image
                          src={item.thumbnailUrl!}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                          sizes="(max-width: 640px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-zinc-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                          <span className="text-zinc-50 text-xs font-medium truncate">
                            {item.title}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                )}

                {/* Non-image items */}
                {portfolioOthers.length > 0 && (
                  <div className="space-y-2">
                    {portfolioOthers.map((item: PortfolioItem) => (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-800 hover:border-amber-500/40 bg-zinc-900 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                          <Sparkle weight="fill" className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-zinc-50 truncate">{item.title}</p>
                          {item.description && (
                            <p className="text-xs text-zinc-500 truncate mt-0.5">{item.description}</p>
                          )}
                        </div>
                        <ArrowUpRight weight="bold" className="w-4 h-4 text-zinc-600 group-hover:text-amber-500 transition-colors shrink-0" />
                      </a>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Experiences */}
            {profile.experiences.length > 0 && (
              <section>
                <p className="eyebrow mb-4">// Expériences</p>
                <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-50 mb-8">
                  Au fil des <span className="font-editorial text-amber-500">plateaux.</span>
                </h2>
                <div className="divide-y divide-zinc-800">
                  {(profile.experiences as Experience[]).map((exp: Experience, i: number) => (
                    <div
                      key={exp.id}
                      className="py-8 flex gap-6 reveal"
                      style={{ ["--reveal-delay" as string]: `${i * 80}ms` }}
                    >
                      {/* Year */}
                      <div className="w-24 shrink-0 pt-0.5">
                        {exp.year && (
                          <span className="text-3xl font-mono tabular-nums text-amber-500 font-medium">
                            {exp.year}
                          </span>
                        )}
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xl font-medium text-zinc-50 leading-tight">{exp.title}</h4>
                        {exp.production && (
                          <p className="text-base text-zinc-400 font-mono mt-1">{exp.production}</p>
                        )}
                        {exp.role && (
                          <p className="text-base text-zinc-400 mt-0.5">{exp.role}</p>
                        )}
                        {exp.description && (
                          <p className="text-base text-zinc-400 leading-relaxed mt-2 max-w-2xl">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {profile.education.length > 0 && (
              <section>
                <p className="eyebrow mb-4">// Formation</p>
                <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-50 mb-8">
                  Parcours <span className="font-editorial text-amber-500">académique.</span>
                </h2>
                <div className="divide-y divide-zinc-800">
                  {(profile.education as EducationWithInstitution[]).map(
                    (edu: EducationWithInstitution, i: number) => (
                      <div
                        key={edu.id}
                        className="py-8 flex gap-6 reveal"
                        style={{ ["--reveal-delay" as string]: `${i * 80}ms` }}
                      >
                        {/* Year range */}
                        <div className="w-24 shrink-0 pt-0.5">
                          {(edu.startYear || edu.endYear) && (
                            <span className="text-3xl font-mono tabular-nums text-amber-500 font-medium">
                              {edu.endYear ?? edu.startYear}
                            </span>
                          )}
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {edu.degree && (
                            <h4 className="text-xl font-medium text-zinc-50 leading-tight">{edu.degree}</h4>
                          )}
                          {edu.field && (
                            <p className="text-base text-zinc-400 font-mono mt-1">{edu.field}</p>
                          )}
                          <p className="text-base text-zinc-400 mt-0.5">
                            {edu.institution?.name ?? edu.customInstitution ?? ""}
                          </p>
                          {edu.startYear && edu.endYear && (
                            <p className="text-sm text-zinc-600 font-mono mt-1">
                              {edu.startYear} – {edu.endYear}
                            </p>
                          )}
                          {edu.description && (
                            <p className="text-base text-zinc-400 leading-relaxed mt-2 max-w-2xl">
                              {edu.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </section>
            )}
          </div>

          {/* ── Right 4 cols (sticky sidebar) ── */}
          <div className="col-span-12 lg:col-span-4">
            <div className="space-y-5 lg:sticky lg:top-24">
              {/* Skills */}
              {profile.skills.length > 0 && (
                <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-5">
                  <p className="eyebrow mb-4">Compétences</p>
                  <div className="flex flex-wrap gap-2">
                    {(profile.skills as SkillEntry[]).map(({ skill }: SkillEntry) => (
                      <span
                        key={skill.id}
                        className="text-base px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/5 text-amber-300/80"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {profile.languages.length > 0 && (
                <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-5">
                  <p className="eyebrow mb-4 flex items-center gap-2">
                    <Translate weight="bold" className="w-3.5 h-3.5" />
                    Langues
                  </p>
                  <div className="space-y-2">
                    {(profile.languages as LanguageEntry[]).map(
                      ({ language, level }: LanguageEntry) => (
                        <div
                          key={language.id}
                          className="flex items-center justify-between"
                        >
                          <span className="text-base text-zinc-300">{language.name}</span>
                          <span className="text-sm font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                            {LANGUAGE_LEVEL_LABELS[level] ?? level}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Availability */}
              <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-5">
                <p className="eyebrow mb-4 flex items-center gap-2">
                  <Calendar weight="bold" className="w-3.5 h-3.5" />
                  Disponibilité
                </p>
                <p className={`text-3xl font-medium mb-2 ${availability.dot === "bg-emerald-500" ? "text-emerald-400" : availability.dot === "bg-amber-500" ? "text-amber-400" : "text-zinc-500"}`}>
                  {availability.label}
                </p>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Contactez ce professionnel pour connaître ses disponibilités précises.
                </p>
              </div>

              {/* Contact CTA card */}
              <div className="bg-zinc-900 border border-zinc-800/60 rounded-2xl p-5">
                <p className="text-base text-zinc-400 leading-relaxed mb-4">
                  Vous souhaitez travailler avec{" "}
                  <span className="text-zinc-50 font-medium">{profile.firstName}</span> ?
                </p>
                {currentUser ? (
                  <Link
                    href={`/dashboard/messages/nouveau?destinataire=${profile.slug}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-7 py-4 text-base transition-colors"
                  >
                    <PaperPlaneRight weight="bold" className="w-4 h-4" />
                    Envoyer un message
                  </Link>
                ) : (
                  <>
                    <Link
                      href={`/connexion?redirect=/profil/${profile.slug}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-7 py-4 text-base transition-colors"
                    >
                      <PaperPlaneRight weight="bold" className="w-4 h-4" />
                      Se connecter pour contacter
                    </Link>
                    <p className="text-sm text-zinc-600 text-center mt-3">
                      Pas encore de compte ?{" "}
                      <Link href="/inscription" className="text-amber-500 hover:text-amber-400 transition-colors">
                        S&apos;inscrire gratuitement
                      </Link>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Contact CTA footer section ── */}
      <section className="border-t border-zinc-800 bg-zinc-900/50 py-20 mt-8">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <div className="eyebrow mb-4 justify-center">// Collaboration</div>
          <h2 className="text-display-sm font-medium text-zinc-50 mb-4">
            Intéressé par ce{" "}
            <span className="font-editorial text-amber-500">profil ?</span>
          </h2>
          <p className="text-lg md:text-xl text-zinc-300 leading-[1.55] max-w-[60ch] mx-auto mb-8">
            Rejoignez Plateau pour entrer en contact avec{" "}
            {profile.firstName} et des centaines de professionnels du cinéma marocain.
          </p>
          {currentUser ? (
            <Link
              href={`/dashboard/messages/nouveau?destinataire=${profile.slug}`}
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-7 py-4 text-base transition-colors"
            >
              <PaperPlaneRight weight="bold" className="w-4 h-4" />
              Contacter {profile.firstName}
            </Link>
          ) : (
            <Link
              href={`/inscription`}
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-7 py-4 text-base transition-colors"
            >
              <PaperPlaneRight weight="bold" className="w-4 h-4" />
              Créer un compte gratuit
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
