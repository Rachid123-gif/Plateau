import Link from "next/link";
import Image from "next/image";
import { SealCheck } from "@phosphor-icons/react/dist/ssr";
import type { ProfileCard } from "@/types";

const AVAILABILITY_DOT: Record<string, string> = {
  AVAILABLE: "bg-emerald-500",
  BUSY: "bg-amber-500",
  UNAVAILABLE: "bg-zinc-600",
};

interface ProfileCardProps {
  profile: ProfileCard;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const initials = `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
  const dot = AVAILABILITY_DOT[profile.availabilityStatus] ?? AVAILABILITY_DOT.UNAVAILABLE;
  const visibleSkills = profile.skills.slice(0, 3);
  const isVerified = profile.verificationStatus === "VERIFIED";

  return (
    <Link
      href={`/profil/${profile.slug}`}
      className="group block rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden hover:border-amber-500/40 transition-all duration-300"
    >
      {/* Portrait photo area */}
      <div className="relative aspect-[4/5] bg-zinc-800 overflow-hidden">
        {profile.photoUrl ? (
          <Image
            src={profile.photoUrl}
            alt={`${profile.firstName} ${profile.lastName}`}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{
              background: "radial-gradient(ellipse at 60% 40%, rgba(245,158,11,0.18) 0%, transparent 70%)",
            }}
          >
            <span className="text-5xl font-medium tracking-[-0.04em] text-zinc-300 select-none">
              {initials}
            </span>
          </div>
        )}

        {/* Verified badge */}
        {isVerified && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full px-2 py-1 bg-zinc-950/70 backdrop-blur-sm border border-zinc-700/60">
            <SealCheck weight="fill" className="w-3.5 h-3.5 text-amber-500" />
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-5">
        {/* Top row: profession + availability dot */}
        <div className="flex items-center justify-between gap-2">
          {profile.primaryProfession ? (
            <span className="text-xs uppercase tracking-[0.15em] font-mono text-amber-500 truncate">
              {profile.primaryProfession.name}
            </span>
          ) : (
            <span className="text-xs uppercase tracking-[0.15em] font-mono text-zinc-600">
              — Métier non renseigné
            </span>
          )}
          <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
        </div>

        {/* Name */}
        <p className="text-lg font-medium text-zinc-50 mt-1 leading-tight truncate">
          {profile.firstName} {profile.lastName}
        </p>

        {/* Artist name */}
        {profile.artistName && (
          <p className="text-sm text-zinc-400 italic mt-0.5 truncate">
            {profile.artistName}
          </p>
        )}

        {/* Divider */}
        <div className="border-t border-zinc-800 my-4" />

        {/* City + experience level */}
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-[0.08em] truncate">
          {[profile.city, profile.experienceLevel].filter(Boolean).join(" · ")}
        </p>

        {/* Skills */}
        {visibleSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {visibleSkills.map(({ skill }: { skill: { id: string; name: string } }) => (
              <span
                key={skill.id}
                className="text-[11px] px-2 py-1 rounded-full border border-zinc-800 text-zinc-400"
              >
                {skill.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
