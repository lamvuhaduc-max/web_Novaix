import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { authConfig } from "./config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const email = parsed.data.email.trim().toLowerCase();
        const [found] = await db.select().from(users).where(eq(users.email, email)).limit(1);

        // So sánh kể cả khi không tìm thấy user để tránh lộ email nào tồn tại qua thời gian phản hồi.
        const hash = found?.passwordHash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva";
        const ok = await bcrypt.compare(parsed.data.password, hash);

        if (!found || !ok || found.status !== "active") return null;

        return {
          id: found.id,
          name: found.name,
          email: found.email,
          role: found.role,
        };
      },
    }),
  ],
});
