import { z } from "zod";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export const saveCategorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "Tên danh mục không được để trống").max(100),
  slug: z
    .string()
    .trim()
    .min(1, "Slug không được để trống")
    .regex(/^[a-z0-9-]+$/, "Slug chỉ chứa chữ cái thường, số và dấu gạch nối"),
  description: z.string().trim().optional(),
  sortOrder: z.number().int().default(0),
  visible: z.boolean().default(true),
});

export const saveArticleSchema = z.object({
  id: z.union([z.number(), z.string().transform(Number)]).optional(),
  title: z.string().trim().min(1, "Tiêu đề bài viết không được để trống").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Slug không được để trống")
    .regex(/^[a-z0-9-]+$/, "Slug chỉ chứa chữ cái thường, số và dấu gạch nối"),
  categoryId: z.string().uuid("Vui lòng chọn danh mục bài viết"),
  excerpt: z.string().trim().max(500, "Mô tả ngắn tối đa 500 ký tự").optional().nullable(),
  coverImage: z.string().trim().optional().nullable(),
  contentHtml: z.string().max(200000, "Nội dung bài viết vượt quá 200.000 ký tự"),
  status: z.enum(["draft", "published", "hidden"]).default("draft"),
});

export const listArticlesFilterSchema = z.object({
  query: z.string().trim().optional(),
  categoryId: z.string().uuid().optional(),
  status: z.enum(["all", "draft", "published", "hidden", "trash"]).default("all"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const railSchema = z.object({
  key: z.string().min(1).max(30),
  title: z.string().trim().min(1).max(60),
  visible: z.boolean(),
  source: z.enum(["category", "manual"]),
  categoryIds: z.array(z.string().uuid()).max(5).default([]),
  articleIds: z.array(z.string().uuid()).max(12).default([]),
  limit: z.number().int().min(1).max(12).default(6),
});

export const homeRailsSchema = z.array(railSchema).max(4);
export const HOME_RAILS_KEY = "home_article_rails";

export const DEFAULT_RAILS = [
  {
    key: "gioi_thieu",
    title: "Về OAlpha",
    visible: true,
    source: "category" as const,
    categoryIds: [],
    articleIds: [],
    limit: 6,
  },
  {
    key: "kien_thuc",
    title: "Kiến thức Chuyển đổi số",
    visible: true,
    source: "category" as const,
    categoryIds: [],
    articleIds: [],
    limit: 6,
  },
];
