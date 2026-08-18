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
    fields: [],
  },



  {
    key: "about",
    title: "Về OAlpha (About)",
    iconName: "IconUsers",
    category: "TRANG CHỦ",
    fields: [],
  },

  {
    key: "modules",
    title: "Hệ sinh thái Module",
    iconName: "IconPackage",
    category: "TRANG CHỦ",
    fields: [],
  },

  {
    key: "features",
    title: "Vì sao chọn OAlpha",
    iconName: "IconChecklist",
    category: "TRANG CHỦ",
    fields: [],
  },
  {
    key: "process",
    title: "Lộ trình triển khai",
    iconName: "IconRoute",
    category: "TRANG CHỦ",
    fields: [],
  },
  {
    key: "segments",
    title: "Giải pháp theo đối tượng",
    iconName: "IconBuilding",
    category: "TRANG CHỦ",
    fields: [],
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
    fields: [],
  },
  {
    key: "faq",
    title: "Câu hỏi thường gặp (FAQ)",
    iconName: "IconHelpCircle",
    category: "TRANG CHỦ",
    fields: [],
  },
  {
    key: "articles",
    title: "Tin tức & Kiến thức",
    iconName: "IconNews",
    category: "TRANG CHỦ",
    fields: [],
  },
  {
    key: "partners",
    title: "Đối tác & Khách hàng",
    iconName: "IconBuildingStore",
    category: "TRANG CHỦ",
    fields: [],
  },
  {
    key: "cta",
    title: "Liên hệ & Form đăng ký",
    iconName: "IconMail",
    category: "TRANG CHỦ",
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

