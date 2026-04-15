import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  type: z.enum(["SCHOOL", "UNIVERSITY", "ORGANIZATION", "ASSOCIATION", "OTHER"]),
  city: z.string().nullable().optional(),
  website: z.string().url().nullable().optional().or(z.literal("")),
  logoUrl: z.string().url().nullable().optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (!hasPermission(user.role, "institutions:manage") && !hasPermission(user.role, "admin:access")) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const institutions = await prisma.institution.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ institutions });
  } catch (error) {
    console.error("GET /api/admin/institutions:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (!hasPermission(user.role, "institutions:manage")) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });
    }

    const { name, type, city, website, logoUrl } = parsed.data;

    const existing = await prisma.institution.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: "Une institution avec ce nom existe déjà" }, { status: 409 });
    }

    const institution = await prisma.institution.create({
      data: {
        name,
        type,
        city: city ?? null,
        website: website || null,
        logoUrl: logoUrl ?? null,
      },
    });

    return NextResponse.json({ institution }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/institutions:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
