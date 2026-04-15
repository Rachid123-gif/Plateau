import { NextRequest, NextResponse } from "next/server";
import { blogArticle } from "@/lib/prisma-blog";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get("category") ?? undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));

    const where = {
      status: "PUBLISHED" as const,
      ...(category ? { category: { slug: category } } : {}),
    };

    const [articles, total] = await Promise.all([
      blogArticle.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              profile: {
                select: { firstName: true, lastName: true, slug: true, photoUrl: true },
              },
            },
          },
          category: {
            select: { id: true, name: true, slug: true, color: true },
          },
        },
      }),
      blogArticle.count({ where }),
    ]);

    return NextResponse.json({
      articles,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/journal:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
