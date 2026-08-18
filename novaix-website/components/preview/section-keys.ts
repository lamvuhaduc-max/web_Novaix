/**
 * Các khóa khối mà HomeSections thực sự render được.
 *
 * Tách khỏi component để `scripts/test-customizer.ts` đối chiếu được với
 * DEFAULT_SECTION_ORDER: một khóa có trong thứ tự nhưng không có nhánh render
 * sẽ biến mất khỏi trang chủ mà không báo lỗi gì.
 */
export const RENDERABLE_SECTION_KEYS = [
  "hero",
  "marquee",
  "about",
  "modules",
  "features",
  "process",
  "segments",
  "pricing",
  "testimonials",
  "partners",
  "faq",
  "articles",
  "cta",
] as const;

export type RenderableSectionKey = (typeof RENDERABLE_SECTION_KEYS)[number];
