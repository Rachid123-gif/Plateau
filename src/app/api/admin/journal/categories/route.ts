import { NextRequest, NextResponse } from "next/server";
import { blogCategory } from "@/lib/prisma-blog";
import { requireAdminOrModerator } from "@/lib/auth";
import { categorySchema } from "@/lib/validations/journal";

export async function GET() {
  try {
    await requireAdminOrModerator();

    const categories = await blogCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { articles: true } } },
    });

    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminOrModerator();

    const body = await request.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const category = await blogCategory.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description ?? null,
        color: parsed.data.color ?? null,
        sortOrder: parsed.data.sortOrder,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
}
