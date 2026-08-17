/**
 * Tạo tài khoản Super Admin đầu tiên. Chạy: npm run db:seed
 * Nếu email đã tồn tại, script chỉ cập nhật lại mật khẩu và nâng quyền super_admin.
 */
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { closeDb, db } from "../lib/db";
import { users } from "../lib/db/schema";

async function main() {
  const name = process.env.SEED_ADMIN_NAME?.trim();
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error("Thiếu SEED_ADMIN_NAME / SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD trong .env");
  }
  if (password.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD phải từ 8 ký tự trở lên.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);

  if (existing) {
    await db
      .update(users)
      .set({ name, passwordHash, role: "super_admin", status: "active", updatedAt: new Date() })
      .where(eq(users.id, existing.id));
    console.log(`✔ Đã cập nhật super admin: ${email}`);
  } else {
    await db.insert(users).values({ name, email, passwordHash, role: "super_admin" });
    console.log(`✔ Đã tạo super admin: ${email}`);
  }
}

main()
  .then(() => closeDb())
  .catch(async (e) => {
    console.error("✖", e instanceof Error ? e.message : e);
    await closeDb();
    process.exit(1);
  });
