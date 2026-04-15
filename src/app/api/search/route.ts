import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { searchSchema } from "@/lib/validations/search";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const parsed = searchSchema.safeParse(Object.fromEntries(searchParams));
    if (!parsed.success) {
      return NextResponse.json({ error: "Paramètres invalides", details: parsed.error.flatten() }, { status: 400 });
    }

    const {
      query,
      profession,
      city,
      region,
      language,
      experienceLevel,
      availabilityStatus,
      institution,
      page,
      limit,
      sortBy,
    } = parsed.data;

    const user = await getCurrentUser();
    const canSearchFull = user && hasPermission(user.role, "search:full");
    const canSearch = user && hasPermission(user.role, "search:basic");

    if (!canSearch && !canSearchFull) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    // Build where clause
    const where: Record<string, unknown> = {
      isPublic: true,
      verificationStatus: canSearchFull ? undefined : "VERIFIED",
    };

    // Remove undefined
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
    if (language) {
      where.languages = {
        some: { language: { code: language } },
      };
    }
    if (institution) {
      where.education = {
        some: {
          OR: [
            { institution: { name: { contains: institution, mode: "insensitive" } } },
            { customInstitution: { contains: institution, mode: "insensitive" } },
          ],
        },
      };
    }

    // Full-text search with PostgreSQL
    if (query && query.trim()) {
      const terms = query.trim().split(/\s+/).filter(Boolean);
      where.OR = [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { artistName: { contains: query, mode: "insensitive" } },
        { bio: { contains: query, mode: "insensitive" } },
        { city: { contains: query, mode: "insensitive" } },
        { primaryProfession: { name: { contains: query, mode: "insensitive" } } },
        // Multi-word: search each term in firstName + lastName concatenation
        ...terms.flatMap((term) => [
          { firstName: { contains: term, mode: "insensitive" } },
          { lastName: { contains: term, mode: "insensitive" } },
        ]),
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
          languages: {
            include: { language: { select: { id: true, name: true, code: true } } },
          },
        },
      }),
      prisma.profile.count({ where }),
    ]);

    return NextResponse.json({
      profiles,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      query: query ?? null,
    });
  } catch (error) {
    console.error("GET /api/search:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
