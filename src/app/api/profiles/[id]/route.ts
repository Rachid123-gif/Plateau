import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { profileSchema } from "@/lib/validations/profile";

type RouteProps = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, props: RouteProps) {
  try {
    const { id } = await props.params;
    const user = await getCurrentUser();

    const profile = await prisma.profile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, role: true } },
        primaryProfession: true,
        professions: { include: { profession: true } },
        skills: { include: { skill: true } },
        experiences: { orderBy: { sortOrder: "asc" } },
        education: { include: { institution: true } },
        portfolio: { orderBy: { sortOrder: "asc" } },
        languages: { include: { language: true } },
        availability: { orderBy: { startDate: "asc" } },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    // Check visibility
    const canViewFull = user && hasPermission(user.role, "profiles:read:full");
    const isOwner = user?.id === profile.userId;
    if (!profile.isPublic && !isOwner && !canViewFull) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    if (profile.verificationStatus !== "VERIFIED" && !isOwner && !canViewFull) {
      return NextResponse.json({ error: "Profil non disponible" }, { status: 404 });
    }

    // Increment view count if not owner
    if (!isOwner && profile.isPublic) {
      await prisma.profile.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("GET /api/profiles/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, props: RouteProps) {
  try {
    const { id } = await props.params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({ where: { id } });
    if (!profile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    const isOwner = user.id === profile.userId;
    const canUpdateAny = hasPermission(user.role, "profiles:update:any");
    const canUpdateOwn = hasPermission(user.role, "profiles:update:own");

    if (!canUpdateAny && !(isOwner && canUpdateOwn)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = profileSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });
    }

    const { skills, languages, ...profileData } = body;

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.profile.update({
        where: { id },
        data: {
          ...(profileData.firstName !== undefined && { firstName: profileData.firstName }),
          ...(profileData.lastName !== undefined && { lastName: profileData.lastName }),
          ...(profileData.artistName !== undefined && { artistName: profileData.artistName }),
          ...(profileData.bio !== undefined && { bio: profileData.bio }),
          ...(profileData.phone !== undefined && { phone: profileData.phone }),
          ...(profileData.city !== undefined && { city: profileData.city }),
          ...(profileData.region !== undefined && { region: profileData.region }),
          ...(profileData.website !== undefined && { website: profileData.website }),
          ...(profileData.primaryProfessionId !== undefined && { primaryProfessionId: profileData.primaryProfessionId || null }),
          ...(profileData.experienceLevel !== undefined && { experienceLevel: profileData.experienceLevel }),
          ...(profileData.availabilityStatus !== undefined && { availabilityStatus: profileData.availabilityStatus }),
          ...(profileData.isPublic !== undefined && { isPublic: profileData.isPublic }),
        },
      });

      // Update skills if provided
      if (Array.isArray(skills)) {
        await tx.profileSkill.deleteMany({ where: { profileId: id } });
        if (skills.length > 0) {
          await tx.profileSkill.createMany({
            data: skills.map((skillId: string) => ({ profileId: id, skillId })),
          });
        }
      }

      // Update languages if provided
      if (Array.isArray(languages)) {
        await tx.profileLanguage.deleteMany({ where: { profileId: id } });
        if (languages.length > 0) {
          await tx.profileLanguage.createMany({
            data: languages.map((l: { languageId: string; level: string }) => ({
              profileId: id,
              languageId: l.languageId,
              level: l.level as "NATIVE" | "FLUENT" | "CONVERSATIONAL" | "BASIC",
            })),
          });
        }
      }

      // Recalculate completeness
      const completeness = calculateCompleteness(p, Array.isArray(skills) ? skills : [], Array.isArray(languages) ? languages : []);
      return tx.profile.update({ where: { id }, data: { profileCompleteness: completeness } });
    });

    return NextResponse.json({ profile: updated });
  } catch (error) {
    console.error("PUT /api/profiles/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, props: RouteProps) {
  try {
    const { id } = await props.params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({ where: { id } });
    if (!profile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    const isOwner = user.id === profile.userId;
    if (!isOwner && !hasPermission(user.role, "profiles:delete")) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    await prisma.profile.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/profiles/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

function calculateCompleteness(
  profile: { firstName: string; lastName: string; bio?: string | null; phone?: string | null; city?: string | null; photoUrl?: string | null; primaryProfessionId?: string | null },
  skills: unknown[],
  languages: unknown[]
): number {
  let score = 0;
  if (profile.firstName && profile.lastName) score += 20;
  if (profile.bio) score += 20;
  if (profile.phone) score += 10;
  if (profile.city) score += 10;
  if (profile.photoUrl) score += 15;
  if (profile.primaryProfessionId) score += 10;
  if (skills.length > 0) score += 10;
  if (languages.length > 0) score += 5;
  return Math.min(100, score);
}
