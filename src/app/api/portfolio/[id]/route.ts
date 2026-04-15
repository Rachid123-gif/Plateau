import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    // Verify ownership
    const existing = await prisma.portfolioItem.findFirst({
      where: { id, profileId: profile.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Élément introuvable" }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, type, url, thumbnailUrl, year, sortOrder } =
      body as {
        title?: string;
        description?: string;
        type?: string;
        url?: string;
        thumbnailUrl?: string;
        year?: number;
        sortOrder?: number;
      };

    const item = await prisma.portfolioItem.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type: type as never }),
        ...(url !== undefined && { url }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(year !== undefined && { year }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("PUT /api/portfolio/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    // Verify ownership
    const existing = await prisma.portfolioItem.findFirst({
      where: { id, profileId: profile.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Élément introuvable" }, { status: 404 });
    }

    await prisma.portfolioItem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/portfolio/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
