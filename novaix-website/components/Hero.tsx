"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Stats from "./Stats";
import type { HeroContent } from "@/lib/site-content/schema";

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
  return (
    <header data-section="hero" className="relative min-h-screen flex items-center pt-[68px] overflow-hidden">
      <HeroScene />
      <div className="wrap z-[3]">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div>
            <motion.span custom={0} variants={fade} initial="hidden" animate="show" className="kicker">
              {content.kicker}
            </motion.span>
            <motion.h1
              custom={1}
              variants={fade}
              initial="hidden"
              animate="show"
              className="font-extrabold my-[18px] mt-[22px]"
              style={{ fontSize: "clamp(40px,6vw,76px)" }}
            >
              {content.titleLead}{" "}
              <span className="grad-text">{content.titleHighlight}</span>
              {content.titleTail ? ` ${content.titleTail}` : ""}
            </motion.h1>
            <motion.p
              custom={2}
              variants={fade}
              initial="hidden"
              animate="show"
              className="text-muted max-w-[540px] mb-[30px]"
              style={{ fontSize: "clamp(16px,2vw,19px)" }}
            >
              {content.desc}
            </motion.p>
            <motion.div custom={3} variants={fade} initial="hidden" animate="show" className="flex gap-3.5 flex-wrap">
              <a href="#lien-he" className="btn btn-primary">
                {content.ctaPrimary}
              </a>
              {content.ctaSecondary && (
                <a href="#modules" className="btn btn-ghost">
                  {content.ctaSecondary}
                </a>
              )}
            </motion.div>
          </div>
        </div>
        <motion.div custom={4} variants={fade} initial="hidden" animate="show">
          <Stats stats={content.stats} />
        </motion.div>
      </div>
    </header>
  );
}
