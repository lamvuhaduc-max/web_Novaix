import { segments } from "@/lib/data";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

export default function Segments() {
  return (
    <section id="khach-hang" className="py-[110px] relative z-[2] bg-bg-2">
      <div className="wrap">
        <SectionHead
          kicker="Giải pháp theo đối tượng"
          title="Phù hợp với từng giai đoạn phát triển"
          desc="Dù bạn là doanh nghiệp đang tăng trưởng nóng hay đã có quy mô, NovAIX có gói phù hợp."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
          {segments.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <div className="panel rounded-[18px] p-[30px] h-full">
                <div className="w-12 h-12 rounded-[13px] grid place-items-center text-[22px] mb-[18px] border border-line"
                  style={{ background: "linear-gradient(135deg,rgba(45,212,191,0.18),rgba(56,189,248,0.14))" }}>
                  {s.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-muted text-[14.5px]">{s.desc}</p>
                <ul className="mt-4 flex flex-col gap-2">
                  {s.items.map((it) => (
                    <li key={it} className="text-sm text-muted flex gap-2.5 items-start">
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
