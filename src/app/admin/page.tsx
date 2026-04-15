import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
type RecentUser = {
  id: string;
  email: string;
  createdAt: Date;
  profile: {
    firstName: string;
    lastName: string;
    verificationStatus: string;
  } | null;
};
import {
  Users,
  UserCheck,
  Clock,
  Briefcase,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export const metadata = {
  title: "Administration",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [
    totalProfiles,
    verifiedProfiles,
    pendingProfiles,
    totalRecruiters,
    totalContactRequests,
    recentRegistrations,
  ] = await Promise.all([
    prisma.profile.count(),
    prisma.profile.count({ where: { verificationStatus: "VERIFIED" } }),
    prisma.profile.count({ where: { verificationStatus: "PENDING" } }),
    prisma.user.count({ where: { role: "RECRUITER" } }),
    prisma.contactRequest.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        profile: {
          select: { firstName: true, lastName: true, verificationStatus: true },
        },
      },
    }),
  ]);

  const stats = [
    {
      label: "Profils total",
      value: totalProfiles,
      icon: Users,
      color: "text-blue-900",
      bg: "bg-blue-100",
    },
    {
      label: "Profils vérifiés",
      value: verifiedProfiles,
      icon: UserCheck,
      color: "text-green-700",
      bg: "bg-green-100",
    },
    {
      label: "En attente de validation",
      value: pendingProfiles,
      icon: Clock,
      color: "text-amber-700",
      bg: "bg-amber-100",
      highlight: pendingProfiles > 0,
    },
    {
      label: "Recruteurs inscrits",
      value: totalRecruiters,
      icon: Briefcase,
      color: "text-purple-700",
      bg: "bg-purple-100",
    },
    {
      label: "Demandes de contact",
      value: totalContactRequests,
      icon: MessageSquare,
      color: "text-indigo-700",
      bg: "bg-indigo-100",
    },
    {
      label: "Taux de vérification",
      value:
        totalProfiles > 0
          ? `${Math.round((verifiedProfiles / totalProfiles) * 100)}%`
          : "0%",
      icon: TrendingUp,
      color: "text-teal-700",
      bg: "bg-teal-100",
    },
  ];

  const verificationBadge: Record<string, { label: string; color: string }> = {
    PENDING: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
    VERIFIED: { label: "Vérifié", color: "bg-green-100 text-green-800" },
    REJECTED: { label: "Rejeté", color: "bg-red-100 text-red-800" },
    SUSPENDED: { label: "Suspendu", color: "bg-gray-100 text-gray-700" },
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-blue-900">Tableau de bord admin</h1>
        <p className="text-sm text-gray-500 mt-1">
          Vue d&apos;ensemble de la plateforme Plateau.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className={stat.highlight ? "border-amber-300 shadow-amber-100 shadow-md" : ""}
            >
              <CardContent className="pt-6 flex items-center gap-4">
                <div className={`rounded-lg p-3 ${stat.bg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent registrations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inscriptions récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentRegistrations.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">
              Aucune inscription récente.
            </p>
          ) : (
            <ul className="divide-y">
              {(recentRegistrations as RecentUser[]).map((u) => {
                const displayName = u.profile
                  ? `${u.profile.firstName} ${u.profile.lastName}`
                  : u.email;
                const initials = u.profile
                  ? `${u.profile.firstName[0]}${u.profile.lastName[0]}`
                  : u.email[0].toUpperCase();
                const vStatus = u.profile?.verificationStatus ?? null;
                return (
                  <li key={u.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-900 text-xs font-medium">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{displayName}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {vStatus && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            verificationBadge[vStatus]?.color ?? ""
                          }`}
                        >
                          {verificationBadge[vStatus]?.label ?? vStatus}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(u.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
