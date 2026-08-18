import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import type { ProcessContent } from "@/lib/site-content/schema";

export default function Process({ content }: { content: ProcessContent }) {
  return (
    <section id="quy-trinh" data-section="process" className="py-[110px] relative z-[2]">
      <div className="wrap">
        <SectionHead
          kicker={content.kicker}
          title={content.title}
          desc={content.desc}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {content.items.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.07}>
              <div className="panel rounded-[16px] p-6 h-full">
                <div className="font-display font-extrabold text-sm text-accent tracking-[0.1em]">{s.n}</div>
                <h4 className="text-[17px] my-2.5 mb-1.5">{s.title}</h4>
                <p className="text-muted text-[13.5px]">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
