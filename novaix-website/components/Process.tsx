"use client";

import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import type { ProcessContent } from "@/lib/site-content/schema";
import { safeHex } from "@/lib/site-content/color";

export default function Process({ content }: { content: ProcessContent }) {
  const isCustom = Boolean(content.customColors);

  const processStyle: React.CSSProperties & Record<string, string> = isCustom
    ? {
        backgroundColor: safeHex(content.bgColor, "#070b16"),
        "--process-kicker-color": safeHex(content.kickerColor, "#2dd4bf"),
        "--process-title-color": safeHex(content.titleColor, "#eef2fb"),
        "--process-desc-color": safeHex(content.descColor, "#9aa6c4"),
        "--process-card-bg": safeHex(content.cardBgColor, "#0d1424"),
        "--process-step-color": safeHex(content.stepNumberColor, "#38bdf8"),
      }
    : {};

  return (
    <section
      id="quy-trinh"
      data-section="process"
      className="py-[110px] relative z-[2]"
      style={processStyle}
    >
      <div className="wrap">
        <SectionHead
          kicker={content.kicker}
          title={content.title}
          desc={content.desc}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {(content.items || []).map((s, i) => (
            <Reveal key={s.n || i} delay={i * 0.07}>
              <div
                className="panel rounded-[16px] p-6 h-full"
                style={
                  isCustom
                    ? {
                        backgroundColor: "var(--process-card-bg)",
                      }
                    : undefined
                }
              >
                <div
                  className="font-display font-extrabold text-sm tracking-[0.1em]"
                  style={{
                    color: isCustom ? "var(--process-step-color)" : "var(--theme-accent, #38bdf8)",
                  }}
                >
                  {s.n}
                </div>
                <h4
                  className="text-[17px] my-2.5 mb-1.5 font-bold"
                  style={{
                    color: isCustom ? "var(--process-title-color)" : undefined,
                  }}
                >
                  {s.title}
                </h4>
                <p
                  className="text-muted text-[13.5px]"
                  style={{
                    color: isCustom ? "var(--process-desc-color)" : undefined,
                  }}
                >
                  {s.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
