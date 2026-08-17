# Luật làm việc trên repo OAlpha

Áp dụng cho **mọi** thay đổi mã nguồn trong repo này, kể cả sửa một dòng.
Mã nguồn nằm ở [`novaix-website/`](novaix-website/) — một ứng dụng Next.js 14 App Router duy nhất.

---

## 1. TRƯỚC khi code — đọc tài liệu

Không mở editor trước khi đọc:

1. [`novaix-website/docs/conventions/coding-style.md`](novaix-website/docs/conventions/coding-style.md) — **bắt buộc, mọi lần**. Nó có bản đồ hai vùng giao diện (Tailwind công khai ↔ MUI admin) và luật không được trộn.
2. [`novaix-website/docs/architecture/tech-stack.md`](novaix-website/docs/architecture/tech-stack.md) — công nghệ nào được dùng, thứ gì **cố ý không có**.
3. Tài liệu của đúng phân hệ đang đụng tới, trong [`novaix-website/docs/specs/`](novaix-website/docs/specs/) — PRD · RFC · spec · tasks · domain.

**Vì sao:** phần lớn quyết định trong repo này là quyết định *có lý do*, và lý do được ghi trong docs chứ không trong code. Viết trước rồi đọc sau là viết lại thứ đã bị loại bỏ có chủ ý — rồi phải bỏ đi.

Nếu tài liệu mâu thuẫn với code: **dừng lại và hỏi**, đừng tự chọn một bên. Một trong hai đang sai, và biết bên nào sai là thông tin của người ra quyết định.

---

## 2. SAU khi code — cập nhật tài liệu trong cùng lượt

Mã đổi thì `docs/` phải đổi **cùng commit**, không để sang lần sau.

| Thay đổi | Phải cập nhật |
| :-- | :-- |
| Thêm/bỏ/nâng thư viện, đổi hạ tầng | `docs/architecture/tech-stack.md` (bảng §1 + ghi chú lý do) |
| Thêm biến môi trường | `.env.example` **và** bảng biến môi trường trong `tech-stack.md` |
| Thêm/đổi script `package.json` | Bảng lệnh trong `tech-stack.md` + README |
| Đổi schema database | `docs/specs/domains/*` của miền đó |
| Thêm/đổi hành vi một tính năng | `docs/specs/features/<tính-năng>/` (spec + tasks) |
| Thêm quy ước code mới, hoặc phá một quy ước cũ | `docs/conventions/coding-style.md` |
| Đổi cấu trúc thư mục | Cây thư mục trong `tech-stack.md` §2 và README |

**Vì sao:** tài liệu sai còn tệ hơn không có tài liệu — người đọc sau tin nó, làm theo, rồi mất nhiều giờ hơn là nếu họ phải tự đọc code từ đầu. Một tài liệu đã kêu oan một lần thì lần sau không ai đọc nữa.

Ghi cả **lý do**, không chỉ kết quả. "Chọn X" là vô dụng sau ba tháng; "chọn X vì Y sẽ hỏng ở chỗ Z" thì không.

---

## 3. KHÔNG set cứng giá trị trong code

🔴 **Giá trị nghiệp vụ và nội dung hiển thị phải sửa được từ trang quản trị `/admin`, không phải sửa code rồi deploy lại.**

Thuộc loại **phải đưa vào `/admin`**:

- Mọi chữ khách nhìn thấy trên trang công khai: tiêu đề, mô tả, nội dung section, nhãn nút, câu hỏi FAQ.
- Thông tin liên hệ: email, số điện thoại, địa chỉ, liên kết mạng xã hội.
- Số liệu trưng bày: số khách hàng, số dự án, phần trăm, giá gói dịch vụ.
- Danh sách nội dung: module, dịch vụ, cảm nhận khách hàng, bài viết.
- Nhận diện: logo, màu thương hiệu, ảnh nền, metadata SEO.
- Ngưỡng nghiệp vụ: số bài trên một trang, số phần tử trên trang chủ.

**Vì sao:** người sửa nội dung là marketing/sale, không phải lập trình viên. Set cứng nghĩa là mỗi lần đổi một số điện thoại phải có người biết code, có quyền deploy, và rảnh — nên thực tế là **nội dung sai cứ nằm đó**. Đây cũng là một trong ba mục tiêu của cả hệ (`tech-stack.md` §Triết lý).

**Ngoại lệ hợp lệ — đừng nhét vào `/admin`:**

| Loại | Đặt ở đâu |
| :-- | :-- |
| Khóa bí mật, chuỗi kết nối, endpoint hạ tầng | Biến môi trường (`.env`) — **không bao giờ** trong DB, vì DB nằm trong mọi bản sao lưu |
| Hằng số kỹ thuật thuần: `revalidate`, giới hạn kích thước file, allowlist thẻ HTML | Hằng số trong code, đặt tên rõ, khai ở **một chỗ duy nhất** |
| Giá trị chỉ lập trình viên mới hiểu đủ để đổi an toàn | Hằng số trong code |

**Giai đoạn quá độ:** nội dung hiện đang nằm trong `lib/data.ts` — chấp nhận được vì đó là **một chỗ tập trung** và màn `/admin/giao-dien` chưa code xong. Nhưng:

- Thêm nội dung mới → vào `lib/data.ts`, **không** rải chữ trực tiếp vào JSX của component.
- Làm màn `/admin/giao-dien` → chuyển `lib/data.ts` sang database, không giữ hai nguồn song song. Hai nguồn cho một thông tin là màn quản trị hiện một đằng, trang web hiện một nẻo.

---

## 4. Nhắc lại ba luật hay bị quên

- **Không trộn hai hệ style.** MUI không vào `components/*` công khai; Tailwind không tạo dáng cho component MUI.
- **Kiểm quyền ở TỪNG server action.** `middleware.ts` chỉ là tiện nghi — server action là endpoint HTTP, gọi thẳng được.
- 🚫 **Không có AI trong hệ này.** Không khóa mô hình ngôn ngữ, không sinh nội dung tự động. Xem `blog-rfc.md` §4.
