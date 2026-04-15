// Blog types — mirrors the Prisma schema
// These will also be available via @prisma/client after prisma generate

export type ArticleStatus = "DRAFT" | "PUBLISHED";

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  sortOrder: number;
  createdAt: Date;
}

export interface BlogArticleAuthor {
  id: string;
  profile: {
    firstName: string;
    lastName: string;
    slug: string;
    photoUrl?: string | null;
    bio?: string | null;
  } | null;
}

export interface BlogArticleListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverUrl: string | null;
  status: ArticleStatus;
  publishedAt: Date | null;
  readingTime: number | null;
  viewCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  author: BlogArticleAuthor;
  category: { id: string; name: string; slug: string; color: string | null } | null;
}

export interface BlogArticleFull extends BlogArticleListItem {
  content: string;
  authorId: string;
  categoryId: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}
