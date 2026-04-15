import { prisma } from "@/lib/prisma";
import { requireAdminOrModerator } from "@/lib/auth";
import { USER_ROLE_LABELS, VERIFICATION_STATUS_LABELS } from "@/lib/constants";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  Briefcase,
  Buildings,
  UsersThree,
  UserCircle,
} from "@phosphor-icons/react/dist/ssr";

export const metadata = { title: "Utilisateurs — Administration" };
export const dynamic = "force-dynamic";

const ROLE_TABS = [
  { value: "", label: "Tous" },
  { value: "PROFESSIONAL", label: "Professionnels" },
  { value: "RECRUITER", label: "Recruteurs" },
  { value: "INSTITUTION", label: "Institutions" },
  { value: "ADMIN", label: "Admins" },
];

const ROLE_BADGE: Record<
  string,
  { label: string; className: string }
> = {
  ADMIN: {
    label: "Admin",
    className: "bg-zinc-950 text-white",
  },
  MODERATOR: {
    label: "Modérateur",
    className: "bg-zinc-700 text-white",
  },
  PROFESSIONAL: {
    label: "Professionnel",
    className: "bg-amber-100 text-amber-800",
  },
  RECRUITER: {
    label: "Recruteur",
    className: "bg-blue-50 text-blue-800",
  },
  INSTITUTION: {
    label: "Institution",
    className: "bg-emerald-50 text-emerald-800",
  },
};

const VERIFICATION_BADGE: Record<string, { label: string; className: string }> = {
  PENDING: { label: "En attente", className: "bg-amber-50 text-amber-700" },
  VERIFIED: { label: "Vérifié", className: "bg-emerald-50 text-emerald-700" },
  REJECTED: { label: "Rejeté", className: "bg-red-50 text-red-700" },
  SUSPENDED: { label: "Suspendu", className: "bg-zinc-100 text-zinc-600" },
};

interface PageProps {
  searchParams: Promise<{ role?: string }>;
}

export default async function UtilisateursPage({ searchParams }: PageProps) {
  await requireAdminOrModerator();

  const sp = await searchParams;
  const roleFilter = sp.role ?? "";

  const users = await prisma.user.findMany({
    where: roleFilter ? { role: roleFilter as never } : undefined,
    include: { profile: true },
    orderBy: { createdAt: "desc" },
  });

  const totalCount = await prisma.user.count();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-950 flex items-center gap-2">
            <Users weight="duotone" className="h-6 w-6 text-amber-500" />
            Utilisateurs
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {totalCount} utilisateur{totalCount !== 1 ? "s" : ""} inscrits au total
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-zinc-200">
        {ROLE_TABS.map((tab) => {
          const isActive = roleFilter === tab.value;
          return (
            <Link
              key={tab.value}
              href={tab.value ? `/admin/utilisateurs?role=${tab.value}` : "/admin/utilisateurs"}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                isActive
                  ? "border-amber-500 text-zinc-950"
                  : "border-transparent text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <UsersThree weight="duotone" className="h-12 w-12 text-zinc-300" />
            <p className="text-zinc-500 text-sm">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#fafaf9] border-b border-zinc-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Utilisateur
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Rôle
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Profil
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Inscription
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {users.map((user) => {
                const profile = user.profile;
                const displayName = profile
                  ? `${profile.firstName} ${profile.lastName}`
                  : user.email.split("@")[0];
                const initials = profile
                  ? `${profile.firstName[0]}${profile.lastName[0]}`
                  : user.email[0].toUpperCase();
                const roleBadge = ROLE_BADGE[user.role] ?? {
                  label: user.role,
                  className: "bg-zinc-100 text-zinc-700",
                };
                const vBadge =
                  profile && profile.verificationStatus
                    ? VERIFICATION_BADGE[profile.verificationStatus]
                    : null;

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-[#fafaf9] transition-colors"
                  >
                    {/* Avatar + Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-semibold shrink-0">
                          {initials}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-950">{displayName}</p>
                          {profile?.artistName && (
                            <p className="text-xs text-zinc-400">{profile.artistName}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Email */}
                    <td className="px-4 py-3 text-zinc-600">{user.email}</td>
                    {/* Role badge */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge.className}`}
                      >
                        {user.role === "ADMIN" && (
                          <ShieldCheck weight="regular" className="h-3 w-3" />
                        )}
                        {user.role === "PROFESSIONAL" && (
                          <Briefcase weight="regular" className="h-3 w-3" />
                        )}
                        {user.role === "INSTITUTION" && (
                          <Buildings weight="regular" className="h-3 w-3" />
                        )}
                        {roleBadge.label}
                      </span>
                    </td>
                    {/* Profile status */}
                    <td className="px-4 py-3">
                      {vBadge ? (
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${vBadge.className}`}
                        >
                          {vBadge.label}
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-xs">—</span>
                      )}
                    </td>
                    {/* Created date */}
                    <td className="px-4 py-3 text-zinc-500 text-xs">
                      {format(new Date(user.createdAt), "d MMM yyyy", { locale: fr })}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      {profile ? (
                        <Link
                          href={`/admin/profils/${profile.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-950 transition-colors"
                        >
                          <UserCircle weight="regular" className="h-4 w-4" />
                          Voir le profil
                        </Link>
                      ) : (
                        <span className="text-zinc-300 text-xs">Pas de profil</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
