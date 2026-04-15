import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { blogArticle, blogCategory } from "@/lib/prisma-blog";
import type { BlogCategory } from "@/types/blog";
import { ArticleForm } from "../../article-form";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";

export const metadata = { title: "Modifier l'article — Administration" };

type ArticleData = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverUrl: string | null;
  status: string;
  categoryId: string | null;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
};

type Props = { params: Promise<{ id: string }> };

export default async function EditArticlePage(props: Props) {
  await requireAdmin();
  const { id } = await props.params;

  const [rawArticle, rawCats] = await Promise.all([
    blogArticle.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        coverUrl: true,
        status: true,
        categoryId: true,
        tags: true,
        seoTitle: true,
        seoDescription: true,
      },
    }),
    blogCategory.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  const article = rawArticle as ArticleData | null;
  const categories = rawCats as unknown as Pick<BlogCategory, "id" | "name">[];

  if (!article) notFound();

  const initialValues = {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt ?? "",
    content: article.content,
    coverUrl: article.coverUrl ?? "",
    categoryId: article.categoryId ?? "",
    tags: article.tags.join(", "),
    status: article.status as "DRAFT" | "PUBLISHED",
    seoTitle: article.seoTitle ?? "",
    seoDescription: article.seoDescription ?? "",
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href="/admin/journal"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-4"
        >
          <CaretLeft className="h-4 w-4" />
          Retour au journal
        </Link>
        <h1 className="text-xl font-semibold text-zinc-900">Modifier l&rsquo;article</h1>
        <p className="text-sm text-zinc-400 font-mono mt-1">{article.slug}</p>
      </div>

      <ArticleForm categories={categories} initialValues={initialValues} articleId={article.id} />
    </div>
  );
}
