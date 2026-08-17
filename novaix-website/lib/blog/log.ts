import { db } from "@/lib/db";
import { activityLogs } from "@/lib/db/schema";
import type { SessionUser } from "@/lib/auth/session";

export async function writeLog(
  actor: SessionUser,
  action: string,
  entity: string,
  entityId?: string,
  meta: object = {}
) {
  try {
    await db.insert(activityLogs).values({
      actorId: actor.id,
      actorEmail: actor.email,
      action,
      entity,
      entityId: entityId || null,
      meta,
    });
  } catch (error) {
    console.error("[blog] Ghi log activity_logs thất bại:", error);
  }
}
