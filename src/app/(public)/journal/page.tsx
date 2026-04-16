import Link from "next/link";
import Image from "next/image";
import {
  Newspaper,
  ArrowRight,
  Clock,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react/dist/ssr";
import { blogArticle, blogCategory } from "@/lib/prisma-blog";
import type { BlogArticleListItem, BlogCategory } from "@/types/blog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const metadata = {
  title: "Le Journal — Plateau",
  description:
    "Portraits, guides métiers, actualités et coulisses du cinéma marocain. La revue éditoriale de Plateau.",
};

export const revalidate = 120;

const PAGE_SIZE = 9;

type SearchParams = {
  category?: string;
  page?: string;
};

export default async function JournalPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const categorySlug = searchParams.category;
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));

  const where = {
    status: "PUBLISHED" as const,
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
  };

  const [categories, articles, total] = await Promise.all([
    blogCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    blogArticle.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        author: {
          select: {
            profile: {
              select: { firstName: true, lastName: true, slug: true },
            },
          },
        },
        category: { select: { id: true, name: true, slug: true, color: true } },
      },
    }),
    blogArticle.count({ where }),
  ]);

  const typedCategories = categories as BlogCategory[];
  const typedArticles = articles as BlogArticleListItem[];
  const typedTotal = total as number;

  const totalPages = Math.ceil(typedTotal / PAGE_SIZE);
  const featured = page === 1 && !categorySlug ? typedArticles[0] : null;
  const gridArticles = featured ? typedArticles.slice(1) : typedArticles;

  const buildHref = (p: number, cat?: string) => {
    const params = new URLSearchParams();
    if (cat) params.set("category", cat);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/journal${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="bg-zinc-950 text-zinc-50 min-h-screen">
      {/* ── HERO ── */}
      <section className="border-b border-zinc-800 pt-24 pb-20 px-6 lg:px-10">
        <div className="container mx-auto max-w-[1380px]">
          <p className="eyebrow mb-6">// Le Journal — MMXXVI</p>
          <h1 className="text-display max-w-3xl">
            Regards sur le{" "}
            <span className="font-editorial text-amber-500">cinéma marocain.</span>
          </h1>
          <p className="mt-8 text-base text-zinc-300 leading-relaxed max-w-[54ch]">
            Portraits d&rsquo;artisans, guides pour les professionnels, actualités du secteur
            et coulisses des tournages. La revue éditoriale de Plateau.
          </p>
        </div>
      </section>

      {/* ── CATEGORY FILTER ── */}
      <section className="border-b border-zinc-800 py-4 px-6 lg:px-10 overflow-x-auto">
        <div className="container mx-auto max-w-[1380px]">
          <div className="flex items-center gap-2 flex-nowrap">
            <Link
              href="/journal"
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-mono uppercase tracking-widest transition-all whitespace-nowrap ${
                !categorySlug
                  ? "bg-amber-500 text-zinc-950"
                  : "border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-50"
              }`}
            >
              <Newspaper weight="bold" className="h-3.5 w-3.5" />
              Tous
            </Link>
            {typedCategories.map((cat: BlogCategory) => (
              <Link
                key={cat.id}
                href={buildHref(1, cat.slug)}
                className={`rounded-full px-4 py-2 text-xs font-mono uppercase tracking-widest transition-all whitespace-nowrap ${
                  categorySlug === cat.slug
                    ? "bg-amber-500 text-zinc-950"
                    : "border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-50"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-[1380px] px-6 lg:px-10 py-16">
        {typedArticles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Newspaper weight="thin" className="h-16 w-16 text-zinc-700" />
            <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
              Aucun article publié pour l&rsquo;instant
            </p>
          </div>
        )}

        {/* ── FEATURED ARTICLE ── */}
        {featured && (
          <Link
            href={`/journal/${featured.slug}`}
            className="group mb-16 block rounded-3xl border border-zinc-800 bg-zinc-900 overflow-hidden hover:border-amber-500 hover:bg-amber-500/5 transition-all duration-300"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative aspect-[16/9] lg:aspect-auto lg:min-h-[480px] bg-zinc-800 overflow-hidden">
                {featured.coverUrl ? (
                  <Image
                    src={featured.coverUrl}
                    alt={featured.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                    <Newspaper weight="thin" className="h-24 w-24 text-amber-500/30" />
                  </div>
                )}
              </div>
              <div className="p-10 lg:p-14 flex flex-col justify-center">
                {featured.category && (
                  <p className="eyebrow mb-4">{featured.category.name}</p>
                )}
                <h2 className="text-display-sm leading-[1.1] mb-4">{featured.title}</h2>
                {featured.excerpt && (
                  <p className="text-base text-zinc-300 leading-relaxed mb-8 max-w-[54ch]">
                    {featured.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 uppercase tracking-wider">
                  {featured.author.profile && (
                    <span>
                      {featured.author.profile.firstName} {featured.author.profile.lastName}
                    </span>
                  )}
                  {featured.publishedAt && (
                    <span>{format(new Date(featured.publishedAt), "d MMM yyyy", { locale: fr })}</span>
                  )}
                  {featured.readingTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {featured.readingTime} min
                    </span>
                  )}
                </div>
                <span className="mt-8 inline-flex items-center gap-2 text-sm text-amber-500 font-medium">
                  Lire l&rsquo;article
                  <ArrowRight weight="bold" className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* ── GRID ── */}
        {gridArticles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridArticles.map((article: BlogArticleListItem) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* ── PAGINATION ── */}
        {totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-3">
            {page > 1 && (
              <Link
                href={buildHref(page - 1, categorySlug)}
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
                href={buildHref(page + 1, categorySlug)}
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

function ArticleCard({ article }: { article: BlogArticleListItem }) {
  return (
    <Link
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
        {article.category && (
          <p className="eyebrow text-[0.7rem] mb-3">{article.category.name}</p>
        )}
        <h3 className="text-lg font-medium tracking-tight text-zinc-50 leading-snug mb-3 flex-1">
          {article.title}
        </h3>
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
  );
}
