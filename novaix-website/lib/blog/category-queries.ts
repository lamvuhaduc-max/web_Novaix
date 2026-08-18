import { db } from "@/lib/db";
import { articleCategories, articles } from "@/lib/db/schema";
import { and, count, eq, isNull } from "drizzle-orm";

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

/**
 * Danh sách danh mục kèm số bài viết còn hiệu lực.
 *
 * Đặt ở module thường (KHÔNG "use server"): hàm này được cả trang công khai
 * /blog lẫn trang quản trị gọi. Nếu để trong file server action, nó sẽ thành
 * một endpoint HTTP ai cũng gọi được mà không qua kiểm quyền.
 */
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

  return rows.map((r) => ({ ...r, articleCount: Number(r.articleCount) }));
}
