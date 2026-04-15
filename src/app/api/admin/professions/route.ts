import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { z } from "zod";
import slugify from "slugify";

const createSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  nameAr: z.string().nullable().optional(),
  categoryId: z.string().min(1, "La catégorie est requise"),
  sortOrder: z.number().int().default(0),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (!hasPermission(user.role, "professions:manage")) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });
    }

    const { name, nameAr, categoryId, sortOrder } = parsed.data;
    const slug = slugify(name, { lower: true, strict: true });

    // Check for duplicate
    const existing = await prisma.profession.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Un métier avec ce nom existe déjà" }, { status: 409 });
    }

    const profession = await prisma.profession.create({
      data: { name, nameAr: nameAr ?? null, categoryId, sortOrder, slug },
    });

    return NextResponse.json({ profession }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/professions:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
