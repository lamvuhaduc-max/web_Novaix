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
    radius: Number.isFinite(theme.borderRadius) ? Math.min(32, Math.max(0, Math.trunc(theme.borderRadius))) : 12,
  };

  return (
    <main
      style={{
        backgroundColor: c.bgColor,
        color: c.textColor,
        minHeight: "100vh",
      }}
    >
      <style>{`
        :root {
          --theme-primary: ${c.primary};
          --theme-primary-dark: ${c.primaryDark};
          --theme-accent: ${c.accent};
          --theme-text: ${c.textColor};
          --theme-text-muted: ${c.textMuted};
          --theme-bg: ${c.bgColor};
          --theme-radius: ${c.radius}px;
        }
        .btn, .panel, .form-input {
          border-radius: ${c.radius}px !important;
        }
        .btn-primary {
          background: linear-gradient(135deg, ${c.primary}, ${c.accent}) !important;
        }
        .kicker {
          color: ${c.primary} !important;
          border-color: ${c.primary}66 !important;
          background: ${c.primary}14 !important;
        }
        .grad-text {
          background: linear-gradient(120deg, ${c.primary}, ${c.accent} 55%, #fbbf24) !important;
          -webkit-background-clip: text !important;
          background-clip: text !important;
        }
        .grad-text-2 {
          background: linear-gradient(120deg, ${c.primary}, ${c.accent}) !important;
          -webkit-background-clip: text !important;
          background-clip: text !important;
        }
      `}</style>
      <Navbar content={content.nav} />
      <Hero content={content.hero} />
      <Marquee content={content.marquee} />
      <About content={content.about} />
      <Modules content={content.modules} />
      <Features content={content.features} />
      <Process content={content.process} />
      <Segments content={content.segments} />
      <Pricing content={content.pricing} />
      <Testimonials content={content.testimonials} />
      <FAQ content={content.faq} />
      <ArticleRail rails={articleRails} />
      <CTA content={content.cta} />
      <Footer content={content.footer} />
    </main>
  );
}
