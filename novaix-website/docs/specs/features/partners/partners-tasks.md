# Tasks — Dải Đối tác & Khách hàng (Partners Strip)

> **Spec:** [`partners-spec.md`](./partners-spec.md) · **RFC:** [`partners-rfc.md`](./partners-rfc.md)
> **Trạng thái:** ✅ **đã triển khai** (18/08/2026).
>
> **Cập nhật 18/08/2026:** viết lại T2 và T4 cho khớp kiến trúc panel mới (component riêng cho từng
> khối, không còn khai báo trường trong `fields.ts`). Bỏ phần việc liên quan tới trường `placement`.

Thứ tự dưới đây là **thứ tự phụ thuộc**, không phải thứ tự ưu tiên.

---

## T1 — Schema, dữ liệu mặc định và đăng ký khối

- [x] `lib/site-content/schema.ts`: thêm `partnerItemSchema`, `partnersSchema`, export `PartnersContent`
- [x] Gắn `partners: partnersSchema.default({})` vào `homeContentSchema`
- [x] **KHÔNG tăng `v`** — [spec §1.1](./partners-spec.md); tăng `v` sẽ reset toàn bộ nội dung trang chủ đang có
- [x] `lib/site-content/defaults.ts`: khối `partners` với `items: []`, `enabled: false`
- [x] Đăng ký khóa `"partners"` vào **cả ba** danh sách ([spec §1.2](./partners-spec.md)):
  - [x] `DEFAULT_SECTION_ORDER` trong `schema.ts` — đặt sau `testimonials`
  - [x] `RENDERABLE_SECTION_KEYS` trong `components/preview/section-keys.ts`
  - [x] `SectionKey` trong `lib/site-content/preview-bridge.ts`

**Xong khi:** `npx tsx scripts/test-customizer.ts` xanh (nhóm 6 và 7 sẽ đỏ nếu đăng ký thiếu), và
bản ghi `home_content` cũ trong database vẫn đọc ra đủ nội dung, không bị reset.

---

## T2 — `ImageInput.tsx`

Component thường, **không** khai kiểu trường vào `fields.ts` — kiến trúc đó không còn dùng.

- [x] `components/admin/customizer/ImageInput.tsx` theo bảng trạng thái ở [spec §2.5](./partners-spec.md)
- [x] Props: `label`, `value`, `onChange`, `folder`, `maxSizeMB`, `hint`
- [x] Kiểm dung lượng **ở client** trước khi gửi
- [x] Ảnh xem trước trên nền ca-rô để thấy vùng trong suốt
- [x] Không đưa giá trị người dùng nhập thẳng vào `sx` của MUI

**Xong khi:** component dùng được cho bất kỳ khối nào, không gắn cứng vào đối tác.

---

## T3 — Server action upload dùng chung

- [x] `lib/media/image-actions.ts`: `uploadImage(formData)` với allowlist `folder`
- [x] Chuyển `detectImageMimeType` sang dùng chung
- [x] `lib/blog/image-actions.ts`: `uploadArticleImage` gọi sang hàm chung, **giữ nguyên chữ ký**
- [x] Từ chối SVG kèm thông báo *"Không nhận tệp SVG. Vui lòng xuất logo sang PNG nền trong suốt."*
- [x] `requireUser()` là dòng đầu tiên
- [x] `rethrowIfNextControlFlow(err)` mở đầu mọi khối `catch`

**Xong khi:** trình soạn bài viết vẫn tải ảnh bình thường (không hồi quy), và tải được logo vào
`partners/YYYY/MM/`.

---

## T4 — Khối trong panel quản trị

Ba việc, theo [spec §2](./partners-spec.md):

- [x] `fields.ts`: thêm metadata vào `SECTIONS_CONFIG` (`fields: []`)
- [x] `components/admin/customizer/PartnersSection.tsx` — khuôn theo `FAQSection.tsx`
  - [x] Danh sách đối tác: accordion lồng, nút ↑ ↓, hộp thoại xác nhận xóa
  - [x] `Slider` cho tốc độ / khoảng cách / chiều cao logo — giống `MarqueeSection`
  - [x] Nhóm màu theo quy ước `customColors` + nút *"Dùng lại màu theme"*
  - [x] Ghi chú ở ô tốc độ: thêm logo mà giữ nguyên số giây thì dải chạy nhanh hơn
- [x] `SectionPanel.tsx`: thêm nhánh `if (sec.key === "partners")` và import icon

**Xong khi:** mở `/admin/giao-dien` thấy khối *"Đối tác & Khách hàng"* với nút mũi tên sắp xếp như
các khối khác; thêm/xóa/sắp xếp đối tác được, chưa cần component công khai.

---

## T5 — Component công khai

- [x] `components/Partners.tsx` theo [spec §4](./partners-spec.md)
- [x] Nhân **đúng hai** bản danh sách, dịch `calc(-50% - gap/2)` — [RFC §5.1](./partners-rfc.md)
- [x] Tự ẩn khi tắt hoặc không còn logo hợp lệ
- [x] Màu qua `safeHex`, chỉ áp khi `customColors` bật
- [x] `<img>` thường, `loading="lazy"`, `alt={name}`, chiều cao cố định
- [x] Không có `link` thì không bọc `<a>`; có thì `rel="noopener noreferrer nofollow"`
- [x] `app/globals.css`: keyframe `partners-scroll` + khối `prefers-reduced-motion`
- [x] `data-section="partners"` trên thẻ ngoài cùng

**Xong khi:** dải chạy liên tục **không thấy điểm nối**, và bật *"giảm chuyển động"* trong hệ điều
hành thì dải đứng yên dạng lưới.

---

## T6 — Ghép vào trang chủ

- [x] `HomeSections.tsx`: thêm `case "partners"` vào `renderSectionByKey`
- [x] Không viết logic vị trí riêng — thứ tự do `sectionOrder` quyết định ([spec §4.5](./partners-spec.md))
- [x] Bấm nút mũi tên trong panel → khung xem trước đổi vị trí ngay, không cần lưu

---

## T7 — Kiểm thử

- [x] Bổ sung nhóm test 9–12 vào `scripts/test-customizer.ts` ([spec §6](./partners-spec.md))
- [x] Chạy tay đủ **AC1–AC9** của [PRD §5](./partners-prd.md)
- [x] Kiểm trên điện thoại thật hoặc chế độ mobile của trình duyệt
- [x] Kiểm bản ghi `home_content` cũ vẫn đọc được sau khi đổi schema
- [x] Kiểm bản ghi có `sectionOrder` cũ (chưa có `"partners"`) — khối phải được bù vào cuối

---

## T8 — Tài liệu (cùng commit, không để lần sau)

- [x] `docs/specs/domains/home-content-domain.md` §4.11: bổ sung khối `partners` vào bản kê nội dung
- [x] Đổi trạng thái bốn tài liệu này từ 📝 sang ✅
- [x] `docs/conventions/coding-style.md`: nếu `ImageInput` sinh ra quy ước mới thì ghi lại

> Theo [luật repo](../../../../../CLAUDE.md) §2: mã đổi thì `docs/` đổi **cùng commit**.

---

# Không làm trong đợt này

| Việc | Vì sao |
| :-- | :-- |
| Trường `placement` riêng | Panel đã có nút sắp xếp khối — [RFC §5.7](./partners-rfc.md) |
| Sửa lỗi nhịp của `Marquee.tsx` | Ngoài phạm vi — [RFC §5.1](./partners-rfc.md) ghi lại để không ai chép sang |
| Trang *"Khách hàng của chúng tôi"* riêng | [PRD §3](./partners-prd.md) |
| Xóa ảnh cũ trên R2 | [RFC §5.5](./partners-rfc.md) |
| Cho tải SVG | [RFC §5.3](./partners-rfc.md) |

---

# Điểm dễ sai — đọc trước khi code

| Cạm bẫy | Hậu quả |
| :-- | :-- |
| Tăng `v` lên 2 | Mọi bản ghi hiện có fail parse → **toàn bộ nội dung trang chủ về mặc định** |
| Đăng ký khóa thiếu một trong ba danh sách | Khối **biến mất khỏi trang chủ trong im lặng**, hoặc không cuộn tới được từ khung xem trước |
| Khai `fields: [...]` như tài liệu bản đầu | Panel không đọc nữa — khối sẽ rỗng. Phải viết `PartnersSection.tsx` |
| Nhân ba bản danh sách như `Marquee.tsx` | Dải giật một nhịp mỗi vòng, rất rõ với logo |
| Quên `rethrowIfNextControlFlow` trong action upload | Phiên hết hạn → người dùng nhận chuỗi `"NEXT_REDIRECT"` |
| Chép `uploadArticleImage` thay vì tổng quát hóa | Lần siết bảo mật sau chỉ chạm một bản |
| Chép lại `safeHex` thay vì import từ `lib/site-content/color.ts` | Đã xảy ra ở `ArticleRail`: regex lệch làm màu `#fff` bị âm thầm bỏ |
| Đưa màu thẳng vào `sx` của MUI | Tiêm CSS làm trắng trang quản trị — đã xảy ra một lần, xem [biên bản rà soát](../../../reviews/blog-review-2026-08-17.md) |
| Dùng `next/image` cho logo | Mỗi host mới phải khai vào `next.config.mjs`; không đáng cho ảnh trong dải chạy |
