"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { activityLogs, siteSettings, users } from "@/lib/db/schema";
import { DEFAULT_HOME_CONTENT } from "./defaults";
import { resolveHomeContent } from "./merge";
import { HOME_CONTENT_KEY } from "./queries";
import { homeContentSchema, type HomeContent } from "./schema";

const saveInputSchema = z.object({
  content: homeContentSchema,
  baseUpdatedAt: z.string().nullable().optional(),
});

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function diffSections(oldVal: unknown, newVal: HomeContent): string[] {
  if (!oldVal || typeof oldVal !== "object") {
    return Object.keys(newVal).filter((k) => k !== "v");
  }
  const oldObj = oldVal as Record<string, unknown>;
  const changed: string[] = [];
  for (const key of Object.keys(newVal)) {
    if (key === "v") continue;
    const oldSec = JSON.stringify(oldObj[key]);
    const newSec = JSON.stringify((newVal as unknown as Record<string, unknown>)[key]);
    if (oldSec !== newSec) {
      changed.push(key);
    }
  }
  return changed;
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Lấy nội dung trang chủ kèm mốc thời gian cập nhật gần nhất cho màn hình chỉnh sửa.
 */
export async function getHomeContentForEdit(): Promise<
  ActionResult<{
    content: HomeContent;
    updatedAt: string | null;
    updatedByName: string | null;
  }>
> {
  try {
    await requireUser();

    const [row] = await db
      .select({
        value: siteSettings.value,
        updatedAt: siteSettings.updatedAt,
        updatedBy: siteSettings.updatedBy,
        userName: users.name,
      })
      .from(siteSettings)
      .leftJoin(users, eq(siteSettings.updatedBy, users.id))
      .where(eq(siteSettings.key, HOME_CONTENT_KEY))
      .limit(1);

    const content = resolveHomeContent(row?.value);
    const updatedAt = row?.updatedAt ? row.updatedAt.toISOString() : null;
    const updatedByName = row?.userName || null;

    return {
      ok: true,
      data: {
        content,
        updatedAt,
        updatedByName,
      },
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Không thể tải nội dung trang chủ.";
    return { ok: false, error: msg };
  }
}

/**
 * Lưu nội dung trang chủ, kiểm soát xung đột mốc thời gian và ghi nhật ký hoạt động.
 */
export async function saveHomeContent(input: unknown): Promise<ActionResult<{ updatedAt: string }>> {
  try {
    const me = await requireUser();

    const parseResult = saveInputSchema.safeParse(input);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      return {
        ok: false,
        error: `Dữ liệu không hợp lệ: ${firstIssue?.message || "Vui lòng kiểm tra lại."}`,
      };
    }

    const { content, baseUpdatedAt } = parseResult.data;

    // Kiểm tra xung đột sửa đổi (Optimistic Concurrency Control)
    const [current] = await db
      .select({
        value: siteSettings.value,
        updatedAt: siteSettings.updatedAt,
      })
      .from(siteSettings)
      .where(eq(siteSettings.key, HOME_CONTENT_KEY))
      .limit(1);

    if (current && baseUpdatedAt) {
      const currentIso = current.updatedAt.toISOString();
      if (currentIso !== baseUpdatedAt) {
        return {
          ok: false,
          error: `Người khác vừa cập nhật nội dung lúc ${formatDate(current.updatedAt)}. Vui lòng tải lại để xem bản mới nhất trước khi lưu.`,
        };
      }
    }

    const changed = diffSections(current?.value, content);
    const now = new Date();

    // Lưu vào site_settings
    await db
      .insert(siteSettings)
      .values({
        key: HOME_CONTENT_KEY,
        value: content,
        updatedAt: now,
        updatedBy: me.id,
      })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: {
          value: content,
          updatedAt: now,
          updatedBy: me.id,
        },
      });

    // Ghi nhật ký hoạt động
    await db.insert(activityLogs).values({
      userId: me.id,
      action: "settings.home_content.update",
      entityType: "site_settings",
      entityId: HOME_CONTENT_KEY,
      meta: { changed },
      createdAt: now,
    });

    // Revalidate trang chủ ISR cache
    revalidatePath("/");

    return {
      ok: true,
      data: {
        updatedAt: now.toISOString(),
      },
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Đã xảy ra lỗi khi lưu nội dung.";
    return { ok: false, error: msg };
  }
}
