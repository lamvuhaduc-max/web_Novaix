import type { HomeContent } from "./schema";

export const PREVIEW_FLAG = "preview";

export type SectionKey =
  | "theme"
  | "nav"
  | "hero"
  | "marquee"
  | "about"
  | "modules"
  | "features"
  | "process"
  | "segments"
  | "pricing"
  | "testimonials"
  | "faq"
  | "articles"
  | "cta"
  | "footer";




export type PreviewMessage =
  | { type: "preview:ready" }
  | { type: "preview:content"; content: HomeContent }
  | { type: "preview:scroll-to"; section: SectionKey }
  | { type: "preview:section-click"; section: SectionKey };
