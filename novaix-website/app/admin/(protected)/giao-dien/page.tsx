import ComingSoon from "@/components/admin/ComingSoon";
import PageHeader from "@/components/admin/PageHeader";

export const metadata = { title: "Giao diện trang chủ · OAlpha Admin" };

export default function HomeContentPage() {
  return (
    <>
      <PageHeader
        title="Giao diện trang chủ"
        description="Chỉnh sửa toàn bộ chữ hiển thị trên trang chủ mà không cần lập trình viên."
      />
      <ComingSoon
        icon="🎨"
        title="Trình sửa nội dung trang chủ"
        points={[
          "Sửa tiêu đề, mô tả từng khối: Hero, Giới thiệu, Module, Quy trình, Bảng giá, FAQ",
          "Quản lý danh sách số liệu, lĩnh vực, cảm nhận khách hàng",
          "Xem trước thay đổi trước khi xuất bản",
          "Lưu lịch sử phiên bản, hoàn tác về bản cũ",
        ]}
      />
    </>
  );
}
