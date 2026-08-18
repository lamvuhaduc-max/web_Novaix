# Tasks — Dải Đối tác & Khách hàng (Partners Strip)

> **Spec:** [`partners-spec.md`](./partners-spec.md) · **RFC:** [`partners-rfc.md`](./partners-rfc.md)
> **Trạng thái:** 📝 chưa bắt đầu · **Ước lượng:** ~1,5 ngày công

Thứ tự dưới đây là **thứ tự phụ thuộc**, không phải thứ tự ưu tiên. T1 và T2 phải xong trước khi
làm được T3 trở đi.

---

## T1 — Schema và dữ liệu mặc định

- [ ] `lib/site-content/schema.ts`: thêm `partnerItemSchema`, `partnersSchema`, export `PartnersContent`
- [ ] Gắn `partners: partnersSchema.default({})` vào `homeContentSchema`
- [ ] **KHÔNG tăng `v`** — xem [spec §1.1](./partners-spec.md), tăng `v` sẽ reset toàn bộ nội dung trang chủ đang có
- [ ] `lib/site-content/defaults.ts`: khối `partners` với `items: []`, `enabled: false`
- [ ] `lib/site-content/preview-bridge.ts`: thêm `"partners"` vào `SectionKey`

**Xong khi:** `npx tsx scripts/test-customizer.ts` vẫn xanh, và bản ghi `home_content` cũ trong
database (chưa có khối `partners`) vẫn đọc ra đủ nội dung, không bị reset.

---

## T2 — Ba kiểu trường mới cho Customizer

Đây là phần dùng chung, không riêng gì đối tác — các khối khác sẽ dùng lại.

- [ ] `fields.ts`: thêm `ImageField`, `BooleanField`, `SelectField` vào `SimpleFieldDef`
- [ ] `components/admin/customizer/ImageInput.tsx` — theo bảng trạng thái ở [spec §2.3](./partners-spec.md)
- [ ] `BooleanInput` (Switch) và `SelectInput` (Select)
- [ ] `FieldInput.tsx`: định tuyến ba kiểu mới
- [ ] Kiểm dung lượng **ở client** trước khi gửi
- [ ] Không đưa giá trị người dùng nhập thẳng vào `sx` của MUI

**Xong khi:** khai một trường `image` bất kỳ trong `SECTIONS_CONFIG` là panel dựng được giao diện,
không phải viết thêm component.

---

## T3 — Server action upload dùng chung

- [ ] `lib/media/image-actions.ts`: `uploadImage(formData)` với allowlist `folder`
- [ ] Chuyển logic `detectImageMimeType` sang dùng chung
- [ ] `lib/blog/image-actions.ts`: `uploadArticleImage` gọi sang hàm chung, **giữ nguyên chữ ký**
- [ ] Từ chối SVG kèm thông báo *"Không nhận tệp SVG. Vui lòng xuất logo sang PNG nền trong suốt."*
- [ ] `requireUser()` là dòng đầu tiên
- [ ] `rethrowIfNextControlFlow(err)` mở đầu mọi khối `catch`

**Xong khi:** trình soạn bài viết vẫn tải ảnh bình thường (không hồi quy), và tải được logo vào
`partners/YYYY/MM/`.

---

## T4 — Khai báo khối trong panel

- [ ] `fields.ts`: thêm khối `partners` vào `SECTIONS_CONFIG` theo [spec §2.2](./partners-spec.md)
- [ ] Ghi chú ở ô tốc độ: thêm logo mà giữ nguyên số giây thì dải chạy nhanh hơn
- [ ] Ghi chú ở ô tên: dùng làm mô tả ảnh cho trình đọc màn hình

**Xong khi:** mở `/admin/giao-dien` thấy khối *"Đối tác & Khách hàng"*, thêm/xóa/sắp xếp được, chưa
cần có component công khai.

---

## T5 — Component công khai

- [ ] `components/Partners.tsx` theo [spec §4](./partners-spec.md)
- [ ] Nhân **đúng hai** bản danh sách, dịch `calc(-50% - gap/2)` — [RFC §5.1](./partners-rfc.md)
- [ ] Tự ẩn khi tắt hoặc không còn logo hợp lệ
- [ ] `<img>` thường, `loading="lazy"`, `alt={name}`, chiều cao cố định
- [ ] Không có `link` thì không bọc `<a>`; có thì `rel="noopener noreferrer nofollow"`
- [ ] `app/globals.css`: keyframe `partners-scroll` + khối `prefers-reduced-motion`
- [ ] `data-section="partners"` trên thẻ ngoài cùng

**Xong khi:** dải chạy liên tục **không thấy điểm nối**, và bật *"giảm chuyển động"* trong hệ điều
hành thì dải đứng yên dạng lưới.

---

## T6 — Ghép vào trang chủ

- [ ] `components/preview/HomeSections.tsx`: chèn theo `placement` ([spec §4.5](./partners-spec.md))
- [ ] Đổi `placement` trong panel → khung xem trước nhảy đúng vị trí ngay, không cần lưu

---

## T7 — Kiểm thử

- [ ] Bổ sung 5 nhóm kiểm vào `scripts/test-customizer.ts` ([spec §6](./partners-spec.md))
- [ ] Chạy tay đủ **AC1–AC9** của [PRD §5](./partners-prd.md)
- [ ] Kiểm trên điện thoại thật hoặc chế độ mobile của trình duyệt
- [ ] Kiểm bản ghi `home_content` cũ vẫn đọc được sau khi đổi schema

---

## T8 — Tài liệu (cùng commit, không để lần sau)

- [ ] `docs/specs/domains/home-content-domain.md`: bổ sung khối `partners` vào bản kê nội dung
- [ ] Đổi trạng thái bốn tài liệu này từ 📝 sang ✅
- [ ] `docs/conventions/coding-style.md`: nếu kiểu trường `image` sinh ra quy ước mới thì ghi lại

> Theo [luật repo](../../../../../CLAUDE.md) §2: mã đổi thì `docs/` đổi **cùng commit**.

---

# Không làm trong đợt này

| Việc | Vì sao |
| :-- | :-- |
| Sửa lỗi nhịp của `Marquee.tsx` | Ngoài phạm vi — RFC §5.1 đã ghi lại để không ai chép sang |
| Trang *"Khách hàng của chúng tôi"* riêng | PRD §3 |
| Xóa ảnh cũ trên R2 | RFC §5.5 |
| Cho tải SVG | RFC §5.3 |

---

# Điểm dễ sai — đọc trước khi code

| Cạm bẫy | Hậu quả |
| :-- | :-- |
| Tăng `v` lên 2 | Mọi bản ghi hiện có fail parse → **toàn bộ nội dung trang chủ về mặc định** |
| Nhân ba bản danh sách như `Marquee.tsx` | Dải giật một nhịp mỗi vòng, rất rõ với logo |
| Quên `rethrowIfNextControlFlow` trong action upload | Phiên hết hạn → người dùng nhận chuỗi `"NEXT_REDIRECT"` |
| Chép `uploadArticleImage` thay vì tổng quát hóa | Lần siết bảo mật sau chỉ chạm một bản |
| Đưa `bgColor` thẳng vào `sx` của MUI | Tiêm CSS làm trắng trang quản trị — đã xảy ra một lần, xem [biên bản rà soát](../../../reviews/blog-review-2026-08-17.md) |
| Dùng `next/image` cho logo | Mỗi host mới phải khai vào `next.config.mjs`; không đáng cho ảnh trong dải chạy |
| Quên thêm `"partners"` vào `SectionKey` | Bấm vào dải trong khung xem trước không mở đúng mục trong panel |
