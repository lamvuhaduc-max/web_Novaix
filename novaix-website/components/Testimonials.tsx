import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import type { TestimonialsContent } from "@/lib/site-content/schema";

export default function Testimonials({ content }: { content: TestimonialsContent }) {
  return (
    <section data-section="testimonials" className="py-[110px] relative z-[2]">
      <div className="wrap">
        <SectionHead
          kicker={content.kicker}
          title={content.title}
          desc={content.desc}
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
          {content.items.map((t, i) => (
            <Reveal key={t.name + i} delay={i * 0.08}>
              <div className="panel rounded-[18px] p-[30px] h-full">
                <p className="text-base leading-7 mb-5">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full grid place-items-center font-extrabold font-display text-[#04121a]"
                    style={{ background: "linear-gradient(135deg,#2dd4bf,#38bdf8)" }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <b className="text-sm">{t.name}</b>
                    <span className="text-[12.5px] text-muted block">{t.role}</span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
