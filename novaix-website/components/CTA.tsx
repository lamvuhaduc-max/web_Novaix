"use client";

import { useState } from "react";
import Reveal from "./Reveal";
import type { CTAContent } from "@/lib/site-content/schema";
import { safeHex } from "@/lib/site-content/color";

export default function CTA({ content }: { content: CTAContent }) {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  const isCustom = Boolean(content.customColors);
  const contacts = content.contacts || [];
  const commitments = content.commitments || [];
  const formFields = content.formFields || [];

  const ctaStyle: React.CSSProperties & Record<string, string> = isCustom
    ? {
        backgroundColor: safeHex(content.bgColor, "#070b16"),
        "--cta-kicker-color": safeHex(content.kickerColor, "#2dd4bf"),
        "--cta-title-color": safeHex(content.titleColor, "#eef2fb"),
        "--cta-desc-color": safeHex(content.descColor, "#9aa6c4"),
        "--cta-card-bg": safeHex(content.cardBgColor, "#0d1424"),
        "--cta-btn-bg": safeHex(content.btnBgColor, "#2dd4bf"),
        "--cta-btn-text": safeHex(content.btnTextColor, "#04121a"),
      }
    : {};

  return (
    <section id="lien-he" data-section="cta" className="py-[110px] relative z-[2]" style={ctaStyle}>
      <div className="wrap">
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-[60px] items-start">
          {/* Left: contact info */}
          <Reveal>
            <span
              className="kicker"
              style={
                isCustom
                  ? {
                      color: "var(--cta-kicker-color)",
                      borderColor: `var(--cta-kicker-color)66`,
                      background: `var(--cta-kicker-color)14`,
                    }
                  : undefined
              }
            >
              {content.kicker}
            </span>
            <h2
              className="font-extrabold my-4 leading-[1.1]"
              style={{
                fontSize: "clamp(26px,3.5vw,40px)",
                color: isCustom ? "var(--cta-title-color)" : undefined,
              }}
            >
              {content.title}
            </h2>
            <p
              className="text-muted text-base mb-8"
              style={{
                color: isCustom ? "var(--cta-desc-color)" : undefined,
              }}
            >
              {content.desc}
            </p>

            {contacts.map((d, i) => (
              <div
                key={i}
                className="flex gap-3 items-start mb-4 text-sm"
                style={{
                  color: isCustom ? "var(--cta-desc-color)" : "#9aa6c4",
                }}
              >
                <span className="text-base mt-0.5">{d.icon}</span>
                <div>
                  <b
                    className="block text-[11px] uppercase tracking-[.08em] font-bold mb-0.5"
                    style={{
                      color: isCustom ? "var(--cta-title-color)" : undefined,
                    }}
                  >
                    {d.label}
                  </b>
                  {d.value}
                </div>
              </div>
            ))}

            {commitments.length > 0 && (
              <div
                className="panel rounded-[16px] p-6 mt-8"
                style={
                  isCustom
                    ? {
                        backgroundColor: "var(--cta-card-bg)",
                      }
                    : undefined
                }
              >
                <div
                  className="text-[12px] text-muted uppercase tracking-[.1em] font-bold mb-2.5"
                  style={{
                    color: isCustom ? "var(--cta-desc-color)" : undefined,
                  }}
                >
                  {content.commitmentsTitle}
                </div>
                {commitments.map((c, i) => (
                  <div
                    key={i}
                    className="flex gap-2 text-[14px] mb-2"
                    style={{
                      color: isCustom ? "var(--cta-desc-color)" : "#9aa6c4",
                    }}
                  >
                    <span style={{ color: isCustom ? "var(--cta-kicker-color)" : "var(--theme-primary, #2dd4bf)" }}>✓</span>
                    {c}
                  </div>
                ))}
              </div>
            )}
          </Reveal>

          {/* Right: form */}
          <Reveal delay={0.15}>
            <div
              className="panel rounded-[22px] p-9"
              style={
                isCustom
                  ? {
                      backgroundColor: "var(--cta-card-bg)",
                    }
                  : undefined
              }
            >
              <h3
                className="font-display font-bold text-[20px] mb-6"
                style={{
                  color: isCustom ? "var(--cta-title-color)" : undefined,
                }}
              >
                {content.formTitle}
              </h3>

              {sent ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-4">✅</div>
                  <p
                    className="font-bold text-lg mb-2"
                    style={{
                      color: isCustom ? "var(--cta-title-color)" : undefined,
                    }}
                  >
                    {content.formSuccessTitle}
                  </p>
                  <p
                    className="text-muted text-sm"
                    style={{
                      color: isCustom ? "var(--cta-desc-color)" : undefined,
                    }}
                  >
                    {content.formSuccessDesc}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-wrap gap-4">
                  {formFields.map((field) => {
                    const isHalf = field.width === "half";

                    return (
                      <div
                        key={field.id}
                        className={`flex flex-col gap-1.5 ${
                          isHalf ? "w-full sm:w-[calc(50%-8px)]" : "w-full"
                        }`}
                      >
                        <label
                          className="text-[13px] font-semibold"
                          style={{
                            color: isCustom ? "var(--cta-title-color)" : undefined,
                          }}
                        >
                          {field.label} {field.required && <span className="text-red-400">*</span>}
                        </label>

                        {field.type === "textarea" ? (
                          <textarea
                            required={field.required}
                            placeholder={field.placeholder || ""}
                            className="form-input resize-y min-h-[100px]"
                          />
                        ) : field.type === "select" ? (
                          <select required={field.required} className="form-input">
                            <option value="">{field.placeholder || "Chọn tùy chọn..."}</option>
                            {(field.options || []).map((opt, oIdx) => (
                              <option key={oIdx} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            required={field.required}
                            type={field.type}
                            placeholder={field.placeholder || ""}
                            className="form-input"
                          />
                        )}
                      </div>
                    );
                  })}

                  <div className="w-full mt-2">
                    <button
                      type="submit"
                      className="btn btn-primary w-full justify-center text-[15px] py-3.5"
                      style={
                        isCustom
                          ? {
                              background: "var(--cta-btn-bg) !important",
                              color: "var(--cta-btn-text) !important",
                            }
                          : undefined
                      }
                    >
                      {content.buttonText}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
