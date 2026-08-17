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
import type { HomeContent } from "@/lib/site-content/schema";

/**
 * Component gom chung toàn bộ các khối trang chủ.
 * Tự động áp dụng bộ theme màu sắc và bo góc toàn trang.
 */
export default function HomeSections({ content }: { content: HomeContent }) {
  const theme = content.theme || {
    primary: "#2dd4bf",
    primaryDark: "#0d9488",
    accent: "#38bdf8",
    textColor: "#eef2fb",
    textMuted: "#9aa6c4",
    bgColor: "#070b16",
    borderRadius: 12,
  };

  return (
    <main
      style={{
        backgroundColor: theme.bgColor || "#070b16",
        color: theme.textColor || "#eef2fb",
        minHeight: "100vh",
      }}
    >
      <style>{`
        :root {
          --theme-primary: ${theme.primary};
          --theme-primary-dark: ${theme.primaryDark};
          --theme-accent: ${theme.accent};
          --theme-text: ${theme.textColor};
          --theme-text-muted: ${theme.textMuted};
          --theme-bg: ${theme.bgColor};
          --theme-radius: ${theme.borderRadius}px;
        }
        .btn, .panel, .form-input {
          border-radius: ${theme.borderRadius}px !important;
        }
        .btn-primary {
          background: linear-gradient(135deg, ${theme.primary}, ${theme.accent}) !important;
        }
        .kicker {
          color: ${theme.primary} !important;
          border-color: ${theme.primary}66 !important;
          background: ${theme.primary}14 !important;
        }
        .grad-text {
          background: linear-gradient(120deg, ${theme.primary}, ${theme.accent} 55%, #fbbf24) !important;
          -webkit-background-clip: text !important;
          background-clip: text !important;
        }
        .grad-text-2 {
          background: linear-gradient(120deg, ${theme.primary}, ${theme.accent}) !important;
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
      <CTA content={content.cta} />
      <Footer content={content.footer} />
    </main>
  );
}
