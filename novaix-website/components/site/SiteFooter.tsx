import Footer from "@/components/Footer";
import { getHomeContent } from "@/lib/site-content/queries";

/** Footer cho các trang ngoài trang chủ. Xem ghi chú ở SiteNavbar. */
export default async function SiteFooter() {
  const content = await getHomeContent();
  return <Footer content={content.footer} />;
}
