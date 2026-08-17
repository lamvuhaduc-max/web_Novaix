import ComingSoon from "@/components/admin/ComingSoon";
import PageHeader from "@/components/admin/PageHeader";

export const metadata = { title: "Bài viết · OAlpha Admin" };

export default function PostsPage() {
  return (
    <>
      <PageHeader
        title="Bài viết"
        description="Soạn, xuất bản và quản lý tin tức, kiến thức chuyển đổi số của OAlpha."
      />
      <ComingSoon
        icon="📝"
        title="Trình quản lý bài viết"
        points={[
          "Soạn thảo nội dung với trình editor, chèn ảnh lưu trên Cloudflare R2",
          "Danh mục, thẻ, đường dẫn tùy chỉnh và thông tin SEO",
          "Trạng thái nháp / đã xuất bản, hẹn giờ đăng",
          "Trang danh sách và trang chi tiết bài viết ngoài website",
        ]}
      />
    </>
  );
}
