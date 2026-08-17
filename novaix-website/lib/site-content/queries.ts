import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { resolveHomeContent } from "./merge";
import type { HomeContent } from "./schema";

export const HOME_CONTENT_KEY = "home_content";

/**
 * Đọc nội dung trang chủ từ database (dùng cho trang chủ SSR/ISR).
 * Nếu database chưa có dữ liệu hoặc lỗi kết nối, fallback về DEFAULT_HOME_CONTENT.
 */
export async function getHomeContent(): Promise<HomeContent> {
  try {
    const [row] = await db
      .select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, HOME_CONTENT_KEY))
      .limit(1);

    return resolveHomeContent(row?.value);
  } catch (error) {
    console.warn("[home-content] Lỗi khi truy vấn database, dùng bản mặc định:", error);
    return resolveHomeContent({});
  }
}
