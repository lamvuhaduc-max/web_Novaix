"use client";

import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import type { ModulesContent } from "@/lib/site-content/schema";
import { safeHex } from "@/lib/site-content/color";

export default function Modules({ content }: { content: ModulesContent }) {
  const isCustom = Boolean(content.customColors);

  const modulesStyle: React.CSSProperties & Record<string, string> = isCustom
    ? {
        backgroundColor: safeHex(content.bgColor, "#070b16"),
        "--modules-kicker-color": safeHex(content.kickerColor, "#2dd4bf"),
        "--modules-title-color": safeHex(content.titleColor, "#eef2fb"),
        "--modules-desc-color": safeHex(content.descColor, "#9aa6c4"),
        "--modules-card-bg": safeHex(content.cardBgColor, "#0d1424"),
        "--modules-card-title": safeHex(content.cardTitleColor, "#eef2fb"),
        "--modules-card-desc": safeHex(content.cardDescColor, "#9aa6c4"),
        "--modules-tag-color": safeHex(content.tagColor, "#38bdf8"),
      }
    : {};

  return (
    <section
      id="modules"
      data-section="modules"
      className="py-[110px] relative z-[2]"
      style={modulesStyle}
    >
      <div className="wrap">
        <SectionHead
          kicker={content.kicker}
          title={content.title}
          desc={content.desc}
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
          {(content.items || []).map((m, i) => (
            <Reveal key={m.title || i} delay={(i % 3) * 0.08}>
              <div
                className="panel rounded-[18px] p-7 h-full transition-all duration-300 hover:-translate-y-1.5 hover:border-[rgba(45,212,191,0.4)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] group"
                style={
                  isCustom
                    ? {
                        backgroundColor: "var(--modules-card-bg)",
                      }
                    : undefined
                }
              >
                <div
                  className="w-12 h-12 rounded-[13px] grid place-items-center text-[22px] mb-[18px] border border-line"
                  style={{
                    background: isCustom
                      ? `linear-gradient(135deg, color-mix(in srgb, var(--modules-kicker-color) 20%, transparent), color-mix(in srgb, var(--modules-tag-color) 15%, transparent))`
                      : "linear-gradient(135deg,rgba(45,212,191,0.18),rgba(56,189,248,0.14))",
                  }}
                >
                  {m.icon}
                </div>
                <h3
                  className="text-xl font-bold mb-2"
                  style={{
                    color: isCustom ? "var(--modules-card-title)" : undefined,
                  }}
                >
                  {m.title}
                </h3>
                <p
                  className="text-muted text-[14.5px]"
                  style={{
                    color: isCustom ? "var(--modules-card-desc)" : undefined,
                  }}
                >
                  {m.desc}
                </p>
                <span
                  className="inline-block mt-3.5 text-xs font-semibold"
                  style={{
                    color: isCustom ? "var(--modules-tag-color)" : undefined,
                  }}
                >
                  {m.tag}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
