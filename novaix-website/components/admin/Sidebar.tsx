"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import {
  IconArticle,
  IconLayoutDashboard,
  IconLayoutGrid,
  IconUsers,
} from "@tabler/icons-react";
import { visibleGroups, type MenuItem } from "@/lib/admin/menu";
import type { UserRole } from "@/lib/db/schema";

export const SIDEBAR_WIDTH = 270;

const icons = {
  dashboard: IconLayoutDashboard,
  layout: IconLayoutGrid,
  article: IconArticle,
  users: IconUsers,
} as const;

function isActive(pathname: string, item: MenuItem) {
  if (item.href === "/admin") return pathname === "/admin";
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export default function Sidebar({ role, onNavigate }: { role: UserRole; onNavigate?: () => void }) {
  const pathname = usePathname();
  const groups = visibleGroups(role);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "background.paper" }}>
      <Box sx={{ px: 3, py: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Image src="/logo.png" alt="OAlpha" width={34} height={34} style={{ borderRadius: 8 }} />
        <Typography variant="h5" sx={{ letterSpacing: "-0.02em" }}>
          OAlpha <Box component="span" sx={{ color: "primary.main" }}>Admin</Box>
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", px: 2, pb: 3 }}>
        {groups.map((group) => (
          <Box key={group.caption} sx={{ mb: 1 }}>
            <Typography
              variant="body2"
              sx={{
                px: 1.5,
                pt: 2,
                pb: 0.5,
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "grey.400",
              }}
            >
              {group.caption}
            </Typography>

            <List disablePadding>
              {group.items.map((item) => {
                const Icon = icons[item.icon];
                const active = isActive(pathname, item);
                return (
                  <ListItemButton
                    key={item.href}
                    component={Link}
                    href={item.href}
                    onClick={onNavigate}
                    selected={active}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      py: 1,
                      color: "grey.500",
                      "&:hover": { bgcolor: "primary.light", color: "primary.main" },
                      "&.Mui-selected": {
                        bgcolor: "primary.main",
                        color: "#fff",
                        "&:hover": { bgcolor: "primary.main", color: "#fff" },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                      <Icon size={21} stroke={1.6} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 500 }}
                    />
                    {item.comingSoon && (
                      <Chip
                        label="Sắp có"
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: 10,
                          bgcolor: active ? "rgba(255,255,255,0.22)" : "grey.100",
                          color: active ? "#fff" : "grey.400",
                        }}
                      />
                    )}
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
