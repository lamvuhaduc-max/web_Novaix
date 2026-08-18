"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Stats from "./Stats";
import type { HeroContent } from "@/lib/site-content/schema";
import { safeHex } from "@/lib/site-content/color";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.13, duration: 0.8, ease: [0.2, 0.7, 0.2, 1] as const },
  }),
};

export default function Hero({ content }: { content: HeroContent }) {
  const isCustom = Boolean(content.customColors);

  // Hero custom colors (with fallbacks)
  const heroStyle: React.CSSProperties & Record<string, string> = isCustom
    ? {
        "--hero-kicker-color": safeHex(content.kickerColor, "#2dd4bf"),
        "--hero-title-color": safeHex(content.titleColor, "#eef2fb"),
        "--hero-highlight-1": safeHex(content.highlightColor, "#2dd4bf"),
        "--hero-highlight-2": safeHex(content.highlightAccentColor, "#38bdf8"),
        "--hero-desc-color": safeHex(content.descColor, "#9aa6c4"),
        "--hero-btn-primary-bg": safeHex(content.btnPrimaryBg, "#2dd4bf"),
        "--hero-btn-primary-text": safeHex(content.btnPrimaryText, "#04121a"),
        "--hero-btn-ghost-bg": safeHex(content.btnGhostBg, "#131c31"),
        "--hero-btn-ghost-text": safeHex(content.btnGhostText, "#eef2fb"),
        "--hero-btn-ghost-border": safeHex(content.btnGhostBorder, "#2dd4bf"),
      }
    : {};

  return (
    <header
      data-section="hero"
      className="relative min-h-screen flex items-center pt-[68px] overflow-hidden"
      style={heroStyle}
    >
      <HeroScene />
      <div className="wrap z-[3]">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div>
            <motion.span
              custom={0}
              variants={fade}
              initial="hidden"
              animate="show"
              className="kicker"
              style={
                isCustom
                  ? {
                      color: "var(--hero-kicker-color)",
                      borderColor: `var(--hero-kicker-color)66`,
                      background: `var(--hero-kicker-color)14`,
                    }
                  : undefined
              }
            >
              {content.kicker}
            </motion.span>

            <motion.h1
              custom={1}
              variants={fade}
              initial="hidden"
              animate="show"
              className="font-extrabold my-[18px] mt-[22px]"
              style={{
                fontSize: "clamp(40px,6vw,76px)",
                color: isCustom ? "var(--hero-title-color)" : undefined,
              }}
            >
              {content.titleLead}{" "}
              <span
                className="grad-text"
                style={
                  isCustom
                    ? {
                        background: `linear-gradient(120deg, var(--hero-highlight-1), var(--hero-highlight-2) 55%, #fbbf24)`,
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                      }
                    : undefined
                }
              >
                {content.titleHighlight}
              </span>
              {content.titleTail ? ` ${content.titleTail}` : ""}
            </motion.h1>

            <motion.p
              custom={2}
              variants={fade}
              initial="hidden"
              animate="show"
              className="text-muted max-w-[540px] mb-[30px]"
              style={{
                fontSize: "clamp(16px,2vw,19px)",
                color: isCustom ? "var(--hero-desc-color)" : undefined,
              }}
            >
              {content.desc}
            </motion.p>

            <motion.div custom={3} variants={fade} initial="hidden" animate="show" className="flex gap-3.5 flex-wrap">
              <a
                href="#lien-he"
                className="btn btn-primary"
                style={
                  isCustom
                    ? {
                        background: "var(--hero-btn-primary-bg) !important",
                        color: "var(--hero-btn-primary-text) !important",
                      }
                    : undefined
                }
              >
                {content.ctaPrimary}
              </a>
              {content.ctaSecondary && (
                <a
                  href="#modules"
                  className="btn btn-ghost"
                  style={
                    isCustom
                      ? {
                          background: "var(--hero-btn-ghost-bg) !important",
                          color: "var(--hero-btn-ghost-text) !important",
                          borderColor: "var(--hero-btn-ghost-border) !important",
                        }
                      : undefined
                  }
                >
                  {content.ctaSecondary}
                </a>
              )}
            </motion.div>
          </div>
        </div>

        <motion.div custom={4} variants={fade} initial="hidden" animate="show">
          <Stats
            stats={content.stats}
            bgColor={content.statsBgColor}
            bgOpacity={content.statsBgOpacity}
            borderColor={content.statsBorderColor}
          />
        </motion.div>
      </div>
    </header>
  );
}
