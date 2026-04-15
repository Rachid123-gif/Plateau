import { NextRequest, NextResponse } from "next/server";
import { blogArticle } from "@/lib/prisma-blog";
import type { BlogArticleFull } from "@/types/blog";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await props.params;
    const user = await getCurrentUser();
    const isAdmin = user?.role === "ADMIN" || user?.role === "MODERATOR";

    const article = (await blogArticle.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                slug: true,
                photoUrl: true,
                bio: true,
              },
            },
          },
        },
        category: {
          select: { id: true, name: true, slug: true, color: true },
        },
      },
    })) as BlogArticleFull | null;

    if (!article) {
      return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
    }

    if (article.status === "DRAFT" && !isAdmin) {
      return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
    }

    // Increment view count fire-and-forget
    blogArticle
      .update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } })
      .catch(() => {});

    return NextResponse.json({ article });
  } catch (error) {
    console.error("GET /api/journal/[slug]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
