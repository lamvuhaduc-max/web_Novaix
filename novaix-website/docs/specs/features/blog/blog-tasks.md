# Tasks — Bài viết & Trưng bày nội dung trên website OAlpha

> **PRD:** [`blog-prd.md`](./blog-prd.md) · **RFC:** [`blog-rfc.md`](./blog-rfc.md) ·
> **Spec:** [`blog-spec.md`](./blog-spec.md) · **Domain:** [`content-article-domain.md`](../../domains/content-article-domain.md)
>
> **Trạng thái:** 📝 chưa bắt đầu.

---

# 0. Điểm chặn cần chốt trước

| # | Câu hỏi | Chặn task | Mặc định nếu không có phản hồi |
| :-- | :-- | :-- | :-- |
| **C1** 🔴 | Trình soạn thảo: **Tiptap (MIT)** hay TinyMCE 6? | T12 | **Tiptap.** Chọn TinyMCE thì phải mở `LICENSE.txt` trong gói npm đọc **ngay sau khi cài** — v7 đã đổi sang GPLv2+ |
| **C2** 🔴 | R2 đã có bucket + khóa + domain `cdn.oalpha.vn` chưa? | T7 | Làm **driver local** (`public/uploads/`) trước, **qua đúng interface `BlobStorage`** để đổi sang R2 không phải sửa nghiệp vụ |
| **C3** | Thêm `vitest` làm devDependency? | T1–T3 | **Có.** Bốn hàm thuần của đợt này là hàng rào bảo mật, không thể không có test |

**C1 và C2 không chặn T1–T6, T8–T11.** Cứ bắt đầu.

### ❌ Đã LOẠI khỏi phạm vi — không có task tương ứng

| Bị loại | Vì sao |
| :-- | :-- |
| Thẻ sản phẩm trong bài | Website không có danh mục sản phẩm, không có giá — bảng nối và đường đọc giá đều vô nghĩa ở đây |
| Tìm kiếm toàn văn · lịch đăng · phiên bản nội dung · chuyển hướng 301 | Xem [PRD §3](./blog-prd.md#3-không-nằm-trong-phạm-vi-non-goals) |

---

# 1. Bảng công việc

**Ước tính tổng: 8–11 ngày làm việc.** Cột *PT* = phụ thuộc.

| # | Task | Lớp | PT | Độ khó |
| :-- | :-- | :-- | :-- | :-- |
| **T1** | Hàm thuần: làm sạch HTML + test | Lib | C3 | 🟠 Vừa |
| **T2** | Hàm thuần: slug + mục lục + test | Lib | C3 | 🟢 Thấp |
| **T3** | Hàm thuần: soi SEO + test | Lib | C3 | 🟠 Vừa |
| **T4** | Schema Drizzle (4 bảng + enum) + `db:push` | DB | — | 🟢 Thấp |
| **T5** | Script hạt giống danh mục | DB | T4 | 🟢 Thấp |
| **T6** | Zod schema + `ActionResult` + nhật ký | BE | T4 | 🟢 Thấp |
| **T7** | `BlobStorage` + upload ảnh | BE | C2, T6 | 🟠 Vừa |
| **T8** | Server action bài viết (CRUD + trạng thái + thùng rác) | BE | T1, T2, T6 | 🔴 Cao |
| **T9** | Server action danh mục | BE | T6 | 🟢 Thấp |
| **T10** | Truy vấn công khai (`queries.ts`) | BE | T4 | 🟠 Vừa |
| **T11** | Màn AD-B1 — danh sách + tab danh mục + thùng rác | FE | T8, T9 | 🟠 Vừa |
| **T12** | Màn AD-B2 — soạn thảo *(🔴 khó nhất)* | FE | C1, T7, T8 | 🔴 Cao |
| **T13** | Khối Soi SEO trong màn soạn thảo | FE | T3, T12 | 🟠 Vừa |
| **T14** | Cấu hình hai dải + màn AD-B3 | BE+FE | T6, T10 | 🟠 Vừa |
| **T15** | SH-B3 — hai dải trên trang chủ | FE | T10, T14 | 🟢 Thấp |
| **T16** | SH-B2 — trang đọc *(🔴 khó nhất về giao diện)* | FE | T10 | 🔴 Cao |
| **T17** | SH-B1 — danh sách công khai + mục menu | FE | T10 | 🟠 Vừa |
| **T18** | SEO — sitemap · JSON-LD · Open Graph | FE | T10, T16 | 🟠 Vừa |
| **T19** | Gỡ `comingSoon` + dọn menu | FE | T11, T14 | 🟢 Thấp |
| **T20** | Di trú nội dung tĩnh vào bài viết (FR-B14) | Nội dung | T16 | 🟢 Thấp |
| **T21** | Cập nhật **tài liệu** *(bắt buộc, không được nợ)* | Docs | mọi task | 🟠 Vừa |

**Thứ tự chạy:** T1–T3 (lõi thuần) → T4–T6 (dữ liệu) → T7–T10 (đường ghi/đọc) → T11–T14 (quản trị) →
T15–T18 (công khai + SEO) → T19–T21 (dọn + tài liệu).

---

# T1 — Hàm thuần: làm sạch HTML

**File:** `lib/blog/html.ts` · `lib/blog/html.test.ts`

- Cài `sanitize-html` + `@types/sanitize-html`.
- Cấu hình allowlist đúng [RFC §5.2](./blog-rfc.md#52-làm-sạch-html) — khai theo hướng **cấm sạch rồi
  mở từng thứ** (`'*': []`).
- `sanitizeArticleHtml(raw)` trả `{ html, removedTags }` — `removedTags` để giao diện báo cho người
  soạn biết cái gì vừa bị bỏ.
- `assertLocalImages(html)` — mọi `img src` phải bắt đầu bằng `R2_PUBLIC_URL` hoặc `/uploads/`.
- `transformTags` cho `<a>` ra ngoài: tự gắn `rel="noopener noreferrer nofollow"`.

**Test (10 ca, viết CÙNG LÚC với hàm, không viết sau):** `<script>` · `onerror` · `javascript:` ·
`data:` · ảnh host ngoài · `<h2 id>` giữ nguyên · `<h1>` bị loại · `//evil.com` · `data-*` bị tước ·
`<a>` ngoài được thêm `rel`.

🔴 **Không tự viết regex làm sạch.** Regex không hiểu thẻ lồng nhau; đây là hàng rào bảo mật, không
phải chỗ để tiết kiệm một dependency.

**Xong khi:** 10 ca xanh, và `npm run build` không lỗi type.

---

# T2 — Hàm thuần: slug + mục lục

**File:** `lib/blog/toc.ts` · `lib/blog/toc.test.ts`

- `slugify(text)`: thay `đ`/`Đ` → `d`/`D` **trước** khi `normalize("NFD")`, bỏ dấu, thường hóa, gạch
  nối, gộp gạch thừa, cắt gạch đầu/cuối.
- `extractToc(html)`: tìm `h2`/`h3`/`h4`, sinh `id`, **chèn vào chính thẻ**, trả cây mục lục (chỉ H2/
  H3 vào mục lục; H4 có `id` nhưng không hiện).
- Trùng `id` → hậu tố `-2`, `-3`.
- Đề mục đã có `id` → **giữ nguyên**, không đè.

**Test:** `"Đầu tư ERP"` → `dau-tu-erp` (🔴 không phải `u-tu-erp`) · hai đề mục cùng tên → `-2` ·
`id` có sẵn được giữ · thứ tự mục lục khớp thứ tự trong bài · HTML rỗng → `toc: []`.

**Xong khi:** test xanh, và chạy `extractToc` hai lần trên cùng đầu vào cho **kết quả y hệt**
(idempotent) — nếu không, mỗi lần lưu lại là một lần neo đổi.

---

# T3 — Hàm thuần: soi SEO

**File:** `lib/blog/seo-check.ts` · `lib/blog/seo-check.test.ts`

- 13 luật ở [RFC §5.4](./blog-rfc.md#54-soi-seo--hàm-thuần-chạy-ở-trình-duyệt-fr-b05).
- `runSeoChecks(input, thresholds)` → `{ issues, readiness }`.
- So khớp từ khóa: **bỏ dấu + ranh giới từ** (dùng lại `slugify` để chuẩn hóa hai vế).
- 🔴 `readiness` tính **chỉ trên luật đang bật** — luật tắt rời khỏi cả tử số lẫn mẫu số.

**Test:** tắt một luật đang đỏ → `readiness` **không giảm** · `"kho"` không khớp trong `"khó"` ·
`"erp"` không khớp giữa `"enterprise"` · bài rỗng → trả về danh sách rút gọn, không phải 13 mục đỏ.

🔴 **Hàm này không được `fetch` bất cứ thứ gì**, và không import `next`. Có một ca test khẳng định
điều đó bằng cách chạy nó trong môi trường không có `fetch`.

---

# T4 — Schema Drizzle

**File:** `lib/db/schema.ts` (thêm vào cuối, **không đụng** phần `users`)

- 1 enum `article_status` + 4 bảng: `article_categories`, `articles`, `site_settings`,
  `activity_logs`. Nội dung đúng [RFC §7.1](./blog-rfc.md#71-schema-drizzle).
- Ba `onDelete` **khác nhau có lý do**: `restrict` (danh mục) · `set null` (tác giả) · `set null` +
  `actor_email` chụp sẵn (nhật ký). Đừng "đồng bộ cho gọn".
- 2 index trên `articles`, 1 trên `activity_logs`.
- Export type suy ra từ bảng (`$inferSelect`), **không gõ tay**.

**Xong khi:** `npm run db:push` chạy sạch trên Postgres local, `npm run db:studio` thấy đủ 4 bảng.

---

# T5 — Hạt giống danh mục

**File:** `scripts/seed-blog.ts` · script `db:seed:blog` trong `package.json`

- Ba danh mục: *Giới thiệu* · *Chính sách* · *Kiến thức*.
- Khuôn theo `scripts/seed-admin.ts` đã có, **kể cả `closeDb()` ở cuối** — thiếu là tiến trình treo.
- Chạy lại nhiều lần không tạo trùng (kiểm theo `slug`).

---

# T6 — Zod schema + nhật ký

**File:** `lib/blog/schema.ts` · `lib/blog/log.ts`

- Toàn bộ Zod schema cho input của action; thông báo lỗi **tiếng Việt viết ngay trong schema**.
- `ActionResult<T>` — cùng hình dạng với `lib/admin/users-actions.ts` đang dùng.
- `writeLog(actor, action, entity, entityId?, meta?)` — chụp `actor_email` tại chỗ.
- 🔴 `meta` **không chứa** thân bài, không chứa gì nhạy cảm.
- Danh sách `action` khai thành union type, không phải chuỗi tự do: `article.create` ·
  `article.update` · `article.publish` · `article.hide` · `article.delete` · `article.restore` ·
  `category.*` · `settings.rails.update`.

---

# T7 — `BlobStorage` + upload ảnh

**File:** `lib/blog/storage.ts` · `lib/blog/image-actions.ts`

- Interface `BlobStorage.put(key, body, contentType) → url`; hai cài đặt: **R2** (`@aws-sdk/client-s3`)
  và **local** (`public/uploads/`) chọn theo `STORAGE_DRIVER`.
- `uploadArticleImage(formData)` — năm phép kiểm ở [RFC §8.3](./blog-rfc.md#83-server-action--ảnh-imageactionsts):
  quyền · dung lượng ≤5MB · **magic bytes** · tên sinh ở máy chủ · qua interface.
- 🔴 **Không tin `file.type` và không tin đuôi tệp.** Đó là hai thứ do trình duyệt gửi lên.
- 🔴 **Không rải `fs` hay lời gọi S3 vào action nghiệp vụ** — mọi truy cập kho ảnh qua interface.

**Xong khi:** upload JPEG thật → có URL mở được; đổi đuôi một tệp `.exe` thành `.jpg` → **bị từ
chối**; upload 12MB → bị từ chối kèm câu nói rõ giới hạn.

---

# T8 — Server action bài viết *(🔴 lõi của đợt)*

**File:** `lib/blog/article-actions.ts`

Bảy hàm ở [RFC §8.1](./blog-rfc.md#81-server-action--bài-viết-libblogarticle-actionsts). Mỗi hàm đủ
bốn nhịp: **`requireUser()` → Zod parse (`input: unknown`) → thao tác → `revalidate`**.

Sáu điểm dễ sai, kiểm từng cái:

1. **Thứ tự trong `saveArticle`**: làm sạch → kiểm ảnh nội bộ → rút mục lục → ghi. Rút mục lục
   **trước** khi làm sạch là mục lục lệch với thân bài.
2. **`published_at = COALESCE(published_at, now())`** — chỉ khi chuyển sang `published`, và không đổi
   ở lần sau.
3. **Khôi phục luôn về `draft`**, kể cả bài lúc xóa đang `published`.
4. **Slug trùng kiểm trước**, trả câu tiếng Việt — không để Postgres ném `duplicate key`.
5. **`revalidateArticle`** gọi đủ 4 đường dẫn; đổi slug thì làm mới **cả slug cũ lẫn mới**.
6. **`hardDeleteArticle` chỉ `super_admin`** — kiểm bằng vai trò đọc từ DB.

**Xong khi:** chạy được toàn bộ vòng đời bằng script gọi thẳng action (chưa cần giao diện):
tạo → lưu → đăng → ẩn → đăng lại (`published_at` không đổi) → xóa → khôi phục (về nháp).

---

# T9 — Server action danh mục

**File:** `lib/blog/category-actions.ts`

- CRUD + `reorderCategories`.
- 🔴 `deleteCategory` **đếm bài trước**, trả câu nói rõ số bài đang vướng. Để `RESTRICT` ném lỗi rồi
  hiện nguyên văn `violates foreign key constraint` là đẩy lỗi kỹ thuật vào mặt người dùng.
- `listCategories()` trả kèm **số bài mỗi danh mục** (một truy vấn `LEFT JOIN … GROUP BY`, không phải
  N+1).

---

# T10 — Truy vấn công khai

**File:** `lib/blog/queries.ts`

- Năm hàm ở [RFC §8.4](./blog-rfc.md#84-truy-vấn-công-khai-queriests).
- 🔴 **Một biểu thức `visibleArticle` dùng chung** cho cả 5 hàm — chép tay vào từng chỗ là bảo đảm sau
  ba tháng có một chỗ quên `deletedAt`.
- Danh sách **không** `SELECT content_html`.
- `getHomeRails`: nguồn `manual` phải **sắp lại theo thứ tự đã chọn trong JS** — `WHERE id IN (...)`
  không giữ thứ tự.
- `getRelatedArticles`: cùng danh mục trước, **đủ 4 rồi thì không chạy truy vấn bù**.

**Xong khi:** viết một script kiểm nhanh: bài `draft`/`hidden`/đã xóa/danh mục ẩn **không** lọt vào
bất kỳ hàm nào trong năm hàm.

---

# T11 — Màn AD-B1

**File:** `app/admin/(protected)/bai-viet/page.tsx` · `components/admin/blog/ArticlesTable.tsx` ·
`CategoriesTable.tsx`

- Hai tab; khuôn theo `MembersTable.tsx` đang có — **không chế bố cục thứ hai**.
- Bộ lọc đủ 4 ô; **Thùng rác là một lựa chọn trong ô Trạng thái**, không phải tab thứ ba.
- Ba trạng thái rỗng khác nhau ([Spec §3.1](./blog-spec.md#31-ad-b1--quản-lý-bài-viết)) — không dùng
  chung một câu "Không có dữ liệu".
- Cảnh báo khi tắt `visible` của danh mục còn bài.
- `export const dynamic = "force-dynamic"` cho page.

⚠️ File này dễ vượt 350 dòng. Tách sớm: `ArticleFilters.tsx`, `ArticleRow.tsx`, `CategoryDialog.tsx`.

---

# T12 — Màn AD-B2 *(🔴 khó nhất)*

**File:** `app/admin/(protected)/bai-viet/[id]/page.tsx` · `components/admin/blog/ArticleEditor.tsx`

- Bố cục hai cột + thanh trên **dính đỉnh** ([Spec §3.2](./blog-spec.md#32-ad-b2--màn-soạn-thảo)).
- Trình soạn thảo theo C1, nạp `ssr: false` (nó đụng `document`).
- Hành vi slug đủ 5 tình huống — đặc biệt: bài **đã đăng** thì đổi tiêu đề **không** đổi slug.
- Cảnh báo `beforeunload` khi có thay đổi chưa lưu.
- Cảnh báo thẻ bị loại sau khi lưu, **liệt kê cụ thể**.
- Chèn ảnh: ô giữ chỗ → khóa nút Lưu → thay bằng `<img>`; lỗi thì **không mất nội dung đang soạn**.
- `Ctrl/Cmd + S` = Lưu.

🔴 Trình soạn thảo **không phải** hàng rào bảo mật — HTML vẫn qua `sanitizeArticleHtml` ở máy chủ.
Đừng làm sạch ở client rồi tin nó.

---

# T13 — Khối Soi SEO

**File:** `components/admin/blog/SeoPanel.tsx` · `SeoThresholdsDialog.tsx`

- Gọi `runSeoChecks` (T3) với **debounce 300ms**.
- Thanh Mức sẵn sàng màu trung tính, **không** con số to màu đỏ, chú thích rõ nó đo cái gì.
- Ba nhóm gợi ý; nhóm `ok` gộp thành một dòng bấm mới mở.
- Ngưỡng + từ khóa lưu `localStorage` theo id bài.
- Bài dưới 20 từ → một dòng *"Bắt đầu viết để nhận gợi ý"*.

🔴 Ba thứ **không** làm: không chặn Lưu/Đăng · không điểm số đỏ · không tự sửa bài hộ người viết.

**Xong khi:** tắt một luật đang đỏ → thanh **không tụt**; mở tab Network, gõ 200 ký tự → **không có
lời gọi mạng nào**.

---

# T14 — Cấu hình hai dải + màn AD-B3

**File:** `lib/blog/rails-actions.ts` · `app/admin/(protected)/giao-dien/page.tsx` ·
`components/admin/blog/RailsEditor.tsx`

- `railSchema` + `homeRailsSchema` ([RFC §5.5](./blog-rfc.md#55-hai-dải-trang-chủ--cấu-hình-jsonb-không-thêm-bảng)).
- 🔴 Đọc **phải `safeParse`**, hỏng thì trả `DEFAULT_RAILS` + `console.warn` — trang chủ không được
  vỡ vì một dòng jsonb cũ.
- Màn: mỗi dải một `Card`, **một nút Lưu duy nhất** ở chân tab.
- Kéo thả thứ tự cho nguồn *chọn tay*.
- **Xem trước dựng đúng thẻ thật**, không phải danh sách chữ.
- 🔴 Cảnh báo tại hàng khi bài trong dải đang `draft`/`hidden`/đã xóa.

---

# T15 — SH-B3: hai dải trên trang chủ

**File:** `components/blog/ArticleRail.tsx` · `components/blog/ArticleCard.tsx` · sửa `app/page.tsx`

- Chèn **sau** *Quy trình*, **trước** *Bảng giá*.
- Tailwind + token nền tối của `app/globals.css`; dùng lại `SectionHead` và `Reveal`.
- 🔴 **Không dùng MUI ở đây** — đây là vùng công khai.
- Dải rỗng → **không render gì**, kể cả tiêu đề.

---

# T16 — SH-B2: trang đọc *(🔴 khó nhất về giao diện)*

**File:** `app/bai-viet/[slug]/page.tsx` · `components/blog/Toc.tsx` · `ArticleBody.tsx` ·
`Breadcrumb.tsx` · `RelatedArticles.tsx`

- Bố cục, ảnh bìa 21:9, cột nội dung ~70–80ch ([Spec §3.6](./blog-spec.md#36-sh-b2--trang-đọc)).
- Chỉ mục `sticky` + `IntersectionObserver` làm nổi mục đang đọc.
- Bấm mục → cuộn mượt + `history.replaceState` (**không** `pushState`).
- Mở trang có `#neo` → nhảy **sau khi ảnh tải xong**.
- Điện thoại: nút *Mục lục* dính đáy, mở tấm trượt.
- Bài **không có đề mục** → không hiện cột chỉ mục, nội dung dùng trọn bề rộng.
- Breadcrumb: mắt cuối **`min-width: 0`**; dưới 640px **xuống dòng**, không cắt cụt.
- `generateStaticParams()` cho bài đã đăng + `revalidate = 300`.
- Không tìm thấy / chưa đủ điều kiện hiện → `notFound()`.

**Xong khi:** ở 375px, `document.body.scrollWidth <= clientWidth`. Đo, không nhìn.

---

# T17 — SH-B1: danh sách công khai + menu

**File:** `app/bai-viet/page.tsx` · sửa `lib/data.ts` + `components/Navbar.tsx`

- Lưới 9 bài/trang, chip lọc danh mục, phân trang bằng query `?trang=`.
- 🔴 `Navbar` phải phân biệt **neo `#`** (cuộn trong trang) với **đường dẫn thật** (`/bai-viet`) —
  nếu không, bấm *Bài viết* từ trang đọc sẽ ra `/bai-viet/x#modules`.
- Chip danh mục rỗng: làm mờ hoặc bỏ khỏi hàng — không dẫn tới trang trống không giải thích gì.

---

# T18 — SEO

**File:** `app/sitemap.ts` · `generateMetadata` trong `app/bai-viet/[slug]/page.tsx` ·
`components/blog/JsonLd.tsx`

- `sitemap.ts` — 🔴 **chỉ bài `published`**, kèm `lastmod`.
- `generateMetadata`: title, description, Open Graph, Twitter Card; thiếu `cover_image` thì dùng ảnh
  mặc định của site.
- JSON-LD `Article` + `BreadcrumbList`, hai khối `<script>` **riêng**.
- 🔴 **Thoát `<` khi tuần tự hóa.** Có test cho tiêu đề chứa `</script>`.

**Xong khi:** dán link bài lên Zalo ra đúng ảnh + tiêu đề; `sitemap.xml` không chứa bài nháp.

---

# T19 — Gỡ `comingSoon` + dọn menu

**File:** `lib/admin/menu.ts`

- Bỏ `comingSoon: true` khỏi *Bài viết* và *Giao diện trang chủ*.
- Kiểm `ComingSoon.tsx` còn ai dùng không; không còn thì xóa file.

🔴 **Không được nợ task này.** Tính năng chạy mà menu vẫn ghi "Sắp có" là sản phẩm nói dối người dùng
theo hướng ngược lại.

---

# T20 — Di trú nội dung tĩnh (FR-B14)

- Tạo bài trong danh mục *Giới thiệu* / *Chính sách*: **Giới thiệu OAlpha**, **Chính sách bảo mật**,
  **Điều khoản dịch vụ**.
- 🔴 `stats`, `modules`, `features`, `steps`, `segments`, `testimonials`, `nav` **ở nguyên** trong
  `lib/data.ts` — đó là cấu trúc trang marketing, không phải bài viết
  ([Domain §4.8](../../domains/content-article-domain.md#48-ranh-giới-với-nội-dung-trang-chủ-fr-b14)).
- Làm **ở cuối**, sau khi trang đọc đã chạy ổn.

---

# T21 — Cập nhật tài liệu *(BẮT BUỘC)*

| File | Sửa gì |
| :-- | :-- |
| [`tech-stack.md`](../../../architecture/tech-stack.md) | 🔴 **Viết lại toàn bộ** — file hiện tại là của dự án khác. Tối thiểu: bảng công nghệ thật + 3 dependency mới (`sanitize-html`, trình soạn thảo, `@aws-sdk/client-s3`) + `vitest` |
| [`coding-style.md`](../../../conventions/coding-style.md) | Ngưỡng file mới nếu `ArticleEditor.tsx` vượt; bổ sung mục về hàm thuần + test |
| `README.md` | Thêm `db:seed:blog`, `npm test`, mô tả `/bai-viet` |
| `.env.example` | Ghi chú lại nhóm `R2_*` (nay mới thật sự dùng) |
| PRD/RFC/Spec | Cập nhật §"sai lệch so với thiết kế" nếu có chỗ làm khác thiết kế |

🔴 Cập nhật tài liệu **cùng PR** với code, không phải PR sau. PR sau nghĩa là không bao giờ.

---

# 2. Rủi ro theo task

| Task | Rủi ro | Giảm bằng |
| :-- | :-- | :-- |
| T1 | Allowlist quá rộng → XSS | Test viết cùng lúc; `'*': []`; không khai `data-*` |
| T2 | Neo đổi giữa các lần lưu → link chết im lặng | Test idempotent (chạy hai lần ra một kết quả) |
| T7 | Upload thành đường lên máy chủ | Magic bytes + trần dung lượng + tên sinh ở máy chủ |
| T8 | Quên `revalidatePath` → "sửa xong mà web không đổi" | Một hàm `revalidateArticle` duy nhất, mọi action gọi nó |
| T12 | File vượt 500 dòng, không ai dám sửa | Tách `SeoPanel`, `CoverPicker`, `SlugField` ngay từ đầu |
| T14 | jsonb cũ làm vỡ trang chủ | `safeParse` + `DEFAULT_RAILS` |
| T16 | Cuộn ngang trên điện thoại | Đo `scrollWidth`, không tin mắt |
| T18 | JSON-LD thoát chuỗi sai → XSS trên mọi trang đọc | Test với tiêu đề chứa `</script>` |
| T20 | Di trú nội dung khi hệ thống chưa ổn định | Làm cuối cùng, sau T16 |

---

# 3. Định nghĩa HOÀN THÀNH

Một task xong khi **tất cả** đúng:

- [ ] Code chạy, `npm run build` **không lỗi type**, `npm run lint` sạch.
- [ ] Hàm thuần có test và test **xanh**.
- [ ] Chuỗi hiển thị **tiếng Việt**, kể cả thông báo lỗi.
- [ ] Client component **không** `import { db }`.
- [ ] Server action đủ bốn nhịp: quyền → Zod (`input: unknown`) → thao tác → `revalidatePath`.
- [ ] Không log mật khẩu, token, `DATABASE_URL`, khóa R2.
- [ ] File dưới ngưỡng của [coding-style](../../../conventions/coding-style.md), hoặc đã tách.
- [ ] Tiêu chí nghiệm thu tương ứng ở [Spec §10](./blog-spec.md#10-tiêu-chí-nghiệm-thu) đã tick.

# End
