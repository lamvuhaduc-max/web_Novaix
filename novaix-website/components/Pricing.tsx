import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

type Feature = { text: string; na?: boolean };

type Tier = {
  label: string;
  name: string;
  price: string;
  sub: string;
  popular: boolean;
  cta: string;
  ctaClass: string;
  features: Feature[];
};

const tiers: Tier[] = [
  {
    label: "Khởi đầu",
    name: "Starter",
    price: "Liên hệ",
    sub: "Phù hợp SME dưới 20 người dùng",
    popular: false,
    cta: "Tư vấn miễn phí →",
    ctaClass: "btn btn-ghost",
    features: [
      { text: "CRM — Quản lý khách hàng" },
      { text: "Kho & Chuỗi cung ứng cơ bản" },
      { text: "Kế toán & Tài chính cơ bản" },
      { text: "HRM — Chấm công & Lương" },
      { text: "Dashboard báo cáo" },
      { text: "Tùy biến quy trình nâng cao", na: true },
      { text: "AI Automation", na: true },
      { text: "Tích hợp API mở", na: true },
    ],
  },
  {
    label: "Mở rộng",
    name: "Business",
    price: "Liên hệ",
    sub: "Phù hợp doanh nghiệp 20–100 người dùng",
    popular: true,
    cta: "Đặt lịch demo →",
    ctaClass: "btn btn-primary",
    features: [
      { text: "Tất cả module Starter" },
      { text: "ERP toàn diện đa phòng ban" },
      { text: "Quy trình & BPM tùy biến" },
      { text: "BI — Báo cáo nâng cao" },
      { text: "AI Automation cơ bản" },
      { text: "Quản lý đa chi nhánh" },
      { text: "Tích hợp TMĐT & vận chuyển" },
      { text: "Enterprise SLA & Custom Dev", na: true },
    ],
  },
  {
    label: "Toàn diện",
    name: "Enterprise",
    price: "Theo yêu cầu",
    sub: "Phù hợp doanh nghiệp 100+ người dùng",
    popular: false,
    cta: "Liên hệ Enterprise →",
    ctaClass: "btn btn-ghost",
    features: [
      { text: "Tất cả module Business" },
      { text: "AI Automation toàn phần" },
      { text: "Tùy biến & phát triển riêng" },
      { text: "SLA cam kết theo hợp đồng" },
      { text: "Dedicated support team" },
      { text: "On-premise hoặc Private Cloud" },
      { text: "Đào tạo chuyên sâu định kỳ" },
      { text: "Tích hợp không giới hạn" },
    ],
  },
];

export default function Pricing() {
  return (
    <section id="bang-gia" className="py-[110px] relative z-[2]">
      <div className="wrap">
        <SectionHead
          kicker="Bảng giá"
          title="Linh hoạt theo quy mô doanh nghiệp"
          desc="Không có gói cứng nhắc — chúng tôi tư vấn lộ trình phù hợp dựa trên số người dùng, module cần thiết và đặc thù ngành."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tiers.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 0.1}>
              <div
                className={`relative flex flex-col h-full rounded-[20px] p-8 ${
                  tier.popular
                    ? "border border-[rgba(45,212,191,0.5)]"
                    : "panel"
                }`}
                style={
                  tier.popular
                    ? { background: "linear-gradient(160deg,rgba(45,212,191,.06),rgba(56,189,248,.04))" }
                    : undefined
                }
              >
                {tier.popular && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[#04121a] text-xs font-bold px-3.5 py-1 rounded-full whitespace-nowrap"
                    style={{ background: "linear-gradient(135deg,#2dd4bf,#38bdf8)" }}
                  >
                    ⭐ Phổ biến nhất
                  </div>
                )}
                <div className="text-xs font-bold uppercase tracking-[.12em] text-muted">{tier.label}</div>
                <div className="font-display font-extrabold text-[22px] mt-1.5">{tier.name}</div>
                <div className="font-display font-extrabold text-[32px] mt-2.5 mb-1">{tier.price}</div>
                <div className="text-muted text-[13px] mb-5 pb-5 border-b border-line">{tier.sub}</div>
                <ul className="flex flex-col gap-2.5 mb-7 flex-1">
                  {tier.features.map((f) => (
                    <li
                      key={f.text}
                      className={`text-[14px] flex gap-2.5 items-start ${f.na ? "opacity-40" : "text-[#9aa6c4]"}`}
                    >
                      <span
                        className="font-bold flex-none"
                        style={{ color: f.na ? undefined : "#2dd4bf" }}
                      >
                        {f.na ? "—" : "✓"}
                      </span>
                      {f.text}
                    </li>
                  ))}
                </ul>
                <a
                  href="#lien-he"
                  className={`${tier.ctaClass} justify-center`}
                  style={{ width: "100%" }}
                >
                  {tier.cta}
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
