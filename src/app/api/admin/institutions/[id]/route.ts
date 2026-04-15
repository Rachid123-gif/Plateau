import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { z } from "zod";

type RouteProps = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(["SCHOOL", "UNIVERSITY", "ORGANIZATION", "ASSOCIATION", "OTHER"]).optional(),
  city: z.string().nullable().optional(),
  website: z.string().url().nullable().optional().or(z.literal("")),
  logoUrl: z.string().url().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(request: NextRequest, props: RouteProps) {
  try {
    const { id } = await props.params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (!hasPermission(user.role, "institutions:manage")) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.website !== undefined) updateData.website = data.website || null;
    if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const institution = await prisma.institution.update({ where: { id }, data: updateData });
    return NextResponse.json({ institution });
  } catch (error) {
    console.error("PUT /api/admin/institutions/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, props: RouteProps) {
  try {
    const { id } = await props.params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    if (!hasPermission(user.role, "institutions:manage")) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    await prisma.institution.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/institutions/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
