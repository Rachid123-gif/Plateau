import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/profiles/me - Get the current user's profile
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: {
        primaryProfession: true,
        professions: { include: { profession: true } },
        skills: { include: { skill: true } },
        languages: { include: { language: true } },
        availability: { orderBy: { startDate: "asc" } },
      },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("GET /api/profiles/me:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT /api/profiles/me - Update the current user's profile
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const { skills, languages, ...profileData } = body;

    // If no profile exists, create one
    const existingProfile = await prisma.profile.findUnique({ where: { userId: user.id } });

    if (!existingProfile) {
      // Need at minimum firstName and lastName
      if (!profileData.firstName || !profileData.lastName) {
        return NextResponse.json({ error: "Prénom et nom requis" }, { status: 400 });
      }
      const { default: slugify } = await import("slugify");
      const baseSlug = slugify(`${profileData.firstName} ${profileData.lastName}`, { lower: true, strict: true });
      const uniqueSlug = `${baseSlug}-${Date.now()}`;

      const created = await prisma.profile.create({
        data: {
          userId: user.id,
          slug: uniqueSlug,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          artistName: profileData.artistName ?? null,
          bio: profileData.bio ?? null,
          phone: profileData.phone ?? null,
          city: profileData.city ?? null,
          region: profileData.region ?? null,
          website: profileData.website ?? null,
          primaryProfessionId: profileData.primaryProfessionId || null,
          experienceLevel: profileData.experienceLevel ?? "JUNIOR",
          availabilityStatus: profileData.availabilityStatus ?? "AVAILABLE",
          isPublic: profileData.isPublic ?? true,
        },
      });
      return NextResponse.json({ profile: created }, { status: 201 });
    }

    const profileId = existingProfile.id;

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.profile.update({
        where: { id: profileId },
        data: {
          ...(profileData.firstName !== undefined && { firstName: profileData.firstName }),
          ...(profileData.lastName !== undefined && { lastName: profileData.lastName }),
          ...(profileData.artistName !== undefined && { artistName: profileData.artistName || null }),
          ...(profileData.bio !== undefined && { bio: profileData.bio || null }),
          ...(profileData.phone !== undefined && { phone: profileData.phone || null }),
          ...(profileData.city !== undefined && { city: profileData.city || null }),
          ...(profileData.region !== undefined && { region: profileData.region || null }),
          ...(profileData.website !== undefined && { website: profileData.website || null }),
          ...(profileData.primaryProfessionId !== undefined && { primaryProfessionId: profileData.primaryProfessionId || null }),
          ...(profileData.experienceLevel !== undefined && { experienceLevel: profileData.experienceLevel }),
          ...(profileData.availabilityStatus !== undefined && { availabilityStatus: profileData.availabilityStatus }),
          ...(profileData.isPublic !== undefined && { isPublic: profileData.isPublic }),
        },
      });

      if (Array.isArray(skills)) {
        await tx.profileSkill.deleteMany({ where: { profileId } });
        if (skills.length > 0) {
          await tx.profileSkill.createMany({
            data: skills.map((skillId: string) => ({ profileId, skillId })),
          });
        }
      }

      if (Array.isArray(languages)) {
        await tx.profileLanguage.deleteMany({ where: { profileId } });
        if (languages.length > 0) {
          await tx.profileLanguage.createMany({
            data: languages.map((l: { languageId: string; level: string }) => ({
              profileId,
              languageId: l.languageId,
              level: l.level as "NATIVE" | "FLUENT" | "CONVERSATIONAL" | "BASIC",
            })),
          });
        }
      }

      // Recalculate completeness
      const currentSkills = Array.isArray(skills)
        ? skills
        : await tx.profileSkill.findMany({ where: { profileId } });
      const currentLangs = Array.isArray(languages)
        ? languages
        : await tx.profileLanguage.findMany({ where: { profileId } });

      let score = 0;
      if (p.firstName && p.lastName) score += 20;
      if (p.bio) score += 20;
      if (p.phone) score += 10;
      if (p.city) score += 10;
      if (p.photoUrl) score += 15;
      if (p.primaryProfessionId) score += 10;
      if (currentSkills.length > 0) score += 10;
      if (currentLangs.length > 0) score += 5;

      return tx.profile.update({
        where: { id: profileId },
        data: { profileCompleteness: Math.min(100, score) },
      });
    });

    return NextResponse.json({ profile: updated });
  } catch (error) {
    console.error("PUT /api/profiles/me:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
