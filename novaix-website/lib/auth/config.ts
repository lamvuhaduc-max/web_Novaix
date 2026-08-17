import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/lib/db/schema";

/**
 * Phần cấu hình chạy được trên Edge (middleware): không import db, không import bcrypt.
 * Provider Credentials được gắn thêm ở lib/auth/index.ts (chạy trên Node runtime).
 */
export const authConfig = {
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  // maxAge: hạn tối đa của một phiên. updateAge: cứ sau 1 giờ hoạt động thì
  // cookie được cấp lại và gia hạn — phiên "trượt" theo người dùng, thay cho refresh token.
  session: { strategy: "jwt", maxAge: 60 * 60 * 8, updateAge: 60 * 60 },
  trustHost: true,
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: UserRole }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (!pathname.startsWith("/admin")) return true;
      if (pathname === "/admin/login") return true;
      return Boolean(auth?.user);
    },
  },
  providers: [],
} satisfies NextAuthConfig;
