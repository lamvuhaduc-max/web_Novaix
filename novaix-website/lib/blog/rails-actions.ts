"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/session";
import { rethrowIfNextControlFlow } from "@/lib/next-errors";
import { writeLog } from "@/lib/blog/log";
import { homeRailsSchema, HOME_RAILS_KEY, type ActionResult } from "@/lib/blog/schema";

// Hàm đọc cấu hình nằm ở lib/blog/rails-config.ts — không đặt trong file
// "use server" này, vì mọi export ở đây đều trở thành endpoint HTTP công khai.

export async function saveHomeRailsConfig(input: unknown): Promise<ActionResult> {
  try {
    const actor = await requireUser();
    const data = homeRailsSchema.parse(input);

    await db
      .insert(siteSettings)
      .values({
        key: HOME_RAILS_KEY,
        value: data,
        updatedAt: new Date(),
        updatedBy: actor.id,
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value: data,
          updatedAt: new Date(),
          updatedBy: actor.id,
        },
      });

    await writeLog(actor, "settings.rails.update", "site_settings", HOME_RAILS_KEY);
    revalidatePath("/");
    revalidatePath("/admin/giao-dien");

    return { ok: true };
  } catch (err: any) {
    rethrowIfNextControlFlow(err);
    console.error("[blog] saveHomeRailsConfig thất bại:", err);
    return { ok: false, error: err.message || "Không thể lưu cấu hình dải bài viết." };
  }
}
