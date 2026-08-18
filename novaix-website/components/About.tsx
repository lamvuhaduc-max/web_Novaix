"use client";

import Reveal from "./Reveal";
import type { AboutContent } from "@/lib/site-content/schema";
import { safeHex } from "@/lib/site-content/color";

export default function About({ content }: { content: AboutContent }) {
  const isCustom = Boolean(content.customColors);

  const aboutStyle: React.CSSProperties & Record<string, string> = isCustom
    ? {
        backgroundColor: safeHex(content.bgColor, "#0b1120"),
        "--about-kicker-color": safeHex(content.kickerColor, "#2dd4bf"),
        "--about-title-color": safeHex(content.titleColor, "#eef2fb"),
        "--about-desc-color": safeHex(content.descColor, "#9aa6c4"),
        "--about-card-bg": safeHex(content.cardBgColor, "#131c31"),
        "--about-accent-color": safeHex(content.accentColor, "#2dd4bf"),
      }
    : { background: "#0b1120" };

  return (
    <section
      id="ve-chung-toi"
      data-section="about"
      className="py-[110px] relative z-[2]"
      style={aboutStyle}
    >
      <div className="wrap">
        <div className="grid lg:grid-cols-2 gap-[50px] items-center">
          <div>
            <Reveal>
              <span
                className="kicker"
                style={
                  isCustom
                    ? {
                        color: "var(--about-kicker-color)",
                        borderColor: `var(--about-kicker-color)66`,
                        background: `var(--about-kicker-color)14`,
                      }
                    : undefined
                }
              >
                {content.kicker}
              </span>
              <h2
                className="font-extrabold my-4"
                style={{
                  fontSize: "clamp(28px,4vw,44px)",
                  color: isCustom ? "var(--about-title-color)" : undefined,
                }}
              >
                {content.title}
              </h2>
              <p
                className="text-muted text-base leading-[1.75] mb-6"
                style={{
                  color: isCustom ? "var(--about-desc-color)" : undefined,
                }}
              >
                {content.desc}
              </p>
            </Reveal>
            <div className="grid grid-cols-3 gap-3.5 mt-1">
              {(content.values || []).map((v, i) => (
                <Reveal key={v.title || i} delay={i * 0.1}>
                  <div
                    className="panel rounded-[14px] p-5 h-full"
                    style={
                      isCustom
                        ? {
                            backgroundColor: "var(--about-card-bg)",
                          }
                        : undefined
                    }
                  >
                    <div className="text-2xl mb-2.5">{v.icon}</div>
                    <h4
                      className="text-[15px] font-bold mb-1.5"
                      style={{
                        color: isCustom ? "var(--about-title-color)" : undefined,
                      }}
                    >
                      {v.title}
                    </h4>
                    <p
                      className="text-muted text-[13.5px]"
                      style={{
                        color: isCustom ? "var(--about-desc-color)" : undefined,
                      }}
                    >
                      {v.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={0.15}>
            <div
              className="panel rounded-[20px] p-8 flex flex-col gap-5"
              style={
                isCustom
                  ? {
                      backgroundColor: "var(--about-card-bg)",
                    }
                  : { background: "linear-gradient(160deg,#0b1120,#0d1424)" }
              }
            >
              {(content.timeline || []).map((t, idx) => (
                <div key={t.year || idx} className="flex gap-4 items-start">
                  <div
                    className="w-[38px] h-[38px] flex-none rounded-[10px] grid place-items-center font-extrabold font-display text-[12px] text-[#04121a]"
                    style={{
                      background: isCustom
                        ? `linear-gradient(135deg, var(--about-accent-color), var(--theme-accent, #38bdf8))`
                        : "linear-gradient(135deg,#2dd4bf,#38bdf8)",
                    }}
                  >
                    {t.label}
                  </div>
                  <div>
                    <div
                      className="text-[12px] font-bold tracking-[0.08em]"
                      style={{
                        color: isCustom ? "var(--about-accent-color)" : "var(--theme-primary, #2dd4bf)",
                      }}
                    >
                      {t.year}
                    </div>
                    <div
                      className="text-[15px] font-bold my-0.5"
                      style={{
                        color: isCustom ? "var(--about-title-color)" : undefined,
                      }}
                    >
                      {t.title}
                    </div>
                    <div
                      className="text-muted text-[13px]"
                      style={{
                        color: isCustom ? "var(--about-desc-color)" : undefined,
                      }}
                    >
                      {t.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
