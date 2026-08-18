import Reveal from "./Reveal";
import type { FeaturesContent } from "@/lib/site-content/schema";

export default function Features({ content }: { content: FeaturesContent }) {
  return (
    <section id="giai-phap" data-section="features" className="py-[110px] relative z-[2] bg-bg-2">
      <div className="wrap">
        <div className="grid md:grid-cols-2 gap-[50px] items-center">
          <Reveal>
            <span className="kicker">{content.kicker}</span>
            <h2 className="font-extrabold my-[26px] mt-4" style={{ fontSize: "clamp(28px,4vw,44px)" }}>
              {content.title}
            </h2>
            <div className="flex flex-col gap-[18px]">
              {content.items.map((f) => (
                <div key={f.n} className="flex gap-4 items-start p-[18px] panel rounded-[14px]">
                  <div
                    className="w-[34px] h-[34px] flex-none rounded-[9px] grid place-items-center font-extrabold font-display text-[#04121a]"
                    style={{ background: "linear-gradient(135deg,#2dd4bf,#38bdf8)" }}
                  >
                    {f.n}
                  </div>
                  <div>
                    <h4 className="text-base mb-0.5">{f.title}</h4>
                    <p className="text-muted text-sm">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div
              className="border border-line rounded-[20px] min-h-[340px] relative overflow-hidden grid place-items-center"
              style={{ background: "linear-gradient(160deg,#0b1120,#0d1424)" }}
            >
              <div
                className="relative w-[220px] h-[220px] rounded-full animate-spin18"
                style={{ border: "1px dashed rgba(45,212,191,0.4)" }}
              >
                <div
                  className="absolute left-1/2 top-1/2 w-[380px] h-[380px] rounded-full -translate-x-1/2 -translate-y-1/2"
                  style={{ border: "1px dashed rgba(56,189,248,0.18)" }}
                />
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[74px] h-[74px] rounded-[18px] grid place-items-center font-extrabold font-display text-[#04121a] animate-spin18r"
                  style={{ background: "linear-gradient(135deg,#2dd4bf,#38bdf8)", boxShadow: "var(--glow)" }}
                >
                  OAlpha
                </div>
                {[
                  { e: "🤝", s: "top-[-21px] left-1/2 -translate-x-1/2" },
                  { e: "💰", s: "bottom-[-21px] left-1/2 -translate-x-1/2" },
                  { e: "📦", s: "top-1/2 left-[-21px] -translate-y-1/2" },
                  { e: "👥", s: "top-1/2 right-[-21px] -translate-y-1/2" },
                ].map((d, i) => (
                  <div
                    key={i}
                    className={`absolute w-[42px] h-[42px] rounded-[11px] grid place-items-center text-[18px] border border-line bg-[#0d1424] ${d.s}`}
                  >
                    {d.e}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
