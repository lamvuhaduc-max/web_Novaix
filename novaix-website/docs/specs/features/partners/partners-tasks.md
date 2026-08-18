# Tasks — Dải Đối tác & Khách hàng (Partners Strip)

> **Spec:** [`partners-spec.md`](./partners-spec.md) · **RFC:** [`partners-rfc.md`](./partners-rfc.md)
> **Trạng thái:** 📝 chưa bắt đầu · **Ước lượng:** ~1,5 ngày công
>
> **Cập nhật 18/08/2026:** viết lại T2 và T4 cho khớp kiến trúc panel mới (component riêng cho từng
> khối, không còn khai báo trường trong `fields.ts`). Bỏ phần việc liên quan tới trường `placement`.

Thứ tự dưới đây là **thứ tự phụ thuộc**, không phải thứ tự ưu tiên.

---

## T1 — Schema, dữ liệu mặc định và đăng ký khối

- [ ] `lib/site-content/schema.ts`: thêm `partnerItemSchema`, `partnersSchema`, export `PartnersContent`
- [ ] Gắn `partners: partnersSchema.default({})` vào `homeContentSchema`
- [ ] **KHÔNG tăng `v`** — [spec §1.1](./partners-spec.md); tăng `v` sẽ reset toàn bộ nội dung trang chủ đang có
- [ ] `lib/site-content/defaults.ts`: khối `partners` với `items: []`, `enabled: false`
- [ ] Đăng ký khóa `"partners"` vào **cả ba** danh sách ([spec §1.2](./partners-spec.md)):
  - [ ] `DEFAULT_SECTION_ORDER` trong `schema.ts` — đặt sau `testimonials`
  - [ ] `RENDERABLE_SECTION_KEYS` trong `components/preview/section-keys.ts`
  - [ ] `SectionKey` trong `lib/site-content/preview-bridge.ts`

**Xong khi:** `npx tsx scripts/test-customizer.ts` xanh (nhóm 6 và 7 sẽ đỏ nếu đăng ký thiếu), và
bản ghi `home_content` cũ trong database vẫn đọc ra đủ nội dung, không bị reset.

---

## T2 — `ImageInput.tsx`

Component thường, **không** khai kiểu trường vào `fields.ts` — kiến trúc đó không còn dùng.

- [ ] `components/admin/customizer/ImageInput.tsx` theo bảng trạng thái ở [spec §2.5](./partners-spec.md)
- [ ] Props: `label`, `value`, `onChange`, `folder`, `maxSizeMB`, `hint`
- [ ] Kiểm dung lượng **ở client** trước khi gửi
- [ ] Ảnh xem trước trên nền ca-rô để thấy vùng trong suốt
- [ ] Không đưa giá trị người dùng nhập thẳng vào `sx` của MUI

**Xong khi:** component dùng được cho bất kỳ khối nào, không gắn cứng vào đối tác.

---

## T3 — Server action upload dùng chung

- [ ] `lib/media/image-actions.ts`: `uploadImage(formData)` với allowlist `folder`
- [ ] Chuyển `detectImageMimeType` sang dùng chung
- [ ] `lib/blog/image-actions.ts`: `uploadArticleImage` gọi sang hàm chung, **giữ nguyên chữ ký**
- [ ] Từ chối SVG kèm thông báo *"Không nhận tệp SVG. Vui lòng xuất logo sang PNG nền trong suốt."*
- [ ] `requireUser()` là dòng đầu tiên
- [ ] `rethrowIfNextControlFlow(err)` mở đầu mọi khối `catch`

**Xong khi:** trình soạn bài viết vẫn tải ảnh bình thường (không hồi quy), và tải được logo vào
`partners/YYYY/MM/`.

---

## T4 — Khối trong panel quản trị

Ba việc, theo [spec §2](./partners-spec.md):

- [ ] `fields.ts`: thêm metadata vào `SECTIONS_CONFIG` (`fields: []`)
- [ ] `components/admin/customizer/PartnersSection.tsx` — khuôn theo `FAQSection.tsx`
  - [ ] Danh sách đối tác: accordion lồng, nút ↑ ↓, hộp thoại xác nhận xóa
  - [ ] `Slider` cho tốc độ / khoảng cách / chiều cao logo — giống `MarqueeSection`
  - [ ] Nhóm màu theo quy ước `customColors` + nút *"Dùng lại màu theme"*
  - [ ] Ghi chú ở ô tốc độ: thêm logo mà giữ nguyên số giây thì dải chạy nhanh hơn
- [ ] `SectionPanel.tsx`: thêm nhánh `if (sec.key === "partners")` và import icon

**Xong khi:** mở `/admin/giao-dien` thấy khối *"Đối tác & Khách hàng"* với nút mũi tên sắp xếp như
các khối khác; thêm/xóa/sắp xếp đối tác được, chưa cần component công khai.

---

## T5 — Component công khai

- [ ] `components/Partners.tsx` theo [spec §4](./partners-spec.md)
- [ ] Nhân **đúng hai** bản danh sách, dịch `calc(-50% - gap/2)` — [RFC §5.1](./partners-rfc.md)
- [ ] Tự ẩn khi tắt hoặc không còn logo hợp lệ
- [ ] Màu qua `safeHex`, chỉ áp khi `customColors` bật
- [ ] `<img>` thường, `loading="lazy"`, `alt={name}`, chiều cao cố định
- [ ] Không có `link` thì không bọc `<a>`; có thì `rel="noopener noreferrer nofollow"`
- [ ] `app/globals.css`: keyframe `partners-scroll` + khối `prefers-reduced-motion`
- [ ] `data-section="partners"` trên thẻ ngoài cùng

**Xong khi:** dải chạy liên tục **không thấy điểm nối**, và bật *"giảm chuyển động"* trong hệ điều
hành thì dải đứng yên dạng lưới.

---

## T6 — Ghép vào trang chủ

- [ ] `HomeSections.tsx`: thêm `case "partners"` vào `renderSectionByKey`
- [ ] Không viết logic vị trí riêng — thứ tự do `sectionOrder` quyết định ([spec §4.5](./partners-spec.md))
- [ ] Bấm nút mũi tên trong panel → khung xem trước đổi vị trí ngay, không cần lưu

---

## T7 — Kiểm thử

- [ ] Bổ sung nhóm test 9–12 vào `scripts/test-customizer.ts` ([spec §6](./partners-spec.md))
- [ ] Chạy tay đủ **AC1–AC9** của [PRD §5](./partners-prd.md)
- [ ] Kiểm trên điện thoại thật hoặc chế độ mobile của trình duyệt
- [ ] Kiểm bản ghi `home_content` cũ vẫn đọc được sau khi đổi schema
- [ ] Kiểm bản ghi có `sectionOrder` cũ (chưa có `"partners"`) — khối phải được bù vào cuối

---

## T8 — Tài liệu (cùng commit, không để lần sau)

- [ ] `docs/specs/domains/home-content-domain.md` §4.11: bổ sung khối `partners` vào bản kê nội dung
- [ ] Đổi trạng thái bốn tài liệu này từ 📝 sang ✅
- [ ] `docs/conventions/coding-style.md`: nếu `ImageInput` sinh ra quy ước mới thì ghi lại

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
