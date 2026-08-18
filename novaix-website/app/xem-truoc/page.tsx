import type { Metadata } from "next";
import PreviewBridge from "@/components/preview/PreviewBridge";
import { getHomeContent } from "@/lib/site-content/queries";
import { getHomeRails } from "@/lib/blog/queries";

/**
 * Bản xem trước nhúng trong iframe của trình chỉnh sửa giao diện (/admin/giao-dien).
 *
 * Tách khỏi "/" để trang chủ công khai giữ được ISR: nếu dùng ?preview=1 ngay
 * trên "/" thì việc đọc searchParams làm cả trang chủ chuyển sang render động,
 * mất cache cho toàn bộ khách truy cập thật.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Xem trước Trang chủ · OAlpha",
  robots: { index: false, follow: false },
};

export default async function PreviewPage() {
  const [content, homeRails] = await Promise.all([getHomeContent(), getHomeRails()]);

  return <PreviewBridge initial={content} articleRails={homeRails} />;
}
