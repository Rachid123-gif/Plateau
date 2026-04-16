import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Eye,
  ChatCircle,
  User,
  CalendarBlank,
  ArrowUpRight,
  CheckCircle,
  Clock,
  XCircle,
  ImageSquare,
  Camera,
  PencilSimpleLine,
  Briefcase,
  Sparkle,
  ShareNetwork,
  Gear,
  SealCheck,
} from "@phosphor-icons/react/dist/ssr";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export const metadata = {
  title: "Tableau de bord",
};

const statusConfig: Record<
  string,
  { label: string; color: string; icon: typeof Clock }
> = {
  PENDING: { label: "En attente", color: "bg-amber-500/15 text-amber-400 border-amber-500/30", icon: Clock },
  ACCEPTED: { label: "Acceptée", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", icon: CheckCircle },
  DECLINED: { label: "Refusée", color: "bg-red-500/15 text-red-400 border-red-500/30", icon: XCircle },
  EXPIRED: { label: "Expirée", color: "bg-zinc-800 text-zinc-400 border-zinc-700", icon: Clock },
};

export default async function DashboardPage() {
  const user = await requireAuth();
  const profile = user.profile;

  const [pendingCount, recentRequests, skillsCount, portfolioCount, experiencesCount] =
    await Promise.all([
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
      profile ? prisma.profileSkill.count({ where: { profileId: profile.id } }) : 0,
      profile ? prisma.portfolioItem.count({ where: { profileId: profile.id } }) : 0,
      profile ? prisma.experience.count({ where: { profileId: profile.id } }) : 0,
    ]);

  // Tasks checklist for completion
  const tasks = profile
    ? [
        { key: "photo", label: "Photo de profil", done: !!profile.photoUrl, icon: Camera, href: "/dashboard/profil" },
        {
          key: "bio",
          label: "Biographie (100+ caractères)",
          done: !!profile.bio && profile.bio.length >= 100,
          icon: PencilSimpleLine,
          href: "/dashboard/profil",
        },
        {
          key: "profession",
          label: "Métier principal",
          done: !!profile.primaryProfessionId,
          icon: Briefcase,
          href: "/dashboard/profil",
        },
        { key: "skills", label: "3+ compétences", done: skillsCount >= 3, icon: Sparkle, href: "/dashboard/profil" },
        { key: "portfolio", label: "Portfolio (1+ travail)", done: portfolioCount >= 1, icon: ImageSquare, href: "/dashboard/portfolio" },
        { key: "experience", label: "1+ expérience", done: experiencesCount >= 1, icon: Briefcase, href: "/dashboard/profil" },
      ]
    : [];

  const completedTasks = tasks.filter((t) => t.done).length;
  const totalTasks = tasks.length;
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const isComplete = completionPct === 100;

  const firstName = profile?.firstName ?? "Professionnel";

  const availabilityStatus = profile?.availabilityStatus ?? "UNAVAILABLE";
  const availabilityConfig: Record<string, { label: string; color: string; dot: string }> = {
    AVAILABLE: {
      label: "Disponible",
      color: "text-emerald-400",
      dot: "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.25)]",
    },
    BUSY: {
      label: "Occupé",
      color: "text-amber-400",
      dot: "bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.25)]",
    },
    UNAVAILABLE: {
      label: "Indisponible",
      color: "text-zinc-400",
      dot: "bg-zinc-500",
    },
  };
  const avail = availabilityConfig[availabilityStatus] ?? availabilityConfig.UNAVAILABLE;

  return (
    <div className="bg-zinc-950 min-h-[100dvh] text-zinc-50">
      <div className="container mx-auto max-w-[1280px] px-6 lg:px-10 py-10 lg:py-14 space-y-10">
        {/* Hero greeting */}
        <div>
          <div className="eyebrow mb-4">// Espace professionnel</div>
          <h1 className="text-display-sm">
            Bonjour{" "}
            <span className="font-editorial text-amber-500">{firstName}.</span>
          </h1>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl">
            {isComplete
              ? "Votre profil est complet. Gardez-le à jour pour maximiser votre visibilité."
              : "Complétez votre profil pour apparaître en haut de l'annuaire."}
          </p>
        </div>

        {/* Completeness block — only if not complete */}
        {profile && !isComplete && (
          <section className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-900 p-8 lg:p-10">
            <div
              aria-hidden
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-500/20 blur-3xl"
            />
            <div className="relative flex items-start justify-between gap-6 flex-wrap mb-6">
              <div>
                <div className="eyebrow mb-2">// Complétez votre profil</div>
                <h2 className="text-3xl lg:text-4xl font-medium tracking-tight">
                  Profil complet à{" "}
                  <span className="font-mono text-amber-500 tabular-nums">
                    {completionPct}%
                  </span>
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  {completedTasks} sur {totalTasks} étapes validées
                </p>
              </div>
              <Link
                href="/dashboard/profil"
                className="shrink-0 inline-flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 px-5 py-3 text-sm font-semibold transition-all hover:-translate-y-[1px]"
              >
                Continuer
                <ArrowUpRight weight="bold" className="w-4 h-4" />
              </Link>
            </div>

            {/* Progress bar */}
            <div className="relative h-2 w-full rounded-full bg-zinc-800 overflow-hidden mb-8">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>

            {/* Tasks checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {tasks.map((task) => {
                const Icon = task.icon;
                return (
                  <Link
                    key={task.key}
                    href={task.href}
                    className={`group flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                      task.done
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-zinc-800 bg-zinc-950/50 hover:border-amber-500/40 hover:bg-amber-500/5"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                        task.done ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-800 text-zinc-400 group-hover:bg-amber-500/15 group-hover:text-amber-400"
                      }`}
                    >
                      {task.done ? (
                        <CheckCircle weight="fill" className="w-4 h-4" />
                      ) : (
                        <Icon weight="regular" className="w-4 h-4" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium flex-1 ${
                        task.done ? "text-zinc-400 line-through" : "text-zinc-200"
                      }`}
                    >
                      {task.label}
                    </span>
                    {!task.done && (
                      <ArrowUpRight
                        weight="bold"
                        className="w-3.5 h-3.5 text-zinc-600 group-hover:text-amber-500 shrink-0 transition-colors"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Views */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 hover:border-zinc-700 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 border border-zinc-800">
                <Eye weight="duotone" className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-zinc-600">
                Vues totales
              </span>
            </div>
            <p className="mt-8 text-4xl lg:text-5xl font-medium font-mono tabular-nums text-zinc-50">
              {(profile?.viewCount ?? 0).toLocaleString("fr-FR")}
            </p>
            <p className="mt-2 text-sm text-zinc-500">Vues depuis la création</p>
          </div>

          {/* Contact requests */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 hover:border-zinc-700 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 border border-zinc-800">
                <ChatCircle weight="duotone" className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-zinc-600">
                En attente
              </span>
            </div>
            <p className="mt-8 text-4xl lg:text-5xl font-medium font-mono tabular-nums text-zinc-50">
              {pendingCount}
            </p>
            <Link
              href="/dashboard/demandes"
              className="mt-2 inline-flex items-center gap-1.5 text-sm text-amber-500 hover:text-amber-400 transition-colors"
            >
              Voir les demandes
              <ArrowUpRight weight="bold" className="w-3 h-3" />
            </Link>
          </div>

          {/* Availability */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 hover:border-zinc-700 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 border border-zinc-800">
                <CalendarBlank weight="duotone" className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-zinc-600">
                Disponibilité
              </span>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${avail.dot}`} />
              <p className={`text-2xl lg:text-3xl font-medium ${avail.color}`}>
                {avail.label}
              </p>
            </div>
            <Link
              href="/dashboard/agenda"
              className="mt-2 inline-flex items-center gap-1.5 text-sm text-amber-500 hover:text-amber-400 transition-colors"
            >
              Modifier
              <ArrowUpRight weight="bold" className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Quick actions grid */}
        <section>
          <div className="eyebrow mb-4">// Actions rapides</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Enrichir portfolio", icon: ImageSquare, href: "/dashboard/portfolio" },
              { label: "Gérer disponibilité", icon: CalendarBlank, href: "/dashboard/agenda" },
              ...(profile?.slug
                ? [{ label: "Voir mon profil public", icon: User, href: `/profil/${profile.slug}` }]
                : []),
              {
                label: "Partager",
                icon: ShareNetwork,
                href: profile?.slug ? `/profil/${profile.slug}` : "/dashboard/profil",
              },
              { label: "Paramètres", icon: Gear, href: "/dashboard/parametres" },
            ]
              .slice(0, 4)
              .map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="group flex flex-col items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 hover:border-amber-500/60 hover:bg-amber-500/5 transition-all hover:-translate-y-1"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 border border-zinc-800 group-hover:border-amber-500/40 transition-colors">
                      <Icon weight="duotone" className="w-5 h-5 text-amber-500" />
                    </div>
                    <span className="text-sm font-medium text-zinc-200 group-hover:text-zinc-50 transition-colors">
                      {action.label}
                    </span>
                  </Link>
                );
              })}
          </div>
        </section>

        {/* Verification status */}
        {profile && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 flex items-center gap-4 flex-wrap">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl shrink-0 ${
                profile.verificationStatus === "VERIFIED"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-amber-500/15 text-amber-400"
              }`}
            >
              <SealCheck weight="duotone" className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-zinc-50">
                {profile.verificationStatus === "VERIFIED"
                  ? "Profil vérifié"
                  : profile.verificationStatus === "PENDING"
                  ? "Validation en cours"
                  : "Validation rejetée"}
              </p>
              <p className="text-sm text-zinc-400 mt-0.5">
                {profile.verificationStatus === "VERIFIED"
                  ? "Votre profil est certifié et apparaît en priorité dans les résultats."
                  : profile.verificationStatus === "PENDING"
                  ? "Notre équipe examine actuellement votre profil sous 48h."
                  : "Contactez-nous pour connaître les raisons et améliorer votre profil."}
              </p>
            </div>
          </section>
        )}

        {/* Recent contact requests */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="eyebrow">// Activité récente</div>
            <Link
              href="/dashboard/demandes"
              className="text-sm text-amber-500 hover:text-amber-400 inline-flex items-center gap-1.5 transition-colors"
            >
              Voir tout
              <ArrowUpRight weight="bold" className="w-3 h-3" />
            </Link>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
            {recentRequests.length === 0 ? (
              <div className="text-center py-14">
                <ChatCircle weight="thin" style={{ width: 48, height: 48 }} className="text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-400">Aucune demande de contact pour le moment.</p>
                <p className="text-sm text-zinc-500 mt-1">
                  Complétez votre profil pour augmenter vos chances.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-zinc-800">
                {recentRequests.map((req) => {
                  const cfg = statusConfig[req.status] ?? statusConfig.PENDING;
                  const StatusIcon = cfg.icon;
                  const senderName = req.sender.profile
                    ? `${req.sender.profile.firstName} ${req.sender.profile.lastName}`
                    : req.sender.email;
                  return (
                    <li key={req.id} className="flex items-center gap-4 p-5 hover:bg-zinc-950/40 transition-colors">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15 text-amber-400 text-sm font-medium shrink-0">
                        {senderName
                          .split(" ")
                          .map((n) => n[0])
                          .filter(Boolean)
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-zinc-50">{req.subject}</p>
                        <p className="text-xs text-zinc-500 mt-0.5 font-mono">
                          {senderName} ·{" "}
                          {formatDistanceToNow(new Date(req.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.1em] whitespace-nowrap ${cfg.color}`}
                      >
                        <StatusIcon weight="regular" className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
