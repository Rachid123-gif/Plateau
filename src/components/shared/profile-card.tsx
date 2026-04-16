import Link from "next/link";
import Image from "next/image";
import { SealCheck, ArrowUpRight, MapPin, ImageSquare } from "@phosphor-icons/react/dist/ssr";
import type { ProfileCard } from "@/types";

const AVAILABILITY_CONFIG: Record<
  string,
  { dot: string; label: string; badge: string }
> = {
  AVAILABLE: {
    dot: "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.25)]",
    label: "Disponible",
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  BUSY: {
    dot: "bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.25)]",
    label: "Occupé",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  UNAVAILABLE: {
    dot: "bg-zinc-500",
    label: "Indisponible",
    badge: "bg-zinc-800 text-zinc-400 border-zinc-700",
  },
};

interface ProfileCardProps {
  profile: ProfileCard & {
    _count?: { portfolio?: number };
  };
  priority?: boolean;
}

/**
 * Carte casting professionnelle — photo plein cadre + overlay bas + status proéminent.
 * Dark theme. Hover scale + reveal CTA.
 */
export function ProfileCard({ profile, priority = false }: ProfileCardProps) {
  const initials = `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
  const availability =
    AVAILABILITY_CONFIG[profile.availabilityStatus] ?? AVAILABILITY_CONFIG.UNAVAILABLE;
  const visibleSkills = profile.skills.slice(0, 2);
  const isVerified = profile.verificationStatus === "VERIFIED";
  const portfolioCount = profile._count?.portfolio ?? 0;

  return (
    <Link
      href={`/profil/${profile.slug}`}
      className="group relative block aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-amber-500/60 transition-all duration-500 hover:-translate-y-1"
    >
      {/* Photo */}
      {profile.photoUrl ? (
        <Image
          src={profile.photoUrl}
          alt={`${profile.firstName} ${profile.lastName}`}
          fill
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className="object-cover transition-transform duration-700 group-hover:scale-[1.08]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background:
              "radial-gradient(ellipse at 60% 35%, rgba(245,158,11,0.18) 0%, transparent 60%), linear-gradient(to bottom, #18181b, #09090b)",
          }}
        >
          <span className="text-6xl font-medium tracking-[-0.04em] text-zinc-400 select-none">
            {initials}
          </span>
        </div>
      )}

      {/* Status pill — top right */}
      <div className="absolute top-3 right-3 z-10">
        <div
          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 backdrop-blur-md ${availability.badge}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${availability.dot}`} />
          <span className="text-[10px] font-mono uppercase tracking-[0.1em] font-medium">
            {availability.label}
          </span>
        </div>
      </div>

      {/* Badges — top left */}
      <div className="absolute top-3 left-3 z-10 flex gap-1.5">
        {isVerified && (
          <div className="flex items-center gap-1 rounded-full bg-zinc-950/70 backdrop-blur-md border border-amber-500/40 px-2 py-1">
            <SealCheck weight="fill" className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-amber-400 font-medium">
              Vérifié
            </span>
          </div>
        )}
        {portfolioCount > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-zinc-950/70 backdrop-blur-md border border-zinc-700 px-2 py-1">
            <ImageSquare weight="regular" className="w-3 h-3 text-zinc-300" />
            <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-zinc-300 font-medium tabular-nums">
              {portfolioCount}
            </span>
          </div>
        )}
      </div>

      {/* Bottom overlay */}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-zinc-950 via-zinc-950/85 to-transparent pt-16 pb-5 px-5">
        {/* Profession eyebrow */}
        {profile.primaryProfession ? (
          <span className="block text-[11px] uppercase tracking-[0.18em] font-mono text-amber-500 truncate font-medium">
            {profile.primaryProfession.name}
          </span>
        ) : (
          <span className="block text-[11px] uppercase tracking-[0.18em] font-mono text-zinc-500 truncate">
            — Métier non renseigné
          </span>
        )}

        {/* Name */}
        <p className="text-xl font-medium text-zinc-50 mt-1.5 leading-tight truncate">
          {profile.firstName}{" "}
          <span className="font-editorial text-amber-400 italic">
            {profile.lastName}
          </span>
        </p>

        {/* Artist name */}
        {profile.artistName && (
          <p className="text-sm text-zinc-400 italic mt-0.5 truncate font-editorial">
            “{profile.artistName}”
          </p>
        )}

        {/* Meta row: city */}
        {profile.city && (
          <div className="flex items-center gap-1.5 mt-3 text-[11px] font-mono uppercase tracking-[0.12em] text-zinc-400">
            <MapPin weight="regular" className="w-3 h-3 shrink-0" />
            <span className="truncate">{profile.city}</span>
          </div>
        )}

        {/* Skills preview */}
        {visibleSkills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {visibleSkills.map(({ skill }: { skill: { id: string; name: string } }) => (
              <span
                key={skill.id}
                className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 text-zinc-300"
              >
                {skill.name}
              </span>
            ))}
            {profile.skills.length > visibleSkills.length && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900/80 border border-zinc-700 text-zinc-500 font-mono">
                +{profile.skills.length - visibleSkills.length}
              </span>
            )}
          </div>
        )}

        {/* Hover CTA */}
        <div className="mt-4 flex items-center gap-2 text-amber-500 text-xs font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <span>Voir le profil</span>
          <ArrowUpRight weight="bold" className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
}
