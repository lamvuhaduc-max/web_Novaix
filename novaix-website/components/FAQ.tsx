"use client";

import { useState } from "react";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import type { FAQContent } from "@/lib/site-content/schema";

export default function FAQ({ content }: { content: FAQContent }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" data-section="faq" className="py-[110px] relative z-[2]" style={{ background: "#0b1120" }}>
      <div className="wrap">
        <SectionHead
          kicker={content.kicker}
          title={content.title}
          desc={content.desc}
        />
        <div className="flex flex-col gap-3 max-w-[820px]">
          {content.items.map((faq, i) => (
            <Reveal key={faq.q + i} delay={i * 0.05}>
              <div
                className="panel rounded-[14px] overflow-hidden"
                style={open === i ? { borderColor: "rgba(45,212,191,0.35)" } : {}}
              >
                <button
                  className="w-full text-left px-6 py-5 flex justify-between items-center gap-4 font-semibold text-base transition-colors"
                  style={{ color: open === i ? "#2dd4bf" : undefined }}
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span>{faq.q}</span>
                  <span
                    className="text-[22px] font-bold flex-none leading-none transition-transform duration-200"
                    style={{ color: "#2dd4bf", transform: open === i ? "rotate(45deg)" : "none" }}
                  >
                    +
                  </span>
                </button>
                {open === i && (
                  <div className="px-6 pb-5 text-muted text-[15px] leading-[1.7]">
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
