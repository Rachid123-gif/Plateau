export const revalidate = 120;

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Newspaper, Clock, CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { blogArticle, blogCategory } from "@/lib/prisma-blog";
import type { BlogCategory, BlogArticleListItem } from "@/types/blog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> };

const PAGE_SIZE = 9;

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const cat = await blogCategory.findUnique({ where: { slug } }) as BlogCategory | null;
  if (!cat) return { title: "Catégorie introuvable" };
  return {
    title: `${cat.name} — Le Journal Plateau`,
    description: cat.description ?? `Articles de la catégorie ${cat.name} sur Le Journal Plateau.`,
  };
}

export default async function CategoryPage(props: Props) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));

  const category = await blogCategory.findUnique({ where: { slug } }) as BlogCategory | null;
  if (!category) notFound();

  const where = { status: "PUBLISHED" as const, categoryId: category.id };
  const [rawArticles, rawTotal] = await Promise.all([
    blogArticle.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        author: { select: { profile: { select: { firstName: true, lastName: true, slug: true } } } },
        category: { select: { name: true, slug: true } },
      },
    }),
    blogArticle.count({ where }),
  ]);
  const articles = rawArticles as BlogArticleListItem[];
  const total = rawTotal as number;

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const buildHref = (p: number) => {
    if (p <= 1) return `/journal/categorie/${slug}`;
    return `/journal/categorie/${slug}?page=${p}`;
  };

  return (
    <div className="bg-zinc-950 text-zinc-50 min-h-screen">
      {/* HERO */}
      <section className="border-b border-zinc-800 pt-24 pb-20 px-6 lg:px-10">
        <div className="container mx-auto max-w-[1380px]">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest hover:text-zinc-50 transition-colors mb-8"
          >
            <CaretLeft className="h-3 w-3" />
            Le Journal
          </Link>
          <p className="eyebrow mb-4">// Catégorie</p>
          <h1 className="text-display max-w-3xl">
            <span className="font-editorial text-amber-500">{category.name}</span>
          </h1>
          {category.description && (
            <p className="mt-6 text-base text-zinc-300 leading-relaxed max-w-[54ch]">
              {category.description}
            </p>
          )}
          <p className="mt-4 text-xs font-mono text-zinc-600 uppercase tracking-widest">
            {total} article{total !== 1 ? "s" : ""}
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-[1380px] px-6 lg:px-10 py-16">
        {articles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Newspaper weight="thin" className="h-16 w-16 text-zinc-700" />
            <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
              Aucun article dans cette catégorie
            </p>
          </div>
        )}

        {articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/journal/${article.slug}`}
                className="group flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden hover:border-amber-500 hover:bg-amber-500/5 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-[16/9] bg-zinc-800 overflow-hidden">
                  {article.coverUrl ? (
                    <Image
                      src={article.coverUrl}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-500/10 to-zinc-900">
                      <Newspaper weight="thin" className="h-14 w-14 text-amber-500/40" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col flex-1 p-6">
                  <p className="eyebrow text-[0.7rem] mb-3">{category.name}</p>
                  <h2 className="text-lg font-medium tracking-tight text-zinc-50 leading-snug mb-3 flex-1">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2 mb-4">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-600 uppercase tracking-wider mt-auto pt-4 border-t border-zinc-800">
                    {article.author.profile && (
                      <span>{article.author.profile.firstName} {article.author.profile.lastName}</span>
                    )}
                    {article.publishedAt && (
                      <span>{format(new Date(article.publishedAt), "d MMM", { locale: fr })}</span>
                    )}
                    {article.readingTime && (
                      <span className="flex items-center gap-1 ml-auto">
                        <Clock className="h-3 w-3" />
                        {article.readingTime} min
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-3">
            {page > 1 && (
              <Link
                href={buildHref(page - 1)}
                className="flex items-center gap-2 rounded-full border border-zinc-700 px-5 py-2.5 text-sm font-mono text-zinc-400 hover:border-zinc-500 hover:text-zinc-50 transition-colors"
              >
                <CaretLeft className="h-4 w-4" />
                Précédent
              </Link>
            )}
            <span className="text-xs font-mono text-zinc-600 uppercase tracking-widest">
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={buildHref(page + 1)}
                className="flex items-center gap-2 rounded-full border border-zinc-700 px-5 py-2.5 text-sm font-mono text-zinc-400 hover:border-zinc-500 hover:text-zinc-50 transition-colors"
              >
                Suivant
                <CaretRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
