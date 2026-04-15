import Link from "next/link";
import { blogArticle } from "@/lib/prisma-blog";
import type { BlogArticleListItem } from "@/types/blog";
import { requireAdminOrModerator } from "@/lib/auth";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Newspaper, Plus, Eye } from "@phosphor-icons/react/dist/ssr";
import { DeleteArticleButton } from "./delete-button";

export const metadata = { title: "Journal — Administration" };
export const dynamic = "force-dynamic";

export default async function AdminJournalPage() {
  await requireAdminOrModerator();

  const rawArticles = await blogArticle.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { profile: { select: { firstName: true, lastName: true } } },
      },
      category: { select: { name: true } },
    },
  });
  const articles = rawArticles as BlogArticleListItem[];

  return (
    <div className="p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Newspaper weight="duotone" className="h-6 w-6 text-amber-500" />
            <h1 className="text-xl font-semibold text-zinc-900">Le Journal</h1>
          </div>
          <p className="text-sm text-zinc-500">{articles.length} article{articles.length !== 1 ? "s" : ""} au total</p>
        </div>
        <Link
          href="/admin/journal/nouveau"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 px-4 py-2.5 text-sm font-semibold transition-colors"
        >
          <Plus weight="bold" className="h-4 w-4" />
          Nouvel article
        </Link>
      </div>

      {articles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-400">
          <Newspaper weight="thin" className="h-12 w-12" />
          <p className="text-sm">Aucun article. Commencez par en créer un.</p>
        </div>
      )}

      {articles.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th className="text-left px-5 py-3.5 font-medium text-zinc-500 text-xs uppercase tracking-wider">Titre</th>
                <th className="text-left px-5 py-3.5 font-medium text-zinc-500 text-xs uppercase tracking-wider hidden md:table-cell">Catégorie</th>
                <th className="text-left px-5 py-3.5 font-medium text-zinc-500 text-xs uppercase tracking-wider">Statut</th>
                <th className="text-left px-5 py-3.5 font-medium text-zinc-500 text-xs uppercase tracking-wider hidden lg:table-cell">Auteur</th>
                <th className="text-left px-5 py-3.5 font-medium text-zinc-500 text-xs uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="text-left px-5 py-3.5 font-medium text-zinc-500 text-xs uppercase tracking-wider hidden xl:table-cell">
                  <Eye className="h-4 w-4" />
                </th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/journal/${article.id}/edit`}
                      className="font-medium text-zinc-900 hover:text-amber-600 transition-colors line-clamp-1"
                    >
                      {article.title}
                    </Link>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">{article.slug}</p>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-zinc-500">
                    {article.category?.name ?? <span className="text-zinc-300">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    {article.status === "PUBLISHED" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-600 px-2.5 py-1 text-xs font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Publié
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 text-amber-600 px-2.5 py-1 text-xs font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Brouillon
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell text-zinc-500">
                    {article.author.profile
                      ? `${article.author.profile.firstName} ${article.author.profile.lastName}`
                      : "—"}
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell text-zinc-400 text-xs font-mono">
                    {article.publishedAt
                      ? format(new Date(article.publishedAt), "d MMM yyyy", { locale: fr })
                      : "—"}
                  </td>
                  <td className="px-5 py-4 hidden xl:table-cell text-zinc-400 text-xs font-mono tabular-nums">
                    {article.viewCount}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/admin/journal/${article.id}/edit`}
                        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 transition-colors"
                      >
                        Modifier
                      </Link>
                      <DeleteArticleButton id={article.id} title={article.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
