import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow flex items-center justify-center pt-28 pb-20">
        <div className="wrap text-center max-w-lg">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-3xl font-extrabold text-ink mb-3">
            Trang không tìm thấy (404)
          </h1>
          <p className="text-muted text-base mb-8 leading-relaxed">
            Nội dung bạn đang tìm kiếm không tồn tại, đã bị ẩn hoặc vừa chuyển sang vị trí khác.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/" className="btn btn-primary">
              Về Trang chủ
            </Link>
            <Link href="/blog" className="btn btn-secondary border border-line">
              Xem tất cả Bài viết
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
