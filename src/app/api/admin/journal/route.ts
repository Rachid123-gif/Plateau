import { NextRequest, NextResponse } from "next/server";
import { blogArticle } from "@/lib/prisma-blog";
import { requireAdminOrModerator } from "@/lib/auth";
import { articleSchema } from "@/lib/validations/journal";
import { calculateReadingTime } from "@/lib/reading-time";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdminOrModerator();
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

    const [articles, total] = await Promise.all([
      blogArticle.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              profile: { select: { firstName: true, lastName: true } },
            },
          },
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      blogArticle.count(),
    ]);

    void user;

    return NextResponse.json({ articles, total, page, totalPages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdminOrModerator();

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

    const article = await blogArticle.create({
      data: {
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt ?? null,
        content: data.content,
        coverUrl: data.coverUrl ?? null,
        status: data.status as "DRAFT" | "PUBLISHED",
        publishedAt: data.status === "PUBLISHED" ? (data.publishedAt ? new Date(data.publishedAt) : new Date()) : null,
        authorId: user.id,
        categoryId: data.categoryId ?? null,
        readingTime,
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
        tags: data.tags ?? [],
      },
    });

    return NextResponse.json({ article }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
}
