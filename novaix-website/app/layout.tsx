import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OAlpha — Giải pháp công nghệ CRM & ERP cho doanh nghiệp",
  description:
    "OAlpha giúp doanh nghiệp Việt hệ thống hóa toàn bộ quy trình vận hành: CRM, ERP, kho vận, nhân sự, tài chính và tự động hóa AI trên một nền tảng duy nhất.",
  keywords: ["OAlpha", "CRM", "ERP", "phần mềm doanh nghiệp", "chuyển đổi số", "tự động hóa"],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "OAlpha — Hệ thống hóa vận hành doanh nghiệp",
    description: "Nền tảng CRM · ERP và các module nghiệp vụ cho doanh nghiệp Việt.",
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
