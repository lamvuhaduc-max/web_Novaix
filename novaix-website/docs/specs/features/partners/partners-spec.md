# Spec — Dải Đối tác & Khách hàng (Partners Strip)

> **PRD:** [`partners-prd.md`](./partners-prd.md) · **RFC:** [`partners-rfc.md`](./partners-rfc.md)
> **Trạng thái:** 📝 chờ duyệt — đây là bản đặc tả để cài đặt, chưa có code.

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
  placement: z.enum(["sau-hero", "truoc-cta"]).default("sau-hero"),

  items: z.array(partnerItemSchema).max(24, "Tối đa 24 đối tác").default([]),

  // Chuyển động
  speed: z.number().int().min(5).max(120).default(40),
  gap: z.number().int().min(20).max(400).default(72),
  direction: z.enum(["trai", "phai"]).default("trai"),
  pauseOnHover: z.boolean().default(true),

  // Hiển thị
  logoHeight: z.number().int().min(20).max(96).default(40),
  grayscale: z.boolean().default(true),
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
> thay đổi tương thích ngược. `resolveHomeContent` sẽ tự trộn bản mặc định vào. Tăng `v` sẽ làm mọi
> bản ghi hiện có fail parse và **toàn bộ nội dung trang chủ bị reset về mặc định**.

## 1.2 Bản mặc định

`lib/site-content/defaults.ts` — khối `partners` mặc định **rỗng**, không bịa tên công ty:

```ts
partners: {
  enabled: false,        // tắt cho tới khi có logo thật
  label: "Được tin dùng bởi",
  placement: "sau-hero",
  items: [],
  speed: 40,
  gap: 72,
  direction: "trai",
  pauseOnHover: true,
  logoHeight: 40,
  grayscale: true,
  bgColor: "#0b1120",
  labelColor: "#5f6c8a",
},
```

`enabled: false` mặc định vì dải rỗng không có gì để khoe, và bịa logo giả là điều
[coding-style](../../../conventions/coding-style.md) cấm ở mục nội dung mẫu.

## 1.3 Ràng buộc và lý do

| Trường | Ràng buộc | Vì sao |
| :-- | :-- | :-- |
| `items` | ≤ 24 | Quá số này thì cần trang riêng, không phải dải chạy |
| `name` | bắt buộc, ≤ 60 | Là `alt` của ảnh — bỏ trống là mất khả năng tiếp cận |
| `logo` | ≤ 500 ký tự | Đủ cho URL R2; chuỗi dài hơn là dấu hiệu ai đó dán base64 |
| `link` | không bắt buộc | Nhiều đối tác không muốn bị trỏ link |
| `speed` | 5–120 giây | Dưới 5 giây là chớp mắt, trên 120 giây là đứng yên |
| `logoHeight` | 20–96 px | Ngoài khoảng này thì dải vỡ bố cục trên điện thoại |

---

# 2. Cấu hình panel quản trị

## 2.1 Kiểu trường mới `image`

`lib/site-content/fields.ts`:

```ts
export type ImageField = BaseField & {
  type: "image";
  folder: "blog" | "partners";
  maxSizeMB?: number;      // mặc định 2
  aspectHint?: string;     // ví dụ "PNG nền trong suốt, cao 80–200px"
};

export type SimpleFieldDef = TextField | NumberField | ImageField;
```

## 2.2 Khai báo khối `partners` trong `SECTIONS_CONFIG`

```ts
{
  key: "partners",
  title: "Đối tác & Khách hàng",
  iconName: "IconBuildingStore",
  category: "TRANG CHỦ",
  fields: [
    { key: "enabled",  path: "partners.enabled",  label: "Hiển thị dải đối tác", type: "boolean" },
    { key: "label",    path: "partners.label",    label: "Dòng nhãn",  type: "text", max: 60 },
    { key: "placement", path: "partners.placement", label: "Vị trí trên trang", type: "select",
      options: [
        { value: "sau-hero",  label: "Ngay dưới khối Hero" },
        { value: "truoc-cta", label: "Trước khối kêu gọi hành động" },
      ] },

    { key: "items", path: "partners.items", type: "list", label: "Danh sách đối tác",
      min: 0, max: 24,
      itemTitle: (item, i) => item.name || `Đối tác ${i + 1}`,
      createEmpty: () => ({ name: "", logo: "", link: "", visible: true }),
      itemFields: [
        { key: "name",    path: "name",    label: "Tên đối tác", type: "text", max: 60, required: true,
          helperText: "Dùng làm mô tả ảnh cho trình đọc màn hình" },
        { key: "logo",    path: "logo",    label: "Logo", type: "image", folder: "partners",
          maxSizeMB: 2, aspectHint: "PNG nền trong suốt, cao 80–200px" },
        { key: "link",    path: "link",    label: "Liên kết", type: "text", max: 300,
          helperText: "Để trống thì logo không bấm được" },
        { key: "visible", path: "visible", label: "Hiển thị", type: "boolean" },
      ] },

    { key: "speed", path: "partners.speed", label: "Tốc độ chạy (giây/vòng)", type: "number",
      min: 5, max: 120,
      helperText: "Số càng nhỏ chạy càng nhanh. Thêm logo mà giữ nguyên số này thì dải chạy nhanh hơn." },
    { key: "gap",       path: "partners.gap",       label: "Khoảng cách giữa các logo (px)", type: "number", min: 20, max: 400 },
    { key: "direction", path: "partners.direction", label: "Hướng chạy", type: "select",
      options: [{ value: "trai", label: "Sang trái" }, { value: "phai", label: "Sang phải" }] },
    { key: "pauseOnHover", path: "partners.pauseOnHover", label: "Dừng khi rê chuột", type: "boolean" },

    { key: "logoHeight", path: "partners.logoHeight", label: "Chiều cao logo (px)", type: "number", min: 20, max: 96 },
    { key: "grayscale",  path: "partners.grayscale",  label: "Lọc xám, hiện màu khi rê chuột", type: "boolean" },
    { key: "bgColor",    path: "partners.bgColor",    label: "Màu nền dải",  type: "color" },
    { key: "labelColor", path: "partners.labelColor", label: "Màu dòng nhãn", type: "color" },
  ],
}
```

> Hai kiểu `boolean` và `select` cũng chưa có trong `fields.ts` hiện tại — xem
> [tasks §T2](./partners-tasks.md). Chúng là kiểu chung, không riêng gì đối tác.

## 2.3 `ImageInput.tsx` — hành vi

Đặt tại `components/admin/customizer/ImageInput.tsx`, cạnh `ColorInput.tsx`.

| Trạng thái | Hiển thị |
| :-- | :-- |
| Chưa có ảnh | Vùng thả tệp + nút *"Chọn tệp"* + dòng gợi ý `aspectHint` |
| Đang tải lên | Thanh tiến trình, nút bị khóa |
| Đã có ảnh | Ảnh xem trước trên **nền ca-rô** (thấy được vùng trong suốt) + nút *"Đổi ảnh"* / *"Gỡ ảnh"* |
| Lỗi | `Alert` đỏ ngay dưới ô, giữ nguyên ảnh cũ |

Ràng buộc bắt buộc:

- **Kiểm dung lượng ở client trước khi gửi** — báo lỗi ngay, không để người dùng chờ tải xong 10 MB rồi mới biết bị từ chối.
- **Không đưa giá trị người dùng nhập thẳng vào `sx`** — xem quy ước *"Giá trị người dùng nhập KHÔNG được ghép thẳng vào CSS"* trong [coding-style](../../../conventions/coding-style.md).
- Nút *"Gỡ ảnh"* chỉ xóa URL khỏi nội dung, **không** xóa tệp trên R2 (RFC §5.5).

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

`lib/blog/image-actions.ts` giữ nguyên chữ ký `uploadArticleImage`, bên trong gọi
`uploadImage` với `folder: "blog"`. Không chép logic.

## 3.2 Điểm bảo mật bắt buộc

| Điểm | Vì sao |
| :-- | :-- |
| `requireUser()` là dòng đầu tiên | Server action là endpoint HTTP công khai |
| `rethrowIfNextControlFlow(err)` mở đầu mọi `catch` | Nếu không, phiên hết hạn sẽ trả về chuỗi `"NEXT_REDIRECT"` cho người dùng |
| `folder` khớp allowlist, không nội suy thô | Chuỗi `../` trong storage key sẽ ghi ra ngoài thư mục dự định |
| Nhận dạng bằng magic byte | `file.type` do trình duyệt gửi, sửa được |
| Từ chối SVG kèm thông báo rõ | RFC §5.3 |

Không cần action mới cho việc **lưu** đối tác: `saveHomeContent` đã lưu cả khối `home_content`.

---

# 4. Component công khai

## 4.1 `components/Partners.tsx`

```tsx
export default function Partners({ content }: { content: PartnersContent }) { ... }
```

Điều kiện tự ẩn — trả về `null` khi **một trong hai**:

1. `content.enabled === false`
2. Không còn mục nào sau khi lọc: `items.filter(p => p.visible !== false && p.logo)`

Không render khung rỗng, không render dòng nhãn treo lơ lửng (AC4).

## 4.2 Cấu trúc và chuyển động

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

Chỉ animate `transform` — chạy trên GPU, không gây reflow (RFC §8).

## 4.3 Liên kết

```tsx
p.link
  ? <a href={p.link} target="_blank" rel="noopener noreferrer nofollow">{logo}</a>
  : logo
```

`rel` đầy đủ: `noopener noreferrer` chặn tab-nabbing, `nofollow` vì đây không phải liên kết biên tập.
Không có `link` thì **không bọc thẻ `<a>`** — để con trỏ không thành bàn tay (AC6).

## 4.4 Giảm chuyển động

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

Dải chuyển thành lưới tĩnh, xem được đủ logo (AC7). Đặt trong `app/globals.css` cùng chỗ với các
keyframe khác — **không** dùng class Tailwind vì đây là vùng công khai dùng token riêng.

## 4.5 Chèn vào trang chủ

`components/preview/HomeSections.tsx`:

```tsx
<Hero content={content.hero} />
{content.partners.placement === "sau-hero" && <Partners content={content.partners} />}
<Marquee content={content.marquee} />
...
<ArticleRail rails={articleRails} />
{content.partners.placement === "truoc-cta" && <Partners content={content.partners} />}
<CTA content={content.cta} />
```

Đặt `data-section="partners"` trên thẻ ngoài cùng để `PreviewBridge` cuộn tới được khi người dùng
mở khối tương ứng trong panel (`preview:scroll-to`).

## 4.6 Đăng ký khóa khối cho xem trước

`lib/site-content/preview-bridge.ts` — thêm `"partners"` vào `SectionKey`. Thiếu bước này thì khối
mới không cuộn tới được và bấm vào dải trong khung xem trước sẽ không mở đúng mục trong panel.

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
| Người dùng dán base64 vào ô `logo` | Chặn bởi giới hạn 500 ký tự |

---

# 6. Kiểm thử

Bổ sung vào `scripts/test-customizer.ts` — chạy bằng `npx tsx scripts/test-customizer.ts`:

| # | Kiểm | Kỳ vọng |
| :-- | :-- | :-- |
| 1 | `DEFAULT_HOME_CONTENT` parse qua schema mới | Hợp lệ |
| 2 | `resolveHomeContent` với dữ liệu **không có** khối `partners` | Trả về khối mặc định, các khối khác **giữ nguyên** |
| 3 | 25 đối tác | Bị từ chối |
| 4 | `speed: 0` và `speed: 999` | Bị từ chối |
| 5 | Mọi field trong `SECTIONS_CONFIG` khối `partners` đều tồn tại trong `DEFAULT_HOME_CONTENT` | Đủ 100% |

Kiểm thủ công theo đúng AC1–AC9 của [PRD §5](./partners-prd.md).
