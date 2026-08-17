"use server";

import { rethrowIfNextControlFlow } from "@/lib/next-errors";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { articles, articleCategories, users, type ArticleStatus } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/session";
import { writeLog } from "@/lib/blog/log";
import { sanitizeArticleHtml, assertLocalImages } from "@/lib/blog/html";
import { extractToc } from "@/lib/blog/toc";
import {
  saveArticleSchema,
  listArticlesFilterSchema,
  type ActionResult,
} from "@/lib/blog/schema";
import { eq, and, isNull, isNotNull, ilike, or, gte, lte, desc, count, sql } from "drizzle-orm";

export type ArticleItemRow = {
  id: number;
  title: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  excerpt: string | null;
  coverImage: string | null;
  status: ArticleStatus;
  publishedAt: Date | null;
  authorName: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type ArticleListPage = {
  items: ArticleItemRow[];
  total: number;
  statusCounts: {
    all: number;
    published: number;
    draft: number;
    hidden: number;
    trash: number;
  };
  page: number;
  limit: number;
  totalPages: number;
};

export type ArticleEditModel = {
  id: number;
  title: string;
  slug: string;
  categoryId: string;
  excerpt: string | null;
  coverImage: string | null;
  contentHtml: string;
  status: ArticleStatus;
};

export async function listArticles(input: unknown): Promise<ArticleListPage> {
  await requireUser();

  const filter = listArticlesFilterSchema.parse(input);
  const offset = (filter.page - 1) * filter.limit;

  const conditions = [];

  // Xử lý bộ lọc trạng thái (trash vs normal)
  if (filter.status === "trash") {
    conditions.push(isNotNull(articles.deletedAt));
  } else {
    conditions.push(isNull(articles.deletedAt));
    if (filter.status !== "all") {
      conditions.push(eq(articles.status, filter.status));
    }
  }

  if (filter.categoryId) {
    conditions.push(eq(articles.categoryId, filter.categoryId));
  }

  if (filter.query) {
    // ilike thay cho like: LIKE của Postgres phân biệt hoa thường nên tìm "CRM"
    // sẽ không ra bài có chữ "crm". Escape % và _ để người dùng gõ chúng như
    // ký tự thường thay vì thành ký tự đại diện khớp mọi thứ.
    const escaped = filter.query.replace(/[\\%_]/g, (c) => `\\${c}`);
    const q = `%${escaped}%`;
    conditions.push(or(ilike(articles.title, q), ilike(articles.excerpt, q)));
  }

  if (filter.startDate) {
    const start = new Date(filter.startDate);
    start.setHours(0, 0, 0, 0);
    conditions.push(gte(sql`COALESCE(${articles.publishedAt}, ${articles.createdAt})`, start.toISOString()));
  }
  if (filter.endDate) {
    const end = new Date(filter.endDate);
    end.setHours(23, 59, 59, 999);
    conditions.push(lte(sql`COALESCE(${articles.publishedAt}, ${articles.createdAt})`, end.toISOString()));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalRes] = await db
    .select({ total: count(articles.id) })
    .from(articles)
    .where(whereClause);

  const total = Number(totalRes?.total || 0);

  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      categoryId: articles.categoryId,
      categoryName: articleCategories.name,
      excerpt: articles.excerpt,
      coverImage: articles.coverImage,
      status: articles.status,
      publishedAt: articles.publishedAt,
      authorName: users.name,
      createdAt: articles.createdAt,
      updatedAt: articles.updatedAt,
      deletedAt: articles.deletedAt,
    })
    .from(articles)
    .innerJoin(articleCategories, eq(articles.categoryId, articleCategories.id))
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(whereClause)
    .orderBy(desc(articles.createdAt))
    .limit(filter.limit)
    .offset(offset);

  const [countsRes] = await db
    .select({
      all: count(sql`CASE WHEN ${articles.deletedAt} IS NULL THEN 1 END`),
      published: count(sql`CASE WHEN ${articles.deletedAt} IS NULL AND ${articles.status} = 'published' THEN 1 END`),
      draft: count(sql`CASE WHEN ${articles.deletedAt} IS NULL AND ${articles.status} = 'draft' THEN 1 END`),
      hidden: count(sql`CASE WHEN ${articles.deletedAt} IS NULL AND ${articles.status} = 'hidden' THEN 1 END`),
      trash: count(sql`CASE WHEN ${articles.deletedAt} IS NOT NULL THEN 1 END`),
    })
    .from(articles);

  const statusCounts = {
    all: Number(countsRes?.all || 0),
    published: Number(countsRes?.published || 0),
    draft: Number(countsRes?.draft || 0),
    hidden: Number(countsRes?.hidden || 0),
    trash: Number(countsRes?.trash || 0),
  };

  return {
    items: rows,
    total,
    statusCounts,
    page: filter.page,
    limit: filter.limit,
    totalPages: Math.ceil(total / filter.limit) || 1,
  };
}

export async function getArticleForEdit(id: number | string): Promise<ArticleEditModel | null> {
  await requireUser();
  const numId = typeof id === "number" ? id : parseInt(id, 10);
  if (isNaN(numId)) return null;

  const [article] = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      categoryId: articles.categoryId,
      excerpt: articles.excerpt,
      coverImage: articles.coverImage,
      contentHtml: articles.contentHtml,
      status: articles.status,
    })
    .from(articles)
    .where(and(eq(articles.id, numId), isNull(articles.deletedAt)));

  if (!article) return null;
  return article;
}

function revalidateArticlePaths(slug: string, oldSlug?: string) {
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  if (oldSlug && oldSlug !== slug) {
    revalidatePath(`/blog/${oldSlug}`);
  }
  revalidatePath("/");
}

export async function saveArticle(
  input: unknown
): Promise<ActionResult<{ id: number; removedTags: string[] }>> {
  try {
    const actor = await requireUser();
    const data = saveArticleSchema.parse(input);

    // 1. Kiểm tra slug duy nhất
    const existingSlug = await db
      .select()
      .from(articles)
      .where(eq(articles.slug, data.slug));

    if (existingSlug.length > 0 && existingSlug[0].id !== data.id) {
      return { ok: false, error: "Đường dẫn (slug) này đã được dùng cho bài viết khác." };
    }

    // 2. Làm sạch HTML máy chủ
    const { html: cleanHtml, removedTags } = sanitizeArticleHtml(data.contentHtml);

    // 3. Kiểm tra host của các ảnh trong bài
    assertLocalImages(cleanHtml);

    // 4. Rút mục lục & gán ID neo cho H2/H3
    const { html: finalHtml, toc } = extractToc(cleanHtml);

    let articleId = data.id;
    let oldSlug: string | undefined = undefined;

    if (data.id) {
      // Lấy bài hiện tại để so sánh slug cũ
      const [current] = await db
        .select()
        .from(articles)
        .where(eq(articles.id, data.id));

      if (current) oldSlug = current.slug;

      await db
        .update(articles)
        .set({
          title: data.title,
          slug: data.slug,
          categoryId: data.categoryId,
          excerpt: data.excerpt || null,
          coverImage: data.coverImage || null,
          contentHtml: finalHtml,
          toc,
          status: data.status,
          updatedAt: new Date(),
          publishedAt:
            data.status === "published"
              ? sql`COALESCE(${articles.publishedAt}, now())`
              : articles.publishedAt,
        })
        .where(eq(articles.id, data.id));

      await writeLog(actor, "article.update", "article", String(data.id), { title: data.title });
    } else {
      const [inserted] = await db
        .insert(articles)
        .values({
          title: data.title,
          slug: data.slug,
          categoryId: data.categoryId,
          excerpt: data.excerpt || null,
          coverImage: data.coverImage || null,
          contentHtml: finalHtml,
          toc,
          status: data.status,
          authorId: actor.id,
          publishedAt: data.status === "published" ? new Date() : null,
        })
        .returning({ id: articles.id });

      articleId = inserted.id;
      await writeLog(actor, "article.create", "article", String(articleId), { title: data.title });
    }

    revalidateArticlePaths(data.slug, oldSlug);

    return { ok: true, data: { id: articleId!, removedTags } };
  } catch (err: any) {
    rethrowIfNextControlFlow(err);
    console.error("[blog] saveArticle thất bại:", err);
    return { ok: false, error: err.message || "Không thể lưu bài viết." };
  }
}

export async function setArticleStatus(
  id: number | string,
  newStatus: ArticleStatus
): Promise<ActionResult> {
  try {
    const actor = await requireUser();
    const numId = typeof id === "number" ? id : parseInt(id, 10);
    if (isNaN(numId)) return { ok: false, error: "ID bài viết không hợp lệ." };

    const [article] = await db.select().from(articles).where(eq(articles.id, numId));
    if (!article) return { ok: false, error: "Bài viết không tồn tại." };

    await db
      .update(articles)
      .set({
        status: newStatus,
        updatedAt: new Date(),
        publishedAt:
          newStatus === "published"
            ? sql`COALESCE(${articles.publishedAt}, now())`
            : article.publishedAt,
      })
      .where(eq(articles.id, numId));

    const actionName =
      newStatus === "published"
        ? "article.publish"
        : newStatus === "hidden"
        ? "article.hide"
        : "article.draft";

    await writeLog(actor, actionName, "article", String(numId), { status: newStatus });
    revalidateArticlePaths(article.slug);

    return { ok: true };
  } catch (err: any) {
    rethrowIfNextControlFlow(err);
    return { ok: false, error: "Lỗi cập nhật trạng thái bài viết." };
  }
}

export async function softDeleteArticle(id: number | string): Promise<ActionResult> {
  try {
    const actor = await requireUser();
    const numId = typeof id === "number" ? id : parseInt(id, 10);
    if (isNaN(numId)) return { ok: false, error: "ID bài viết không hợp lệ." };

    const [article] = await db.select().from(articles).where(eq(articles.id, numId));
    if (!article) return { ok: false, error: "Bài viết không tồn tại." };

    await db
      .update(articles)
      .set({ deletedAt: new Date() })
      .where(eq(articles.id, numId));

    await writeLog(actor, "article.delete", "article", String(numId));
    revalidateArticlePaths(article.slug);

    return { ok: true };
  } catch (err: any) {
    rethrowIfNextControlFlow(err);
    return { ok: false, error: "Không thể chuyển bài viết vào thùng rác." };
  }
}

export async function restoreArticle(id: number | string): Promise<ActionResult> {
  try {
    const actor = await requireUser();
    const numId = typeof id === "number" ? id : parseInt(id, 10);
    if (isNaN(numId)) return { ok: false, error: "ID bài viết không hợp lệ." };

    const [article] = await db.select().from(articles).where(eq(articles.id, numId));
    if (!article) return { ok: false, error: "Bài viết không tồn tại." };

    // Khôi phục LUÔN về trạng thái draft để đảm bảo an toàn
    await db
      .update(articles)
      .set({ deletedAt: null, status: "draft" })
      .where(eq(articles.id, numId));

    await writeLog(actor, "article.restore", "article", String(numId));
    revalidateArticlePaths(article.slug);

    return { ok: true };
  } catch (err: any) {
    rethrowIfNextControlFlow(err);
    return { ok: false, error: "Không thể khôi phục bài viết." };
  }
}

export async function hardDeleteArticle(id: number | string): Promise<ActionResult> {
  try {
    const actor = await requireUser();
    const numId = typeof id === "number" ? id : parseInt(id, 10);
    if (isNaN(numId)) return { ok: false, error: "ID bài viết không hợp lệ." };

    // Chỉ super_admin mới được xóa vĩnh viễn
    if (actor.role !== "super_admin") {
      return { ok: false, error: "Chỉ Super Admin mới có quyền xóa vĩnh viễn dữ liệu." };
    }

    await db.delete(articles).where(eq(articles.id, numId));
    await writeLog(actor, "article.hard_delete", "article", String(numId));

    revalidatePath("/admin/blog");
    return { ok: true };
  } catch (err: any) {
    rethrowIfNextControlFlow(err);
    return { ok: false, error: "Không thể xóa vĩnh viễn bài viết." };
  }
}
