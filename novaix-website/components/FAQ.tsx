"use client";

import { useState } from "react";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

const faqs = [
  {
    q: "OAlpha phù hợp với quy mô doanh nghiệp nào?",
    a: "OAlpha phù hợp với doanh nghiệp từ 10 đến 500+ người dùng, bao gồm SME đang tăng trưởng, doanh nghiệp quy mô vừa và các tập đoàn có nhiều chi nhánh. Chúng tôi thiết kế gói triển khai linh hoạt theo từng giai đoạn phát triển của bạn.",
  },
  {
    q: "Thời gian triển khai mất bao lâu?",
    a: "Với gói Starter, thời gian triển khai thường từ 4–6 tuần. Gói Business mất 8–12 tuần tùy mức độ phức tạp quy trình. Chúng tôi sẽ lập lịch chi tiết và minh bạch sau buổi khảo sát ban đầu.",
  },
  {
    q: "Dữ liệu của tôi có được bảo mật không?",
    a: "Có. Dữ liệu được mã hóa tại chỗ và trong quá trình truyền tải (AES-256, TLS 1.3), lưu trữ trên hạ tầng đám mây đặt tại Việt Nam, sao lưu tự động hàng ngày và phân quyền truy cập chi tiết theo từng người dùng.",
  },
  {
    q: "OAlpha có tích hợp được với phần mềm đang dùng không?",
    a: "Có. OAlpha hỗ trợ tích hợp qua API REST & Webhook tiêu chuẩn. Chúng tôi đã có connector sẵn với các sàn TMĐT (Shopee, Lazada, TikTok Shop), đơn vị vận chuyển (GHN, GHTK, J&T), ngân hàng và phần mềm kế toán MISA.",
  },
  {
    q: "Chi phí có bao gồm hỗ trợ sau triển khai không?",
    a: "Có. Tất cả các gói đều bao gồm hỗ trợ kỹ thuật trong năm đầu tiên. Từ năm thứ hai, chúng tôi cung cấp gói duy trì linh hoạt theo nhu cầu với cam kết phản hồi trong vòng 4 giờ trong giờ hành chính.",
  },
  {
    q: "Nếu quy trình công ty tôi đặc thù, OAlpha có tùy biến được không?",
    a: "Hoàn toàn có. Đây là thế mạnh của OAlpha — chúng tôi cấu hình module theo quy trình thực tế của bạn, không bắt doanh nghiệp phải thay đổi để theo phần mềm. Với yêu cầu phát triển riêng, gói Business và Enterprise hỗ trợ custom development.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-[110px] relative z-[2]" style={{ background: "#0b1120" }}>
      <div className="wrap">
        <SectionHead
          kicker="Câu hỏi thường gặp"
          title="Những điều doanh nghiệp hay hỏi"
          desc="Chưa tìm thấy câu trả lời? Liên hệ đội ngũ tư vấn — chúng tôi phản hồi trong 2 giờ làm việc."
        />
        <div className="flex flex-col gap-3 max-w-[820px]">
          {faqs.map((faq, i) => (
            <Reveal key={faq.q} delay={i * 0.05}>
              <div
                className="panel rounded-[14px] overflow-hidden"
                style={open === i ? { borderColor: "rgba(45,212,191,0.35)" } : {}}
              >
                <button
                  className="w-full text-left px-6 py-5 flex justify-between items-center gap-4 font-semibold text-base transition-colors"
                  style={{ color: open === i ? "#2dd4bf" : undefined }}
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <span>{faq.q}</span>
                  <span
                    className="text-[22px] font-bold flex-none leading-none transition-transform duration-200"
                    style={{ color: "#2dd4bf", transform: open === i ? "rotate(45deg)" : "none" }}
                  >
                    +
                  </span>
                </button>
                {open === i && (
                  <div className="px-6 pb-5 text-muted text-[15px] leading-[1.7]">
                    {faq.a}
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
