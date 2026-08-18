import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import About from "@/components/About";
import Modules from "@/components/Modules";
import Features from "@/components/Features";
import Process from "@/components/Process";
import Segments from "@/components/Segments";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import ArticleRail from "@/components/blog/ArticleRail";
import type { HomeContent } from "@/lib/site-content/schema";
import type { PublicArticleCard } from "@/lib/blog/queries";
import { safeHex } from "@/lib/site-content/color";

/**
 * Component gom chung toàn bộ các khối trang chủ.
 * Tự động áp dụng bộ theme màu sắc và bo góc toàn trang.
 */
export default function HomeSections({
  content,
  articleRails = [],
}: {
  content: HomeContent;
  articleRails?: { title: string; articles: PublicArticleCard[] }[];
}) {
  const theme = content.theme || {
    primary: "#2dd4bf",
    primaryDark: "#0d9488",
    accent: "#38bdf8",
    textColor: "#eef2fb",
    textMuted: "#9aa6c4",
    bgColor: "#070b16",
    borderRadius: 12,
  };

  const c = {
    primary: safeHex(theme.primary, "#2dd4bf"),
    primaryDark: safeHex(theme.primaryDark, "#0d9488"),
    accent: safeHex(theme.accent, "#38bdf8"),
    textColor: safeHex(theme.textColor, "#eef2fb"),
    textMuted: safeHex(theme.textMuted, "#9aa6c4"),
    bgColor: safeHex(theme.bgColor, "#070b16"),
    btnPrimaryBg: safeHex(theme.btnPrimaryBg, "#2dd4bf"),
    btnPrimaryText: safeHex(theme.btnPrimaryText, "#04121a"),
    btnGhostBg: safeHex(theme.btnGhostBg, "#131c31"),
    btnGhostText: safeHex(theme.btnGhostText, "#eef2fb"),
    btnGhostBorder: safeHex(theme.btnGhostBorder, "#2dd4bf"),
    radius: Number.isFinite(theme.borderRadius)
      ? Math.min(32, Math.max(0, Math.trunc(theme.borderRadius)))
      : 12,
  };

  const dynamicCss = `
    :root {
      --theme-primary: ${c.primary};
      --theme-primary-dark: ${c.primaryDark};
      --theme-accent: ${c.accent};
      --theme-text: ${c.textColor};
      --theme-text-muted: ${c.textMuted};
      --theme-bg: ${c.bgColor};
      --theme-radius: ${c.radius}px;
      --theme-btn-primary-bg: ${c.btnPrimaryBg};
      --theme-btn-primary-text: ${c.btnPrimaryText};
      --theme-btn-ghost-bg: ${c.btnGhostBg};
      --theme-btn-ghost-text: ${c.btnGhostText};
      --theme-btn-ghost-border: ${c.btnGhostBorder};
    }
    body, main {
      color: ${c.textColor};
    }
    .text-muted {
      color: ${c.textMuted};
    }
    [data-section="hero"] .text-muted {
      color: var(--hero-desc-color, ${c.textMuted}) !important;
    }
    [data-section="hero"] h1 {
      color: var(--hero-title-color, ${c.textColor});
    }
    [data-section="about"] .kicker {
      color: var(--about-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
      border-color: color-mix(in srgb, var(--about-kicker-color, var(--hero-kicker-color, ${c.primary})) 40%, transparent) !important;
      background: color-mix(in srgb, var(--about-kicker-color, var(--hero-kicker-color, ${c.primary})) 10%, transparent) !important;
    }
    [data-section="about"] .kicker::before {
      background: var(--about-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
      box-shadow: 0 0 10px var(--about-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
    }
    [data-section="about"] h2, [data-section="about"] h4 {
      color: var(--about-title-color, ${c.textColor});
    }
    [data-section="about"] .text-muted {
      color: var(--about-desc-color, ${c.textMuted}) !important;
    }
    [data-section="modules"] .kicker {
      color: var(--modules-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
      border-color: color-mix(in srgb, var(--modules-kicker-color, var(--hero-kicker-color, ${c.primary})) 40%, transparent) !important;
      background: color-mix(in srgb, var(--modules-kicker-color, var(--hero-kicker-color, ${c.primary})) 10%, transparent) !important;
    }
    [data-section="modules"] .kicker::before {
      background: var(--modules-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
      box-shadow: 0 0 10px var(--modules-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
    }
    [data-section="modules"] h2 {
      color: var(--modules-title-color, ${c.textColor});
    }
    [data-section="modules"] h3 {
      color: var(--modules-card-title, ${c.textColor});
    }
    [data-section="modules"] .text-muted {
      color: var(--modules-desc-color, ${c.textMuted}) !important;
    }
    [data-section="modules"] .panel .text-muted {
      color: var(--modules-card-desc, var(--modules-desc-color, ${c.textMuted})) !important;
    }
    [data-section="features"] .kicker {
      color: var(--features-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
      border-color: color-mix(in srgb, var(--features-kicker-color, var(--hero-kicker-color, ${c.primary})) 40%, transparent) !important;
      background: color-mix(in srgb, var(--features-kicker-color, var(--hero-kicker-color, ${c.primary})) 10%, transparent) !important;
    }
    [data-section="features"] .kicker::before {
      background: var(--features-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
      box-shadow: 0 0 10px var(--features-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
    }
    [data-section="features"] h2, [data-section="features"] h4 {
      color: var(--features-title-color, ${c.textColor});
    }
    [data-section="features"] .text-muted {
      color: var(--features-desc-color, ${c.textMuted}) !important;
    }
    [data-section="features"] .panel .text-muted {
      color: var(--features-desc-color, ${c.textMuted}) !important;
    }
    [data-section="process"] .kicker {
      color: var(--process-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
      border-color: color-mix(in srgb, var(--process-kicker-color, var(--hero-kicker-color, ${c.primary})) 40%, transparent) !important;
      background: color-mix(in srgb, var(--process-kicker-color, var(--hero-kicker-color, ${c.primary})) 10%, transparent) !important;
    }
    [data-section="process"] .kicker::before {
      background: var(--process-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
      box-shadow: 0 0 10px var(--process-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
    }
    [data-section="process"] h2, [data-section="process"] h4 {
      color: var(--process-title-color, ${c.textColor});
    }
    [data-section="process"] .text-muted {
      color: var(--process-desc-color, ${c.textMuted}) !important;
    }
    [data-section="process"] .panel .text-muted {
      color: var(--process-desc-color, ${c.textMuted}) !important;
    }
    [data-section="segments"] .kicker {
      color: var(--segments-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
      border-color: color-mix(in srgb, var(--segments-kicker-color, var(--hero-kicker-color, ${c.primary})) 40%, transparent) !important;
      background: color-mix(in srgb, var(--segments-kicker-color, var(--hero-kicker-color, ${c.primary})) 10%, transparent) !important;
    }
    [data-section="segments"] .kicker::before {
      background: var(--segments-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
      box-shadow: 0 0 10px var(--segments-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
    }
    [data-section="segments"] h2, [data-section="segments"] h3 {
      color: var(--segments-title-color, ${c.textColor});
    }
    [data-section="segments"] .text-muted {
      color: var(--segments-desc-color, ${c.textMuted}) !important;
    }
    [data-section="segments"] .panel .text-muted {
      color: var(--segments-desc-color, ${c.textMuted}) !important;
    }
    [data-section="pricing"] .kicker {
      color: var(--pricing-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
      border-color: color-mix(in srgb, var(--pricing-kicker-color, var(--hero-kicker-color, ${c.primary})) 40%, transparent) !important;
      background: color-mix(in srgb, var(--pricing-kicker-color, var(--hero-kicker-color, ${c.primary})) 10%, transparent) !important;
    }
    [data-section="pricing"] .kicker::before {
      background: var(--pricing-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
      box-shadow: 0 0 10px var(--pricing-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
    }
    [data-section="pricing"] h2 {
      color: var(--pricing-title-color, ${c.textColor});
    }
    [data-section="pricing"] .text-muted {
      color: var(--pricing-desc-color, ${c.textMuted}) !important;
    }
    [data-section="pricing"] .panel .text-muted, [data-section="pricing"] ul li:not(.opacity-40) {
      color: var(--pricing-desc-color, ${c.textMuted}) !important;
    }
    [data-section="testimonials"] .kicker {
      color: var(--testimonials-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
      border-color: color-mix(in srgb, var(--testimonials-kicker-color, var(--hero-kicker-color, ${c.primary})) 40%, transparent) !important;
      background: color-mix(in srgb, var(--testimonials-kicker-color, var(--hero-kicker-color, ${c.primary})) 10%, transparent) !important;
    }
    [data-section="testimonials"] .kicker::before {
      background: var(--testimonials-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
      box-shadow: 0 0 10px var(--testimonials-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
    }
    [data-section="testimonials"] h2, [data-section="testimonials"] b {
      color: var(--testimonials-title-color, ${c.textColor});
    }
    [data-section="testimonials"] .text-muted {
      color: var(--testimonials-desc-color, ${c.textMuted}) !important;
    }
    [data-section="testimonials"] .panel .text-muted {
      color: var(--testimonials-desc-color, ${c.textMuted}) !important;
    }
    [data-section="faq"] .kicker {
      color: var(--faq-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
      border-color: color-mix(in srgb, var(--faq-kicker-color, var(--hero-kicker-color, ${c.primary})) 40%, transparent) !important;
      background: color-mix(in srgb, var(--faq-kicker-color, var(--hero-kicker-color, ${c.primary})) 10%, transparent) !important;
    }
    [data-section="faq"] .kicker::before {
      background: var(--faq-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
      box-shadow: 0 0 10px var(--faq-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
    }
    [data-section="faq"] h2 {
      color: var(--faq-title-color, ${c.textColor});
    }
    [data-section="faq"] .text-muted {
      color: var(--faq-desc-color, ${c.textMuted}) !important;
    }
    [data-section="faq"] .panel .text-muted {
      color: var(--faq-desc-color, ${c.textMuted}) !important;
    }

    [data-section="articles"] .kicker {
      color: var(--articles-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
      border-color: color-mix(in srgb, var(--articles-kicker-color, var(--hero-kicker-color, ${c.primary})) 40%, transparent) !important;
      background: color-mix(in srgb, var(--articles-kicker-color, var(--hero-kicker-color, ${c.primary})) 10%, transparent) !important;
    }
    [data-section="articles"] .kicker::before {
      background: var(--articles-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
      box-shadow: 0 0 10px var(--articles-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
    }
    [data-section="articles"] h2 {
      color: var(--articles-title-color, ${c.textColor}) !important;
    }
    [data-section="articles"] .article-card {
      background-color: var(--articles-card-bg, #0d1424) !important;
    }
    [data-section="articles"] .article-title-link {
      color: var(--articles-card-title, ${c.textColor}) !important;
    }
    [data-section="articles"] .article-excerpt {
      color: var(--articles-card-desc, ${c.textMuted}) !important;
    }
    [data-section="articles"] .article-cat-badge {
      color: var(--articles-cat-color, ${c.primary}) !important;
      background-color: var(--articles-cat-bg, #0b1120) !important;
      border-color: color-mix(in srgb, var(--articles-cat-color, ${c.primary}) 35%, transparent) !important;
    }
    [data-section="articles"] .article-readmore-btn {
      color: var(--articles-readmore-color, ${c.primary}) !important;
    }

    [data-section="cta"] .kicker {

      color: var(--cta-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
      border-color: color-mix(in srgb, var(--cta-kicker-color, var(--hero-kicker-color, ${c.primary})) 40%, transparent) !important;
      background: color-mix(in srgb, var(--cta-kicker-color, var(--hero-kicker-color, ${c.primary})) 10%, transparent) !important;
    }
    [data-section="cta"] .kicker::before {
      background: var(--cta-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
      box-shadow: 0 0 10px var(--cta-kicker-color, var(--hero-kicker-color, ${c.primary})) !important;
    }
    [data-section="cta"] h2, [data-section="cta"] h3 {
      color: var(--cta-title-color, ${c.textColor});
    }
    [data-section="cta"] .text-muted {
      color: var(--cta-desc-color, ${c.textMuted}) !important;
    }
    [data-section="cta"] .btn-primary {
      background: var(--cta-btn-bg, var(--hero-btn-primary-bg, ${c.btnPrimaryBg})) !important;
      color: var(--cta-btn-text, var(--hero-btn-primary-text, ${c.btnPrimaryText})) !important;
    }
    .btn, .panel, .form-input {
      border-radius: ${c.radius}px !important;
    }

    .btn-primary {
      background: ${c.btnPrimaryBg} !important;
      color: ${c.btnPrimaryText} !important;
    }
    [data-section="hero"] .btn-primary {
      background: var(--hero-btn-primary-bg, ${c.btnPrimaryBg}) !important;
      color: var(--hero-btn-primary-text, ${c.btnPrimaryText}) !important;
    }
    .btn-ghost {
      background: ${c.btnGhostBg} !important;
      color: ${c.btnGhostText} !important;
      border-color: ${c.btnGhostBorder} !important;
    }
    [data-section="hero"] .btn-ghost {
      background: var(--hero-btn-ghost-bg, ${c.btnGhostBg}) !important;
      color: var(--hero-btn-ghost-text, ${c.btnGhostText}) !important;
      border-color: var(--hero-btn-ghost-border, ${c.btnGhostBorder}) !important;
    }
    .kicker {
      color: var(--hero-kicker-color, ${c.primary}) !important;
      border-color: color-mix(in srgb, var(--hero-kicker-color, ${c.primary})) 40%, transparent) !important;
      background: color-mix(in srgb, var(--hero-kicker-color, ${c.primary})) 10%, transparent) !important;
    }
    .kicker::before {
      background: var(--hero-kicker-color, ${c.primary}) !important;
      box-shadow: 0 0 10px var(--hero-kicker-color, ${c.primary})) !important;
    }
    .grad-text {
      background: linear-gradient(120deg, var(--hero-highlight-1, ${c.primary}), var(--hero-highlight-2, ${c.accent}) 55%, #fbbf24) !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
    }
    .grad-text-2 {
      background: linear-gradient(120deg, var(--hero-highlight-1, ${c.primary}), var(--hero-highlight-2, ${c.accent})) !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
    }
  `;

  const DEFAULT_ORDER = [
    "hero",
    "marquee",
    "about",
    "modules",
    "features",
    "process",
    "segments",
    "pricing",
    "testimonials",
    "faq",
    "articles",
    "cta",
  ];

  const rawOrder = Array.isArray(content.sectionOrder) && content.sectionOrder.length > 0
    ? content.sectionOrder
    : DEFAULT_ORDER;

  const validOrder = rawOrder.filter((k) => DEFAULT_ORDER.includes(k as any));
  const missing = DEFAULT_ORDER.filter((k) => !validOrder.includes(k));
  const effectiveOrder = [...validOrder, ...missing];

  const renderSectionByKey = (key: string) => {
    switch (key) {
      case "hero":
        return <Hero key="hero" content={content.hero} />;
      case "marquee":
        return <Marquee key="marquee" content={content.marquee} />;
      case "about":
        return <About key="about" content={content.about} />;
      case "modules":
        return <Modules key="modules" content={content.modules} />;
      case "features":
        return <Features key="features" content={content.features} />;
      case "process":
        return <Process key="process" content={content.process} />;
      case "segments":
        return <Segments key="segments" content={content.segments} />;
      case "pricing":
        return <Pricing key="pricing" content={content.pricing} />;
      case "testimonials":
        return <Testimonials key="testimonials" content={content.testimonials} />;
      case "faq":
        return <FAQ key="faq" content={content.faq} />;
      case "articles":
        return <ArticleRail key="articles" rails={articleRails} content={content.articles} />;

      case "cta":
        return <CTA key="cta" content={content.cta} />;
      default:
        return null;
    }
  };

  return (
    <main
      style={{
        backgroundColor: c.bgColor,
        color: c.textColor,
        minHeight: "100vh",
      }}
    >
      <style
        dangerouslySetInnerHTML={{ __html: dynamicCss }}
      />

      <Navbar content={content.nav} />
      {effectiveOrder.map((sectionKey) => renderSectionByKey(sectionKey))}
      <Footer content={content.footer} />
    </main>
  );
}

