"use client";

import { useState } from "react";
import Reveal from "./Reveal";

const moduleOptions = [
  "CRM — Quản lý khách hàng",
  "ERP — Hoạch định nguồn lực",
  "Kho & Chuỗi cung ứng",
  "Kế toán & Tài chính",
  "HRM — Nhân sự & Lương",
  "Trọn bộ giải pháp",
];

const sizeOptions = [
  "Dưới 20 nhân viên",
  "20 – 100 nhân viên",
  "100 – 500 nhân viên",
  "Trên 500 nhân viên",
];

export default function CTA() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <section id="lien-he" className="py-[110px] relative z-[2]">
      <div className="wrap">
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-[60px] items-start">
          {/* Left: contact info */}
          <Reveal>
            <span className="kicker">Liên hệ</span>
            <h2
              className="font-extrabold my-4 leading-[1.1]"
              style={{ fontSize: "clamp(26px,3.5vw,40px)" }}
            >
              Bắt đầu hành trình số hóa ngay hôm nay
            </h2>
            <p className="text-muted text-base mb-8">
              Đặt lịch demo 30 phút — chúng tôi phân tích quy trình và đề xuất lộ trình phù hợp, hoàn toàn miễn phí và không ràng buộc.
            </p>

            {[
              { icon: "📍", label: "Địa chỉ", value: "14 Đường 41, An Khánh, TP. Thủ Đức, TP. Hồ Chí Minh" },
              { icon: "✉️", label: "Email", value: "contact@novaix.vn" },
              { icon: "📞", label: "Điện thoại", value: "+84 (0) xxx xxx xxx" },
              { icon: "🕐", label: "Giờ làm việc", value: "Thứ 2 – Thứ 6  ·  8:00 – 17:30" },
            ].map((d) => (
              <div key={d.label} className="flex gap-3 items-start mb-4 text-sm text-[#9aa6c4]">
                <span className="text-base mt-0.5">{d.icon}</span>
                <div>
                  <b className="block text-[11px] uppercase tracking-[.08em] text-ink font-bold mb-0.5">{d.label}</b>
                  {d.value}
                </div>
              </div>
            ))}

            <div className="panel rounded-[16px] p-6 mt-8">
              <div className="text-[12px] text-muted uppercase tracking-[.1em] font-bold mb-2.5">Cam kết của chúng tôi</div>
              {[
                "Phản hồi trong 2 giờ làm việc",
                "Demo miễn phí, không ràng buộc",
                "Tư vấn lộ trình phù hợp quy mô",
              ].map((c) => (
                <div key={c} className="flex gap-2 text-[14px] text-[#9aa6c4] mb-2">
                  <span style={{ color: "#2dd4bf" }}>✓</span>
                  {c}
                </div>
              ))}
            </div>
          </Reveal>

          {/* Right: form */}
          <Reveal delay={0.15}>
            <div className="panel rounded-[22px] p-9">
              <h3 className="font-display font-bold text-[20px] mb-6">Đăng ký tư vấn miễn phí</h3>

              {sent ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-4">✅</div>
                  <p className="font-bold text-lg mb-2">Đã nhận yêu cầu!</p>
                  <p className="text-muted text-sm">Đội ngũ tư vấn sẽ liên hệ với bạn trong vòng 2 giờ làm việc.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-0">
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-semibold">Họ và tên *</label>
                      <input required type="text" placeholder="Nguyễn Văn A" className="form-input" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-semibold">Số điện thoại *</label>
                      <input required type="tel" placeholder="0901 234 567" className="form-input" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-semibold">Email *</label>
                      <input required type="email" placeholder="email@congty.vn" className="form-input" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-semibold">Tên công ty</label>
                      <input type="text" placeholder="Công ty TNHH ABC" className="form-input" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mb-4">
                    <label className="text-[13px] font-semibold">Quy mô doanh nghiệp</label>
                    <select className="form-input">
                      <option value="">Chọn quy mô...</option>
                      {sizeOptions.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 mb-4">
                    <label className="text-[13px] font-semibold">Module quan tâm</label>
                    <select className="form-input">
                      <option value="">Chọn giải pháp...</option>
                      {moduleOptions.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 mb-6">
                    <label className="text-[13px] font-semibold">Mô tả nhu cầu</label>
                    <textarea
                      placeholder="Mô tả ngắn gọn về quy trình và vấn đề bạn đang gặp phải..."
                      className="form-input resize-y min-h-[110px]"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary justify-center text-[15px] py-3.5">
                    Gửi yêu cầu tư vấn →
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
