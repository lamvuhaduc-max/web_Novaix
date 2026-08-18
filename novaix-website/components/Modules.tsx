import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import type { ModulesContent } from "@/lib/site-content/schema";

export default function Modules({ content }: { content: ModulesContent }) {
  return (
    <section id="modules" data-section="modules" className="py-[110px] relative z-[2]">
      <div className="wrap">
        <SectionHead
          kicker={content.kicker}
          title={content.title}
          desc={content.desc}
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
          {content.items.map((m, i) => (
            <Reveal key={m.title} delay={(i % 3) * 0.08}>
              <div className="panel rounded-[18px] p-7 h-full transition-all duration-300 hover:-translate-y-1.5 hover:border-[rgba(45,212,191,0.4)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] group">
                <div
                  className="w-12 h-12 rounded-[13px] grid place-items-center text-[22px] mb-[18px] border border-line"
                  style={{ background: "linear-gradient(135deg,rgba(45,212,191,0.18),rgba(56,189,248,0.14))" }}
                >
                  {m.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{m.title}</h3>
                <p className="text-muted text-[14.5px]">{m.desc}</p>
                <span className="inline-block mt-3.5 text-xs text-accent font-semibold">{m.tag}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
