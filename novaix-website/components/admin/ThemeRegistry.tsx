"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { adminTheme } from "@/lib/admin/theme";

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  // Không bật enableCssLayer: Tailwind v3 xuất CSS không nằm trong layer,
  // bật layer sẽ khiến preflight của Tailwind đè lên style của MUI.
  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <ThemeProvider theme={adminTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
