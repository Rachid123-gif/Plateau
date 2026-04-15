"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slug";

type Category = { id: string; name: string };

type FormValues = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverUrl: string;
  categoryId: string;
  tags: string;
  status: "DRAFT" | "PUBLISHED";
  seoTitle: string;
  seoDescription: string;
};

type Props = {
  categories: Category[];
  initialValues?: Partial<FormValues>;
  articleId?: string; // if present = edit mode
};

const EMPTY: FormValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverUrl: "",
  categoryId: "",
  tags: "",
  status: "DRAFT",
  seoTitle: "",
  seoDescription: "",
};

export function ArticleForm({ categories, initialValues, articleId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormValues>({ ...EMPTY, ...initialValues });
  const [slugManual, setSlugManual] = useState(!!articleId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug from title in create mode
  useEffect(() => {
    if (!slugManual && form.title) {
      setForm((prev) => ({ ...prev, slug: slugify(form.title) }));
    }
  }, [form.title, slugManual]);

  function set(field: keyof FormValues, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      slug: form.slug,
      title: form.title,
      excerpt: form.excerpt || null,
      content: form.content,
      coverUrl: form.coverUrl || null,
      status: form.status,
      publishedAt: form.status === "PUBLISHED" ? new Date().toISOString() : null,
      categoryId: form.categoryId || null,
      seoTitle: form.seoTitle || null,
      seoDescription: form.seoDescription || null,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      const url = articleId ? `/api/admin/journal/${articleId}` : "/api/admin/journal";
      const method = articleId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Erreur lors de la sauvegarde.");
        return;
      }

      router.push("/admin/journal");
      router.refresh();
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          Titre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          required
          maxLength={200}
          placeholder="Titre de l'article"
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          Slug <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) => {
            setSlugManual(true);
            set("slug", e.target.value);
          }}
          required
          maxLength={200}
          placeholder="url-de-larticle"
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 font-mono text-sm placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
        />
        <p className="mt-1 text-xs text-zinc-400">
          URL&nbsp;: /journal/{form.slug || "..."}
        </p>
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          Extrait <span className="text-zinc-400 font-normal">(max 300 caractères)</span>
        </label>
        <textarea
          value={form.excerpt}
          onChange={(e) => set("excerpt", e.target.value)}
          maxLength={300}
          rows={3}
          placeholder="Courte description affichée dans les listes et le SEO"
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
        />
        <p className="mt-1 text-xs text-zinc-400 text-right">{form.excerpt.length}/300</p>
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          Contenu <span className="text-red-500">*</span>{" "}
          <span className="text-zinc-400 font-normal">(HTML)</span>
        </label>
        <textarea
          value={form.content}
          onChange={(e) => set("content", e.target.value)}
          required
          rows={20}
          placeholder={"<p>Contenu de l'article en HTML...</p>\n\n<h2>Sous-titre</h2>\n<p>...</p>\n\n<blockquote>Citation</blockquote>"}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-950 text-zinc-100 px-4 py-3 font-mono text-sm placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all resize-y h-96"
        />
        <p className="mt-1 text-xs text-zinc-400">
          Balises supportées : p, h2, h3, blockquote, ul, ol, li, strong, em, a
        </p>
      </div>

      {/* Cover URL */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          URL de l&rsquo;image de couverture
        </label>
        <input
          type="url"
          value={form.coverUrl}
          onChange={(e) => set("coverUrl", e.target.value)}
          placeholder="https://..."
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
        />
      </div>

      {/* Category + Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">Catégorie</label>
          <select
            value={form.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
          >
            <option value="">— Aucune catégorie —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">Statut</label>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value as "DRAFT" | "PUBLISHED")}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
          >
            <option value="DRAFT">Brouillon</option>
            <option value="PUBLISHED">Publié</option>
          </select>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          Tags <span className="text-zinc-400 font-normal">(séparés par des virgules)</span>
        </label>
        <input
          type="text"
          value={form.tags}
          onChange={(e) => set("tags", e.target.value)}
          placeholder="cinéma, Maroc, portrait"
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
        />
      </div>

      {/* SEO */}
      <fieldset className="rounded-2xl border border-zinc-200 p-6 space-y-5">
        <legend className="px-2 text-sm font-semibold text-zinc-700">SEO</legend>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            Titre SEO <span className="text-zinc-400 font-normal">(max 70 car.)</span>
          </label>
          <input
            type="text"
            value={form.seoTitle}
            onChange={(e) => set("seoTitle", e.target.value)}
            maxLength={70}
            placeholder={form.title}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
          />
          <p className="mt-1 text-xs text-zinc-400 text-right">{form.seoTitle.length}/70</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            Description SEO <span className="text-zinc-400 font-normal">(max 160 car.)</span>
          </label>
          <textarea
            value={form.seoDescription}
            onChange={(e) => set("seoDescription", e.target.value)}
            maxLength={160}
            rows={3}
            placeholder={form.excerpt}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
          />
          <p className="mt-1 text-xs text-zinc-400 text-right">{form.seoDescription.length}/160</p>
        </div>
      </fieldset>

      {/* Submit */}
      <div className="flex items-center gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 px-6 py-3 font-semibold transition-colors disabled:opacity-60"
        >
          {loading ? "Sauvegarde..." : articleId ? "Mettre à jour" : "Créer l'article"}
        </button>
        <a
          href="/admin/journal"
          className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          Annuler
        </a>
      </div>
    </form>
  );
}
