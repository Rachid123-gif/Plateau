import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { searchSchema } from "@/lib/validations/search";
import { profileSchema } from "@/lib/validations/profile";
import slugify from "slugify";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const parsed = searchSchema.safeParse(Object.fromEntries(searchParams));
    if (!parsed.success) {
      return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
    }

    const { query, profession, city, region, experienceLevel, availabilityStatus, page, limit, sortBy, verificationStatus } = parsed.data;

    const user = await getCurrentUser();
    const canSeeUnverified = user && hasPermission(user.role, "profiles:verify");

    const where: Record<string, unknown> = {
      isPublic: canSeeUnverified ? undefined : true,
      verificationStatus: canSeeUnverified
        ? verificationStatus ?? undefined
        : "VERIFIED",
    };

    // Remove undefined keys
    Object.keys(where).forEach((k) => where[k] === undefined && delete where[k]);

    if (profession) {
      where.primaryProfession = { slug: profession };
    }
    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }
    if (region) {
      where.region = region;
    }
    if (experienceLevel) {
      where.experienceLevel = experienceLevel;
    }
    if (availabilityStatus) {
      where.availabilityStatus = availabilityStatus;
    }
    if (query) {
      where.OR = [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { artistName: { contains: query, mode: "insensitive" } },
        { bio: { contains: query, mode: "insensitive" } },
      ];
    }

    const orderBy: Record<string, string> =
      sortBy === "name"
        ? { lastName: "asc" }
        : sortBy === "recent"
        ? { createdAt: "desc" }
        : sortBy === "views"
        ? { viewCount: "desc" }
        : { createdAt: "desc" };

    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          primaryProfession: true,
          skills: { include: { skill: { select: { id: true, name: true } } } },
          languages: { include: { language: { select: { id: true, name: true, code: true } } } },
        },
      }),
      prisma.profile.count({ where }),
    ]);

    return NextResponse.json({
      profiles,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/profiles:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (!hasPermission(user.role, "profiles:create")) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Check if profile already exists
    if (user.profile) {
      return NextResponse.json({ error: "Un profil existe déjà pour cet utilisateur" }, { status: 409 });
    }

    const body = await request.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const baseSlug = slugify(`${data.firstName} ${data.lastName}`, { lower: true, strict: true });
    const uniqueSlug = `${baseSlug}-${Date.now()}`;

    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        artistName: data.artistName ?? null,
        bio: data.bio ?? null,
        phone: data.phone ?? null,
        city: data.city ?? null,
        region: data.region ?? null,
        website: data.website ?? null,
        primaryProfessionId: data.primaryProfessionId ?? null,
        experienceLevel: data.experienceLevel,
        availabilityStatus: data.availabilityStatus,
        isPublic: data.isPublic,
        slug: uniqueSlug,
      },
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error("POST /api/profiles:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
