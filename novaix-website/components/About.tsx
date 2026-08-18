import Reveal from "./Reveal";
import type { AboutContent } from "@/lib/site-content/schema";

export default function About({ content }: { content: AboutContent }) {
  return (
    <section id="ve-chung-toi" data-section="about" className="py-[110px] relative z-[2]" style={{ background: "#0b1120" }}>
      <div className="wrap">
        <div className="grid lg:grid-cols-2 gap-[50px] items-center">
          <div>
            <Reveal>
              <span className="kicker">{content.kicker}</span>
              <h2
                className="font-extrabold my-4"
                style={{ fontSize: "clamp(28px,4vw,44px)" }}
              >
                {content.title}
              </h2>
              <p className="text-muted text-base leading-[1.75] mb-6">
                {content.desc}
              </p>
            </Reveal>
            <div className="grid grid-cols-3 gap-3.5 mt-1">
              {content.values.map((v, i) => (
                <Reveal key={v.title} delay={i * 0.1}>
                  <div className="panel rounded-[14px] p-5 h-full">
                    <div className="text-2xl mb-2.5">{v.icon}</div>
                    <h4 className="text-[15px] font-bold mb-1.5">{v.title}</h4>
                    <p className="text-muted text-[13.5px]">{v.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={0.15}>
            <div
              className="panel rounded-[20px] p-8 flex flex-col gap-5"
              style={{ background: "linear-gradient(160deg,#0b1120,#0d1424)" }}
            >
              {content.timeline.map((t) => (
                <div key={t.year} className="flex gap-4 items-start">
                  <div
                    className="w-[38px] h-[38px] flex-none rounded-[10px] grid place-items-center font-extrabold font-display text-[12px] text-[#04121a]"
                    style={{ background: "linear-gradient(135deg,#2dd4bf,#38bdf8)" }}
                  >
                    {t.label}
                  </div>
                  <div>
                    <div className="text-[12px] font-bold tracking-[0.08em]" style={{ color: "#2dd4bf" }}>
                      {t.year}
                    </div>
                    <div className="text-[15px] font-bold my-0.5">{t.title}</div>
                    <div className="text-muted text-[13px]">{t.desc}</div>
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
