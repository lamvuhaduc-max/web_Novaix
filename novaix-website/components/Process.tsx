import { steps } from "@/lib/data";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

export default function Process() {
  return (
    <section id="quy-trinh" className="py-[110px] relative z-[2]">
      <div className="wrap">
        <SectionHead
          kicker="Lộ trình triển khai"
          title="Từ khảo sát đến vận hành — 5 bước rõ ràng"
          desc="Phương pháp triển khai chuẩn hóa giúp doanh nghiệp đưa hệ thống vào sử dụng nhanh, đúng quy trình và đo lường được hiệu quả."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {steps.map((s, i) => (
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
