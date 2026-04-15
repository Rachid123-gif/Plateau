import { requireAdminOrModerator } from "@/lib/auth";
import { blogCategory } from "@/lib/prisma-blog";
import type { BlogCategory } from "@/types/blog";
import { ArticleForm } from "../article-form";
import Link from "next/link";
import { CaretLeft } from "@phosphor-icons/react/dist/ssr";

export const metadata = { title: "Nouvel article — Administration" };

export default async function NewArticlePage() {
  await requireAdminOrModerator();

  const rawCats = await blogCategory.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });
  const categories = rawCats as unknown as Pick<BlogCategory, "id" | "name">[];

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
        <h1 className="text-xl font-semibold text-zinc-900">Nouvel article</h1>
        <p className="text-sm text-zinc-500 mt-1">Créez un article pour Le Journal Plateau.</p>
      </div>

      <ArticleForm categories={categories} />
    </div>
  );
}
