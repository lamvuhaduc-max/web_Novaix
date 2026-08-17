"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { articleCategories, articles } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/session";
import { writeLog } from "@/lib/blog/log";
import { saveCategorySchema, type ActionResult } from "@/lib/blog/schema";
import { eq, count, sql, isNull, and } from "drizzle-orm";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  visible: boolean;
  articleCount: number;
  createdAt: Date;
};

export async function listCategories(): Promise<CategoryRow[]> {
  const rows = await db
    .select({
      id: articleCategories.id,
      name: articleCategories.name,
      slug: articleCategories.slug,
      description: articleCategories.description,
      sortOrder: articleCategories.sortOrder,
      visible: articleCategories.visible,
      createdAt: articleCategories.createdAt,
      articleCount: count(articles.id),
    })
    .from(articleCategories)
    .leftJoin(
      articles,
      and(eq(articles.categoryId, articleCategories.id), isNull(articles.deletedAt))
    )
    .groupBy(articleCategories.id)
    .orderBy(articleCategories.sortOrder, articleCategories.name);

  return rows.map((r) => ({
    ...r,
    articleCount: Number(r.articleCount),
  }));
}

export async function saveCategory(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requireUser();
    const data = saveCategorySchema.parse(input);

    // Kiểm tra trùng slug
    const existing = await db
      .select()
      .from(articleCategories)
      .where(eq(articleCategories.slug, data.slug));

    if (existing.length > 0 && existing[0].id !== data.id) {
      return { ok: false, error: "Đường dẫn (slug) này đã được dùng cho danh mục khác." };
    }

    let catId = data.id;

    if (data.id) {
      await db
        .update(articleCategories)
        .set({
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          sortOrder: data.sortOrder,
          visible: data.visible,
        })
        .where(eq(articleCategories.id, data.id));

      await writeLog(actor, "category.update", "article_category", data.id);
    } else {
      const [inserted] = await db
        .insert(articleCategories)
        .values({
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          sortOrder: data.sortOrder,
          visible: data.visible,
        })
        .returning({ id: articleCategories.id });

      catId = inserted.id;
      await writeLog(actor, "category.create", "article_category", catId);
    }

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    revalidatePath("/");

    return { ok: true, data: { id: catId! } };
  } catch (err: any) {
    console.error("[blog] saveCategory thất bại:", err);
    return { ok: false, error: err.message || "Lỗi lưu danh mục bài viết." };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    const actor = await requireUser();

    // Đếm số bài viết thuộc danh mục này
    const articleRes = await db
      .select({ total: count(articles.id) })
      .from(articles)
      .where(eq(articles.categoryId, id));

    const totalArticles = Number(articleRes[0]?.total || 0);

    if (totalArticles > 0) {
      return {
        ok: false,
        error: `Danh mục này còn ${totalArticles} bài viết. Chuyển các bài sang danh mục khác trước khi xóa.`,
      };
    }

    await db.delete(articleCategories).where(eq(articleCategories.id, id));
    await writeLog(actor, "category.delete", "article_category", id);

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    revalidatePath("/");

    return { ok: true };
  } catch (err: any) {
    console.error("[blog] deleteCategory thất bại:", err);
    return { ok: false, error: err.message || "Không thể xóa danh mục bài viết." };
  }
}

export async function reorderCategories(
  orderedIds: string[]
): Promise<ActionResult> {
  try {
    const actor = await requireUser();

    for (let index = 0; index < orderedIds.length; index++) {
      await db
        .update(articleCategories)
        .set({ sortOrder: index + 1 })
        .where(eq(articleCategories.id, orderedIds[index]));
    }

    await writeLog(actor, "category.reorder", "article_category");

    revalidatePath("/admin/blog");
    revalidatePath("/blog");

    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: "Lỗi thay đổi thứ tự danh mục." };
  }
}
