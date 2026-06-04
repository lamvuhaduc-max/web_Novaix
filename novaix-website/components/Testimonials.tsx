import { testimonials } from "@/lib/data";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

export default function Testimonials() {
  return (
    <section className="py-[110px] relative z-[2]">
      <div className="wrap">
        <SectionHead
          kicker="Khách hàng nói gì"
          title="Vận hành gọn hơn, quyết định nhanh hơn"
          desc="Một vài chia sẻ minh họa về trải nghiệm chuẩn hóa quy trình cùng OAlpha."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <div className="panel rounded-[18px] p-[30px] h-full">
                <p className="text-base leading-7 mb-5">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full grid place-items-center font-extrabold font-display text-[#04121a]"
                    style={{ background: "linear-gradient(135deg,#2dd4bf,#38bdf8)" }}>
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
