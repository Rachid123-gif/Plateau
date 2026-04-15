import { NextRequest, NextResponse } from "next/server";
import { blogArticle } from "@/lib/prisma-blog";
import { requireAdmin } from "@/lib/auth";
import { articleSchema } from "@/lib/validations/journal";
import { calculateReadingTime } from "@/lib/reading-time";

type Props = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, props: Props) {
  try {
    await requireAdmin();
    const { id } = await props.params;

    const article = await blogArticle.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, profile: { select: { firstName: true, lastName: true } } },
        },
        category: true,
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
}

export async function PUT(request: NextRequest, props: Props) {
  try {
    await requireAdmin();
    const { id } = await props.params;

    const body = await request.json();
    const parsed = articleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const readingTime = calculateReadingTime(data.content);

    const article = await blogArticle.update({
      where: { id },
      data: {
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt ?? null,
        content: data.content,
        coverUrl: data.coverUrl ?? null,
        status: data.status as "DRAFT" | "PUBLISHED",
        publishedAt:
          data.status === "PUBLISHED"
            ? data.publishedAt
              ? new Date(data.publishedAt)
              : new Date()
            : null,
        categoryId: data.categoryId ?? null,
        readingTime,
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
        tags: data.tags ?? [],
      },
    });

    return NextResponse.json({ article });
  } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
}

export async function DELETE(_request: NextRequest, props: Props) {
  try {
    await requireAdmin();
    const { id } = await props.params;

    await blogArticle.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
}
