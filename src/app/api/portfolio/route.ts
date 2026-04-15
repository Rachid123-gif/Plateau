import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ items: [] });
    }

    const items = await prisma.portfolioItem.findMany({
      where: { profileId: profile.id },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("GET /api/portfolio:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profil introuvable" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description, type, url, thumbnailUrl, year } = body as {
      title?: string;
      description?: string;
      type?: string;
      url?: string;
      thumbnailUrl?: string;
      year?: number;
    };

    if (!title || !type || !url) {
      return NextResponse.json(
        { error: "Titre, type et URL sont requis" },
        { status: 400 }
      );
    }

    // Get max sort order
    const last = await prisma.portfolioItem.findFirst({
      where: { profileId: profile.id },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const item = await prisma.portfolioItem.create({
      data: {
        profileId: profile.id,
        title,
        description: description ?? null,
        type: type as never,
        url,
        thumbnailUrl: thumbnailUrl ?? null,
        year: year ?? null,
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("POST /api/portfolio:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
