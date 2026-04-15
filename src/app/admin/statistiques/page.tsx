import { prisma } from "@/lib/prisma";
import { requireAdminOrModerator } from "@/lib/auth";
import {
  TrendUp,
  Users,
  ChartBar,
  MapPin,
  UserCheck,
  Briefcase,
  Buildings,
  ArrowUp,
  Clock,
  XCircle,
} from "@phosphor-icons/react/dist/ssr";

export const metadata = { title: "Statistiques — Administration" };
export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  icon: Icon,
  accent = false,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ weight: "duotone" | "regular"; className: string }>;
  accent?: boolean;
  sub?: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${
        accent
          ? "bg-zinc-950 border-zinc-900 text-white"
          : "bg-white border-zinc-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium uppercase tracking-wide ${accent ? "text-zinc-400" : "text-zinc-500"}`}>
          {label}
        </span>
        <Icon
          weight="duotone"
          className={`h-5 w-5 ${accent ? "text-amber-400" : "text-amber-500"}`}
        />
      </div>
      <p className={`text-4xl font-mono font-bold ${accent ? "text-white" : "text-zinc-950"}`}>
        {value}
      </p>
      {sub && (
        <p className={`text-xs ${accent ? "text-zinc-400" : "text-zinc-500"}`}>{sub}</p>
      )}
    </div>
  );
}

export default async function StatistiquesPage() {
  await requireAdminOrModerator();

  const [
    totalUsers,
    totalProfessionals,
    totalRecruiters,
    totalInstitutions,
    totalAdmins,
    verifiedProfiles,
    pendingProfiles,
    rejectedProfiles,
    totalContacts,
    pendingContacts,
    acceptedContacts,
    declinedContacts,
    recentRegistrations,
    profilesByProfessionRaw,
    profilesByCityRaw,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "PROFESSIONAL" } }),
    prisma.user.count({ where: { role: "RECRUITER" } }),
    prisma.user.count({ where: { role: "INSTITUTION" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.profile.count({ where: { verificationStatus: "VERIFIED" } }),
    prisma.profile.count({ where: { verificationStatus: "PENDING" } }),
    prisma.profile.count({ where: { verificationStatus: "REJECTED" } }),
    prisma.contactRequest.count(),
    prisma.contactRequest.count({ where: { status: "PENDING" } }),
    prisma.contactRequest.count({ where: { status: "ACCEPTED" } }),
    prisma.contactRequest.count({ where: { status: "DECLINED" } }),
    prisma.user.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.profile.groupBy({
      by: ["primaryProfessionId"],
      _count: { primaryProfessionId: true },
      where: { primaryProfessionId: { not: null } },
      orderBy: { _count: { primaryProfessionId: "desc" } },
      take: 10,
    }),
    prisma.profile.groupBy({
      by: ["city"],
      _count: { city: true },
      where: { city: { not: null } },
      orderBy: { _count: { city: "desc" } },
      take: 10,
    }),
  ]);

  // Resolve profession names
  const professionIds = profilesByProfessionRaw
    .map((p) => p.primaryProfessionId)
    .filter(Boolean) as string[];

  const professions = await prisma.profession.findMany({
    where: { id: { in: professionIds } },
    select: { id: true, name: true },
  });
  const professionMap = Object.fromEntries(professions.map((p) => [p.id, p.name]));

  const profilesByProfession = profilesByProfessionRaw.map((p) => ({
    name: p.primaryProfessionId
      ? (professionMap[p.primaryProfessionId] ?? "Inconnu")
      : "Inconnu",
    count: p._count.primaryProfessionId,
  }));

  const profilesByCity = profilesByCityRaw.map((p) => ({
    name: p.city ?? "Inconnu",
    count: p._count.city,
  }));

  const maxProfessionCount = profilesByProfession[0]?.count ?? 1;
  const maxCityCount = profilesByCity[0]?.count ?? 1;
  const totalProfiles = verifiedProfiles + pendingProfiles + rejectedProfiles;
  const verifiedPct = totalProfiles > 0 ? Math.round((verifiedProfiles / totalProfiles) * 100) : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-950 flex items-center gap-2">
          <ChartBar weight="duotone" className="h-6 w-6 text-amber-500" />
          Statistiques
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Vue d&apos;ensemble de la plateforme Plateau
        </p>
      </div>

      {/* BENTO GRID */}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: "repeat(12, 1fr)",
          gridTemplateRows: "auto",
        }}
      >
        {/* Hero — total users (col 1-5, row 1) */}
        <div style={{ gridColumn: "1 / 6", gridRow: "1" }}>
          <StatCard
            label="Utilisateurs inscrits"
            value={totalUsers}
            icon={Users}
            accent
            sub={`+${recentRegistrations} ces 30 derniers jours`}
          />
        </div>

        {/* Professionnels (col 6-9, row 1) */}
        <div style={{ gridColumn: "6 / 10", gridRow: "1" }}>
          <StatCard
            label="Professionnels"
            value={totalProfessionals}
            icon={Briefcase}
            sub={`${totalRecruiters} recruteurs`}
          />
        </div>

        {/* Institutions (col 10-13, row 1) */}
        <div style={{ gridColumn: "10 / 13", gridRow: "1" }}>
          <StatCard
            label="Institutions"
            value={totalInstitutions}
            icon={Buildings}
            sub={`${totalAdmins} admin${totalAdmins !== 1 ? "s" : ""}`}
          />
        </div>

        {/* Vérification status (col 1-5, row 2) */}
        <div style={{ gridColumn: "1 / 6", gridRow: "2" }}>
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-5 space-y-4 h-full">
            <div className="flex items-center gap-2">
              <UserCheck weight="duotone" className="h-5 w-5 text-amber-500" />
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Statut des profils
              </span>
            </div>
            <div className="space-y-3">
              {[
                { label: "Vérifiés", count: verifiedProfiles, color: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
                { label: "En attente", count: pendingProfiles, color: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
                { label: "Rejetés", count: rejectedProfiles, color: "bg-red-500", text: "text-red-700", bg: "bg-red-50" },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-700">{item.label}</span>
                    <span className={`font-mono font-semibold ${item.text}`}>
                      {item.count}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all`}
                      style={{ width: `${totalProfiles > 0 ? (item.count / totalProfiles) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-zinc-400 font-mono pt-1">
              {verifiedPct}% de taux de vérification
            </p>
          </div>
        </div>

        {/* Demandes de contact (col 6-9, row 2) */}
        <div style={{ gridColumn: "6 / 10", gridRow: "2" }}>
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-5 space-y-4 h-full">
            <div className="flex items-center gap-2">
              <TrendUp weight="duotone" className="h-5 w-5 text-amber-500" />
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Demandes de contact
              </span>
            </div>
            <p className="text-4xl font-mono font-bold text-zinc-950">{totalContacts}</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-zinc-500">
                  <Clock weight="regular" className="h-3.5 w-3.5" />
                  En attente
                </span>
                <span className="font-mono text-zinc-700">{pendingContacts}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-zinc-500">
                  <ArrowUp weight="regular" className="h-3.5 w-3.5 text-emerald-500" />
                  Acceptées
                </span>
                <span className="font-mono text-zinc-700">{acceptedContacts}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-zinc-500">
                  <XCircle weight="regular" className="h-3.5 w-3.5 text-red-400" />
                  Refusées
                </span>
                <span className="font-mono text-zinc-700">{declinedContacts}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Inscriptions récentes (col 10-13, row 2) */}
        <div style={{ gridColumn: "10 / 13", gridRow: "2" }}>
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-5 space-y-3 h-full">
            <div className="flex items-center gap-2">
              <TrendUp weight="duotone" className="h-5 w-5 text-amber-500" />
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                30 derniers jours
              </span>
            </div>
            <p className="text-4xl font-mono font-bold text-zinc-950">
              +{recentRegistrations}
            </p>
            <p className="text-xs text-zinc-500">nouvelles inscriptions</p>
          </div>
        </div>

        {/* Top professions — wide (col 1-8, row 3) */}
        <div style={{ gridColumn: "1 / 9", gridRow: "3" }}>
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Briefcase weight="duotone" className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-semibold text-zinc-950">
                Professions les plus représentées
              </span>
            </div>
            <div className="space-y-2.5">
              {profilesByProfession.length === 0 ? (
                <p className="text-sm text-zinc-400">Aucune donnée disponible</p>
              ) : (
                profilesByProfession.map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-700 truncate max-w-[60%]">{item.name}</span>
                      <span className="font-mono text-zinc-500 text-xs">{item.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all"
                        style={{ width: `${(item.count / maxProfessionCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Top cities — narrow (col 9-13, row 3) */}
        <div style={{ gridColumn: "9 / 13", gridRow: "3" }}>
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-5 space-y-4">
            <div className="flex items-center gap-2">
              <MapPin weight="duotone" className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-semibold text-zinc-950">
                Top villes
              </span>
            </div>
            <div className="space-y-2">
              {profilesByCity.length === 0 ? (
                <p className="text-sm text-zinc-400">Aucune donnée</p>
              ) : (
                profilesByCity.slice(0, 8).map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 font-mono w-4 shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-xs text-zinc-700 truncate">{item.name}</span>
                        <span className="text-xs font-mono text-zinc-500 ml-2">{item.count}</span>
                      </div>
                      <div className="h-1 rounded-full bg-zinc-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-zinc-400 transition-all"
                          style={{ width: `${(item.count / maxCityCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
