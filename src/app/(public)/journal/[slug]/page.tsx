export const revalidate = 300;

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  Clock,
  CaretLeft,
  Newspaper,
  User,
} from "@phosphor-icons/react/dist/ssr";
import { blogArticle } from "@/lib/prisma-blog";
import type { BlogArticleFull, BlogArticleListItem } from "@/types/blog";
import { getCurrentUser } from "@/lib/auth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const article = await blogArticle.findUnique({
    where: { slug },
    select: {
      title: true,
      excerpt: true,
      seoTitle: true,
      seoDescription: true,
      coverUrl: true,
    },
  }) as { title: string; excerpt: string | null; seoTitle: string | null; seoDescription: string | null; coverUrl: string | null } | null;

  if (!article) return { title: "Article introuvable" };

  const title = article.seoTitle ?? article.title;
  const description = article.seoDescription ?? article.excerpt ?? "";

  return {
    title: `${title} — Le Journal Plateau`,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      ...(article.coverUrl ? { images: [{ url: article.coverUrl }] } : {}),
    },
  };
}

export default async function ArticlePage(props: Props) {
  const { slug } = await props.params;

  const [rawArticle, user] = await Promise.all([
    blogArticle.findUnique({
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
        category: { select: { id: true, name: true, slug: true } },
      },
    }) as Promise<BlogArticleFull | null>,
    getCurrentUser(),
  ]);

  const article = rawArticle;
  const isAdmin = user?.role === "ADMIN" || user?.role === "MODERATOR";

  if (!article || (article.status === "DRAFT" && !isAdmin)) {
    notFound();
  }

  // Fire-and-forget view count increment
  blogArticle
    .update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  // Related articles
  const related = await blogArticle.findMany({
    where: {
      status: "PUBLISHED",
      categoryId: article.categoryId ?? undefined,
      id: { not: article.id },
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
    include: {
      author: {
        select: { profile: { select: { firstName: true, lastName: true } } },
      },
      category: { select: { name: true, slug: true } },
    },
  }) as BlogArticleListItem[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt ?? "",
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: article.author.profile
      ? {
          "@type": "Person",
          name: `${article.author.profile.firstName} ${article.author.profile.lastName}`,
        }
      : undefined,
    image: article.coverUrl ?? undefined,
    publisher: {
      "@type": "Organization",
      name: "Plateau",
    },
  };

  return (
    <div className="bg-zinc-950 text-zinc-50 min-h-screen">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ARTICLE HERO */}
      <section className="pt-20 pb-12 px-6 lg:px-10 border-b border-zinc-800">
        <div className="container mx-auto max-w-[860px]">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest hover:text-zinc-50 transition-colors mb-10"
          >
            <CaretLeft className="h-3 w-3" />
            Le Journal
          </Link>

          {article.category && (
            <p className="eyebrow mb-5">{article.category.name}</p>
          )}

          <h1 className="text-display leading-[1.05] mb-6">{article.title}</h1>

          {article.excerpt && (
            <p className="text-lg text-zinc-300 leading-relaxed mb-8 max-w-[58ch]">
              {article.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-500 uppercase tracking-wider">
            {article.author.profile && (
              <span className="flex items-center gap-2 rounded-full border border-zinc-800 px-3 py-1.5">
                <User className="h-3 w-3" />
                {article.author.profile.firstName} {article.author.profile.lastName}
              </span>
            )}
            {article.publishedAt && (
              <span>{format(new Date(article.publishedAt), "d MMMM yyyy", { locale: fr })}</span>
            )}
            {article.readingTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {article.readingTime} min de lecture
              </span>
            )}
          </div>
        </div>
      </section>

      {/* COVER IMAGE */}
      {article.coverUrl && (
        <div className="px-6 lg:px-10 py-10">
          <div className="container mx-auto max-w-[1100px]">
            <div className="relative aspect-[16/9] rounded-3xl overflow-hidden">
              <Image
                src={article.coverUrl}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 1200px) 100vw, 1100px"
                priority
              />
            </div>
          </div>
        </div>
      )}

      {/* ARTICLE CONTENT - content is admin-entered HTML, rendered directly */}
      <section className="px-6 lg:px-10 py-16">
        <div className="container mx-auto max-w-[68ch]">
          <ArticleBody html={article.content} />
        </div>
      </section>

      {/* TAGS */}
      {article.tags.length > 0 && (
        <div className="px-6 lg:px-10 pb-12">
          <div className="container mx-auto max-w-[68ch]">
            <div className="flex flex-wrap gap-2 pt-8 border-t border-zinc-800">
              {article.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-xs font-mono uppercase tracking-wider text-zinc-500 border border-zinc-800 rounded-full px-3 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AUTHOR BIO */}
      {article.author.profile && (
        <div className="px-6 lg:px-10 pb-16">
          <div className="container mx-auto max-w-[68ch]">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 flex items-start gap-5">
              <div className="relative h-14 w-14 rounded-full overflow-hidden shrink-0 bg-zinc-800">
                {article.author.profile.photoUrl ? (
                  <Image
                    src={article.author.profile.photoUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
                    <User className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-zinc-50">
                  {article.author.profile.firstName} {article.author.profile.lastName}
                </p>
                {article.author.profile.bio && (
                  <p className="mt-1 text-sm text-zinc-400 leading-relaxed line-clamp-2">
                    {article.author.profile.bio}
                  </p>
                )}
                {article.author.profile.slug && (
                  <Link
                    href={`/profil/${article.author.profile.slug}`}
                    className="mt-3 inline-block text-xs font-mono text-amber-500 uppercase tracking-widest hover:underline"
                  >
                    Voir le profil
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RELATED ARTICLES */}
      {related.length > 0 && (
        <section className="border-t border-zinc-800 px-6 lg:px-10 py-20">
          <div className="container mx-auto max-w-[1380px]">
            <p className="eyebrow mb-10">// Lire aussi</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((rel: BlogArticleListItem) => (
                <Link
                  key={rel.id}
                  href={`/journal/${rel.slug}`}
                  className="group flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden hover:border-amber-500 hover:bg-amber-500/5 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative aspect-[16/9] bg-zinc-800 overflow-hidden">
                    {rel.coverUrl ? (
                      <Image
                        src={rel.coverUrl}
                        alt={rel.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-500/10 to-zinc-900">
                        <Newspaper weight="thin" className="h-10 w-10 text-amber-500/40" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    {rel.category && (
                      <p className="eyebrow text-[0.7rem] mb-2">{rel.category.name}</p>
                    )}
                    <h3 className="text-base font-medium tracking-tight text-zinc-50 leading-snug flex-1">
                      {rel.title}
                    </h3>
                    <div className="mt-4 flex items-center gap-3 text-[11px] font-mono text-zinc-600 uppercase tracking-wider">
                      {rel.author.profile && (
                        <span>{rel.author.profile.firstName} {rel.author.profile.lastName}</span>
                      )}
                      {rel.readingTime && (
                        <span className="flex items-center gap-1 ml-auto">
                          <Clock className="h-3 w-3" />
                          {rel.readingTime} min
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// Separate component to isolate the HTML rendering
// Content is admin-controlled HTML only, not user-submitted input
function ArticleBody({ html }: { html: string }) {
  return (
    <div
      className="prose-plateau"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
