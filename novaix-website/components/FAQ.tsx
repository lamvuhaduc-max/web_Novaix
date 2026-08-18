"use client";

import { useState } from "react";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import type { FAQContent } from "@/lib/site-content/schema";
import { safeHex } from "@/lib/site-content/color";

export default function FAQ({ content }: { content: FAQContent }) {
  const [open, setOpen] = useState<number | null>(null);
  const isCustom = Boolean(content.customColors);

  const faqStyle: React.CSSProperties & Record<string, string> = isCustom
    ? {
        backgroundColor: safeHex(content.bgColor, "#0b1120"),
        "--faq-kicker-color": safeHex(content.kickerColor, "#2dd4bf"),
        "--faq-title-color": safeHex(content.titleColor, "#eef2fb"),
        "--faq-desc-color": safeHex(content.descColor, "#9aa6c4"),
        "--faq-card-bg": safeHex(content.cardBgColor, "#131c31"),
        "--faq-active-color": safeHex(content.activeQuestionColor, "#2dd4bf"),
      }
    : { background: "#0b1120" };

  return (
    <section
      id="faq"
      data-section="faq"
      className="py-[110px] relative z-[2]"
      style={faqStyle}
    >
      <div className="wrap">
        <SectionHead
          kicker={content.kicker}
          title={content.title}
          desc={content.desc}
        />
        <div className="flex flex-col gap-3 max-w-[820px]">
          {(content.items || []).map((faq, i) => (
            <Reveal key={faq.q + i} delay={i * 0.05}>
              <div
                className="panel rounded-[14px] overflow-hidden"
                style={
                  open === i
                    ? {
                        borderColor: isCustom
                          ? "var(--faq-active-color)"
                          : "rgba(45,212,191,0.35)",
                        backgroundColor: isCustom ? "var(--faq-card-bg)" : undefined,
                      }
                    : isCustom
                    ? { backgroundColor: "var(--faq-card-bg)" }
                    : {}
                }
              >
                <button
                  className="w-full text-left px-6 py-5 flex justify-between items-center gap-4 font-semibold text-base transition-colors"
                  style={{
                    color:
                      open === i
                        ? isCustom
                          ? "var(--faq-active-color)"
                          : "#2dd4bf"
                        : isCustom
                        ? "var(--faq-title-color)"
                        : undefined,
                  }}
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span>{faq.q}</span>
                  <span
                    className="text-[22px] font-bold flex-none leading-none transition-transform duration-200"
                    style={{
                      color: isCustom ? "var(--faq-active-color)" : "#2dd4bf",
                      transform: open === i ? "rotate(45deg)" : "none",
                    }}
                  >
                    +
                  </span>
                </button>
                {open === i && (
                  <div
                    className="px-6 pb-5 text-muted text-[15px] leading-[1.7]"
                    style={{
                      color: isCustom ? "var(--faq-desc-color)" : undefined,
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
