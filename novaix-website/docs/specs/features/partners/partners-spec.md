# Spec — Dải Đối tác & Khách hàng (Partners Strip)

> **PRD:** [`partners-prd.md`](./partners-prd.md) · **RFC:** [`partners-rfc.md`](./partners-rfc.md)
> **Trạng thái:** 📝 chờ duyệt — bản đặc tả để cài đặt, chưa có code.
>
> **Cập nhật 18/08/2026:** viết lại §2 và §4.5 cho khớp kiến trúc panel mới. Bản đầu mô tả cách khai
> báo trường trong `SECTIONS_CONFIG`; cách đó **không còn dùng** — xem §2.1. Đồng thời **bỏ trường
> `placement`** vì panel đã có sẵn tính năng sắp xếp khối dùng chung — xem §4.5.

---

# 1. Dữ liệu

## 1.1 Zod schema

Thêm vào `lib/site-content/schema.ts`, dùng lại các helper sẵn có (`text`, `required`, `hexColor`):

```ts
export const partnerItemSchema = z.object({
  name: required(60, "Tên đối tác"),
  logo: z.string().trim().max(500).default(""),
  link: text(300).default(""),
  visible: z.boolean().default(true),
});

export const partnersSchema = z.object({
  enabled: z.boolean().default(true),
  label: text(60).default("Được tin dùng bởi"),

  items: z.array(partnerItemSchema).max(24, "Tối đa 24 đối tác").default([]),

  // Chuyển động
  speed: z.number().int().min(5).max(120).default(40),
  gap: z.number().int().min(20).max(400).default(72),
  direction: z.enum(["trai", "phai"]).default("trai"),
  pauseOnHover: z.boolean().default(true),

  // Hiển thị logo
  logoHeight: z.number().int().min(20).max(96).default(40),
  grayscale: z.boolean().default(true),

  // Màu — theo đúng quy ước customColors của các khối khác (xem §1.4)
  customColors: z.boolean().default(false),
  bgColor: hexColor("#0b1120"),
  labelColor: hexColor("#5f6c8a"),
});
```

Gắn vào `homeContentSchema` với `.default({})` để **dữ liệu cũ trong database không có khối
`partners` vẫn parse được**:

```ts
export const homeContentSchema = z.object({
  v: z.literal(1),
  // ...
  partners: partnersSchema.default({}),
  // ...
});

export type PartnersContent = z.infer<typeof partnersSchema>;
```

> ⚠️ **Không tăng `v`.** `v` là số phiên bản hình dạng dữ liệu; thêm một khối **có `.default()`** là
> thay đổi tương thích ngược, `resolveHomeContent` tự trộn bản mặc định vào. Tăng `v` sẽ làm mọi bản
> ghi hiện có fail parse và **toàn bộ nội dung trang chủ bị reset về mặc định**.

## 1.2 Đăng ký khối vào ba danh sách

Khối mới phải có tên ở **cả ba** chỗ, thiếu một là hỏng im lặng:

| Danh sách | Ở đâu | Thiếu thì sao |
| :-- | :-- | :-- |
| `DEFAULT_SECTION_ORDER` | `lib/site-content/schema.ts` | Khối không xuất hiện trong thứ tự, và `sectionOrder` lưu về sẽ **lọc mất** khóa này |
| `RENDERABLE_SECTION_KEYS` | `components/preview/section-keys.ts` | Khối bị loại khỏi `DEFAULT_ORDER` lúc render → **biến mất khỏi trang chủ, không báo lỗi** |
| `SectionKey` | `lib/site-content/preview-bridge.ts` | Bấm vào dải trong khung xem trước không mở đúng mục trong panel |

Bộ self-test (§6) có phép kiểm đối chiếu hai danh sách đầu — thêm thiếu là test đỏ ngay.

Vị trí chèn đề xuất trong `DEFAULT_SECTION_ORDER`: **sau `testimonials`**, để cụm bằng chứng xã hội
(lời chứng thực → logo đối tác) nằm liền nhau. Người dùng đổi lại được bằng nút mũi tên trong panel.

## 1.3 Bản mặc định

`lib/site-content/defaults.ts` — khối `partners` mặc định **rỗng**, không bịa tên công ty:

```ts
partners: {
  enabled: false,        // tắt cho tới khi có logo thật
  label: "Được tin dùng bởi",
  items: [],
  speed: 40,
  gap: 72,
  direction: "trai",
  pauseOnHover: true,
  logoHeight: 40,
  grayscale: true,
  customColors: false,
  bgColor: "#0b1120",
  labelColor: "#5f6c8a",
},
```

`enabled: false` vì dải rỗng không có gì để khoe, và bịa logo giả là điều
[coding-style](../../../conventions/coding-style.md) cấm ở mục nội dung mẫu.

## 1.4 Quy ước `customColors`

Mọi khối trang chủ hiện dùng chung một quy ước: `customColors: false` nghĩa là **thừa hưởng màu
theme chung**; bật lên mới dùng `bgColor` / `labelColor` riêng. `PartnersSection` phải có nút
*"Dùng lại màu theme"* đặt `customColors: false` cùng các màu về mặc định, giống `FAQSection`.

Component công khai chỉ áp màu riêng khi `customColors === true` — xem §4.2.

## 1.5 Ràng buộc và lý do

| Trường | Ràng buộc | Vì sao |
| :-- | :-- | :-- |
| `items` | ≤ 24 | Quá số này thì cần trang riêng, không phải dải chạy |
| `name` | bắt buộc, ≤ 60 | Là `alt` của ảnh — bỏ trống là mất khả năng tiếp cận |
| `logo` | ≤ 500 ký tự | Đủ cho URL R2; chuỗi dài hơn là dấu hiệu ai đó dán base64 |
| `link` | không bắt buộc | Nhiều đối tác không muốn bị trỏ link |
| `speed` | 5–120 giây | Dưới 5 giây là chớp mắt, trên 120 giây là đứng yên |
| `logoHeight` | 20–96 px | Ngoài khoảng này thì dải vỡ bố cục trên điện thoại |

---

# 2. Giao diện quản trị

## 2.1 Kiến trúc panel hiện tại — đọc kỹ trước khi code

`lib/site-content/fields.ts` **từng** khai báo mọi trường theo kiểu dữ liệu (`type: "text"`,
`"number"`, `"list"`…) và panel tự dựng giao diện từ đó. **Cách này đã bị thay thế.**

Hiện tại:

- `SECTIONS_CONFIG` chỉ còn là **sổ đăng ký metadata**: `key`, `title`, `iconName`, `category`, và
  `fields: []` rỗng cho mọi khối.
- `SectionPanel.renderSectionBody()` là một chuỗi `if (sec.key === "...")` **điều hướng sang một
  component riêng cho từng khối**: `HeroSection.tsx`, `AboutSection.tsx`, `FAQSection.tsx`…

Nghĩa là thêm một khối mới cần **ba việc**, không phải một dòng khai báo:

```text
1. lib/site-content/fields.ts       → thêm metadata vào SECTIONS_CONFIG (fields: [])
2. components/admin/customizer/PartnersSection.tsx  → viết giao diện sửa
3. components/admin/customizer/SectionPanel.tsx     → thêm nhánh điều hướng
```

## 2.2 Metadata trong `SECTIONS_CONFIG`

```ts
{
  key: "partners",
  title: "Đối tác & Khách hàng",
  iconName: "IconBuildingStore",
  category: "TRANG CHỦ",
  fields: [],
},
```

`iconName` phải được import và map trong `SectionPanel.tsx` cùng chỗ với các icon khác.

## 2.3 Nhánh điều hướng trong `SectionPanel.tsx`

```tsx
if (sec.key === "partners") {
  return (
    <PartnersSection
      partners={content.partners}
      onChange={(newPartners) => onChange("partners", newPartners)}
    />
  );
}
```

## 2.4 `PartnersSection.tsx` — khuôn theo `FAQSection.tsx`

Chữ ký và lối viết bám đúng các khối đã có:

```tsx
export default function PartnersSection({
  partners,
  onChange,
}: {
  partners: PartnersContent;
  onChange: (next: PartnersContent) => void;
}) {
  const updateField = <K extends keyof PartnersContent>(key: K, val: PartnersContent[K]) => {
    onChange({ ...partners, [key]: val });
  };
  // ...
}
```

Bố cục trong khối gập:

| Vùng | Điều khiển | Ghi chú |
| :-- | :-- | :-- |
| Bật/tắt | `Switch` | `enabled` |
| Dòng nhãn | `TextField` | `label`, tối đa 60 |
| **Danh sách đối tác** | Accordion lồng, mỗi mục có: `TextField` tên · `ImageInput` logo · `TextField` liên kết · `Switch` hiển thị · nút ↑ ↓ · nút xóa (có `Dialog` xác nhận) | Theo đúng khuôn danh sách của `FAQSection` |
| Nút *"Thêm đối tác"* | `Button` + `IconPlus` | Khóa lại khi đã đủ 24 mục |
| Tốc độ chạy | **`Slider`** 5–120, nhãn hiện `{speed}s / vòng` | Giống hệt `MarqueeSection.speed` |
| Khoảng cách | **`Slider`** 20–400, nhãn hiện `{gap}px` | Giống `MarqueeSection.gap` |
| Chiều cao logo | **`Slider`** 20–96 | |
| Hướng chạy | `ToggleButtonGroup` hoặc `Select` 2 lựa chọn | |
| Dừng khi rê chuột · Lọc xám | `Switch` | |
| Màu | `ColorInput` cho `bgColor`, `labelColor` + nút *"Dùng lại màu theme"* | Chỉ hiện khi `customColors` bật |

Ghi chú bắt buộc dưới ô tốc độ: *"Thêm logo mà giữ nguyên số giây thì dải chạy nhanh hơn."*

> 🔴 **Không truyền giá trị người dùng nhập thẳng vào `sx` của MUI.** Emotion biên dịch `sx` thành
> CSS thật của trang quản trị — một chuỗi màu hỏng đã từng làm trắng toàn bộ màn admin. Mọi màu đi
> qua `safeHex()` ở `lib/site-content/color.ts`. Xem
> [coding-style](../../../conventions/coding-style.md) và
> [biên bản rà soát](../../../reviews/blog-review-2026-08-17.md).

## 2.5 `ImageInput.tsx` — component mới

Đặt tại `components/admin/customizer/ImageInput.tsx`, cạnh `ColorInput.tsx`. **Không** khai thêm
kiểu trường vào `fields.ts` — kiến trúc đó không còn dùng; đây là một component thường, nhận props
trực tiếp:

```tsx
export default function ImageInput({
  label,
  value,
  onChange,
  folder,          // "partners" | "blog"
  maxSizeMB = 2,
  hint,            // ví dụ "PNG nền trong suốt, cao 80–200px"
}: { ... })
```

| Trạng thái | Hiển thị |
| :-- | :-- |
| Chưa có ảnh | Vùng thả tệp + nút *"Chọn tệp"* + dòng gợi ý `hint` |
| Đang tải lên | `LinearProgress`, nút bị khóa |
| Đã có ảnh | Ảnh xem trước trên **nền ca-rô** (thấy được vùng trong suốt) + nút *"Đổi ảnh"* / *"Gỡ ảnh"* |
| Lỗi | `Alert` đỏ ngay dưới ô, **giữ nguyên ảnh cũ** |

Ràng buộc:

- **Kiểm dung lượng ở client trước khi gửi** — không để người dùng chờ tải xong 10 MB rồi mới bị từ chối.
- Nút *"Gỡ ảnh"* chỉ xóa URL khỏi nội dung, **không** xóa tệp trên R2 ([RFC §5.5](./partners-rfc.md)).
- `ImageInput` dùng lại được cho ảnh nền Hero và ảnh About sau này — đừng gắn cứng vào đối tác.

---

# 3. Server action

## 3.1 Tổng quát hóa upload

`lib/media/image-actions.ts` (file mới):

```ts
"use server";

const FOLDERS = { blog: "blog", partners: "partners" } as const;
const MAX_SIZE_BYTES = { blog: 5 * 1024 * 1024, partners: 2 * 1024 * 1024 };

export async function uploadImage(formData: FormData): Promise<ActionResult<{ url: string }>> {
  try {
    await requireUser();
    // 1. Đọc và kiểm `folder` — chỉ nhận giá trị trong allowlist, KHÔNG ghép thẳng vào storage key
    // 2. Kiểm dung lượng theo folder
    // 3. detectImageMimeType(buffer) — magic byte, chỉ PNG/JPEG/WebP
    // 4. key = `${folder}/${yyyy}/${mm}/${randomUUID()}.${ext}`
    // 5. getStorageDriver().put(...)
  } catch (err) {
    rethrowIfNextControlFlow(err);   // BẮT BUỘC — xem coding-style
    // ...
  }
}
```

`lib/blog/image-actions.ts` giữ nguyên chữ ký `uploadArticleImage`, bên trong gọi `uploadImage` với
`folder: "blog"`. Không chép logic.

## 3.2 Điểm bảo mật bắt buộc

| Điểm | Vì sao |
| :-- | :-- |
| `requireUser()` là dòng đầu tiên | Server action là endpoint HTTP công khai |
| `rethrowIfNextControlFlow(err)` mở đầu mọi `catch` | Nếu không, phiên hết hạn trả về chuỗi `"NEXT_REDIRECT"` cho người dùng |
| `folder` khớp allowlist, không nội suy thô | Chuỗi `../` trong storage key sẽ ghi ra ngoài thư mục dự định |
| Nhận dạng bằng magic byte | `file.type` do trình duyệt gửi, sửa được |
| Từ chối SVG kèm thông báo rõ | [RFC §5.3](./partners-rfc.md) |

Không cần action mới cho việc **lưu** đối tác: `saveHomeContent` đã lưu cả khối `home_content`.

---

# 4. Component công khai

## 4.1 `components/Partners.tsx`

```tsx
export default function Partners({ content }: { content: PartnersContent }) { ... }
```

Trả về `null` khi **một trong hai**:

1. `content.enabled === false`
2. Không còn mục nào sau khi lọc: `items.filter(p => p.visible !== false && p.logo)`

Không render khung rỗng, không render dòng nhãn treo lơ lửng (AC4).

## 4.2 Màu và biến CSS

Theo đúng khuôn của các khối khác — đặt biến CSS trên thẻ ngoài cùng, **mọi màu qua `safeHex`**:

```tsx
const style = content.customColors
  ? {
      backgroundColor: safeHex(content.bgColor, "#0b1120"),
      "--partners-label-color": safeHex(content.labelColor, "#5f6c8a"),
    }
  : {};
```

Không bật `customColors` thì khối thừa hưởng màu theme chung từ `dynamicCss` của `HomeSections`.

## 4.3 Cấu trúc và chuyển động

```tsx
const visible = content.items.filter((p) => p.visible !== false && p.logo);
const loop = [...visible, ...visible];        // ĐÚNG HAI bản — RFC §5.1
```

| Thuộc tính | Giá trị |
| :-- | :-- |
| Vùng chạy | `display: flex; width: max-content; gap: {gap}px` |
| Chuyển động | `transform: translateX(calc(-50% - {gap}px / 2))`, `linear`, `infinite` |
| Thời lượng | `animationDuration: {speed}s` |
| Hướng | `direction === "phai"` → `animationDirection: reverse` |
| Dừng khi rê chuột | `pauseOnHover` → `:hover { animation-play-state: paused }` |
| Mỗi logo | `<img>` thường, `height: {logoHeight}px`, `width: auto`, `loading="lazy"`, `alt={name}` |
| Lọc xám | `grayscale` → `filter: grayscale(1); opacity: .7`, bỏ khi `:hover` |

Chỉ animate `transform` — chạy trên GPU, không gây reflow.

## 4.4 Liên kết

```tsx
p.link
  ? <a href={p.link} target="_blank" rel="noopener noreferrer nofollow">{logo}</a>
  : logo
```

Không có `link` thì **không bọc thẻ `<a>`** — để con trỏ không thành bàn tay (AC6).

## 4.5 Chèn vào trang chủ — qua `sectionOrder`, không phải prop riêng

> **Đây là phần đổi so với bản spec đầu.** Bản cũ có trường `placement` với hai giá trị cố định.
> Panel nay đã có **nút mũi tên ↑ ↓ trên mọi khối trang chủ**, lưu vào `content.sectionOrder`.
> Làm thêm `placement` là dựng cơ chế thứ hai cho cùng một việc — người dùng sẽ gặp hai chỗ đặt vị
> trí và không biết cái nào thắng.

`HomeSections.tsx` render theo `effectiveOrder`; chỉ cần thêm một nhánh vào `renderSectionByKey`:

```tsx
case "partners":
  return <Partners key="partners" content={content.partners} />;
```

Cộng với việc đăng ký khóa ở §1.2. Vị trí mặc định do thứ tự trong `DEFAULT_SECTION_ORDER` quyết
định; người dùng đổi bằng nút mũi tên, không cần lập trình viên.

Đặt `data-section="partners"` trên thẻ ngoài cùng để `PreviewBridge` cuộn tới được
(`preview:scroll-to`) và để `dynamicCss` nhắm được vào khối.

## 4.6 Giảm chuyển động

```css
@media (prefers-reduced-motion: reduce) {
  .partners-track {
    animation: none;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
  }
}
```

Dải chuyển thành lưới tĩnh, xem được đủ logo (AC7). Đặt trong `app/globals.css` cùng chỗ các
keyframe khác — **không** dùng class Tailwind vì đây là vùng công khai dùng token riêng.

---

# 5. Trường hợp biên

| Tình huống | Xử lý |
| :-- | :-- |
| 1 đối tác duy nhất | Vẫn nhân đôi → dải chạy liên tục, không giật |
| Tất cả đối tác đều `visible: false` | Dải tự ẩn hoàn toàn (§4.1) |
| Đối tác có tên nhưng chưa tải logo | Bị lọc khỏi dải công khai, **vẫn hiện trong panel** để người dùng bổ sung |
| Ảnh trên R2 bị xóa | Ô trống đúng kích thước, logo khác chạy bình thường (AC9) |
| `link` không có `https://` | Chuẩn hóa khi lưu: thêm `https://` nếu thiếu giao thức |
| Logo cực rộng (banner ngang) | `logoHeight` cố định chiều cao, `width: auto` — dải dài ra chứ không vỡ |
| Dữ liệu cũ chưa có khối `partners` | `.default({})` trong schema xử lý, không cần migration |
| `sectionOrder` cũ chưa có `"partners"` | `HomeSections` tự bù khóa thiếu vào cuối; đổi vị trí bằng nút mũi tên |
| Người dùng dán base64 vào ô `logo` | Chặn bởi giới hạn 500 ký tự |

---

# 6. Kiểm thử

Bổ sung vào `scripts/test-customizer.ts` — chạy bằng `npx tsx scripts/test-customizer.ts`.

Bộ test hiện có 8 nhóm; nhóm **6** và **7** sẽ **tự động bắt lỗi đăng ký thiếu** của khối mới:

| # | Nhóm test có sẵn | Bắt được gì cho khối partners |
| :-- | :-- | :-- |
| 6 | Mọi khối trong `SECTIONS_CONFIG` đều có dữ liệu mặc định | Quên thêm `partners` vào `defaults.ts` |
| 7 | Mọi khóa trong `DEFAULT_SECTION_ORDER` đều render được | Quên thêm vào `RENDERABLE_SECTION_KEYS` hoặc quên nhánh `case "partners"` |
| 8 | Chuỗi tiêm CSS bị chặn | Màu của khối mới vẫn qua `hexColor` |

Thêm mới:

| # | Kiểm | Kỳ vọng |
| :-- | :-- | :-- |
| 9 | `resolveHomeContent` với dữ liệu **không có** khối `partners` | Trả về khối mặc định, các khối khác **giữ nguyên** |
| 10 | 25 đối tác | Bị từ chối |
| 11 | `speed: 0` và `speed: 999` | Bị từ chối |
| 12 | `sectionOrder` cũ thiếu `"partners"` | Sau chuẩn hóa, `"partners"` được bù vào cuối |

Kiểm thủ công theo đúng AC1–AC9 của [PRD §5](./partners-prd.md).
