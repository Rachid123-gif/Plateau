import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { contactRequestSchema } from "@/lib/validations/profile";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Professionals see received requests, recruiters see sent requests
    const isRecruiter = user.role === "RECRUITER" || user.role === "INSTITUTION";

    const requests = await prisma.contactRequest.findMany({
      where: isRecruiter ? { senderId: user.id } : { receiverId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
          include: {
            profile: {
              select: {
                firstName: true,
                lastName: true,
                photoUrl: true,
                slug: true,
              },
            },
          },
        },
        receiver: {
          include: {
            profile: {
              select: {
                firstName: true,
                lastName: true,
                photoUrl: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("GET /api/contact-requests:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (!hasPermission(user.role, "contact:send")) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = contactRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });
    }

    const { receiverId, subject, message } = parsed.data;

    // Check receiver exists
    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) {
      return NextResponse.json({ error: "Destinataire introuvable" }, { status: 404 });
    }

    // Check for duplicate pending request
    const existing = await prisma.contactRequest.findFirst({
      where: { senderId: user.id, receiverId, status: "PENDING" },
    });
    if (existing) {
      return NextResponse.json({ error: "Une demande en attente existe déjà" }, { status: 409 });
    }

    const contactRequest = await prisma.contactRequest.create({
      data: { senderId: user.id, receiverId, subject, message },
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: "CONTACT_REQUEST",
        title: "Nouvelle demande de contact",
        message: `Vous avez reçu une demande de contact : ${subject}`,
        link: "/dashboard/demandes",
      },
    });

    return NextResponse.json({ contactRequest }, { status: 201 });
  } catch (error) {
    console.error("POST /api/contact-requests:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
