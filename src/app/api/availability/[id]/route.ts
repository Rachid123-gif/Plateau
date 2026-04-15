import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type RouteProps = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, props: RouteProps) {
  try {
    const { id } = await props.params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const slot = await prisma.availabilitySlot.findUnique({ where: { id } });
    if (!slot) {
      return NextResponse.json({ error: "Créneau introuvable" }, { status: 404 });
    }

    // Only the owner or admin can delete
    const isOwner = user.profile?.id === slot.profileId;
    const isAdmin = user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    await prisma.availabilitySlot.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/availability/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
