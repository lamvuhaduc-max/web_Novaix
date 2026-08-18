import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import type { SegmentsContent } from "@/lib/site-content/schema";

export default function Segments({ content }: { content: SegmentsContent }) {
  return (
    <section id="khach-hang" data-section="segments" className="py-[110px] relative z-[2] bg-bg-2">
      <div className="wrap">
        <SectionHead
          kicker={content.kicker}
          title={content.title}
          desc={content.desc}
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
          {content.items.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <div className="panel rounded-[18px] p-[30px] h-full">
                <div
                  className="w-12 h-12 rounded-[13px] grid place-items-center text-[22px] mb-[18px] border border-line"
                  style={{ background: "linear-gradient(135deg,rgba(45,212,191,0.18),rgba(56,189,248,0.14))" }}
                >
                  {s.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-muted text-[14.5px]">{s.desc}</p>
                <ul className="mt-4 flex flex-col gap-2">
                  {s.items.map((it, itemIdx) => (
                    <li key={itemIdx} className="text-sm text-muted flex gap-2.5 items-start">
                      <span className="text-accent font-extrabold">›</span>
                      {it}
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
