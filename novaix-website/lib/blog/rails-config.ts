import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { DEFAULT_RAILS, HOME_RAILS_KEY, homeRailsSchema } from "@/lib/blog/schema";

export type RailConfig = z.infer<typeof homeRailsSchema>[number];

/**
 * Đọc cấu hình dải bài viết trang chủ.
 *
 * Đặt ở module thường (KHÔNG "use server") vì trang chủ công khai cũng dùng;
 * để trong file server action sẽ tạo ra endpoint HTTP không kiểm quyền.
 */
export async function getHomeRailsConfig(): Promise<RailConfig[]> {
  try {
    const rows = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, HOME_RAILS_KEY));

    if (rows.length === 0) return DEFAULT_RAILS;

    const parsed = homeRailsSchema.safeParse(rows[0].value);
    if (!parsed.success) {
      console.warn(
        "[blog] Cấu hình dải bài viết hỏng schema, trả về mặc định:",
        parsed.error.issues[0]
      );
      return DEFAULT_RAILS;
    }
    return parsed.data;
  } catch (err) {
    console.error("[blog] Đọc dải bài viết thất bại:", err);
    return DEFAULT_RAILS;
  }
}
