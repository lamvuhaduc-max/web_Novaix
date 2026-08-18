# PRD — Dải Đối tác & Khách hàng (Partners Strip)

> **Domain gốc:** [`home-content-domain.md`](../../domains/home-content-domain.md) — đây là **một khối nội dung của trang chủ**, không phải phân hệ riêng.
> **Mã FR:** `FR-P01`…`FR-P12` (nhóm **P** — Partners)
> **Trạng thái:** 📝 **chưa triển khai** — tài liệu chờ duyệt, chưa viết dòng code nào.
> **Cập nhật 18/08/2026:** `FR-P10` đổi cách thực hiện sau khi panel có tính năng sắp xếp khối.
> **Phụ thuộc:** [Customizer](../customizer/customizer-prd.md) (đã xong) — dùng chung `site_settings.home_content`, khung xem trước và cơ chế nháp/hoàn tác.

---

# 1. Vấn đề

## 1.1 Logo đối tác là thứ khách nhìn trước khi tin

Với phần mềm quản trị doanh nghiệp, quyết định mua hàng đi qua một câu hỏi: *"Đã có ai dùng chưa?"*
Trang chủ OAlpha hiện trả lời câu đó bằng **chữ** — 3 lời chứng thực và vài con số. Không có một
logo nào.

Dải logo đối tác là dạng bằng chứng rẻ nhất và được đọc nhanh nhất: khách quét mắt trong 2 giây,
nhận ra một cái tên quen, và ở lại đọc tiếp.

## 1.2 Danh sách đối tác thay đổi thường xuyên hơn mọi thứ khác trên trang chủ

Ký thêm một khách lớn, một đối tác cũ đổi nhận diện, một hợp đồng hết hạn và phải gỡ logo xuống
**ngay trong ngày** vì lý do pháp lý. Đây là loại nội dung đổi hằng tháng — chính xác là loại
**không được** nằm trong mã nguồn.

## 1.3 Nếu làm sai cách, nó sẽ lại là một dải viết cứng

Trang chủ đã có sẵn `components/Marquee.tsx` — một dải chữ chạy ngang. Cách nhanh nhất để có dải
đối tác là chép nó ra, đổi chữ thành `<img>`, nhét mảng logo vào `lib/data.ts` và gọi là xong.

Làm vậy là **lặp lại đúng vấn đề mà Customizer vừa mất một đợt để dọn**: nội dung quay về mã nguồn,
marketing lại phải mở ticket, và repo có thêm một dải chạy thứ hai trôi dạt khỏi dải thứ nhất.

## 1.4 Ai bị ảnh hưởng

| Nhóm | Chịu gì |
| :-- | :-- |
| **Marketing** | Không tự thêm được logo khách hàng mới sau khi ký hợp đồng |
| **Sale** | Mất một luận cứ mạnh khi khách hỏi "có ai dùng chưa" |
| **Pháp chế** | Không gỡ được logo trong ngày khi hợp đồng chấm dứt hoặc đối tác yêu cầu |
| **Lập trình viên** | Thành người gác cổng cho việc thêm/bớt một tấm ảnh |

---

# 2. Mục tiêu

| # | Mục tiêu | Đo bằng |
| :-- | :-- | :-- |
| **G1** | Thêm, sửa, gỡ, sắp xếp lại đối tác **không cần deploy** | Thêm một logo → hiện trên web, **0** lần build |
| **G2** | **Mọi thuộc tính hiển thị đều cấu hình được** | Tốc độ chạy, khoảng cách, hướng, bật/tắt, vị trí trên trang — tất cả trong `/admin`, không có hằng số nào phải sửa code |
| **G3** | Tải logo lên ngay trong màn sửa | Chọn tệp từ máy → có URL R2 → thấy trong khung xem trước, không rời trang |
| **G4** | Gỡ logo là việc của **một phút** | Tắt hiển thị một đối tác bằng một công tắc, không cần xóa dữ liệu |
| **G5** | Không đẻ thêm hạ tầng | Không thêm bảng, không thêm gói npm, không thêm biến môi trường |

---

# 3. Ngoài phạm vi (Non-goals)

| Không làm | Vì sao |
| :-- | :-- |
| Trang *"Khách hàng của chúng tôi"* riêng, có phân trang, lọc theo ngành | Chưa có nhu cầu. Khi nào cần thì đây là lúc tách `partners` ra bảng riêng — xem [RFC §7](./partners-rfc.md) |
| Gắn dải đối tác vào trang `/blog` hay trang bài viết | Đây là bằng chứng cho trang bán hàng, không phải cho trang đọc |
| Cho tải lên **SVG** | SVG là tài liệu chạy được script. Xem [RFC §5.3](./partners-rfc.md) |
| Tự động lấy logo từ website đối tác | Phụ thuộc mạng ngoài, hỏng im lặng, và dính bản quyền |
| Thống kê số lượt bấm vào logo đối tác | Không có hệ đo lường trong dự án; thêm vào là thêm một phân hệ |

---

# 4. Yêu cầu chức năng

## 4.1 Nội dung một đối tác

| Mã | Yêu cầu | Bắt buộc |
| :-- | :-- | :-- |
| **FR-P01** | Mỗi đối tác có **tên** — vừa để nhận biết trong màn quản trị, vừa là `alt` của ảnh | ✅ |
| **FR-P02** | Mỗi đối tác có **logo**, tải lên từ máy, lưu trên Cloudflare R2 | ✅ |
| **FR-P03** | Mỗi đối tác có **liên kết** tùy chọn; để trống thì logo không bấm được | ⬜ |
| **FR-P04** | Mỗi đối tác có **công tắc hiển thị** — tắt để gỡ khỏi web mà vẫn giữ dữ liệu | ✅ |
| **FR-P05** | **Sắp xếp lại thứ tự** bằng nút lên/xuống | ✅ |

## 4.2 Cấu hình cả dải

| Mã | Yêu cầu | Khoảng giá trị |
| :-- | :-- | :-- |
| **FR-P06** | Bật/tắt toàn bộ dải | — |
| **FR-P07** | **Tốc độ chạy** — số giây để chạy hết một vòng | 5–120 giây |
| **FR-P08** | **Khoảng cách** giữa hai logo | 20–400 px |
| **FR-P09** | **Hướng chạy**: trái hoặc phải | — |
| **FR-P10** | **Vị trí trên trang chủ** đổi được | Dùng nút sắp xếp khối có sẵn của panel, không làm trường riêng — xem [RFC §5.7](./partners-rfc.md) |
| **FR-P11** | Dòng nhãn phía trên dải (ví dụ *"Được tin dùng bởi"*) và màu nền | — |
| **FR-P12** | **Dừng khi rê chuột** — bật/tắt | — |

## 4.3 Ràng buộc

- Tối thiểu **0** đối tác (dải trống thì tự ẩn, không để lại khoảng trắng).
- Tối đa **24** đối tác — quá số này thì dải quá dài, và đó là dấu hiệu cần một trang riêng.
- Logo tối đa **2 MB**, định dạng **PNG · JPEG · WebP**.

---

# 5. Tiêu chí nghiệm thu

| # | Kịch bản | Kết quả mong đợi |
| :-- | :-- | :-- |
| **AC1** | Marketing tải lên 6 logo, đặt tốc độ 40 giây, bấm *Lưu & áp dụng* | Trang chủ hiện dải chạy 40 giây/vòng, **không** cần deploy |
| **AC2** | Gõ đổi tốc độ từ 40 xuống 15 | Khung xem trước đổi **ngay trong lúc gõ**, chưa cần lưu |
| **AC3** | Tắt công tắc của một đối tác | Logo biến mất khỏi web, dữ liệu vẫn còn trong màn quản trị |
| **AC4** | Xóa hết đối tác | Trang chủ không có dải, **không** có khoảng trắng thừa |
| **AC5** | Tải lên một tệp `.svg` đổi đuôi thành `.png` | Bị từ chối, kèm thông báo tiếng Việt |
| **AC6** | Đối tác không có liên kết | Logo hiển thị, không bấm được, không có con trỏ bàn tay |
| **AC7** | Máy bật *"giảm chuyển động"* trong hệ điều hành | Dải **đứng yên**, logo vẫn xem được đủ |
| **AC8** | Xem trên điện thoại | Dải chạy mượt, logo không vỡ, không tràn ngang |
| **AC9** | Ảnh logo bị xóa khỏi R2 | Ô logo trống, **các logo khác vẫn chạy bình thường** |

---

# 6. Rủi ro

| Rủi ro | Mức | Xử lý |
| :-- | :-- | :-- |
| Logo nhiều màu, nhiều kích cỡ → dải trông lộn xộn | Cao | Chuẩn hóa chiều cao, có tùy chọn lọc xám + sáng lên khi rê chuột ([Spec §4.3](./partners-spec.md)) |
| Dùng logo khách hàng khi chưa được phép | Cao | Ngoài phạm vi kỹ thuật — nhưng FR-P04 cho phép gỡ trong một phút |
| 24 ảnh tải cùng lúc làm chậm trang chủ | Trung bình | `loading="lazy"`, chiều cao cố định để không giật bố cục |
| Ảnh cũ nằm lại trên R2 sau khi đổi logo | Thấp | Chấp nhận. Xem [RFC §5.5](./partners-rfc.md) |
