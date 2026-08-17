import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { auth } from "./index";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: (typeof users.role.enumValues)[number];
};

export type SessionState =
  | { state: "anonymous" }
  /** Cookie còn hợp lệ nhưng tài khoản đã bị khóa hoặc xóa khỏi database. */
  | { state: "revoked"; reason: "disabled" | "deleted" }
  | { state: "active"; user: SessionUser };

/**
 * Đối chiếu cookie phiên với dữ liệu thật trong database ở mỗi request.
 *
 * Cần thiết vì `role` và `status` được nhúng trong token lúc đăng nhập:
 * nếu chỉ đọc token, việc khóa tài khoản hay hạ quyền sẽ không có hiệu lực
 * cho tới khi token hết hạn. `cache()` gộp các lần gọi trong cùng một request
 * thành một truy vấn duy nhất.
 */
export const getSessionState = cache(async (): Promise<SessionState> => {
  const session = await auth();
  if (!session?.user?.id) return { state: "anonymous" };

  const [row] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!row) return { state: "revoked", reason: "deleted" };
  if (row.status !== "active") return { state: "revoked", reason: "disabled" };

  const { status: _status, ...user } = row;
  return { state: "active", user };
});

import { redirect } from "next/navigation";

/** Dùng trong server action / page: chuyển hướng hoặc ném lỗi nếu phiên không còn hợp lệ. */
export async function requireUser(): Promise<SessionUser> {
  const result = await getSessionState();
  if (result.state === "anonymous") {
    redirect("/admin/login");
  }
  if (result.state === "revoked") {
    redirect(`/admin/logout?reason=${result.reason}`);
  }
  return result.user;
}
