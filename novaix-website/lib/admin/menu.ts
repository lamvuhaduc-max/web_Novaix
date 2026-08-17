import type { UserRole } from "@/lib/db/schema";

export type MenuItem = {
  label: string;
  href: string;
  /** Tên icon trong @tabler/icons-react, map ở components/admin/Sidebar.tsx */
  icon: "dashboard" | "layout" | "article" | "users";
  /** Vai trò được phép thấy mục này. Bỏ trống = mọi vai trò. */
  roles?: UserRole[];
  /** Chưa code, hiển thị nhãn "Sắp có". */
  comingSoon?: boolean;
};

export type MenuGroup = {
  caption: string;
  items: MenuItem[];
};

export const menuGroups: MenuGroup[] = [
  {
    caption: "Tổng quan",
    items: [{ label: "Bảng điều khiển", href: "/admin", icon: "dashboard" }],
  },
  {
    caption: "Nội dung",
    items: [
      { label: "Giao diện trang chủ", href: "/admin/giao-dien", icon: "layout" },
      { label: "Bài viết", href: "/admin/blog", icon: "article" },
    ],
  },
  {
    caption: "Hệ thống",
    items: [
      { label: "Quản lý thành viên", href: "/admin/thanh-vien", icon: "users", roles: ["super_admin"] },
    ],
  },
];

export function visibleGroups(role: UserRole): MenuGroup[] {
  return menuGroups
    .map((g) => ({ ...g, items: g.items.filter((i) => !i.roles || i.roles.includes(role)) }))
    .filter((g) => g.items.length > 0);
}

export const roleLabel: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
};
