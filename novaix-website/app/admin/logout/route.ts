import { signOut } from "@/lib/auth";

/**
 * Xóa cookie phiên rồi đưa về trang đăng nhập.
 * Route handler được phép ghi cookie, còn server component thì không —
 * nên layout phải chuyển hướng sang đây khi phát hiện phiên đã bị thu hồi.
 */
export async function GET(request: Request) {
  const reason = new URL(request.url).searchParams.get("reason");
  const target = reason ? `/admin/login?reason=${encodeURIComponent(reason)}` : "/admin/login";

  await signOut({ redirectTo: target });
}
