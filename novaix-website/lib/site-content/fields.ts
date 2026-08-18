import type { SectionKey } from "./preview-bridge";

export type BaseField = {
  key: string;
  path: string;
  label: string;
  required?: boolean;
  helperText?: string;
};

export type TextField = BaseField & {
  type: "text" | "textarea";
  max?: number;
};

export type NumberField = BaseField & {
  type: "number";
  min?: number;
  max?: number;
};

export type SimpleFieldDef = TextField | NumberField;

export type ListFieldDef = BaseField & {
  type: "list";
  min: number;
  max: number;
  itemTitle: (item: any, index: number) => string;
  createEmpty: () => any;
  itemFields: SimpleFieldDef[];
};

export type FieldDef = SimpleFieldDef | ListFieldDef;

export type SectionConfig = {
  key: SectionKey;
  title: string;
  iconName: string;
  category: "GIAO DIỆN & MÀU SẮC" | "TRANG CHỦ" | "ĐIỀU HƯỚNG & LIÊN HỆ";
  fields: FieldDef[];
};

export function getAt(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur === null || cur === undefined) return undefined;
    cur = cur[p];
  }
  return cur;
}

export function setAt(obj: any, path: string, value: any): any {
  const parts = path.split(".");
  if (parts.length === 0) return obj;

  function setNested(current: any, index: number): any {
    if (index === parts.length - 1) {
      if (Array.isArray(current)) {
        const copy = [...current];
        copy[Number(parts[index])] = value;
        return copy;
      }
      return { ...current, [parts[index]]: value };
    }

    const key = parts[index];
    const nextVal = current ? current[key] : undefined;
    const isNextArray = !isNaN(Number(parts[index + 1]));
    const childContainer = nextVal !== undefined ? nextVal : isNextArray ? [] : {};

    if (Array.isArray(current)) {
      const copy = [...current];
      copy[Number(key)] = setNested(childContainer, index + 1);
      return copy;
    }

    return {
      ...current,
      [key]: setNested(childContainer, index + 1),
    };
  }

  return setNested(obj, 0);
}

export const SECTIONS_CONFIG: SectionConfig[] = [
  {
    key: "theme",
    title: "Màu sắc",
    iconName: "IconRocket",
    category: "GIAO DIỆN & MÀU SẮC",
    fields: [],
  },
  {
    key: "nav",
    title: "Menu ngang",
    iconName: "IconMenu2",
    category: "ĐIỀU HƯỚNG & LIÊN HỆ",
    fields: [],
  },
  {
    key: "marquee",
    title: "Thanh chữ chạy",
    iconName: "IconSpeakerphone",
    category: "ĐIỀU HƯỚNG & LIÊN HỆ",
    fields: [],
  },
  {
    key: "hero",
    title: "Hero (Đầu trang)",
    iconName: "IconBolt",
    category: "TRANG CHỦ",
    fields: [
      { key: "kicker", path: "hero.kicker", label: "Dòng nhãn trên", type: "text", max: 60, required: true },
      { key: "titleLead", path: "hero.titleLead", label: "Tiêu đề (phần đầu)", type: "text", max: 60, required: true },
      { key: "titleHighlight", path: "hero.titleHighlight", label: "Tiêu đề (phần nhấn gradient)", type: "text", max: 40, required: true },
      { key: "titleTail", path: "hero.titleTail", label: "Tiêu đề (phần đuôi)", type: "text", max: 60 },
      { key: "desc", path: "hero.desc", label: "Mô tả", type: "textarea", max: 400, required: true },
      { key: "ctaPrimary", path: "hero.ctaPrimary", label: "Nút chính", type: "text", max: 30, required: true },
      { key: "ctaSecondary", path: "hero.ctaSecondary", label: "Nút phụ", type: "text", max: 30 },
      {
        key: "stats",
        path: "hero.stats",
        label: "Khối số liệu thống kê",
        type: "list",
        min: 2,
        max: 6,
        itemTitle: (it) => `${it?.target || 0}${it?.suffix || ""} - ${it?.label || "Số liệu"}`,
        createEmpty: () => ({ target: 100, suffix: "+", label: "Khách hàng tin dùng" }),
        itemFields: [
          { key: "target", path: "target", label: "Số liệu", type: "number", min: 0, max: 1000000, required: true },
          { key: "suffix", path: "suffix", label: "Hậu tố (%, +, /7)", type: "text", max: 6 },
          { key: "label", path: "label", label: "Nhãn giải thích", type: "text", max: 30, required: true },
        ],
      },
    ],
  },
  {
    key: "about",

    title: "Về OAlpha (About)",
    iconName: "IconUsers",
    category: "TRANG CHỦ",
    fields: [
      { key: "kicker", path: "about.kicker", label: "Dòng nhãn", type: "text", max: 60, required: true },
      { key: "title", path: "about.title", label: "Tiêu đề", type: "text", max: 120, required: true },
      { key: "desc", path: "about.desc", label: "Mô tả", type: "textarea", max: 500, required: true },
      {
        key: "values",
        path: "about.values",
        label: "Giá trị cốt lõi (3 khối)",
        type: "list",
        min: 1,
        max: 6,
        itemTitle: (it) => `${it?.icon || "💎"} ${it?.title || "Giá trị"}`,
        createEmpty: () => ({ icon: "✨", title: "Giá trị mới", desc: "Mô tả giá trị" }),
        itemFields: [
          { key: "icon", path: "icon", label: "Icon / Emoji", type: "text", max: 10, required: true },
          { key: "title", path: "title", label: "Tiêu đề", type: "text", max: 40, required: true },
          { key: "desc", path: "desc", label: "Mô tả", type: "textarea", max: 200, required: true },
        ],
      },
      {
        key: "timeline",
        path: "about.timeline",
        label: "Lộ trình phát triển (Timeline)",
        type: "list",
        min: 1,
        max: 8,
        itemTitle: (it) => `${it?.year || "Năm"} - ${it?.title || "Mốc"}`,
        createEmpty: () => ({ year: "2026 · Phát triển", title: "Cột mốc mới", desc: "Mô tả cột mốc", label: "26" }),
        itemFields: [
          { key: "label", path: "label", label: "Badge 2 số (21, 22...)", type: "text", max: 10, required: true },
          { key: "year", path: "year", label: "Dòng thời gian", type: "text", max: 50, required: true },
          { key: "title", path: "title", label: "Tiêu đề mốc", type: "text", max: 60, required: true },
          { key: "desc", path: "desc", label: "Mô tả", type: "textarea", max: 200, required: true },
        ],
      },
    ],
  },
  {
    key: "modules",
    title: "Hệ sinh thái Module",
    iconName: "IconPackage",
    category: "TRANG CHỦ",
    fields: [
      { key: "kicker", path: "modules.kicker", label: "Dòng nhãn", type: "text", max: 60, required: true },
      { key: "title", path: "modules.title", label: "Tiêu đề", type: "text", max: 120, required: true },
      { key: "desc", path: "modules.desc", label: "Mô tả", type: "textarea", max: 400 },
      {
        key: "items",
        path: "modules.items",
        label: "Danh sách các Module",
        type: "list",
        min: 3,
        max: 16,
        itemTitle: (it) => `${it?.icon || "📦"} ${it?.title || "Module"}`,
        createEmpty: () => ({ icon: "⚡", title: "Tên module mới", desc: "Mô tả chức năng module", tag: "Phân loại" }),
        itemFields: [
          { key: "icon", path: "icon", label: "Icon / Emoji", type: "text", max: 10, required: true },
          { key: "title", path: "title", label: "Tên module", type: "text", max: 60, required: true },
          { key: "desc", path: "desc", label: "Mô tả chi tiết", type: "textarea", max: 250, required: true },
          { key: "tag", path: "tag", label: "Nhãn phân loại", type: "text", max: 40, required: true },
        ],
      },
    ],
  },
  {
    key: "features",
    title: "Vì sao chọn OAlpha",
    iconName: "IconChecklist",
    category: "TRANG CHỦ",
    fields: [
      { key: "kicker", path: "features.kicker", label: "Dòng nhãn", type: "text", max: 60, required: true },
      { key: "title", path: "features.title", label: "Tiêu đề", type: "text", max: 120, required: true },
      {
        key: "items",
        path: "features.items",
        label: "Các ưu điểm vượt trội",
        type: "list",
        min: 2,
        max: 8,
        itemTitle: (it) => `${it?.n || 1}. ${it?.title || "Ưu điểm"}`,
        createEmpty: () => ({ n: 1, title: "Ưu điểm mới", desc: "Mô tả ưu điểm" }),
        itemFields: [
          { key: "n", path: "n", label: "Số thứ tự", type: "number", min: 1, max: 20, required: true },
          { key: "title", path: "title", label: "Tiêu đề", type: "text", max: 60, required: true },
          { key: "desc", path: "desc", label: "Mô tả", type: "textarea", max: 250, required: true },
        ],
      },
    ],
  },
  {
    key: "process",
    title: "Lộ trình triển khai",
    iconName: "IconRoute",
    category: "TRANG CHỦ",
    fields: [
      { key: "kicker", path: "process.kicker", label: "Dòng nhãn", type: "text", max: 60, required: true },
      { key: "title", path: "process.title", label: "Tiêu đề", type: "text", max: 120, required: true },
      { key: "desc", path: "process.desc", label: "Mô tả", type: "textarea", max: 400 },
      {
        key: "items",
        path: "process.items",
        label: "Các bước triển khai",
        type: "list",
        min: 3,
        max: 8,
        itemTitle: (it) => `${it?.n || "BƯỚC"}: ${it?.title || "Tên bước"}`,
        createEmpty: () => ({ n: "BƯỚC 0X", title: "Tên bước mới", desc: "Mô tả bước triển khai" }),
        itemFields: [
          { key: "n", path: "n", label: "Nhãn bước (BƯỚC 01...)", type: "text", max: 20, required: true },
          { key: "title", path: "title", label: "Tiêu đề bước", type: "text", max: 60, required: true },
          { key: "desc", path: "desc", label: "Mô tả", type: "textarea", max: 250, required: true },
        ],
      },
    ],
  },
  {
    key: "segments",
    title: "Giải pháp theo đối tượng",
    iconName: "IconBuilding",
    category: "TRANG CHỦ",
    fields: [
      { key: "kicker", path: "segments.kicker", label: "Dòng nhãn", type: "text", max: 60, required: true },
      { key: "title", path: "segments.title", label: "Tiêu đề", type: "text", max: 120, required: true },
      { key: "desc", path: "segments.desc", label: "Mô tả", type: "textarea", max: 400 },
      {
        key: "items",
        path: "segments.items",
        label: "Các phân khúc đối tượng",
        type: "list",
        min: 2,
        max: 6,
        itemTitle: (it) => `${it?.icon || "🚀"} ${it?.title || "Đối tượng"}`,
        createEmpty: () => ({ icon: "🏢", title: "Đối tượng mới", desc: "Mô tả đối tượng", items: ["Đặc điểm 1", "Đặc điểm 2", "Đặc điểm 3"] }),
        itemFields: [
          { key: "icon", path: "icon", label: "Icon / Emoji", type: "text", max: 10, required: true },
          { key: "title", path: "title", label: "Tên phân khúc", type: "text", max: 60, required: true },
          { key: "desc", path: "desc", label: "Mô tả", type: "textarea", max: 250, required: true },
        ],
      },
    ],
  },
  {
    key: "pricing",
    title: "Bảng giá & Gói dịch vụ",
    iconName: "IconCash",
    category: "TRANG CHỦ",
    fields: [],
  },

  {
    key: "testimonials",
    title: "Khách hàng nói gì",
    iconName: "IconMessageCircle",
    category: "TRANG CHỦ",
    fields: [
      { key: "kicker", path: "testimonials.kicker", label: "Dòng nhãn", type: "text", max: 60, required: true },
      { key: "title", path: "testimonials.title", label: "Tiêu đề", type: "text", max: 120, required: true },
      { key: "desc", path: "testimonials.desc", label: "Mô tả", type: "textarea", max: 400 },
      {
        key: "items",
        path: "testimonials.items",
        label: "Danh sách cảm nhận",
        type: "list",
        min: 1,
        max: 9,
        itemTitle: (it) => `${it?.name || "Khách hàng"} - ${it?.role || "Chức danh"}`,
        createEmpty: () => ({ initials: "KH", quote: "Nội dung nhận xét đánh giá...", name: "Anh/Chị Tên", role: "Giám đốc · Doanh nghiệp" }),
        itemFields: [
          { key: "initials", path: "initials", label: "Chữ cái đại diện (Avatar)", type: "text", max: 6, required: true },
          { key: "name", path: "name", label: "Tên người đánh giá", type: "text", max: 50, required: true },
          { key: "role", path: "role", label: "Chức vụ & Công ty", type: "text", max: 80, required: true },
          { key: "quote", path: "quote", label: "Nội dung lời chứng", type: "textarea", max: 350, required: true },
        ],
      },
    ],
  },
  {
    key: "faq",
    title: "Câu hỏi thường gặp (FAQ)",
    iconName: "IconHelpCircle",
    category: "TRANG CHỦ",
    fields: [
      { key: "kicker", path: "faq.kicker", label: "Dòng nhãn", type: "text", max: 60, required: true },
      { key: "title", path: "faq.title", label: "Tiêu đề", type: "text", max: 120, required: true },
      { key: "desc", path: "faq.desc", label: "Mô tả", type: "textarea", max: 400 },
      {
        key: "items",
        path: "faq.items",
        label: "Danh sách Hỏi & Đáp",
        type: "list",
        min: 1,
        max: 20,
        itemTitle: (it) => it?.q || "Câu hỏi",
        createEmpty: () => ({ q: "Câu hỏi mới?", a: "Câu trả lời chi tiết..." }),
        itemFields: [
          { key: "q", path: "q", label: "Câu hỏi", type: "text", max: 150, required: true },
          { key: "a", path: "a", label: "Câu trả lời", type: "textarea", max: 600, required: true },
        ],
      },
    ],
  },
  {
    key: "cta",
    title: "Liên hệ & Form đăng ký",
    iconName: "IconMail",
    category: "ĐIỀU HƯỚNG & LIÊN HỆ",
    fields: [],
  },

  {
    key: "footer",
    title: "Footer",
    iconName: "IconLayoutBottombar",
    category: "ĐIỀU HƯỚNG & LIÊN HỆ",
    fields: [],
  },
];

