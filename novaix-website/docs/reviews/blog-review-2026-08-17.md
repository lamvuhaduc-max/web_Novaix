# Rà soát phân hệ Bài viết — 17/08/2026

Tài liệu này ghi lại 10 lỗi tìm được khi rà soát nhánh `feat/nhathuy` (phân hệ bài viết), đã sửa ở nhánh `fix/blog-review` và merge vào `master`.

Mục đích không phải là chấm điểm ai, mà để cả nhóm nhận ra **kiểu lỗi** — vì phần lớn những lỗi dưới đây không phải do viết ẩu, mà do một vài đặc tính của Next.js App Router và Postgres không hiện ra lúc chạy thử trên máy. Code chạy đúng ở môi trường dev, chỉ hỏng khi lên thật hoặc khi gặp dữ liệu ngoài dự kiến.

**Phạm vi:** 39 file, 6.611 dòng thêm — commit `392799f`.
**Bản vá:** commit `fb4e2af`, merge `211c60c`.

---

## Tổng quan

| # | Lỗi | Mức độ | File |
| :-- | :-- | :-- | :-- |
| 1 | `/_next/image` mở cho mọi host trên Internet | 🔴 Bảo mật | `next.config.mjs` |
| 2 | Hàm đọc trong file `"use server"` thành API không xác thực | 🔴 Bảo mật | `category-actions.ts`, `rails-actions.ts` |
| 3 | Kiểm tra host ảnh bằng `startsWith` nên bỏ lọt tên miền giả | 🟠 Bảo mật | `lib/blog/html.ts` |
| 4 | `redirect()` bị `try/catch` của action nuốt mất | 🔴 Chức năng | `lib/auth/session.ts` + 11 khối catch |
| 5 | `articleIds` khai sai kiểu → dải "chọn thủ công" không lưu được | 🔴 Chức năng | `lib/blog/schema.ts` |
| 6 | Ô tìm kiếm bài viết không hoạt động | 🟠 Chức năng | `ArticlesTable.tsx` |
| 7 | Tìm kiếm phân biệt hoa thường | 🟠 Chức năng | `article-actions.ts` |
| 8 | `?trang=-1` làm trang `/blog` trả lỗi 500 | 🟠 Chức năng | `app/blog/page.tsx` |
| 9 | Heading xuống dòng bị mất khỏi mục lục | 🟡 Chức năng | `lib/blog/toc.ts` |
| 10 | Lỗi database làm sập `next build` của trang chủ | 🟠 Vận hành | `lib/blog/queries.ts` |

Cộng thêm một vấn đề vận hành: cấu hình R2 thiếu biến thì hệ thống **âm thầm** ghi ảnh ra đĩa.

---

## 🔴 1. `/_next/image` biến máy chủ thành proxy tải ảnh hộ

**Code cũ:**

```js
images: {
  remotePatterns: [
    { protocol: "https", hostname: "images.unsplash.com" },
    { protocol: "https", hostname: "**" },   // ⚠️
  ],
},
```

**Chuyện gì xảy ra.** `hostname: "**"` cho phép Next tối ưu ảnh từ *bất kỳ* host HTTPS nào. Bất kỳ ai trên Internet cũng gọi được:

```
https://oalpha.vn/_next/image?url=https://file-nang-50mb.com/x.jpg&w=640&q=75
```

Máy chủ của mình sẽ tải file đó về, xử lý, rồi trả ra. Hệ quả: người khác xài băng thông và CPU của mình miễn phí, và dùng máy chủ mình làm bàn đạp để dò các endpoint mà từ ngoài không truy cập được.

**Điểm đáng chú ý.** `next/image` **không được dùng ở đâu cả**. Cả `ArticleCard.tsx` lẫn `app/blog/[slug]/page.tsx` đều `import Image from "next/image"` rồi lại render bằng thẻ `<img>` thường. Nghĩa là allowlist này mở toang một cánh cửa cho một tính năng không ai xài.

**Đã sửa:** giới hạn đúng host của `R2_PUBLIC_URL`, đọc từ biến môi trường.

```js
const r2ImageHost = process.env.R2_PUBLIC_URL
  ? new URL(process.env.R2_PUBLIC_URL).hostname
  : null;

images: {
  remotePatterns: r2ImageHost ? [{ protocol: "https", hostname: r2ImageHost }] : [],
},
```

**Kiểm chứng:** gọi `/_next/image` với host `images.unsplash.com` giờ trả **400** thay vì 200.

> **Rút ra:** `"**"` trong `remotePatterns` không bao giờ là đáp án đúng. Nếu đang loay hoay vì ảnh không hiện, hãy thêm đúng host đang cần, đừng mở toàn bộ.

---

## 🔴 2. Hàm chỉ đọc nằm trong file `"use server"` → API không xác thực

Đây là lỗi dễ mắc nhất và khó thấy nhất, vì nhìn code thì hoàn toàn hợp lý.

**Code cũ** — `lib/blog/category-actions.ts`:

```ts
"use server";

export async function listCategories(): Promise<CategoryRow[]> {
  // không có requireUser()
  return db.select({ ... }).from(articleCategories) ...;
}
```

**Chuyện gì xảy ra.** Trong Next.js App Router, **mọi hàm được export từ file có `"use server"` đều trở thành một endpoint HTTP công khai**. Không chỉ hàm ghi — hàm đọc cũng vậy. Next sinh ra một Action ID và bất kỳ ai biết ID đó đều POST vào được, không qua middleware, không qua layout.

Vậy là `listCategories()` — trả về cả danh mục đang `visible = false` kèm số bài viết — thành một API mở. Tương tự với `getHomeRailsConfig()`.

**Vì sao không sửa bằng cách thêm `requireUser()`.** Vì trang công khai `/blog` cũng gọi `listCategories()`. Thêm kiểm quyền là khách vào xem blog sẽ bị đá ra.

**Đã sửa:** tách hàm đọc sang module thường, không có `"use server"`. Server component import trực tiếp vẫn chạy bình thường, nhưng không còn endpoint nào được sinh ra.

| Việc | Đặt ở đâu | `"use server"` |
| :-- | :-- | :-- |
| Ghi (tạo/sửa/xóa) | `lib/<miền>/*-actions.ts` | ✅ có, kèm `requireUser()` |
| Đọc (công khai lẫn admin) | `lib/<miền>/*-queries.ts`, `*-config.ts` | ❌ không |

File mới: `lib/blog/category-queries.ts`, `lib/blog/rails-config.ts`.

> **Rút ra:** trước khi thêm một hàm vào file `*-actions.ts`, tự hỏi: *"Nếu người lạ POST thẳng vào hàm này thì sao?"* Nếu câu trả lời không phải "bị chặn ngay ở dòng đầu", thì hàm đó không thuộc về file này.

---

## 🟠 3. Kiểm tra host ảnh bằng `startsWith`

**Code cũ:**

```ts
const isR2 = r2Url ? src.startsWith(r2Url) : false;
```

**Chuyện gì xảy ra.** Với `R2_PUBLIC_URL = "https://cdn.oalpha.vn"`, đường dẫn sau **vượt qua** kiểm tra:

```
https://cdn.oalpha.vn.ke-gian.com/anh.jpg
```

Vì nó đúng là bắt đầu bằng `https://cdn.oalpha.vn`. So sánh tiền tố trên URL luôn có lỗ này — ranh giới tên miền không nằm ở vị trí ký tự.

**Đã sửa:** parse URL rồi so `hostname` chính xác.

```ts
const hostname = new URL(src).hostname;      // "cdn.oalpha.vn.ke-gian.com"
if (!allowedHosts.has(hostname)) throw new Error(...);
```

> **Rút ra:** so khớp tên miền thì luôn `new URL(x).hostname`, không bao giờ `startsWith` / `includes` trên cả chuỗi URL.

---

## 🔴 4. `redirect()` bị `try/catch` của server action nuốt mất

Lỗi nặng nhất về mặt ảnh hưởng người dùng.

**Bối cảnh.** `requireUser()` được đổi từ *ném lỗi* sang *chuyển hướng*:

```ts
export async function requireUser(): Promise<SessionUser> {
  const result = await getSessionState();
  if (result.state === "anonymous") redirect("/admin/login");
  if (result.state === "revoked") redirect(`/admin/logout?reason=${result.reason}`);
  return result.user;
}
```

Với **page** thì đúng. Với **server action** thì hỏng.

**Chuyện gì xảy ra.** `redirect()` của Next không trả về — nó **ném ra một Error** mang thuộc tính `digest = "NEXT_REDIRECT;..."`, để framework bắt ở tầng ngoài cùng và biến thành lệnh chuyển hướng.

Nhưng mọi action đều có dạng:

```ts
try {
  const actor = await requireUser();   // ném NEXT_REDIRECT ở đây
  ...
} catch (err: any) {
  return { ok: false, error: err.message };   // 🔥 nuốt mất
}
```

Kết quả khi phiên hết hạn: **không chuyển hướng**, người dùng bấm Lưu và nhận về một hộp lỗi đỏ ghi đúng chữ `NEXT_REDIRECT`. Có 11 khối `catch` dính lỗi này.

**Đã sửa:** thêm `lib/next-errors.ts` và gọi ở đầu mọi khối catch.

```ts
export function rethrowIfNextControlFlow(err: unknown): void {
  const digest = (err as { digest?: unknown })?.digest;
  if (typeof digest === "string" &&
      (digest.startsWith("NEXT_REDIRECT") || digest === "NEXT_NOT_FOUND")) {
    throw err;
  }
}
```

```ts
} catch (err: any) {
  rethrowIfNextControlFlow(err);    // ← luôn là dòng đầu tiên
  console.error("[blog] saveArticle thất bại:", err);
  return { ok: false, error: err.message || "Không thể lưu bài viết." };
}
```

> **Rút ra:** `redirect()` và `notFound()` là **luồng điều khiển**, không phải lỗi. Bất cứ khi nào bọc `try/catch` quanh code có thể gọi chúng, phải ném lại. Đây là cái bẫy kinh điển của App Router.

---

## 🔴 5. `articleIds` khai sai kiểu — dải "chọn thủ công" không bao giờ lưu được

**Code cũ** — `lib/blog/schema.ts`:

```ts
categoryIds: z.array(z.string().uuid()).max(5).default([]),
articleIds:  z.array(z.string().uuid()).max(12).default([]),   // ⚠️
```

**Chuyện gì xảy ra.** Hai bảng dùng hai kiểu khóa chính khác nhau:

```ts
articleCategories = pgTable("article_categories", { id: uuid("id")... })   // UUID
articles          = pgTable("articles",           { id: serial("id")... }) // số nguyên
```

`categoryIds` khai `uuid()` là đúng. `articleIds` copy theo thì sai — ID bài viết là `1`, `2`, `3`. Zod chặn ngay ở `homeRailsSchema.parse(input)`, nên **mọi lần lưu dải "chọn bài thủ công" đều thất bại**, kèm thông báo lỗi Zod khó hiểu.

Lỗi này chỉ lộ ra khi thao tác đúng kịch bản đó — chọn nguồn "thủ công", tick bài, bấm Lưu. Test nhanh bằng nguồn "theo danh mục" thì không thấy gì.

**Đã sửa:** nhận cả số lẫn chuỗi số, chuẩn hóa về chuỗi cho khớp cách `RailsEditor` so sánh.

```ts
articleIds: z
  .array(z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]).transform(String))
  .max(12)
  .default([]),
```

**Kiểm chứng:** lưu xong, database ghi `["3", "1"]` và trang chủ render đúng hai bài theo đúng thứ tự đã chọn.

> **Rút ra:** khi copy một dòng schema sang trường khác, kiểm lại kiểu khóa chính trong `lib/db/schema.ts`. Trong repo này `uuid` và `serial` sống cạnh nhau.

---

## 🟠 6. Ô tìm kiếm bài viết không hoạt động

**Chuyện gì xảy ra.** Gõ từ khóa rồi nhấn Enter — không có gì xảy ra. Bảng vẫn hiện nguyên danh sách cũ.

Code nhìn thì đủ cả:

```tsx
<form onSubmit={handleSearchSubmit}>
  <TextField placeholder="Tìm tiêu đề hoặc địa chỉ..." value={searchInput} ... />
  <Select ... />   {/* danh mục */}
  <Button ... />   {/* các nút lọc ngày */}
</form>
```

Vấn đề nằm ở HTML, không nằm ở React: **form không có nút `type="submit"` nào**, mà lại chứa nhiều trường nhập. Theo chuẩn HTML, trình duyệt chỉ tự submit khi nhấn Enter ("implicit submission") nếu form có nút submit, hoặc chỉ có đúng một trường. Ở đây không thỏa cả hai — `handleSearchSubmit` không bao giờ được gọi. MUI `Button` mặc định là `type="button"`, không phải `submit`.

**Đã sửa:** bắt phím Enter trực tiếp trên ô nhập.

```tsx
onKeyDown={(e) => {
  if (e.key === "Enter") { e.preventDefault(); runSearch(); }
}}
```

> **Rút ra:** viết xong handler thì phải bấm thử. `handleSearchSubmit` tồn tại, được nối vào `onSubmit`, TypeScript không phàn nàn — nhưng tính năng chết hoàn toàn.

---

## 🟠 7. Tìm kiếm phân biệt hoa thường

**Code cũ:**

```ts
const q = `%${filter.query}%`;
conditions.push(or(like(articles.title, q), like(articles.excerpt, q)));
```

**Chuyện gì xảy ra.** `LIKE` của Postgres **phân biệt hoa thường** (khác MySQL — chỗ này hay nhầm). Gõ `crm` không ra bài tên "Quản trị **CRM** Tối ưu 2026". Người dùng sẽ kết luận "chưa có bài nào".

Thêm nữa, `%` và `_` người dùng gõ vào bị hiểu là ký tự đại diện — gõ `%` là khớp toàn bộ.

**Đã sửa:**

```ts
const escaped = filter.query.replace(/[\\%_]/g, (c) => `\\${c}`);
const q = `%${escaped}%`;
conditions.push(or(ilike(articles.title, q), ilike(articles.excerpt, q)));
```

**Kiểm chứng:** gõ `crm` chữ thường giờ ra 2 bài có chữ "CRM" viết hoa.

> **Rút ra:** tìm kiếm text trong Postgres thì mặc định dùng `ilike`, và luôn escape `%` `_` trước khi ghép vào chuỗi mẫu.

---

## 🟠 8. `?trang=-1` làm trang `/blog` trả lỗi 500

**Code cũ:**

```ts
const page = parseInt(searchParams.trang || "1", 10);
```

**Chuyện gì xảy ra.** Tham số URL do người dùng gõ tùy ý.

- `?trang=abc` → `NaN` → may mắn thoát, vì `NaN || 1` trả về `1` (NaN là falsy).
- `?trang=-1` → `-1` là truthy → `offset = (-1 - 1) * 9 = -18` → Postgres từ chối `OFFSET` âm → trang trả **500**.

Người dùng bình thường không gõ vậy, nhưng bot quét web thì có, và một URL sai trong bài đăng cũng đủ.

**Đã sửa:** chặn ở hai lớp — trang và hàm truy vấn.

```ts
// app/blog/page.tsx
const parsedPage = Number.parseInt(searchParams.trang || "1", 10);
const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

// lib/blog/queries.ts
const page  = Math.max(1, Math.trunc(opts?.page  || 1));
const limit = Math.min(50, Math.max(1, Math.trunc(opts?.limit || 9)));
```

**Kiểm chứng:** `?trang=-1`, `?trang=abc`, `?trang=99999`, `?danh_muc=%` đều trả 200.

> **Rút ra:** `searchParams` là dữ liệu người ngoài gửi vào, ngang hàng với body của request. Validate như validate form.

---

## 🟡 9. Heading xuống dòng bị mất khỏi mục lục

**Code cũ:**

```ts
const headingRegex = /<h([234])([^>]*)>(.*?)<\/h\1>/gi;
```

Trong JavaScript, `.` **không khớp ký tự xuống dòng** nếu thiếu cờ `s`. Trình soạn thảo hay xuống dòng bên trong thẻ heading, khi đó heading này không khớp regex → không được gán `id` → biến mất khỏi mục lục, và link neo trong bài trỏ vào chỗ không tồn tại.

**Đã sửa:** thêm cờ `s` → `/gis`.

---

## 🟠 10. Lỗi database làm sập `next build` của trang chủ

**Chuyện gì xảy ra.** `app/page.tsx` giờ gọi `getHomeRails()`, mà trang chủ được **prerender lúc build**. Nghĩa là `next build` phải kết nối được database. Nếu không — máy CI chưa mở firewall, database đang bảo trì, biến môi trường thiếu — **cả build thất bại**, không chỉ phần bài viết mà toàn bộ trang giới thiệu công ty cũng không lên được.

Tôi gặp đúng lỗi này khi build lần đầu:

```
Error occurred prerendering page "/"
Error: Failed query: select "articles"... relation "articles" does not exist
> Export encountered errors on following paths: /page: /
```

**Đã sửa:** bọc lỗi lại, phần bài viết hỏng thì trả mảng rỗng, các section còn lại vẫn hiển thị.

```ts
export async function getHomeRails() {
  try {
    return await getHomeRailsUnsafe();
  } catch (err) {
    console.error("[blog] Không tải được dải bài viết trang chủ:", err);
    return [];
  }
}
```

> **Rút ra:** khi thêm truy vấn database vào một trang tĩnh, trang đó không còn tự đứng được nữa. Phần phụ hỏng không được kéo theo phần chính.

---

## ➕ Cấu hình R2 sai thì âm thầm ghi ảnh ra đĩa

```ts
if (driver === "r2" && process.env.R2_ACCESS_KEY_ID) {
  return new R2StorageDriver();
}
return new LocalStorageDriver();   // ⚠️ rơi về đây khi thiếu biến
```

Đặt `STORAGE_DRIVER=r2` nhưng quên một biến — hệ thống không báo gì, lặng lẽ ghi ảnh vào `public/uploads/`. Trên máy dev thì vẫn chạy nên không ai biết. Lên serverless thì ổ đĩa chỉ đọc hoặc bị xóa sạch sau mỗi lần deploy: **ảnh bài viết biến mất, không có log nào**.

Đã sửa: thiếu biến nào thì ném lỗi ngay, kèm tên biến còn thiếu.

> **Rút ra:** cấu hình sai nên hỏng to và hỏng sớm. Fallback im lặng biến lỗi cấu hình 5 giây thành cuộc điều tra vài giờ.

---

## Những chỗ làm tốt, giữ nguyên

Nói cho công bằng — nhiều phần trong nhánh này làm chắc tay:

- **Kiểm định dạng ảnh bằng magic byte**, không tin `file.type` do trình duyệt gửi lên. Đây là cách đúng, nhiều người làm sai chỗ này.
- **`sanitize-html` theo allowlist** (chỉ cho phép thẻ đã liệt kê) chứ không phải blocklist, và cố tình loại `h1` để trang tự render.
- **Xóa mềm** (`deletedAt`) kèm thùng rác, và khôi phục thì luôn về `draft` thay vì đăng thẳng lại.
- **Xóa vĩnh viễn chỉ dành cho `super_admin`** — kiểm ngay trong action.
- **Nhật ký thao tác** (`activity_logs`) ghi lại ai làm gì.
- **Index database** đặt đúng cho truy vấn thực tế: `(status, published_at desc)` và `(category_id, status, published_at desc)`.
- **`extractToc` chạy được hai lần mà không hỏng** — gọi lúc lưu và lúc đọc đều cho kết quả như nhau.
- **Khóa ngoại `onDelete: "restrict"`** cho danh mục, chặn xóa danh mục còn bài viết.

---

## Checklist rút gọn

Trước khi mở PR, soát nhanh:

- [ ] Hàm mới thêm vào file `*-actions.ts` — có `requireUser()` ở dòng đầu chưa? Nếu là hàm đọc mà trang công khai cũng gọi, đưa sang `*-queries.ts`.
- [ ] Mọi khối `catch` trong action bắt đầu bằng `rethrowIfNextControlFlow(err)`.
- [ ] Kiểu ID trong Zod khớp với `lib/db/schema.ts` — `uuid` hay `serial`?
- [ ] Tìm kiếm text dùng `ilike`, đã escape `%` và `_`.
- [ ] `searchParams` được validate như dữ liệu người ngoài gửi vào.
- [ ] So khớp tên miền bằng `new URL(x).hostname`, không dùng `startsWith`.
- [ ] Không có `hostname: "**"` trong `next.config.mjs`.
- [ ] Truy vấn database trong trang tĩnh đã bọc lỗi để không làm sập build.
- [ ] Cấu hình thiếu thì ném lỗi, không fallback im lặng.
- [ ] **Đã bấm thử từng nút trên giao diện**, không chỉ dựa vào build xanh.

---

## Kiểm chứng lại

```bash
git checkout master
cd novaix-website
npm install
npm run db:up          # Postgres trong Docker, cổng 5433
npm run db:push
npm run db:seed        # tài khoản super admin
npm run db:seed:blog   # 3 bài viết mẫu
npm run dev
```

Các kịch bản đã chạy qua trình duyệt sau khi sửa:

| Kịch bản | Trước | Sau |
| :-- | :-- | :-- |
| Lưu dải "chọn bài thủ công" | Lỗi validation | Lưu được, trang chủ hiện đúng thứ tự |
| Tìm `crm` (chữ thường) | Không ra kết quả | 2 bài |
| Nhấn Enter ở ô tìm kiếm | Không phản ứng | Lọc đúng |
| `/blog?trang=-1` | 500 | 200 |
| `/_next/image` host lạ | 200 (proxy thành công) | 400 |
| `next build` khi DB lỗi | Build sập | Build xong, trang chủ thiếu phần bài viết |
| Lưu bài viết | — | Mục lục 4 mục, nhật ký ghi `article.update` |

---

*Hai quy ước mới rút ra từ lần rà soát này đã được bổ sung vào [`docs/conventions/coding-style.md`](../conventions/coding-style.md): "Hàm chỉ đọc KHÔNG đặt trong file `use server`" và "`redirect()` trong action phải được ném lại".*
