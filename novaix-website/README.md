# NovAIX — Website giải pháp công nghệ doanh nghiệp

Landing page cho **NovAIX** — công ty giải pháp công nghệ (CRM · ERP và các module nghiệp vụ giúp doanh nghiệp hệ thống hóa quy trình). Xây dựng bằng **Next.js 14 (App Router)** + **Three.js** (react-three-fiber) + Tailwind CSS + Framer Motion.

## Yêu cầu
- Node.js >= 18.18

## Chạy dự án
```bash
npm install
npm run dev      # mở http://localhost:3000
```

## Build production
```bash
npm run build
npm start
```

## Cấu trúc
```
app/
  layout.tsx        # font (Bricolage Grotesque + Manrope), metadata SEO
  page.tsx          # ghép toàn bộ section
  globals.css       # design tokens (màu, hiệu ứng grain, nút, kicker)
components/
  HeroScene.tsx     # 3D node-network bằng react-three-fiber (Three.js)
  Hero.tsx          # tiêu đề lớn + CTA + Stats (đếm số)
  Marquee.tsx       # dải lĩnh vực chạy ngang
  Modules.tsx       # 9 module: CRM, ERP, Kho, Kế toán, HRM, Quy trình, BI, AI, Tích hợp
  Features.tsx      # vì sao chọn NovAIX + vòng tròn orbit
  Process.tsx       # 5 bước triển khai
  Segments.tsx      # giải pháp theo đối tượng
  Testimonials.tsx  # cảm nhận khách hàng (nội dung minh họa)
  CTA.tsx           # kêu gọi đặt demo
  Footer.tsx        # liên hệ: 14 Đường 41, An Khánh, HCM
lib/data.ts         # toàn bộ nội dung tập trung tại đây — sửa text ở đây
```

## Tùy chỉnh nhanh
- **Nội dung**: sửa trong `lib/data.ts`.
- **Màu sắc**: đổi biến trong `app/globals.css` và `tailwind.config.ts` (accent `#2dd4bf`, `#38bdf8`, `#fbbf24`).
- **Hiệu ứng 3D**: chỉnh số node `N`, khoảng nối `maxDist`, tốc độ xoay trong `components/HeroScene.tsx`.
- **Thông tin liên hệ**: email/điện thoại trong `CTA.tsx` và `Footer.tsx`.
