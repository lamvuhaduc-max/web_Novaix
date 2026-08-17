"use server";

import { revalidatePath } from "next/cache";
import { and, asc, eq, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users, type User } from "@/lib/db/schema";

export type ActionResult = { ok: true } | { ok: false; error: string };

const BCRYPT_ROUNDS = 12;

/**
 * Mọi thao tác quản lý thành viên chỉ dành cho super_admin.
 * Vai trò đọc từ database, không tin vào role trong token.
 */
async function requireSuperAdmin() {
  const me = await requireUser();
  if (me.role !== "super_admin") throw new Error("Bạn không có quyền thực hiện thao tác này.");
  return me;
}

function fail(e: unknown): ActionResult {
  const message = e instanceof Error ? e.message : "Đã có lỗi xảy ra.";
  return { ok: false, error: message };
}

export type MemberRow = Omit<User, "passwordHash">;

export async function listMembers(): Promise<MemberRow[]> {
  await requireSuperAdmin();
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .orderBy(asc(users.createdAt));
}

const passwordRule = z
  .string()
  .min(8, "Mật khẩu phải từ 8 ký tự trở lên.")
  .max(72, "Mật khẩu tối đa 72 ký tự.");

const createSchema = z.object({
  name: z.string().trim().min(2, "Tên phải từ 2 ký tự."),
  email: z.string().trim().toLowerCase().email("Email không hợp lệ."),
  password: passwordRule,
  role: z.enum(["super_admin", "admin"]),
});

export async function createMember(input: unknown): Promise<ActionResult> {
  try {
    await requireSuperAdmin();
    const data = createSchema.parse(input);

    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, data.email)).limit(1);
    if (existing) return { ok: false, error: "Email này đã được sử dụng." };

    await db.insert(users).values({
      name: data.name,
      email: data.email,
      passwordHash: await bcrypt.hash(data.password, BCRYPT_ROUNDS),
      role: data.role,
    });

    revalidatePath("/admin/thanh-vien");
    return { ok: true };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, error: e.issues[0].message };
    return fail(e);
  }
}

const updateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(2, "Tên phải từ 2 ký tự."),
  email: z.string().trim().toLowerCase().email("Email không hợp lệ."),
  role: z.enum(["super_admin", "admin"]),
  status: z.enum(["active", "disabled"]),
});

export async function updateMember(input: unknown): Promise<ActionResult> {
  try {
    const me = await requireSuperAdmin();
    const data = updateSchema.parse(input);

    // Tự hạ quyền hoặc tự khóa tài khoản mình sẽ khiến không ai vào được hệ thống.
    if (data.id === me.id && data.role !== "super_admin") {
      return { ok: false, error: "Không thể tự hạ quyền tài khoản đang đăng nhập." };
    }
    if (data.id === me.id && data.status !== "active") {
      return { ok: false, error: "Không thể tự khóa tài khoản đang đăng nhập." };
    }

    const [taken] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, data.email), ne(users.id, data.id)))
      .limit(1);
    if (taken) return { ok: false, error: "Email này đã được sử dụng bởi thành viên khác." };

    if (data.role !== "super_admin" || data.status !== "active") {
      const guard = await ensureAnotherActiveSuperAdmin(data.id);
      if (guard) return guard;
    }

    await db
      .update(users)
      .set({ name: data.name, email: data.email, role: data.role, status: data.status, updatedAt: new Date() })
      .where(eq(users.id, data.id));

    revalidatePath("/admin/thanh-vien");
    return { ok: true };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, error: e.issues[0].message };
    return fail(e);
  }
}

const resetSchema = z.object({ id: z.string().uuid(), password: passwordRule });

export async function resetMemberPassword(input: unknown): Promise<ActionResult> {
  try {
    await requireSuperAdmin();
    const data = resetSchema.parse(input);

    await db
      .update(users)
      .set({ passwordHash: await bcrypt.hash(data.password, BCRYPT_ROUNDS), updatedAt: new Date() })
      .where(eq(users.id, data.id));

    revalidatePath("/admin/thanh-vien");
    return { ok: true };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, error: e.issues[0].message };
    return fail(e);
  }
}

export async function deleteMember(id: string): Promise<ActionResult> {
  try {
    const me = await requireSuperAdmin();
    if (id === me.id) return { ok: false, error: "Không thể xóa chính tài khoản đang đăng nhập." };

    const guard = await ensureAnotherActiveSuperAdmin(id);
    if (guard) return guard;

    await db.delete(users).where(eq(users.id, id));
    revalidatePath("/admin/thanh-vien");
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/**
 * Chặn thao tác làm biến mất super admin hoạt động cuối cùng.
 * Trả về lỗi nếu `excludeId` là super admin active duy nhất còn lại.
 */
async function ensureAnotherActiveSuperAdmin(excludeId: string): Promise<ActionResult | null> {
  const [target] = await db.select().from(users).where(eq(users.id, excludeId)).limit(1);
  if (!target || target.role !== "super_admin" || target.status !== "active") return null;

  const remaining = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.role, "super_admin"), eq(users.status, "active"), ne(users.id, excludeId)))
    .limit(1);

  if (remaining.length === 0) {
    return { ok: false, error: "Hệ thống phải còn ít nhất một Super Admin đang hoạt động." };
  }
  return null;
}
