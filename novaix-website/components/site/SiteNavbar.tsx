import Navbar from "@/components/Navbar";
import { getHomeContent } from "@/lib/site-content/queries";

/**
 * Navbar cho các trang ngoài trang chủ (blog, 404).
 *
 * Navbar nhận nội dung qua prop để trình chỉnh sửa giao diện xem trước được;
 * những trang không có sẵn `HomeContent` thì dùng component này để tự nạp,
 * thay vì mỗi trang phải tự truyền.
 */
export default async function SiteNavbar() {
  const content = await getHomeContent();
  return <Navbar content={content.nav} />;
}
