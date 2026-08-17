# RFC — Sửa chữ trang chủ trực tiếp (Home Content Customizer)

> **PRD:** [`customizer-prd.md`](./customizer-prd.md) · **Domain:** [`home-content-domain.md`](../../domains/home-content-domain.md)
> **Trạng thái:** 📝 chờ duyệt · **Mã FR:** `FR-C01`…`FR-C13`

---

# 1. Bối cảnh

Trang chủ `app/page.tsx` ghép 13 component. Chữ của chúng nằm hai nơi: `lib/data.ts` (8 mảng) và
**viết cứng trong chính component** (Hero, About, Pricing, FAQ, CTA, Footer, 6 khối `SectionHead`).

RFC này mô tả cách đưa toàn bộ chữ đó vào database và dựng một màn sửa có xem trước trực tiếp — **mà
không thêm bảng, không thêm dependency, không thêm tầng kiến trúc**.

---

# 2. Vấn đề kỹ thuật

## 2.1 Hai hệ giao diện không nhúng thẳng vào nhau được

Panel là **MUI**, nền sáng `#F2F6FA`. Trang chủ là **Tailwind**, nền tối `#070b16`, và `globals.css`
gắn vào `body::before` một lớp quầng sáng `position: fixed` phủ toàn màn hình cộng một lớp nhiễu
(grain). Render các khối trang chủ ngay trong trang admin nghĩa là hai lớp nền tranh nhau, và mọi
`clamp()`/breakpoint tính theo bề rộng **cửa sổ** chứ không theo bề rộng khung xem trước.

## 2.2 "Live" không được đi qua máy chủ

Gõ một ký tự mà đi một vòng server action → DB → revalidate → render là chậm gấp trăm lần ngưỡng cảm
nhận, và biến mọi lần thử thành một lần sửa thật.

## 2.3 Dữ liệu trong DB sẽ luôn lệch với mã

Lập trình viên thêm khối mới, đổi tên trường, bỏ một mục — trong khi jsonb trong DB vẫn là bản cũ.
Đây không phải rủi ro hiếm, nó là **trạng thái bình thường** của mọi hệ CMS tự xây.

---

# 3. Mục tiêu kỹ thuật

1. **Một nguồn chân lý cho hình dạng nội dung**: một Zod schema, một bản mặc định, dùng chung cho cả
   trang chủ lẫn panel.
2. **Trang chủ không bao giờ vỡ** vì dữ liệu thiếu, cũ hoặc hỏng.
3. **Live không chạm máy chủ** — chỉ `postMessage` giữa hai khung cùng gốc.
4. **Không thêm bảng, không thêm gói npm.**
5. **Bóc chữ một lần, gọn**: sau đợt này không còn chuỗi tiếng Việt nào viết cứng trong
   `components/*.tsx`.

---

# 4. Không nằm trong phạm vi

- ❌ Sửa màu / phông / bo góc / bố cục / thứ tự khối.
- ❌ Đổi ảnh, upload ảnh.
- ❌ Lịch sử phiên bản ở phía máy chủ; link xem trước chia sẻ được.
- ❌ Soạn thảo rich-text — chữ ở đây là **chữ thuần**.

---

# 5. Kiến trúc đề xuất

## 5.1 Phân tầng

```text
lib/site-content/
  schema.ts        Zod: homeContentSchema + kiểu HomeContent          ◄── nguồn chân lý hình dạng
  defaults.ts      DEFAULT_HOME_CONTENT — chữ rút từ mã hiện tại      ◄── nguồn chân lý nội dung gốc
  fields.ts        Bản kê trường cho panel (nhãn, kiểu ô, độ dài)     ◄── nguồn chân lý giao diện panel
  merge.ts         deepMerge + safeParse (hàm thuần)
  queries.ts       getHomeContent()          — dùng cho trang chủ
  actions.ts       getHomeContentForEdit() · saveHomeContent()  ("use server")
  preview-bridge.ts  hằng số + kiểu của giao thức postMessage

app/
  page.tsx                    Server Component: đọc content → truyền props
  (preview)/PreviewBridge.tsx "use client": nhận postMessage, giữ state, render lại
  admin/(protected)/giao-dien/page.tsx
    └─ CustomizerShell.tsx    "use client": iframe trái + panel phải + thanh công cụ

components/*.tsx              13 khối — nhận chữ qua props, KHÔNG còn chuỗi viết cứng
```

Ba file `schema` · `defaults` · `fields` là **ba mặt của cùng một thứ** và phải khớp nhau. Chúng có
một ca test khẳng định điều đó (§15).

## 5.2 🔴 Quyết định lớn nhất: xem trước bằng iframe

```tsx
<iframe
  ref={frameRef}
  src="/?preview=1"
  title="Xem trước trang chủ"
  style={{ width: device === "mobile" ? 390 : "100%", height: "100%", border: 0 }}
/>
```

| PA | Đánh đổi | Kết |
| :-- | :-- | :-- |
| **iframe + postMessage** ⭐ | Cái nhìn thấy **là** trang thật. CSS cách ly. Mobile = đổi bề rộng. Trả giá: một cầu nối ~60 dòng | ✅ Chọn |
| Render khối trang chủ trong panel | Không cần cầu nối | ❌ Hai hệ nền đè nhau (§2.1); breakpoint tính sai; và bản xem trước sẽ **âm thầm khác** trang thật — mất niềm tin là mất tính năng |
| Ảnh chụp render ở máy chủ | Chính xác tuyệt đối | ❌ Không live được; mỗi lần gõ một lượt render là vô nghĩa |

**Iframe cùng gốc, `src` là hằng số trong mã.** Không bao giờ dựng `src` từ dữ liệu người dùng, và
không dùng `sandbox` nới lỏng cho gốc khác.

## 5.3 Giao thức `postMessage` — hợp đồng hai chiều

```ts
// lib/site-content/preview-bridge.ts
export const PREVIEW_FLAG = "preview";

export type PreviewMessage =
  | { type: "preview:ready" }                                  // con → cha
  | { type: "preview:content"; content: HomeContent }          // cha → con
  | { type: "preview:scroll-to"; section: SectionKey }         // cha → con
  | { type: "preview:section-click"; section: SectionKey };    // con → cha
```

**Phía con (trong iframe):**

```tsx
useEffect(() => {
  function onMessage(e: MessageEvent) {
    if (e.origin !== window.location.origin) return;          // 🔴 BẮT BUỘC
    const msg = e.data as PreviewMessage;
    if (msg?.type === "preview:content") setContent(msg.content);
    if (msg?.type === "preview:scroll-to") scrollToSection(msg.section);
  }
  window.addEventListener("message", onMessage);
  window.parent.postMessage({ type: "preview:ready" }, window.location.origin);
  return () => window.removeEventListener("message", onMessage);
}, []);
```

**Phía cha:** gửi kèm `targetOrigin` tường minh, **không dùng `"*"`**:

```ts
frameRef.current?.contentWindow?.postMessage(msg, window.location.origin);
```

Năm luật:

1. 🔴 **Kiểm `e.origin` ở cả hai đầu, và luôn truyền `targetOrigin` cụ thể.** Bỏ qua nghĩa là bất kỳ
   trang nào nhúng được `/?preview=1` cũng bơm được chữ tùy ý vào rồi chụp màn hình — một trang
   OAlpha giả, dựng bằng chính mã của OAlpha.
2. **Chờ `preview:ready` rồi mới gửi nội dung.** Gửi trước khi iframe gắn xong bộ nghe là thông điệp
   rơi vào hư không, và khung xem trước đứng ở nội dung đã lưu — trông y như tính năng hỏng.
3. **Không đổi `src`, không `reload()`** khi nội dung đổi. Chỉ đẩy state.
4. **Không gửi gì ngoài nội dung.** Không token, không thông tin phiên.
5. **Con luôn khởi tạo bằng bản đã áp dụng** (đọc từ DB như trang thường), rồi mới nhận đè. Nhờ vậy
   mở `/?preview=1` bằng tay không rò gì cả.

## 5.4 Nhận diện chế độ xem trước

```tsx
// app/page.tsx  (Server Component)
export default async function Home({ searchParams }: { searchParams: { preview?: string } }) {
  const content = await getHomeContent();                  // luôn là bản ĐÃ áp dụng
  const isPreview = searchParams.preview === "1";

  const sections = <HomeSections content={content} />;     // dùng chung cho cả hai nhánh
  return isPreview ? <PreviewBridge initial={content} /> : sections;
}

export async function generateMetadata({ searchParams }) {
  return searchParams.preview === "1" ? { robots: { index: false, follow: false } } : baseMetadata;
}
```

- `PreviewBridge` là client component: giữ `content` trong state, khởi tạo bằng `initial`, render
  `<HomeSections content={state} />`.
- 🔴 **`HomeSections` dùng chung cho cả hai nhánh.** Hai cây render riêng cho preview và trang thật là
  hai cây sẽ trôi khỏi nhau — và sai lệch chỉ lộ ra sau khi đã áp dụng.
- Nhánh preview phải **không cache**: `export const dynamic = "force-dynamic"` khi có cờ, hoặc tách
  cache theo `searchParams`. Bản xem trước lọt vào cache dùng chung là khách thật nhận nội dung nháp.

⚠️ 13 khối phải render được **ở phía client** (trong `PreviewBridge`). Phần lớn đã là `"use client"`
sẵn (`Hero`, `CTA`, `Marquee`…); khối nào còn là server component thuần thì vẫn chạy được vì chúng
chỉ nhận props và không đụng database — nhưng **không được** để chúng tự đọc dữ liệu bên trong.

## 5.5 Lược đồ nội dung

```ts
// lib/site-content/schema.ts
const text = (max: number) => z.string().trim().max(max);
const required = (max: number, label: string) =>
  z.string().trim().min(1, `${label} không được để trống.`).max(max, `${label} tối đa ${max} ký tự.`);

export const heroSchema = z.object({
  kicker: required(60, "Dòng nhãn"),
  titleLead: required(60, "Tiêu đề (phần đầu)"),
  titleHighlight: required(40, "Tiêu đề (phần nhấn)"),
  titleTail: text(60),
  desc: required(300, "Mô tả"),
  ctaPrimary: required(30, "Nút chính"),
  ctaSecondary: text(30),
  stats: z.array(z.object({
    target: z.number().int().min(0).max(1_000_000),
    suffix: text(6),
    label: required(30, "Nhãn số liệu"),
  })).min(2).max(6),
});

export const sectionHeadSchema = z.object({
  kicker: required(60, "Dòng nhãn"),
  title: required(120, "Tiêu đề"),
  desc: text(400),
});

export const homeContentSchema = z.object({
  v: z.literal(1),
  nav: navSchema,
  hero: heroSchema,
  marquee: z.object({ items: z.array(required(40, "Lĩnh vực")).min(3).max(16) }),
  about: aboutSchema,
  modules: sectionHeadSchema.extend({ items: z.array(moduleItemSchema).min(3).max(12) }),
  features: sectionHeadSchema.extend({ items: z.array(featureItemSchema).min(2).max(8) }),
  process: sectionHeadSchema.extend({ items: z.array(stepItemSchema).min(3).max(8) }),
  segments: sectionHeadSchema.extend({ items: z.array(segmentItemSchema).min(2).max(6) }),
  pricing: sectionHeadSchema.extend({ tiers: z.array(tierSchema).min(1).max(4) }),
  testimonials: sectionHeadSchema.extend({ items: z.array(quoteSchema).min(1).max(9) }),
  faq: sectionHeadSchema.extend({ items: z.array(qaSchema).min(1).max(20) }),
  cta: ctaSchema,
  footer: footerSchema,
});

export type HomeContent = z.infer<typeof homeContentSchema>;
```

Bốn quyết định về hình dạng:

| Quyết định | Vì sao |
| :-- | :-- |
| **Tiêu đề Hero tách 3 mảnh** (`titleLead` · `titleHighlight` · `titleTail`) | Bản hiện tại có một cụm được tô gradient giữa câu (`<span className="grad-text">`). Một ô duy nhất thì không nói được **chỗ nào** được tô, và cho gõ `<span>` là mở cửa HTML — đúng thứ §7 cấm |
| **`min`/`max` cho mọi mảng** | Lưới 9 module còn 1 mục là bố cục hỏng; 40 mục là trang chủ thành catalog |
| **Độ dài tối đa cho mọi chuỗi** | Vừa là ràng buộc bố cục, vừa chặn một lần dán nhầm 2 MB vào jsonb |
| **`v: z.literal(1)`** | Số phiên bản lược đồ. Không có nó thì ngày đổi hình dạng lớn, việc duy nhất làm được là đoán dữ liệu đang theo bản nào |

## 5.6 🔴 Đọc: `safeParse` + merge sâu với mặc định

```ts
// lib/site-content/merge.ts  (HÀM THUẦN)
export function resolveHomeContent(raw: unknown): HomeContent {
  const merged = deepMerge(DEFAULT_HOME_CONTENT, isPlainObject(raw) ? raw : {});
  const parsed = homeContentSchema.safeParse(merged);
  if (parsed.success) return parsed.data;

  console.warn("[home-content] dữ liệu không hợp lược đồ, dùng bản mặc định", parsed.error.issues[0]);
  return DEFAULT_HOME_CONTENT;                       // 🔴 trang chủ KHÔNG được vỡ
}
```

Ba luật của `deepMerge` ở đây — không dùng thư viện merge chung chung, vì hành vi với **mảng** là chỗ
quyết định:

1. **Mảng thì THAY, không trộn từng phần tử.** Người dùng xóa module thứ 5 thì mảng mới có 8 phần
   tử; trộn theo chỉ số là module cũ sống dậy.
2. **Chỉ merge sâu với object thuần.** `null` trong dữ liệu **không** được coi là "chưa có" — nó là
   một giá trị người dùng đã chọn.
3. **Merge TRƯỚC, parse SAU.** Ngược lại thì dữ liệu thiếu một khóa bắt buộc sẽ trượt validate và
   rơi thẳng về bản mặc định — mất luôn những gì người dùng đã sửa đúng.

## 5.7 Ghi: server action + chống ghi đè

```ts
// lib/site-content/actions.ts
export async function saveHomeContent(input: unknown): Promise<ActionResult<{ updatedAt: Date }>> {
  const me = await requireUser();                                  // 1. quyền
  const { content, baseUpdatedAt } = saveInputSchema.parse(input); // 2. Zod (cả nội dung lẫn mốc)

  const [current] = await db.select().from(siteSettings).where(eq(siteSettings.key, HOME_CONTENT_KEY));
  if (current && current.updatedAt.getTime() !== new Date(baseUpdatedAt).getTime()) {
    return { ok: false, error: `Người khác vừa cập nhật nội dung lúc ${fmt(current.updatedAt)}. Tải lại trang để xem bản mới nhất trước khi lưu.` };
  }

  const changed = diffSections(current?.value, content);           // ['hero', 'pricing']
  const [saved] = await db.insert(siteSettings)
    .values({ key: HOME_CONTENT_KEY, value: content, updatedBy: me.id, updatedAt: new Date() })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value: content, updatedBy: me.id, updatedAt: new Date() } })
    .returning({ updatedAt: siteSettings.updatedAt });

  await writeLog(me, "settings.home_content.update", "site_settings", HOME_CONTENT_KEY, { changed });
  revalidatePath("/");                                             // 4. cache
  return { ok: true, data: { updatedAt: saved.updatedAt } };
}
```

- **So mốc trong cùng câu lệnh ghi** thì tốt hơn nữa: đưa điều kiện `WHERE updated_at = $base` vào
  chính `UPDATE` và kiểm số hàng bị ảnh hưởng — đọc-rồi-ghi vẫn còn một khe hở dù rất hẹp.
- `diffSections` trả **tên các khối đã đổi** để ghi nhật ký. 🔴 **Không** ghi toàn bộ nội dung vào
  `meta` — nhật ký không phải chỗ sao lưu.
- `revalidatePath("/")` là **bắt buộc**. Quên là "lưu xong mà web không đổi" — đúng vấn đề phân hệ
  này sinh ra để giải.

## 5.8 Bản nháp trong `localStorage`

```ts
type StoredDraft = {
  v: 1;
  content: HomeContent;
  baseUpdatedAt: string;   // mốc bản đã áp dụng lúc tạo nháp
  savedAt: string;
};
```

- Ghi lại sau mỗi lần gõ, **debounce 500ms**.
- Mở màn: có nháp → hiện *"Đã khôi phục bản nháp chưa lưu"* + [Dùng tiếp] [Bỏ bản nháp].
- 🔴 **`baseUpdatedAt` của nháp khác `updatedAt` hiện tại** → cảnh báo mạnh hơn: *"Bản nháp này được
  tạo trước khi người khác cập nhật nội dung. Dùng tiếp sẽ ghi đè thay đổi của họ."* Không có phép
  kiểm này thì khôi phục nháp cũ là **âm thầm quay ngược** công của người khác.
- Xóa nháp ngay sau khi *Lưu & áp dụng* thành công.
- Nháp là dữ liệu nội bộ, không nhạy cảm — nhưng vẫn xóa khi đăng xuất.

## 5.9 Panel dựng từ bản kê trường, không viết tay 130 ô

```ts
// lib/site-content/fields.ts
export type FieldDef =
  | { kind: "text";     path: string; label: string; max: number; required?: boolean; multiline?: boolean }
  | { kind: "number";   path: string; label: string; min: number; max: number }
  | { kind: "list";     path: string; label: string; itemLabel: (i: number, v: any) => string;
      min: number; max: number; fields: FieldDef[]; blank: () => unknown };

export const SECTIONS: { key: SectionKey; label: string; anchor: string; fields: FieldDef[] }[] = [ … ];
```

| PA | Đánh đổi | Kết |
| :-- | :-- | :-- |
| **Bản kê + panel dựng động** ⭐ | Thêm trường = thêm một dòng khai báo. Nhãn, độ dài, đếm ký tự nhất quán toàn màn | ✅ Chọn |
| Viết tay từng ô MUI | Toàn quyền tùy biến từng ô | ❌ ~130 ô, mỗi ô 6–8 dòng: một file 1.000 dòng không ai dám sửa, và chắc chắn có ô quên đếm ký tự |

`path` dùng cú pháp chấm (`hero.stats.0.label`) với hai hàm thuần `getAt`/`setAt`. `setAt` phải trả
**đối tượng mới** (không sửa tại chỗ), nếu không React không thấy state đổi và khung xem trước đứng
im — kiểu hỏng khó lần nhất của cả màn này.

## 5.10 Live: state ở đâu, gửi lúc nào

```
Ô nhập (MUI TextField)  ── giữ giá trị cục bộ, gõ mượt
        │ onChange
        ▼
  content state (useReducer ở CustomizerShell)  ── nguồn chân lý của phiên sửa
        ├──► lịch sử hoàn tác (mảng ảnh chụp, tối đa 50)
        ├──► localStorage (debounce 500ms)
        └──► postMessage sang iframe (debounce ~80ms)
```

- **`useReducer`, không phải 130 `useState`.** Một hành động `SET_FIELD { path, value }` cho mọi ô.
- **Hoàn tác gom nhóm theo thời gian**: các lần gõ liên tiếp trong ~500ms vào **cùng một trường** gộp
  thành một bước. Nếu không, hoàn tác lùi từng ký tự — và 50 bước không lùi nổi một câu.
- **Debounce sang iframe ~80ms**: dưới ngưỡng cảm nhận nhưng đủ để không render lại cả trang 12 lần
  cho một từ.

---

# 6. Ảnh hưởng tới phần khác

| Phần | Thay đổi |
| :-- | :-- |
| `components/*.tsx` (13 file) | 🔴 Nhận chữ qua `props`; **bỏ toàn bộ chuỗi viết cứng**. Việc lớn nhất của đợt |
| `lib/data.ts` | Chuyển thành `lib/site-content/defaults.ts`; xóa file cũ để không còn hai nguồn |
| `app/page.tsx` | Đọc nội dung, truyền props, thêm nhánh preview |
| `app/admin/(protected)/giao-dien/page.tsx` | Thay `ComingSoon` bằng màn thật |
| `lib/admin/menu.ts` | Gỡ `comingSoon` khỏi *Giao diện trang chủ* |
| `lib/db/schema.ts` | **Không đổi** nếu nhóm B đã tạo `site_settings` + `activity_logs` |
| `README.md` | Câu *"toàn bộ nội dung tập trung ở `lib/data.ts`"* không còn đúng |
| [`coding-style.md`](../../../conventions/coding-style.md) | Mục *"Nội dung — tập trung ở `lib/data.ts`"* phải viết lại |

---

# 7. Bảo mật

| Mối lo | Chặn bằng |
| :-- | :-- |
| 🔴 **Bơm nội dung giả vào khung xem trước** từ trang ngoài | Kiểm `e.origin` ở cả hai đầu; `postMessage` luôn kèm `targetOrigin` cụ thể, **không** `"*"` (§5.3) |
| **XSS qua chữ người dùng nhập** | Chữ render bằng `{text}` của React (tự thoát). **Không** `dangerouslySetInnerHTML` ở bất kỳ đâu trong phân hệ này |
| **Rò nội dung chưa duyệt** | Nháp chỉ tồn tại trong trình duyệt người sửa; preview khởi tạo bằng bản đã áp dụng; `noindex` + không cache (§5.4) |
| **Ghi khi chưa đăng nhập** | `requireUser()` trong action — server action là endpoint HTTP công khai, ai cũng POST được vào |
| **Nhồi dữ liệu khổng lồ vào jsonb** | Mọi chuỗi có `max`, mọi mảng có `max`; thêm trần tổng ~256 KB cho cả đối tượng |
| **Mất công người khác** | So mốc `updated_at` (§5.7) + cảnh báo khi khôi phục nháp cũ (§5.8) |
| **Rò qua nhật ký** | `meta` chỉ ghi **tên khối** đã đổi |

---

# 8. Bề mặt gọi được

```ts
// lib/site-content/queries.ts   — dùng ở Server Component
export async function getHomeContent(): Promise<HomeContent>;

// lib/site-content/actions.ts   — "use server"
export async function getHomeContentForEdit(): Promise<{ content: HomeContent; updatedAt: Date | null }>;
export async function saveHomeContent(input: unknown): Promise<ActionResult<{ updatedAt: Date }>>;
```

Chỉ **ba** hàm. Mọi thứ còn lại — hoàn tác, nháp, đặt lại, đổi Desktop/Mobile — xảy ra **hoàn toàn ở
trình duyệt** và không cần một lời gọi máy chủ nào. Đó là thước đo cho biết thiết kế này đúng hướng.

---

# 9. Xử lý lỗi

| Tình huống | Hành vi |
| :-- | :-- |
| jsonb hỏng / thiếu khóa | Merge với mặc định; hỏng nặng thì dùng nguyên mặc định + `console.warn`. **Trang chủ vẫn chạy** |
| Trường bắt buộc rỗng | Báo đỏ tại ô + **chặn** *Lưu & áp dụng*, kèm nút nhảy tới ô đang lỗi |
| Vượt độ dài | Báo tại ô, bộ đếm chuyển đỏ, chặn lưu |
| Người khác đã lưu trước | `{ ok: false }` nói rõ **lúc nào**; đề nghị tải lại (FR-C13) |
| Mất mạng lúc lưu | Toast đỏ; **nội dung đang sửa và bản nháp còn nguyên** |
| iframe không báo `ready` sau 5s | Hiện nút *Tải lại khung xem trước*; panel **vẫn sửa được** — hỏng xem trước không được kéo theo hỏng cả màn |
| Nháp lệch mốc | Cảnh báo mạnh trước khi dùng tiếp (§5.8) |

---

# 10. Hiệu năng

| Điểm | Cách |
| :-- | :-- |
| Trang chủ | **1 truy vấn** cho toàn bộ chữ; vẫn ISR được (`revalidate`), `revalidatePath("/")` khi lưu |
| Gõ trong panel | Ô nhập giữ state cục bộ; reducer cập nhật cây; debounce ~80ms sang iframe |
| Render lại preview | React chỉ dựng lại khối có props đổi — miễn là **không tạo mới object props không cần thiết**; khối nặng bọc `memo` |
| Lịch sử hoàn tác | Ảnh chụp cả cây, trần **50 bước**. Cây ~40 KB × 50 ≈ 2 MB — chấp nhận được trong RAM |
| `localStorage` | Debounce 500ms, ghi JSON một lần; **không** ghi mỗi ký tự |

---

# 11. Các phương án đã cân nhắc

## 11.1 Nơi lưu nội dung

| PA | Đánh đổi | Kết |
| :-- | :-- | :-- |
| **1 hàng `site_settings.home_content`** ⭐ | Đọc 1 truy vấn, ghi nguyên tử, hoàn tác đơn giản | ✅ Chọn |
| Mỗi khối một hàng | Ghi từng phần được | ❌ Đọc trang chủ thành 13 truy vấn; lưu nửa chừng lỗi là trang chủ pha hai phiên bản |
| Bảng có cột cho từng trường | Ràng buộc chặt ở tầng DB | ❌ ~130 cột, và mỗi lần thêm chữ là một migration |
| File JSON trong repo | Đơn giản nhất | ❌ Sửa vẫn phải deploy — đúng vấn đề đang giải |

## 11.2 Cơ chế xem trước

Xem §5.2.

## 11.3 Nơi giữ bản nháp

| PA | Đánh đổi | Kết |
| :-- | :-- | :-- |
| **`localStorage`** ⭐ | Không cần đường ghi thứ hai, không cần trả lời "nháp của ai" | ✅ Chọn — đổi lại nháp không theo người dùng sang máy khác, và **phải nói rõ trên giao diện** |
| Cột `draft` trong DB | Nháp đi theo tài khoản | ❌ Đẻ ra khóa/quyền/xung đột nháp; thừa với đội vài người |

## 11.4 Bóc chữ ra khỏi component

| PA | Đánh đổi | Kết |
| :-- | :-- | :-- |
| **Props từ trên xuống** ⭐ | Tường minh; component thành thuần trình bày, test được | ✅ Chọn |
| React Context `useContent()` | Không phải xâu props | ❌ Che mất phụ thuộc; và khối nào cũng phải là client component |
| Đọc DB trong từng khối | Không phải sửa `page.tsx` | ❌ 13 truy vấn mỗi lượt tải, và preview không đè được nội dung |

---

# 12. Kế hoạch triển khai

Rủi ro nằm ở **thứ tự**, không ở dữ liệu (không có dữ liệu cũ để di trú):

1. **Lược đồ + mặc định + merge** — hàm thuần, có test. Chưa đụng giao diện.
2. **Bóc chữ**: 13 khối nhận props, `page.tsx` truyền xuống. 🔴 **Trang chủ phải trông y hệt trước
   đó** — đây là bước dễ vỡ nhất và phải so ảnh trước/sau.
3. **Đường ghi**: server action + nhật ký + chống ghi đè.
4. **Cầu xem trước**: `?preview=1` + `PreviewBridge` + kiểm origin.
5. **Panel**: bản kê trường + ô nhập + danh sách + nháp/hoàn tác/đặt lại.
6. **Dọn**: xóa `lib/data.ts`, gỡ `comingSoon`, viết lại README + `coding-style`.

🔴 Bước 2 **phải xong và ổn định** trước khi bắt đầu bước 4–5. Vừa bóc chữ vừa dựng panel là lúc lỗi
bố cục và lỗi luồng dữ liệu trộn vào nhau, không biết cái nào gây ra cái nào.

---

# 13. Chiến lược kiểm thử

| Lớp | Kiểm gì | Cách |
| :-- | :-- | :-- |
| **Hàm thuần** 🔴 | `deepMerge` (mảng thay chứ không trộn · `null` không bị coi là thiếu · lồng sâu) · `resolveHomeContent` (thiếu khóa · dư khóa · rác hoàn toàn → về mặc định) · `getAt`/`setAt` (trả object mới, không sửa tại chỗ) | `vitest` |
| **Khớp ba nguồn** 🔴 | Mọi `path` trong `fields.ts` **tồn tại** trong `DEFAULT_HOME_CONTENT`; mọi trường bắt buộc của schema **có mặt** trong `fields.ts` | `vitest` — ca test này bắt đúng lỗi "thêm trường mà quên khai vào panel" |
| **Bảo mật cầu nối** 🔴 | `postMessage` từ origin khác **bị bỏ qua** | `vitest` + kiểm tay |
| **Server action** | Chưa đăng nhập → chặn · mốc lệch → từ chối · lưu thành công → `updated_at` đổi + có dòng nhật ký | Chạy trên DB Docker local |
| **Bóc chữ** (bước 2) | Trang chủ **trông y hệt** trước khi bóc | So ảnh chụp toàn trang trước/sau, ở 1440px và 375px |
| **Live** | Gõ → khung xem trước đổi; không nhấp nháy; **không mất vị trí cuộn** | Thủ công |
| **Bố cục** | Chữ dài nhất theo `max` của từng trường **không** làm vỡ bố cục ở 375px | Thủ công, dùng một bản nội dung "chữ dài tối đa" |

---

# 14. Giám sát

- `activity_logs` — ai áp dụng nội dung, lúc nào, đổi những khối nào.
- `console.warn` tiền tố `[home-content]` khi dữ liệu không hợp lược đồ và phải lùi về mặc định. Đây
  là dấu hiệu **duy nhất** cho biết dữ liệu trong DB đã lệch với mã.
- Panel hiện `updated_at` + người sửa gần nhất ngay trên thanh công cụ — để hai người cùng làm nhìn
  thấy nhau trước khi đụng nhau.

---

# 15. Câu hỏi còn mở

| # | Câu hỏi | Chặn ai |
| :-- | :-- | :-- |
| **Q1** | Làm nhóm B (bài viết) trước hay nhóm C trước? | Nếu C trước thì task schema của C phải tạo `site_settings` + `activity_logs` |
| **Q2** | Bề rộng Mobile 390px hay 375px? | Chỉ ảnh hưởng một hằng số |
| **Q3** | Có cần cột `home_content` riêng thay vì `site_settings` không? | Không — nhưng nếu sau này thêm `theme`, `seo`, cần thống nhất quy ước đặt khóa |

---

# Quy tắc quyết định

RFC này chốt **cách xây**. Hành vi chi tiết từng ô, từng nút ở [Spec](./customizer-spec.md); chia
việc ở [Tasks](./customizer-tasks.md).

# End
