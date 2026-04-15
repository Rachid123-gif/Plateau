import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { availabilitySlotSchema } from "@/lib/validations/profile";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const profileId = searchParams.get("profileId");

    // If requesting own slots
    if (!profileId || profileId === user.profile?.id) {
      if (!user.profile) {
        return NextResponse.json({ slots: [] });
      }
      const slots = await prisma.availabilitySlot.findMany({
        where: { profileId: user.profile.id },
        orderBy: { startDate: "asc" },
      });
      return NextResponse.json({ slots });
    }

    // Requesting someone else's slots — requires permission
    if (!hasPermission(user.role, "profiles:read")) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const slots = await prisma.availabilitySlot.findMany({
      where: { profileId },
      orderBy: { startDate: "asc" },
    });
    return NextResponse.json({ slots });
  } catch (error) {
    console.error("GET /api/availability:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (!hasPermission(user.role, "availability:manage:own")) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    if (!user.profile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = availabilitySlotSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });
    }

    const { startDate, endDate, status, note } = parsed.data;

    const slot = await prisma.availabilitySlot.create({
      data: {
        profileId: user.profile.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status,
        note: note ?? null,
      },
    });

    return NextResponse.json({ slot }, { status: 201 });
  } catch (error) {
    console.error("POST /api/availability:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
