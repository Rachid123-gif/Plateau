import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

type RouteProps = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  status: z.enum(["ACCEPTED", "DECLINED"]),
});

export async function PUT(request: NextRequest, props: RouteProps) {
  try {
    const { id } = await props.params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const contactRequest = await prisma.contactRequest.findUnique({ where: { id } });
    if (!contactRequest) {
      return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
    }

    // Only the receiver can accept/decline
    if (contactRequest.receiverId !== user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    if (contactRequest.status !== "PENDING") {
      return NextResponse.json({ error: "Cette demande a déjà été traitée" }, { status: 409 });
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const updated = await prisma.contactRequest.update({
      where: { id },
      data: {
        status: parsed.data.status,
        respondedAt: new Date(),
      },
    });

    // Notify the sender
    await prisma.notification.create({
      data: {
        userId: contactRequest.senderId,
        type: "CONTACT_RESPONSE",
        title:
          parsed.data.status === "ACCEPTED"
            ? "Demande de contact acceptée"
            : "Demande de contact refusée",
        message:
          parsed.data.status === "ACCEPTED"
            ? `Votre demande "${contactRequest.subject}" a été acceptée.`
            : `Votre demande "${contactRequest.subject}" a été refusée.`,
      },
    });

    return NextResponse.json({ contactRequest: updated });
  } catch (error) {
    console.error("PUT /api/contact-requests/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
