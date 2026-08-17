import { Suspense } from "react";
import Image from "next/image";
import { redirect } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import LoginForm from "@/components/admin/LoginForm";
import { getSessionState } from "@/lib/auth/session";

export default async function AdminLoginPage() {
  const result = await getSessionState();
  if (result.state === "active") redirect("/admin");

  return (
    <Box
      className="admin-root"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        background:
          "radial-gradient(#d2f1df, #d3d7fa, #bad8f4) 0% 0% / 400% 400%",
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 440 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4.5 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, justifyContent: "center", mb: 3 }}>
            <Image src="/logo.png" alt="OAlpha" width={38} height={38} style={{ borderRadius: 9 }} />
            <Typography variant="h4" sx={{ letterSpacing: "-0.02em" }}>
              OAlpha <Box component="span" sx={{ color: "primary.main" }}>Admin</Box>
            </Typography>
          </Box>

          <Typography variant="h5" sx={{ mb: 0.5 }}>
            Đăng nhập hệ thống
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Khu vực dành riêng cho quản trị viên OAlpha.
          </Typography>

          <Suspense>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </Box>
  );
}
