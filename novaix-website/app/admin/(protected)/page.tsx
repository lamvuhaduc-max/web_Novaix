import Link from "next/link";
import { count, eq } from "drizzle-orm";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import PageHeader from "@/components/admin/PageHeader";
import { roleLabel, visibleGroups } from "@/lib/admin/menu";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await requireUser();
  const isSuperAdmin = user.role === "super_admin";

  const [members] = isSuperAdmin
    ? await db.select({ value: count() }).from(users).where(eq(users.status, "active"))
    : [{ value: 0 }];

  const shortcuts = visibleGroups(user.role)
    .flatMap((g) => g.items)
    .filter((i) => i.href !== "/admin");

  return (
    <>
      <PageHeader
        title={`Xin chào, ${user.name} 👋`}
        description="Đây là khu quản trị nội bộ của OAlpha."
      />

      <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, mb: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary">Vai trò của bạn</Typography>
            <Typography variant="h4" sx={{ mt: 0.5 }}>{roleLabel[user.role]}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {isSuperAdmin
                ? "Toàn quyền: nội dung và quản lý thành viên."
                : "Quyền nội dung: đăng bài và sửa chữ giao diện."}
            </Typography>
          </CardContent>
        </Card>

        {isSuperAdmin && (
          <Card>
            <CardContent>
              <Typography variant="body1" color="text.secondary">Thành viên hoạt động</Typography>
              <Typography variant="h4" sx={{ mt: 0.5 }}>{members.value}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Tài khoản đang được phép đăng nhập.
              </Typography>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary">Tài khoản</Typography>
            <Typography variant="h5" sx={{ mt: 0.5, wordBreak: "break-all" }}>{user.email}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Phiên đăng nhập hết hạn sau 8 giờ.
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Typography variant="h5" sx={{ mb: 1.5 }}>Lối tắt</Typography>
      <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" } }}>
        {shortcuts.map((item) => (
          <Card key={item.href}>
            <CardActionArea component={Link} href={item.href} sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                  <Typography variant="h6">{item.label}</Typography>
                  {item.comingSoon && (
                    <Chip label="Sắp có" size="small" sx={{ height: 20, fontSize: 10, bgcolor: "grey.100", color: "grey.400" }} />
                  )}
                </Box>
                <Typography variant="body1" color="text.secondary">
                  Mở trang {item.label.toLowerCase()}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </>
  );
}
