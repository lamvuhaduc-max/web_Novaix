# RFC — Dải Đối tác & Khách hàng (Partners Strip)

> **PRD:** [`partners-prd.md`](./partners-prd.md) · **Domain:** [`home-content-domain.md`](../../domains/home-content-domain.md)
> **Trạng thái:** ✅ **đã triển khai** (18/08/2026).

---

# 1. Bối cảnh

Trang chủ đã có `components/Marquee.tsx` — một dải **chữ** chạy ngang, đã được Customizer đưa vào
`site_settings.home_content` với đủ `speed`, `gap`, `bgColor`, `enabled`. Dải đối tác về bản chất là
**cùng một cơ chế, đổi chữ thành ảnh**.

RFC này mô tả cách thêm nó mà không đẻ ra bảng mới, gói mới, hay một dải chạy thứ hai trôi dạt khỏi
dải thứ nhất.

---

# 2. Ba quyết định chính

| # | Quyết định | Bác bỏ phương án |
| :-- | :-- | :-- |
| **D1** | Lưu trong `home_content` jsonb, thêm khối `partners` | Bảng `partners` riêng |
| **D2** | Viết `PartnersSection.tsx` theo khuôn các khối có sẵn của panel | Viết một màn quản trị riêng |
| **D3** | Dùng CSS animation nhân đôi danh sách | Thư viện carousel |

---

# 3. D1 — Không thêm bảng

## 3.1 Chọn gì

`partners` là một khối trong `homeContentSchema`, nằm cùng chỗ với `hero`, `marquee`, `footer`:

```text
site_settings
  key   = 'home_content'
  value = { v: 1, hero: {...}, marquee: {...}, partners: {...}, ... }
```

## 3.2 Vì sao

Đổi lại được **miễn phí** toàn bộ hạ tầng Customizer đã dựng:

| Có sẵn | Nếu tách bảng riêng thì phải viết lại |
| :-- | :-- |
| Xem trước trực tiếp qua `postMessage` | Cơ chế xem trước thứ hai |
| Bản nháp trong `localStorage` | Cơ chế nháp riêng |
| Hoàn tác / làm lại | Ngăn xếp lịch sử riêng |
| Chống ghi đè bằng `baseUpdatedAt` | Khóa lạc quan riêng |
| Ghi `activity_logs` khi lưu | Ghi nhật ký riêng |
| `resolveHomeContent` không bao giờ làm vỡ trang chủ | Xử lý dữ liệu hỏng riêng |

Một bảng riêng chỉ đáng khi cần **truy vấn** đối tác — lọc theo ngành, phân trang, dùng lại ở trang
khác. Hiện tại chỉ cần đọc toàn bộ một lần để render một dải. Đọc cả khối jsonb rẻ hơn một lần `JOIN`.

## 3.3 Khi nào đổi ý

Tách `partners` thành bảng riêng khi xuất hiện **một trong ba** dấu hiệu:

1. Cần trang *"Khách hàng của chúng tôi"* có phân trang hoặc lọc theo ngành.
2. Số đối tác vượt ~50 — khối jsonb phình làm mọi thao tác lưu nội dung chậm theo.
3. Cần gắn dữ liệu khác vào đối tác: ngành, ngày ký, người phụ trách, tình trạng hợp đồng.

Chưa có dấu hiệu nào thì **không tách** — đó là trừu tượng hóa sớm, đúng thứ
[coding-style](../../../conventions/coding-style.md) đã cấm.

---

# 4. D2 — Component riêng cho khối, không khai báo trường

> **Cập nhật 18/08/2026.** Bản RFC đầu đề xuất thêm `type: "image"` vào `fields.ts` để panel tự dựng
> giao diện. Kiến trúc đó **đã bị thay thế** trước khi tính năng này được code — mục này viết lại
> theo hiện trạng.

## 4.1 Kiến trúc panel hiện tại

`SECTIONS_CONFIG` trong `fields.ts` nay chỉ còn là **sổ đăng ký metadata** (`key`, `title`,
`iconName`, `category`, `fields: []` rỗng). Giao diện sửa của từng khối là **một component riêng**
— `HeroSection.tsx`, `AboutSection.tsx`, `FAQSection.tsx`… — được `SectionPanel.renderSectionBody()`
điều hướng tới bằng một chuỗi `if (sec.key === "...")`.

Đánh đổi của kiến trúc này: mỗi khối viết tay nhiều hơn, nhưng bố cục tự do hơn hẳn (slider, nút sắp
xếp, hộp thoại xác nhận xóa, nhóm màu gập/mở) — thứ mà bảng khai báo trường không diễn đạt nổi.

## 4.2 Hệ quả cho dải đối tác

Thêm khối cần ba việc thay vì một dòng khai báo:

```text
1. fields.ts        → metadata vào SECTIONS_CONFIG (fields: [])
2. PartnersSection.tsx  → viết giao diện sửa, khuôn theo FAQSection.tsx
3. SectionPanel.tsx     → thêm nhánh điều hướng
```

Chi tiết ở [spec §2](./partners-spec.md).

## 4.3 `ImageInput` là component thường, không phải kiểu trường

Vì không còn bảng khai báo trường, `ImageInput.tsx` là một component nhận props trực tiếp
(`value`, `onChange`, `folder`, `maxSizeMB`, `hint`), đặt cạnh `ColorInput.tsx`.

Đây vẫn là **thứ mới duy nhất có giá trị lâu dài** trong cả tính năng: ảnh nền Hero và ảnh khối
*Về chúng tôi* đều sẽ dùng lại. Viết nó gắn cứng vào đối tác là bỏ phí.

## 4.4 Tái dùng action upload đã có

`lib/blog/image-actions.ts` đã có `uploadArticleImage`: kiểm quyền, giới hạn dung lượng, **nhận dạng
định dạng bằng magic byte**, đẩy lên R2 qua `getStorageDriver()`.

Việc cần làm là **tổng quát hóa, không chép**:

```text
lib/media/image-actions.ts
  uploadImage(formData)        // formData.folder ∈ {"blog", "partners"}
lib/blog/image-actions.ts
  uploadArticleImage(...)      // gọi sang hàm chung, giữ nguyên chữ ký cũ
```

Chép hàm này ra chỗ thứ hai là đúng thứ [coding-style](../../../conventions/coding-style.md) cấm ở
mục *"Tách để tái dùng"*: lần siết bảo mật sau sẽ chỉ chạm một bản, bản kia hỏng trong im lặng.

---

# 5. Chi tiết kỹ thuật

## 5.1 Vòng lặp CSS phải nhân **đôi**, không nhân ba

`components/Marquee.tsx` hiện nhân danh sách thành **ba** bản rồi chạy `translateX(-50%)`:

```tsx
const loop = [...content.items, ...content.items, ...content.items];
```

Ba bản có tổng bề rộng `3W`, dịch `-50%` là dịch `1.5W` — **không phải bội số của `W`**. Khi
animation quay về 0, nội dung nhảy một nhịp. Với dải chữ thì khó thấy; với **logo** thì rất rõ.

Dải đối tác nhân **đúng hai** bản và dịch trọn một bản:

```tsx
const loop = [...visible, ...visible];
// transform: translateX(calc(-50% - var(--partners-gap) / 2))
```

Trừ thêm nửa `gap` vì `flex` chèn một khoảng giữa hai bản mà bản thân `-50%` không tính tới.

> Dải chữ `Marquee` hiện có cũng đang dính lỗi nhịp này. Sửa nó **nằm ngoài phạm vi RFC** — ghi lại
> ở đây để không ai tưởng đó là chủ ý rồi chép sang.

## 5.2 Tốc độ là **thời gian**, không phải "nhanh/chậm"

`speed` = số giây chạy hết một vòng, khớp với `marquee.speed` đã có. Người dùng hiểu ngay
*"40 giây một vòng"*, và giá trị không đổi ý nghĩa khi thêm bớt logo.

Hệ quả cần nói rõ trong giao diện: thêm logo mà giữ nguyên `speed` thì dải chạy **nhanh hơn** — đi
quãng đường dài hơn trong cùng thời gian. Đây là hành vi đúng và giống mọi marquee CSS; ô nhập kèm
ghi chú nhắc điều đó.

## 5.3 Không nhận SVG — cố ý

Logo thương hiệu hay ở dạng SVG, và đây là thứ đầu tiên người dùng sẽ thử tải lên.

**SVG là tài liệu XML chạy được `<script>`.** Một tệp SVG đặt trên cùng tên miền, mở trực tiếp, là
XSS chạy trong ngữ cảnh trang OAlpha. Chặn an toàn cần một trình làm sạch SVG riêng — thêm một gói,
thêm một bề mặt tấn công, cho một tính năng chỉ để hiển thị.

Chỉ nhận **PNG · JPEG · WebP**, nhận dạng bằng **magic byte** chứ không tin phần mở rộng tên tệp hay
`file.type` do trình duyệt gửi lên. Thông báo lỗi nói thẳng việc cần làm:
*"Không nhận tệp SVG. Vui lòng xuất logo sang PNG nền trong suốt."*

## 5.4 Ảnh hỏng không được kéo theo cả dải

Logo trỏ tới R2; ảnh có thể bị xóa hoặc R2 lỗi. Dùng thẻ `<img>` thường (như `ArticleCard` đang
làm), `loading="lazy"`, và **chiều cao cố định** để ảnh hỏng để lại một ô trống đúng kích thước thay
vì làm giật bố cục cả dải.

Không dùng `next/image`: ảnh nằm trong một dải chạy liên tục nên việc tối ưu không đáng, và mỗi host
mới lại phải khai thêm vào `next.config.mjs`.

## 5.5 Ảnh cũ nằm lại trên R2

Đổi logo của một đối tác thì tệp cũ vẫn nằm trên R2. Chấp nhận: quy mô là vài chục tệp, chi phí gần
như bằng không, còn xóa tự động thì cần đếm tham chiếu — và một lỗi đếm sai sẽ **xóa mất ảnh đang
dùng**. Rủi ro lớn hơn lợi ích nhiều lần.

## 5.6 Tôn trọng `prefers-reduced-motion`

Chuyển động ngang liên tục gây khó chịu cho người nhạy cảm tiền đình. Khi hệ điều hành bật *"giảm
chuyển động"*, dải **đứng yên** và hiển thị logo dạng lưới tĩnh — không phải ẩn đi. Người dùng vẫn
xem được đủ nội dung.

## 5.7 Vị trí trên trang: dùng `sectionOrder` có sẵn, bỏ trường `placement`

> **Cập nhật 18/08/2026.** Bản đầu đề xuất một trường `placement` với hai giá trị cố định. Trong lúc
> tài liệu chờ duyệt, panel đã có **nút mũi tên ↑ ↓ trên mọi khối trang chủ**, lưu vào
> `content.sectionOrder`. Trường `placement` vì thế **bị bỏ**.

Làm thêm `placement` bây giờ là dựng cơ chế thứ hai cho đúng một việc: người dùng sẽ thấy hai chỗ
đặt vị trí cho cùng một khối và không biết cái nào thắng. Đó là kiểu hỏng khó gỡ nhất — không phải
lỗi kỹ thuật mà là mâu thuẫn trong mô hình khái niệm.

Dải đối tác chỉ cần đăng ký tên vào ba danh sách (`DEFAULT_SECTION_ORDER`,
`RENDERABLE_SECTION_KEYS`, `SectionKey`) là tự động có nút sắp xếp như mọi khối khác. Vị trí mặc
định đề xuất: **sau `testimonials`**, để cụm bằng chứng xã hội nằm liền nhau.

Chi tiết ở [spec §1.2 và §4.5](./partners-spec.md).

---

# 6. Những gì **không** đổi

| | |
| :-- | :-- |
| Bảng database | Không thêm, không sửa cột |
| Gói npm | Không thêm |
| Biến môi trường | Không thêm — R2 đã cấu hình sẵn |
| `next.config.mjs` | Không đổi — host R2 đã nằm trong allowlist ảnh |
| Số route | Không thêm |
| Mục menu | Không thêm — nằm trong `/admin/giao-dien` |

---

# 7. Phương án đã cân nhắc và bác bỏ

| Phương án | Vì sao bỏ |
| :-- | :-- |
| **Bảng `partners` riêng + màn CRUD riêng** | Phải viết lại xem trước, nháp, hoàn tác, chống ghi đè. Chỉ đáng khi cần truy vấn — xem §3.3 |
| **Chép `Marquee.tsx` thành `PartnersMarquee.tsx`** | Hai dải chạy sẽ trôi dạt. Nếu sau này thấy trùng lặp thật thì tách phần chạy thành component dùng chung, không chép |
| **Thư viện carousel (`swiper`, `embla`)** | Thêm ~30 KB cho một hiệu ứng 12 dòng CSS. Dự án đang giữ số gói ở mức tối thiểu |
| **Cho dán URL logo từ web ngoài** | Ảnh hỏng khi bên kia đổi đường dẫn, và mở đường tải nội dung từ host bất kỳ — đúng lỗ hổng vừa đóng ở `assertLocalImages` |
| **Cho tải SVG rồi làm sạch bằng `DOMPurify`** | Thêm gói, thêm bề mặt tấn công, cho một tính năng chỉ để hiển thị — xem §5.3 |
| **Tự lấy logo qua Clearbit / favicon Google** | Phụ thuộc dịch vụ ngoài, hỏng im lặng, và không có quyền dùng logo |

---

# 8. Rủi ro kỹ thuật

| Rủi ro | Xử lý |
| :-- | :-- |
| `home_content` phình to vì thêm 24 mục | Chỉ lưu **URL** ảnh, không lưu base64. Một đối tác ≈ 200 byte |
| Người dùng đặt tốc độ 5 giây với 24 logo → chớp mắt là hết một vòng | Ô nhập có ghi chú; khung xem trước cho thấy ngay hậu quả trước khi lưu |
| Logo trong suốt trên nền tối nhìn không ra | Cho chỉnh màu nền dải (`FR-P11`) và tùy chọn lọc xám |
| Dải chạy tiêu CPU trên máy yếu | Chỉ animate `transform` (chạy trên GPU), không animate `left` / `margin` |
