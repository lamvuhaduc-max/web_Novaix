import type { Metadata } from "next";
import HomeSections from "@/components/preview/HomeSections";
import { getHomeContent } from "@/lib/site-content/queries";
import { getHomeRails } from "@/lib/blog/queries";

// Trang chủ là trang được xem nhiều nhất — giữ ISR để không truy vấn database
// ở mỗi lượt truy cập. Bản xem trước của trình chỉnh sửa nằm ở /xem-truoc,
// KHÔNG dùng searchParams ở đây (searchParams làm trang chuyển sang render động).
export const revalidate = 60;

export const metadata: Metadata = {
  title: "OAlpha — Hệ thống hóa toàn bộ vận hành doanh nghiệp của bạn",
  description:
    "Nền tảng CRM · ERP cho doanh nghiệp Việt. Chuẩn hóa quy trình, tự động hóa nghiệp vụ và ra quyết định bằng dữ liệu.",
};

export default async function Home() {
  const [content, homeRails] = await Promise.all([getHomeContent(), getHomeRails()]);

  return <HomeSections content={content} articleRails={homeRails} />;
}
