import Reveal from "./Reveal";

const values = [
  { icon: "🎯", title: "Sứ mệnh", desc: "Số hóa quy trình vận hành để mọi doanh nghiệp Việt vận hành hiệu quả như doanh nghiệp toàn cầu." },
  { icon: "🔭", title: "Tầm nhìn", desc: "Trở thành nền tảng quản trị doanh nghiệp hàng đầu Đông Nam Á vào năm 2030." },
  { icon: "💎", title: "Giá trị cốt lõi", desc: "Thực chất · Đồng hành · Đổi mới liên tục · Lấy khách hàng làm trọng tâm." },
];

const timeline = [
  { year: "2021 · Thành lập", title: "Ra mắt OAlpha", desc: "Triển khai module CRM đầu tiên cho nhóm SME tại TP.HCM, khởi đầu hành trình số hóa.", label: "21" },
  { year: "2022 · Mở rộng", title: "Hệ sinh thái ERP & Kho", desc: "Triển khai thành công cho 20+ doanh nghiệp sản xuất và phân phối trên cả nước.", label: "22" },
  { year: "2023 · Đột phá", title: "Tích hợp AI Automation", desc: "Ra mắt module tự động hóa trí tuệ nhân tạo, giảm 60% tác vụ lặp lại trong vận hành.", label: "23" },
  { year: "2024 – 2026 · Hiện tại", title: "Nền tảng toàn diện", desc: "40+ module, 100+ doanh nghiệp đang vận hành và tiếp tục mở rộng toàn quốc.", label: "26" },
];

export default function About() {
  return (
    <section id="ve-chung-toi" className="py-[110px] relative z-[2]" style={{ background: "#0b1120" }}>
      <div className="wrap">
        <div className="grid lg:grid-cols-2 gap-[50px] items-center">
          <div>
            <Reveal>
              <span className="kicker">Về OAlpha</span>
              <h2
                className="font-extrabold my-4"
                style={{ fontSize: "clamp(28px,4vw,44px)" }}
              >
                Xây dựng nền tảng công nghệ cho doanh nghiệp Việt
              </h2>
              <p className="text-muted text-base leading-[1.75] mb-6">
                OAlpha ra đời từ mong muốn giúp doanh nghiệp Việt chuyển đổi số thực chất — không chỉ là phần mềm mà còn là quy trình vận hành chuẩn, đội ngũ đồng hành và công nghệ phù hợp với thực tế địa phương.
              </p>
            </Reveal>
            <div className="grid grid-cols-3 gap-3.5 mt-1">
              {values.map((v, i) => (
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
              {timeline.map((t) => (
                <div key={t.year} className="flex gap-4 items-start">
                  <div
                    className="w-[38px] h-[38px] flex-none rounded-[10px] grid place-items-center font-extrabold font-display text-[12px] text-[#04121a]"
                    style={{ background: "linear-gradient(135deg,#2dd4bf,#38bdf8)" }}
                  >
                    {t.label}
                  </div>
                  <div>
                    <div className="text-[12px] font-bold tracking-[0.08em]" style={{ color: "#2dd4bf" }}>{t.year}</div>
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
