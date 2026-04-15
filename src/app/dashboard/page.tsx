import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

type RecentRequest = {
  id: string;
  subject: string;
  message: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";
  createdAt: Date;
  sender: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      photoUrl: string | null;
      slug: string;
    } | null;
  };
};
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  MessageSquare,
  User,
  CalendarDays,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export const metadata = {
  title: "Tableau de bord",
};

function ProfileCompletenessBar({ value }: { value: number }) {
  const color =
    value >= 80 ? "bg-green-500" : value >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">Complétude du profil</span>
        <span className="font-bold text-blue-900">{value}%</span>
      </div>
      <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      {value < 80 && (
        <p className="text-xs text-gray-500">
          Complétez votre profil pour augmenter votre visibilité.
        </p>
      )}
    </div>
  );
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  PENDING: { label: "En attente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  ACCEPTED: { label: "Acceptée", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  DECLINED: { label: "Refusée", color: "bg-red-100 text-red-800", icon: XCircle },
  EXPIRED: { label: "Expirée", color: "bg-gray-100 text-gray-600", icon: Clock },
};

export default async function DashboardPage() {
  const user = await requireAuth();

  const profile = user.profile;

  const [pendingCount, recentRequests] = await Promise.all([
    prisma.contactRequest.count({
      where: { receiverId: user.id, status: "PENDING" },
    }),
    prisma.contactRequest.findMany({
      where: { receiverId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        sender: {
          include: {
            profile: {
              select: { firstName: true, lastName: true, photoUrl: true, slug: true },
            },
          },
        },
      },
    }),
  ]);

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : user.email;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Welcome banner */}
      <div className="rounded-xl bg-blue-900 text-white px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bienvenue, {profile?.firstName ?? "Professionnel"} !</h1>
          <p className="text-blue-200 mt-1 text-sm">
            Gérez votre profil et vos disponibilités depuis votre espace personnel.
          </p>
        </div>
        <div className="hidden sm:block">
          <Link
            href="/dashboard/profil"
            className="inline-flex items-center justify-center rounded-lg border border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 h-7 gap-1 px-2.5 text-[0.8rem] font-medium transition-all"
          >
            Modifier mon profil
          </Link>
        </div>
      </div>

      {/* Profile completeness */}
      {profile && (
        <Card>
          <CardContent className="pt-6">
            <ProfileCompletenessBar value={profile.profileCompleteness} />
          </CardContent>
        </Card>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="rounded-lg bg-blue-100 p-3">
              <Eye className="h-6 w-6 text-blue-900" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Vues du profil</p>
              <p className="text-3xl font-bold text-blue-900">
                {profile?.viewCount ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="rounded-lg bg-amber-100 p-3">
              <MessageSquare className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Demandes en attente</p>
              <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/profil"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background hover:bg-muted h-8 px-2.5 text-sm font-medium transition-all"
          >
            <User className="h-4 w-4" />
            Modifier mon profil
          </Link>
          <Link
            href="/dashboard/agenda"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background hover:bg-muted h-8 px-2.5 text-sm font-medium transition-all"
          >
            <CalendarDays className="h-4 w-4" />
            Gérer mes disponibilités
          </Link>
          <Link
            href="/dashboard/demandes"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background hover:bg-muted h-8 px-2.5 text-sm font-medium transition-all"
          >
            <MessageSquare className="h-4 w-4" />
            Voir les demandes
            {pendingCount > 0 && (
              <Badge className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5">
                {pendingCount}
              </Badge>
            )}
          </Link>
        </CardContent>
      </Card>

      {/* Recent contact requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Demandes de contact récentes</CardTitle>
          <Link
            href="/dashboard/demandes"
            className="text-sm text-blue-900 hover:underline flex items-center gap-1"
          >
            Voir tout <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {recentRequests.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Aucune demande de contact pour le moment.
            </p>
          ) : (
            <ul className="space-y-3">
              {(recentRequests as RecentRequest[]).map((req) => {
                const cfg = statusConfig[req.status] ?? statusConfig.PENDING;
                const StatusIcon = cfg.icon;
                const senderName = req.sender.profile
                  ? `${req.sender.profile.firstName} ${req.sender.profile.lastName}`
                  : req.sender.email;
                return (
                  <li
                    key={req.id}
                    className="flex items-start justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{req.subject}</p>
                      <p className="text-xs text-gray-500">
                        De : {senderName} &bull;{" "}
                        {formatDistanceToNow(new Date(req.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${cfg.color}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {cfg.label}
                    </span>
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
