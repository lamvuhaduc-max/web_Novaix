"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/session";
import { writeLog } from "@/lib/blog/log";
import {
  homeRailsSchema,
  HOME_RAILS_KEY,
  DEFAULT_RAILS,
  type ActionResult,
} from "@/lib/blog/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export type RailConfig = z.infer<typeof homeRailsSchema>[number];

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

export async function saveHomeRailsConfig(
  input: unknown
): Promise<ActionResult> {
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
    console.error("[blog] saveHomeRailsConfig thất bại:", err);
    return { ok: false, error: err.message || "Không thể lưu cấu hình dải bài viết." };
  }
}
