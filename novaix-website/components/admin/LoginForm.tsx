"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

const REVOKED_NOTICES: Record<string, string> = {
  disabled: "Tài khoản của bạn đã bị khóa. Liên hệ Super Admin để được mở lại.",
  deleted: "Tài khoản của bạn không còn tồn tại trong hệ thống.",
};

export default function LoginForm() {
  const params = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Lý do bị đăng xuất, do /admin/logout truyền sang.
  const notice = REVOKED_NOTICES[params.get("reason") ?? ""];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", { email, password, redirect: false });

    if (res?.error) {
      setError("Email hoặc mật khẩu không đúng, hoặc tài khoản đã bị khóa.");
      setLoading(false);
      return;
    }

    // Điều hướng cứng để server render lại với cookie phiên vừa được cấp.
    window.location.href = safeCallbackUrl(params.get("callbackUrl"));
  }

  /** Chỉ chấp nhận đường dẫn nội bộ trong /admin, tránh open redirect. */
  function safeCallbackUrl(raw: string | null): string {
    if (!raw) return "/admin";
    try {
      const url = new URL(raw, window.location.origin);
      if (url.origin !== window.location.origin) return "/admin";
      return url.pathname.startsWith("/admin") ? url.pathname + url.search : "/admin";
    } catch {
      return "/admin";
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2.5}>
        {notice && !error && <Alert severity="warning">{notice}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        <Box>
          <Typography variant="subtitle1" sx={{ mb: 0.75 }}>
            Email
          </Typography>
          <TextField
            fullWidth
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@oalpha.vn"
            autoComplete="email"
            required
            autoFocus
          />
        </Box>

        <Box>
          <Typography variant="subtitle1" sx={{ mb: 0.75 }}>
            Mật khẩu
          </Typography>
          <TextField
            fullWidth
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((v) => !v)}
                    edge="end"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <IconEyeOff size={19} /> : <IconEye size={19} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
          {loading ? "Đang đăng nhập…" : "Đăng nhập"}
        </Button>

        <Typography variant="body2" color="text.secondary" align="center">
          Quên mật khẩu? Liên hệ Super Admin để được cấp lại.
        </Typography>
      </Stack>
    </Box>
  );
}
