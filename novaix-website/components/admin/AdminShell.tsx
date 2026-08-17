"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { IconLogout, IconMenu2 } from "@tabler/icons-react";
import Sidebar, { SIDEBAR_WIDTH } from "./Sidebar";
import { roleLabel } from "@/lib/admin/menu";
import type { UserRole } from "@/lib/db/schema";

export type ShellUser = { name: string; email: string; role: UserRole };

export default function AdminShell({
  user,
  children,
}: {
  user: ShellUser;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <Box className="admin-root" sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Box component="nav" sx={{ width: { lg: SIDEBAR_WIDTH }, flexShrink: { lg: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", lg: "none" },
            "& .MuiDrawer-paper": { width: SIDEBAR_WIDTH, boxSizing: "border-box" },
          }}
        >
          <Sidebar role={user.role} onNavigate={() => setMobileOpen(false)} />
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", lg: "block" },
            "& .MuiDrawer-paper": {
              width: SIDEBAR_WIDTH,
              boxSizing: "border-box",
              borderRight: "1px solid",
              borderColor: "divider",
            },
          }}
        >
          <Sidebar role={user.role} />
        </Drawer>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <AppBar
          position="sticky"
          elevation={0}
          color="inherit"
          sx={{ bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider" }}
        >
          <Toolbar sx={{ gap: 1 }}>
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ display: { lg: "none" }, color: "grey.500" }}
              aria-label="Mở menu"
            >
              <IconMenu2 size={22} />
            </IconButton>

            <Box sx={{ flex: 1 }} />

            <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" }, mr: 0.5 }}>
              <Typography variant="subtitle1" sx={{ lineHeight: 1.3 }}>
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {roleLabel[user.role]}
              </Typography>
            </Box>

            <IconButton onClick={(e) => setAnchor(e.currentTarget)} aria-label="Tài khoản">
              <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.light", color: "primary.main", fontSize: 14, fontWeight: 600 }}>
                {initials || "?"}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchor}
              open={Boolean(anchor)}
              onClose={() => setAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{ paper: { sx: { minWidth: 220, mt: 1 } } }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle1">{user.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => signOut({ callbackUrl: "/admin/login" })} sx={{ py: 1.25 }}>
                <ListItemIcon>
                  <IconLogout size={19} />
                </ListItemIcon>
                <Typography variant="body1">Đăng xuất</Typography>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
