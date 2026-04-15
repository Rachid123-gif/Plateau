import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { blogArticle } from "@/lib/prisma-blog";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://plateau.ma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, profiles] = await Promise.all([
    blogArticle.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.profile.findMany({
      where: { isPublic: true, verificationStatus: "VERIFIED" },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/annuaire`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/journal`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const articleRoutes: MetadataRoute.Sitemap = (articles as { slug: string; updatedAt: Date }[]).map((a) => ({
    url: `${BASE_URL}/journal/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const profileRoutes: MetadataRoute.Sitemap = profiles.map((p) => ({
    url: `${BASE_URL}/profil/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...articleRoutes, ...profileRoutes];
}
