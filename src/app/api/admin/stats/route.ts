import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (!hasPermission(user.role, "admin:stats")) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const [
      totalProfiles,
      verifiedProfiles,
      pendingProfiles,
      rejectedProfiles,
      totalUsers,
      totalRecruiters,
      totalProfessionals,
      totalContactRequests,
      pendingContactRequests,
      profilesByProfession,
      profilesByCity,
      recentRegistrations,
    ] = await Promise.all([
      prisma.profile.count(),
      prisma.profile.count({ where: { verificationStatus: "VERIFIED" } }),
      prisma.profile.count({ where: { verificationStatus: "PENDING" } }),
      prisma.profile.count({ where: { verificationStatus: "REJECTED" } }),
      prisma.user.count(),
      prisma.user.count({ where: { role: "RECRUITER" } }),
      prisma.user.count({ where: { role: "PROFESSIONAL" } }),
      prisma.contactRequest.count(),
      prisma.contactRequest.count({ where: { status: "PENDING" } }),
      prisma.profile.groupBy({
        by: ["primaryProfessionId"],
        _count: { _all: true },
        where: { primaryProfessionId: { not: null } },
        orderBy: { _count: { primaryProfessionId: "desc" } },
        take: 10,
      }),
      prisma.profile.groupBy({
        by: ["city"],
        _count: { _all: true },
        where: { city: { not: null } },
        orderBy: { _count: { city: "desc" } },
        take: 10,
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    // Resolve profession names
    const professionIds = (profilesByProfession as Array<{ primaryProfessionId: string | null; _count: { _all: number } }>)
      .map((p) => p.primaryProfessionId)
      .filter(Boolean) as string[];

    const professions = await prisma.profession.findMany({
      where: { id: { in: professionIds } },
      select: { id: true, name: true },
    });

    const professionMap = Object.fromEntries(professions.map((p: { id: string; name: string }) => [p.id, p.name]));

    return NextResponse.json({
      totalProfiles,
      verifiedProfiles,
      pendingProfiles,
      rejectedProfiles,
      totalUsers,
      totalRecruiters,
      totalProfessionals,
      totalContactRequests,
      pendingContactRequests,
      recentRegistrations,
      profilesByProfession: profilesByProfession.map((p: { primaryProfessionId: string | null; _count: { _all: number } }) => ({
        profession: p.primaryProfessionId ? (professionMap[p.primaryProfessionId] ?? "Inconnu") : "Inconnu",
        count: p._count._all,
      })),
      profilesByCity: profilesByCity.map((p: { city: string | null; _count: { _all: number } }) => ({
        city: p.city ?? "Inconnu",
        count: p._count._all,
      })),
    });
  } catch (error) {
    console.error("GET /api/admin/stats:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
