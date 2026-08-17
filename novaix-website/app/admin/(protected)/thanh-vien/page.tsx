import { redirect } from "next/navigation";
import MembersTable from "@/components/admin/MembersTable";
import { listMembers } from "@/lib/admin/users-actions";
import { requireUser } from "@/lib/auth/session";

export const metadata = { title: "Quản lý thành viên · OAlpha Admin" };
export const dynamic = "force-dynamic";

export default async function MembersPage() {
  // Vai trò lấy từ database chứ không từ token, nên hạ quyền có tác dụng ngay.
  const me = await requireUser();
  if (me.role !== "super_admin") redirect("/admin");

  const members = await listMembers();

  return <MembersTable members={members} currentUserId={me.id} />;
}
