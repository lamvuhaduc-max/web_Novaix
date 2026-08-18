"use client";

import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import type { SegmentsContent } from "@/lib/site-content/schema";
import { safeHex } from "@/lib/site-content/color";

export default function Segments({ content }: { content: SegmentsContent }) {
  const isCustom = Boolean(content.customColors);

  const segmentsStyle: React.CSSProperties & Record<string, string> = isCustom
    ? {
        backgroundColor: safeHex(content.bgColor, "#0b1120"),
        "--segments-kicker-color": safeHex(content.kickerColor, "#2dd4bf"),
        "--segments-title-color": safeHex(content.titleColor, "#eef2fb"),
        "--segments-desc-color": safeHex(content.descColor, "#9aa6c4"),
        "--segments-card-bg": safeHex(content.cardBgColor, "#131c31"),
        "--segments-accent-color": safeHex(content.accentColor, "#38bdf8"),
      }
    : {};

  return (
    <section
      id="khach-hang"
      data-section="segments"
      className="py-[110px] relative z-[2] bg-bg-2"
      style={segmentsStyle}
    >
      <div className="wrap">
        <SectionHead
          kicker={content.kicker}
          title={content.title}
          desc={content.desc}
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
          {(content.items || []).map((s, i) => (
            <Reveal key={s.title || i} delay={i * 0.08}>
              <div
                className="panel rounded-[18px] p-[30px] h-full"
                style={
                  isCustom
                    ? {
                        backgroundColor: "var(--segments-card-bg)",
                      }
                    : undefined
                }
              >
                <div
                  className="w-12 h-12 rounded-[13px] grid place-items-center text-[22px] mb-[18px] border border-line"
                  style={{
                    background: isCustom
                      ? `linear-gradient(135deg, color-mix(in srgb, var(--segments-kicker-color) 20%, transparent), color-mix(in srgb, var(--segments-accent-color) 15%, transparent))`
                      : "linear-gradient(135deg,rgba(45,212,191,0.18),rgba(56,189,248,0.14))",
                  }}
                >
                  {s.icon}
                </div>
                <h3
                  className="text-xl font-bold mb-2"
                  style={{
                    color: isCustom ? "var(--segments-title-color)" : undefined,
                  }}
                >
                  {s.title}
                </h3>
                <p
                  className="text-muted text-[14.5px]"
                  style={{
                    color: isCustom ? "var(--segments-desc-color)" : undefined,
                  }}
                >
                  {s.desc}
                </p>
                <ul className="mt-4 flex flex-col gap-2">
                  {(s.items || []).map((it, itemIdx) => (
                    <li key={itemIdx} className="text-sm text-muted flex gap-2.5 items-start">
                      <span
                        className="font-extrabold"
                        style={{
                          color: isCustom ? "var(--segments-accent-color)" : "var(--theme-accent, #38bdf8)",
                        }}
                      >
                        ›
                      </span>
                      <span
                        style={{
                          color: isCustom ? "var(--segments-desc-color)" : undefined,
                        }}
                      >
                        {it}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
