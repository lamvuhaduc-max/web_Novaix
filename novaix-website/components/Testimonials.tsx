"use client";

import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import type { TestimonialsContent } from "@/lib/site-content/schema";
import { safeHex } from "@/lib/site-content/color";

export default function Testimonials({ content }: { content: TestimonialsContent }) {
  const isCustom = Boolean(content.customColors);

  const testimonialsStyle: React.CSSProperties & Record<string, string> = isCustom
    ? {
        backgroundColor: safeHex(content.bgColor, "#070b16"),
        "--testimonials-kicker-color": safeHex(content.kickerColor, "#2dd4bf"),
        "--testimonials-title-color": safeHex(content.titleColor, "#eef2fb"),
        "--testimonials-desc-color": safeHex(content.descColor, "#9aa6c4"),
        "--testimonials-card-bg": safeHex(content.cardBgColor, "#0d1424"),
        "--testimonials-quote-color": safeHex(content.quoteColor, "#eef2fb"),
      }
    : {};

  return (
    <section
      data-section="testimonials"
      className="py-[110px] relative z-[2]"
      style={testimonialsStyle}
    >
      <div className="wrap">
        <SectionHead
          kicker={content.kicker}
          title={content.title}
          desc={content.desc}
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
          {(content.items || []).map((t, i) => (
            <Reveal key={t.name + i} delay={i * 0.08}>
              <div
                className="panel rounded-[18px] p-[30px] h-full"
                style={
                  isCustom
                    ? {
                        backgroundColor: "var(--testimonials-card-bg)",
                      }
                    : undefined
                }
              >
                <p
                  className="text-base leading-7 mb-5"
                  style={{
                    color: isCustom ? "var(--testimonials-quote-color)" : undefined,
                  }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full grid place-items-center font-extrabold font-display text-[#04121a]"
                    style={{
                      background: isCustom
                        ? `linear-gradient(135deg, var(--testimonials-kicker-color), var(--theme-accent, #38bdf8))`
                        : "linear-gradient(135deg,#2dd4bf,#38bdf8)",
                    }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <b
                      className="text-sm block"
                      style={{
                        color: isCustom ? "var(--testimonials-title-color)" : undefined,
                      }}
                    >
                      {t.name}
                    </b>
                    <span
                      className="text-[12.5px] text-muted block"
                      style={{
                        color: isCustom ? "var(--testimonials-desc-color)" : undefined,
                      }}
                    >
                      {t.role}
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
