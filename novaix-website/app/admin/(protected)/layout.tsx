import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getSessionState } from "@/lib/auth/session";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const result = await getSessionState();

  // Middleware đã chặn ở tầng edge; ở đây đối chiếu thêm với database
  // để việc khóa tài khoản / đổi vai trò có hiệu lực ngay lập tức.
  if (result.state === "anonymous") redirect("/admin/login");
  if (result.state === "revoked") redirect(`/admin/logout?reason=${result.reason}`);

  return <AdminShell user={result.user}>{children}</AdminShell>;
}
