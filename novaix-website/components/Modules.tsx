import { modules } from "@/lib/data";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

export default function Modules() {
  return (
    <section id="modules" className="py-[110px] relative z-[2]">
      <div className="wrap">
        <SectionHead
          kicker="Hệ sinh thái module"
          title="Một nền tảng — đầy đủ nghiệp vụ doanh nghiệp"
          desc="Triển khai từng phần hoặc trọn bộ. Các module dùng chung một cơ sở dữ liệu, nên dữ liệu chảy liền mạch giữa các phòng ban mà không cần nhập liệu lại."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
          {modules.map((m, i) => (
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
