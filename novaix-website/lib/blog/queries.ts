import { db } from "@/lib/db";
import { articles, articleCategories } from "@/lib/db/schema";
import { getHomeRailsConfig } from "@/lib/blog/rails-actions";
import { extractToc, type TocItem } from "@/lib/blog/toc";
import { eq, and, isNull, inArray, desc, count, sql } from "drizzle-orm";

export type PublicArticleCard = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  publishedAt: Date | null;
};

export type PublicArticleDetail = {
  id: number;
  title: string;
  slug: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  excerpt: string | null;
  coverImage: string | null;
  contentHtml: string;
  toc: TocItem[];
  publishedAt: Date | null;
  updatedAt: Date;
};

/**
 * Điều kiện dùng chung cho bài viết được phép xuất hiện công khai:
 * 1. status = 'published'
 * 2. deleted_at IS NULL
 * 3. Danh mục đang visible = true
 */
const visibleArticleCondition = and(
  eq(articles.status, "published"),
  isNull(articles.deletedAt),
  eq(articleCategories.visible, true)
);

export async function getPublishedArticles(opts?: {
  categorySlug?: string;
  page?: number;
  limit?: number;
}): Promise<{
  items: PublicArticleCard[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const page = opts?.page || 1;
  const limit = opts?.limit || 9;
  const offset = (page - 1) * limit;

  const conditions = [visibleArticleCondition];

  if (opts?.categorySlug) {
    conditions.push(eq(articleCategories.slug, opts.categorySlug));
  }

  const whereClause = and(...conditions);

  const [totalRes] = await db
    .select({ total: count(articles.id) })
    .from(articles)
    .innerJoin(articleCategories, eq(articles.categoryId, articleCategories.id))
    .where(whereClause);

  const total = Number(totalRes?.total || 0);

  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      excerpt: articles.excerpt,
      coverImage: articles.coverImage,
      publishedAt: articles.publishedAt,
      categoryId: articleCategories.id,
      categoryName: articleCategories.name,
      categorySlug: articleCategories.slug,
    })
    .from(articles)
    .innerJoin(articleCategories, eq(articles.categoryId, articleCategories.id))
    .where(whereClause)
    .orderBy(desc(articles.publishedAt))
    .limit(limit)
    .offset(offset);

  const items: PublicArticleCard[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt,
    coverImage: r.coverImage,
    publishedAt: r.publishedAt,
    category: {
      id: r.categoryId,
      name: r.categoryName,
      slug: r.categorySlug,
    },
  }));

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export async function getArticleBySlug(slug: string): Promise<PublicArticleDetail | null> {
  const [row] = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      excerpt: articles.excerpt,
      coverImage: articles.coverImage,
      contentHtml: articles.contentHtml,
      toc: articles.toc,
      publishedAt: articles.publishedAt,
      updatedAt: articles.updatedAt,
      categoryId: articleCategories.id,
      categoryName: articleCategories.name,
      categorySlug: articleCategories.slug,
    })
    .from(articles)
    .innerJoin(articleCategories, eq(articles.categoryId, articleCategories.id))
    .where(and(eq(articles.slug, slug), visibleArticleCondition));

  if (!row) return null;

  const { html: finalContentHtml, toc: extractedToc } = extractToc(row.contentHtml);
  const dbToc = (row.toc as TocItem[]) || [];
  const finalToc = dbToc.length > 0 ? dbToc : extractedToc;

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    coverImage: row.coverImage,
    contentHtml: finalContentHtml,
    toc: finalToc,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    category: {
      id: row.categoryId,
      name: row.categoryName,
      slug: row.categorySlug,
    },
  };
}

export async function getRelatedArticles(
  articleId: number | string,
  categoryId: string
): Promise<PublicArticleCard[]> {
  // Lấy tối đa 4 bài cùng danh mục trước
  const sameCategoryRows = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      excerpt: articles.excerpt,
      coverImage: articles.coverImage,
      publishedAt: articles.publishedAt,
      categoryId: articleCategories.id,
      categoryName: articleCategories.name,
      categorySlug: articleCategories.slug,
    })
    .from(articles)
    .innerJoin(articleCategories, eq(articles.categoryId, articleCategories.id))
    .where(
      and(
        visibleArticleCondition,
        eq(articles.categoryId, categoryId),
        sql`${articles.id} != ${articleId}`
      )
    )
    .orderBy(desc(articles.publishedAt))
    .limit(4);

  const result: PublicArticleCard[] = sameCategoryRows.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt,
    coverImage: r.coverImage,
    publishedAt: r.publishedAt,
    category: {
      id: r.categoryId,
      name: r.categoryName,
      slug: r.categorySlug,
    },
  }));

  // Nếu chưa đủ 4 bài, bù bằng các bài mới nhất ở danh mục khác
  if (result.length < 4) {
    const existingIds = [articleId, ...result.map((r) => r.id)];
    const needed = 4 - result.length;

    const fallbackRows = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        excerpt: articles.excerpt,
        coverImage: articles.coverImage,
        publishedAt: articles.publishedAt,
        categoryId: articleCategories.id,
        categoryName: articleCategories.name,
        categorySlug: articleCategories.slug,
      })
      .from(articles)
      .innerJoin(articleCategories, eq(articles.categoryId, articleCategories.id))
      .where(
        and(
          visibleArticleCondition,
          sql`${articles.id} NOT IN (${sql.join(
            existingIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        )
      )
      .orderBy(desc(articles.publishedAt))
      .limit(needed);

    for (const r of fallbackRows) {
      result.push({
        id: r.id,
        title: r.title,
        slug: r.slug,
        excerpt: r.excerpt,
        coverImage: r.coverImage,
        publishedAt: r.publishedAt,
        category: {
          id: r.categoryId,
          name: r.categoryName,
          slug: r.categorySlug,
        },
      });
    }
  }

  return result;
}

export async function getHomeRails(): Promise<
  { title: string; articles: PublicArticleCard[] }[]
> {
  const railsConfig = await getHomeRailsConfig();
  const visibleRails = railsConfig.filter((r) => r.visible);

  const results = [];

  for (const rail of visibleRails) {
    let cards: PublicArticleCard[] = [];

    if (rail.source === "category") {
      const categoryCond =
        rail.categoryIds.length > 0
          ? inArray(articles.categoryId, rail.categoryIds)
          : undefined;

      const whereCond = categoryCond
        ? and(visibleArticleCondition, categoryCond)
        : visibleArticleCondition;

      const rows = await db
        .select({
          id: articles.id,
          title: articles.title,
          slug: articles.slug,
          excerpt: articles.excerpt,
          coverImage: articles.coverImage,
          publishedAt: articles.publishedAt,
          categoryId: articleCategories.id,
          categoryName: articleCategories.name,
          categorySlug: articleCategories.slug,
        })
        .from(articles)
        .innerJoin(articleCategories, eq(articles.categoryId, articleCategories.id))
        .where(whereCond)
        .orderBy(desc(articles.publishedAt))
        .limit(rail.limit || 6);

      cards = rows.map((r) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        excerpt: r.excerpt,
        coverImage: r.coverImage,
        publishedAt: r.publishedAt,
        category: {
          id: r.categoryId,
          name: r.categoryName,
          slug: r.categorySlug,
        },
      }));
    } else if (rail.source === "manual" && rail.articleIds.length > 0) {
      const numIds = rail.articleIds.map((id) => Number(id));
      const rows = await db
        .select({
          id: articles.id,
          title: articles.title,
          slug: articles.slug,
          excerpt: articles.excerpt,
          coverImage: articles.coverImage,
          publishedAt: articles.publishedAt,
          categoryId: articleCategories.id,
          categoryName: articleCategories.name,
          categorySlug: articleCategories.slug,
        })
        .from(articles)
        .innerJoin(articleCategories, eq(articles.categoryId, articleCategories.id))
        .where(
          and(
            visibleArticleCondition,
            numIds.length > 0 ? inArray(articles.id, numIds) : sql`1=0`
          )
        );

      // PostgreSQL WHERE IN không giữ thứ tự, phải sắp lại trong JS theo articleIds
      const map = new Map(rows.map((r) => [r.id, r]));
      const orderedRows = [];
      for (const id of rail.articleIds) {
        const item = map.get(Number(id));
        if (item) orderedRows.push(item);
      }

      cards = orderedRows.map((r) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        excerpt: r.excerpt,
        coverImage: r.coverImage,
        publishedAt: r.publishedAt,
        category: {
          id: r.categoryId,
          name: r.categoryName,
          slug: r.categorySlug,
        },
      }));
    }

    if (cards.length > 0) {
      results.push({
        title: rail.title,
        articles: cards,
      });
    }
  }

  return results;
}
