import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { z } from "zod";

type RouteProps = { params: Promise<{ id: string }> };

const verifySchema = z.object({
  action: z.enum(["verify", "reject"]),
  comment: z.string().max(500).optional(),
});

export async function POST(request: NextRequest, props: RouteProps) {
  try {
    const { id } = await props.params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (!hasPermission(user.role, "profiles:verify")) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const profile = await prisma.profile.findUnique({ where: { id } });
    if (!profile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const newStatus = parsed.data.action === "verify" ? "VERIFIED" : "REJECTED";

    const [updatedProfile] = await prisma.$transaction([
      prisma.profile.update({
        where: { id },
        data: { verificationStatus: newStatus },
      }),
      prisma.adminReview.create({
        data: {
          profileId: id,
          reviewerId: user.id,
          status: newStatus,
          comment: parsed.data.comment ?? null,
        },
      }),
      prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: parsed.data.action === "verify" ? "PROFILE_VERIFIED" : "PROFILE_REJECTED",
          entity: "Profile",
          entityId: id,
          details: { comment: parsed.data.comment },
        },
      }),
      // Notify the profile owner
      prisma.notification.create({
        data: {
          userId: profile.userId,
          type: parsed.data.action === "verify" ? "PROFILE_VERIFIED" : "PROFILE_REJECTED",
          title:
            parsed.data.action === "verify"
              ? "Profil vérifié !"
              : "Profil non validé",
          message:
            parsed.data.action === "verify"
              ? "Votre profil a été vérifié et est maintenant visible dans l'annuaire."
              : "Votre profil n'a pas été validé. Contactez l'équipe CCM pour plus d'informations.",
          link: "/dashboard/profil",
        },
      }),
    ]);

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error("POST /api/admin/profiles/[id]/verify:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
