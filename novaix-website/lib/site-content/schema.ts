import { z } from "zod";
import { HEX_COLOR } from "./color";

const text = (max: number) => z.string().trim().max(max);
const required = (max: number, label: string) =>
  z.string().trim().min(1, `${label} không được để trống.`).max(max, `${label} tối đa ${max} ký tự.`);

/**
 * Màu được ghép thẳng vào khối <style> của trang chủ, nên phải chặn ngay từ schema:
 * một chuỗi như "red; } * { display: none" sẽ thoát khỏi khai báo và phá vỡ
 * toàn bộ CSS trang công khai. Chỉ chấp nhận đúng mã hex.
 */
const hexColor = (fallback: string) =>
  z
    .string()
    .trim()
    .regex(HEX_COLOR, "Màu phải ở dạng mã hex, ví dụ #2dd4bf.")
    .default(fallback);

export const themeSchema = z.object({
  primary: hexColor("#2dd4bf"),
  primaryDark: hexColor("#0d9488"),
  accent: hexColor("#38bdf8"),
  textColor: hexColor("#eef2fb"),
  textMuted: hexColor("#9aa6c4"),
  bgColor: hexColor("#070b16"),
  borderRadius: z.number().int().min(0).max(32).default(12),
});

export const navItemSchema = z.object({
  href: z.string().trim().max(100),
  label: required(40, "Nhãn menu"),
  visible: z.boolean().default(true),
});

export const navSchema = z.object({
  brandName: required(40, "Tên thương hiệu"),
  items: z.array(navItemSchema).min(1, "Cần ít nhất 1 mục menu").max(12, "Tối đa 12 mục menu"),
  ctaLabel: required(30, "Nhãn nút CTA"),
});

export const statItemSchema = z.object({
  target: z.number().int().min(0).max(1_000_000),
  suffix: text(6),
  label: required(30, "Nhãn số liệu"),
});

export const heroSchema = z.object({
  kicker: required(60, "Dòng nhãn"),
  titleLead: required(60, "Tiêu đề (phần đầu)"),
  titleHighlight: required(40, "Tiêu đề (phần nhấn)"),
  titleTail: text(60),
  desc: required(400, "Mô tả"),
  ctaPrimary: required(30, "Nút chính"),
  ctaSecondary: text(30),
  stats: z.array(statItemSchema).min(2, "Cần ít nhất 2 số liệu").max(6, "Tối đa 6 số liệu"),
});

export const marqueeSchema = z.object({
  enabled: z.boolean().default(true),
  label: text(60).default("Phù hợp với mọi lĩnh vực kinh doanh"),
  items: z.array(required(80, "Mẫu tin")).min(1, "Cần ít nhất 1 mẫu tin").max(20, "Tối đa 20 mẫu tin"),
  bgColor: hexColor("#0b1120"),
  textColor: hexColor("#5f6c8a"),
  labelBgColor: hexColor("#2dd4bf"),
  labelTextColor: hexColor("#04121a"),
  speed: z.number().int().min(5).max(120).default(30),
  gap: z.number().int().min(20).max(400).default(160),
  link: text(200).default(""),
});

export const aboutValueSchema = z.object({
  icon: required(10, "Icon"),
  title: required(40, "Tiêu đề"),
  desc: required(200, "Mô tả"),
});

export const aboutTimelineSchema = z.object({
  year: required(50, "Thời gian"),
  title: required(60, "Tiêu đề"),
  desc: required(200, "Mô tả"),
  label: required(10, "Nhãn mốc"),
});

export const aboutSchema = z.object({
  kicker: required(60, "Dòng nhãn"),
  title: required(120, "Tiêu đề"),
  desc: required(500, "Mô tả"),
  values: z.array(aboutValueSchema).min(1, "Cần ít nhất 1 giá trị").max(6, "Tối đa 6 giá trị"),
  timeline: z.array(aboutTimelineSchema).min(1, "Cần ít nhất 1 mốc timeline").max(8, "Tối đa 8 mốc timeline"),
});

export const sectionHeadSchema = z.object({
  kicker: required(60, "Dòng nhãn"),
  title: required(120, "Tiêu đề"),
  desc: text(400),
});

export const moduleItemSchema = z.object({
  icon: required(10, "Icon"),
  title: required(60, "Tên module"),
  desc: required(250, "Mô tả module"),
  tag: required(40, "Nhãn phân loại"),
});

export const featureItemSchema = z.object({
  n: z.number().int().min(1).max(20),
  title: required(60, "Tiêu đề"),
  desc: required(250, "Mô tả"),
});

export const stepItemSchema = z.object({
  n: required(20, "Số bước"),
  title: required(60, "Tên bước"),
  desc: required(250, "Mô tả"),
});

export const segmentItemSchema = z.object({
  icon: required(10, "Icon"),
  title: required(60, "Đối tượng"),
  desc: required(250, "Mô tả"),
  items: z.array(required(80, "Đặc điểm")).min(1, "Cần ít nhất 1 đặc điểm").max(6, "Tối đa 6 đặc điểm"),
});

export const tierFeatureSchema = z.object({
  text: required(100, "Tính năng"),
  na: z.boolean().optional(),
});

export const tierSchema = z.object({
  label: required(30, "Nhãn gói"),
  name: required(40, "Tên gói"),
  price: required(30, "Giá"),
  sub: required(100, "Mô tả phụ"),
  popular: z.boolean().default(false),
  cta: required(30, "Nút CTA"),
  ctaClass: text(40).default("btn btn-ghost"),
  features: z.array(tierFeatureSchema).min(1, "Cần ít nhất 1 tính năng").max(20, "Tối đa 20 tính năng"),
});

export const quoteSchema = z.object({
  initials: required(6, "Chữ cái đầu"),
  quote: required(350, "Lời chứng"),
  name: required(50, "Tên khách hàng"),
  role: required(80, "Chức danh"),
});

export const qaSchema = z.object({
  q: required(150, "Câu hỏi"),
  a: required(600, "Câu trả lời"),
});

export const contactItemSchema = z.object({
  icon: required(10, "Icon"),
  label: required(30, "Nhãn"),
  value: required(150, "Giá trị"),
});

export const ctaFormFieldSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  label: required(60, "Nhãn trường"),
  type: z.enum(["text", "email", "tel", "select", "textarea"]).default("text"),
  placeholder: text(150).default(""),
  required: z.boolean().default(false),
  options: z.array(z.string()).default([]),
  width: z.enum(["half", "full"]).default("full"),
});

export const ctaSchema = z.object({
  kicker: required(60, "Dòng nhãn"),
  title: required(120, "Tiêu đề"),
  desc: required(350, "Mô tả"),
  contacts: z.array(contactItemSchema).min(1, "Cần ít nhất 1 thông tin liên hệ").max(8),
  commitmentsTitle: required(60, "Tiêu đề cam kết"),
  commitments: z.array(required(150, "Cam kết")).min(1, "Cần ít nhất 1 cam kết").max(10),
  formTitle: required(60, "Tiêu đề form"),
  formSuccessTitle: required(60, "Tiêu đề thành công"),
  formSuccessDesc: required(200, "Mô tả thành công"),
  buttonText: required(40, "Nút gửi form"),
  formFields: z.array(ctaFormFieldSchema).min(1, "Cần ít nhất 1 trường form").max(20).default([
    { id: "name", label: "Họ và tên", type: "text", placeholder: "Nguyễn Văn A", required: true, width: "half", options: [] },
    { id: "phone", label: "Số điện thoại", type: "tel", placeholder: "0901 234 567", required: true, width: "half", options: [] },
    { id: "email", label: "Email", type: "email", placeholder: "email@congty.vn", required: true, width: "half", options: [] },
    { id: "company", label: "Tên công ty", type: "text", placeholder: "Công ty TNHH ABC", required: false, width: "half", options: [] },
    {
      id: "size",
      label: "Quy môi doanh nghiệp",
      type: "select",
      placeholder: "Chọn quy mô...",
      required: false,
      width: "full",
      options: ["Dưới 20 nhân viên", "20 – 100 nhân viên", "100 – 500 nhân viên", "Trên 500 nhân viên"],
    },
    {
      id: "module",
      label: "Module quan tâm",
      type: "select",
      placeholder: "Chọn giải pháp...",
      required: false,
      width: "full",
      options: [
        "CRM — Quản lý khách hàng",
        "ERP — Hoạch định nguồn lực",
        "Kho & Chuỗi cung ứng",
        "Kế toán & Tài chính",
        "HRM — Nhân sự & Lương",
        "Trọn bộ giải pháp",
      ],
    },
    { id: "note", label: "Mô tả nhu cầu", type: "textarea", placeholder: "Mô tả ngắn gọn về quy trình và vấn đề bạn đang gặp phải...", required: false, width: "full", options: [] },
  ]),
});


export const footerLinkItemSchema = z.object({
  label: required(60, "Nhãn liên kết"),
  href: text(150),
});

export const footerColumnSchema = z.object({
  title: required(60, "Tiêu đề cột"),
  links: z.array(footerLinkItemSchema).min(1, "Cần ít nhất 1 liên kết").max(10, "Tối đa 10 liên kết"),
});

export const footerSchema = z.object({
  bgColor: hexColor("#0b1120"),
  textColor: hexColor("#9aa6c4"),
  brandDesc: text(300).default("Giải pháp công nghệ giúp doanh nghiệp Việt hệ thống hóa quy trình và vận hành bằng dữ liệu."),
  columns: z.array(footerColumnSchema).min(1, "Cần ít nhất 1 cột").max(6, "Tối đa 6 cột").default([
    {
      title: "Sản phẩm",
      links: [
        { label: "CRM", href: "#modules" },
        { label: "ERP", href: "#modules" },
        { label: "HRM", href: "#modules" },
        { label: "Kế toán", href: "#modules" },
        { label: "BI & Báo cáo", href: "#modules" },
      ],
    },
    {
      title: "Công ty",
      links: [
        { label: "Giải pháp", href: "#giai-phap" },
        { label: "Quy trình", href: "#quy-trinh" },
        { label: "Khách hàng", href: "#khach-hang" },
        { label: "Liên hệ", href: "#lien-he" },
      ],
    },
  ]),
  copyright: required(150, "Dòng bản quyền").default("© 2026 OAlpha. Mọi quyền được bảo lưu."),
  bottomLinks: z.array(footerLinkItemSchema).max(10).default([
    { label: "Chính sách bảo mật", href: "#" },
    { label: "Điều khoản", href: "#" },
  ]),
});


export const homeContentSchema = z.object({
  v: z.literal(1),
  theme: themeSchema.default({
    primary: "#2dd4bf",
    primaryDark: "#0d9488",
    accent: "#38bdf8",
    textColor: "#eef2fb",
    textMuted: "#9aa6c4",
    bgColor: "#070b16",
    borderRadius: 12,
  }),
  nav: navSchema,
  hero: heroSchema,
  marquee: marqueeSchema,
  about: aboutSchema,
  modules: sectionHeadSchema.extend({ items: z.array(moduleItemSchema).min(3, "Cần ít nhất 3 module").max(16, "Tối đa 16 module") }),
  features: sectionHeadSchema.extend({ items: z.array(featureItemSchema).min(2, "Cần ít nhất 2 ưu điểm").max(8, "Tối đa 8 ưu điểm") }),
  process: sectionHeadSchema.extend({ items: z.array(stepItemSchema).min(3, "Cần ít nhất 3 bước").max(8, "Tối đa 8 bước") }),
  segments: sectionHeadSchema.extend({ items: z.array(segmentItemSchema).min(2, "Cần ít nhất 2 phân khúc").max(6, "Tối đa 6 phân khúc") }),
  pricing: sectionHeadSchema.extend({ tiers: z.array(tierSchema).min(1, "Cần ít nhất 1 gói giá").max(6, "Tối đa 6 gói giá") }),
  testimonials: sectionHeadSchema.extend({ items: z.array(quoteSchema).min(1, "Cần ít nhất 1 cảm nhận").max(9, "Tối đa 9 cảm nhận") }),
  faq: sectionHeadSchema.extend({ items: z.array(qaSchema).min(1, "Cần ít nhất 1 câu hỏi").max(20, "Tối đa 20 câu hỏi") }),
  cta: ctaSchema,
  footer: footerSchema,
});

export type HomeContent = z.infer<typeof homeContentSchema>;
export type ThemeContent = z.infer<typeof themeSchema>;
export type NavContent = z.infer<typeof navSchema>;
export type HeroContent = z.infer<typeof heroSchema>;
export type MarqueeContent = z.infer<typeof marqueeSchema>;
export type AboutContent = z.infer<typeof aboutSchema>;
export type ModulesContent = z.infer<typeof homeContentSchema>["modules"];
export type FeaturesContent = z.infer<typeof homeContentSchema>["features"];
export type ProcessContent = z.infer<typeof homeContentSchema>["process"];
export type SegmentsContent = z.infer<typeof homeContentSchema>["segments"];
export type PricingContent = z.infer<typeof homeContentSchema>["pricing"];
export type TestimonialsContent = z.infer<typeof homeContentSchema>["testimonials"];
export type FAQContent = z.infer<typeof homeContentSchema>["faq"];
export type CTAContent = z.infer<typeof ctaSchema>;
export type FooterContent = z.infer<typeof footerSchema>;
