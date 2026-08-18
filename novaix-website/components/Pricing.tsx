"use client";

import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import type { PricingContent } from "@/lib/site-content/schema";
import { safeHex } from "@/lib/site-content/color";

export default function Pricing({ content }: { content: PricingContent }) {
  const isCustom = Boolean(content.customColors);

  const pricingStyle: React.CSSProperties & Record<string, string> = isCustom
    ? {
        backgroundColor: safeHex(content.bgColor, "#070b16"),
        "--pricing-kicker-color": safeHex(content.kickerColor, "#2dd4bf"),
        "--pricing-title-color": safeHex(content.titleColor, "#eef2fb"),
        "--pricing-desc-color": safeHex(content.descColor, "#9aa6c4"),
        "--pricing-card-bg": safeHex(content.cardBgColor, "#0d1424"),
        "--pricing-popular-border": safeHex(content.popularBorderColor, "#2dd4bf"),
        "--pricing-check-color": safeHex(content.checkColor, "#2dd4bf"),
      }
    : {};

  return (
    <section
      id="bang-gia"
      data-section="pricing"
      className="py-[110px] relative z-[2]"
      style={pricingStyle}
    >
      <div className="wrap">
        <SectionHead
          kicker={content.kicker}
          title={content.title}
          desc={content.desc}
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(content.tiers || []).map((tier, i) => (
            <Reveal key={tier.name || i} delay={i * 0.1}>
              <div
                className={`relative flex flex-col h-full rounded-[20px] p-8 ${
                  tier.popular
                    ? isCustom
                      ? "border"
                      : "border border-[rgba(45,212,191,0.5)]"
                    : "panel"
                }`}
                style={
                  tier.popular
                    ? {
                        borderColor: isCustom ? "var(--pricing-popular-border)" : undefined,
                        background: isCustom
                          ? `linear-gradient(160deg, color-mix(in srgb, var(--pricing-popular-border) 8%, var(--pricing-card-bg, #0d1424)), var(--pricing-card-bg, #0d1424))`
                          : "linear-gradient(160deg,rgba(45,212,191,.06),rgba(56,189,248,.04))",
                      }
                    : isCustom
                    ? { backgroundColor: "var(--pricing-card-bg)" }
                    : undefined
                }
              >
                {tier.popular && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[#04121a] text-xs font-bold px-3.5 py-1 rounded-full whitespace-nowrap"
                    style={{
                      background: isCustom
                        ? `linear-gradient(135deg, var(--pricing-popular-border), var(--theme-accent, #38bdf8))`
                        : "linear-gradient(135deg,#2dd4bf,#38bdf8)",
                    }}
                  >
                    ⭐ Phổ biến nhất
                  </div>
                )}
                <div
                  className="text-xs font-bold uppercase tracking-[.12em] text-muted"
                  style={{
                    color: isCustom ? "var(--pricing-desc-color)" : undefined,
                  }}
                >
                  {tier.label}
                </div>
                <div
                  className="font-display font-extrabold text-[22px] mt-1.5"
                  style={{
                    color: isCustom ? "var(--pricing-title-color)" : undefined,
                  }}
                >
                  {tier.name}
                </div>
                <div
                  className="font-display font-extrabold text-[32px] mt-2.5 mb-1"
                  style={{
                    color: isCustom ? "var(--pricing-title-color)" : undefined,
                  }}
                >
                  {tier.price}
                </div>
                <div
                  className="text-muted text-[13px] mb-5 pb-5 border-b border-line"
                  style={{
                    color: isCustom ? "var(--pricing-desc-color)" : undefined,
                  }}
                >
                  {tier.sub}
                </div>
                <ul className="flex flex-col gap-2.5 mb-7 flex-1">
                  {(tier.features || []).map((f, fIdx) => (
                    <li
                      key={fIdx}
                      className={`text-[14px] flex gap-2.5 items-start ${f.na ? "opacity-40" : ""}`}
                      style={{
                        color: f.na ? undefined : isCustom ? "var(--pricing-title-color)" : "#9aa6c4",
                      }}
                    >
                      <span
                        className="font-bold flex-none"
                        style={{
                          color: f.na ? undefined : isCustom ? "var(--pricing-check-color)" : "#2dd4bf",
                        }}
                      >
                        {f.na ? "—" : "✓"}
                      </span>
                      {f.text}
                    </li>
                  ))}
                </ul>
                <a
                  href="#lien-he"
                  className={`${tier.ctaClass || "btn btn-ghost"} justify-center`}
                  style={{ width: "100%" }}
                >
                  {tier.cta}
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
