# RFC — Bài viết & Trưng bày nội dung trên website OAlpha

> **PRD:** [`blog-prd.md`](./blog-prd.md) · **Domain:** [`content-article-domain.md`](../../domains/content-article-domain.md)
> **Trạng thái:** 📝 chờ duyệt · **Mã FR:** `FR-B01`…`FR-B14`

---

# 1. Bối cảnh

Repo `novaix-website` là **một** ứng dụng Next.js 14 App Router. Đã có: xác thực Auth.js v5, phân
quyền hai vai trò đọc từ database, kết nối Drizzle + Postgres, khu `/admin` dựng bằng MUI, trang
công khai dựng bằng Tailwind. Chưa có: bất kỳ nội dung nào lưu trong database ngoài bảng `users`.

RFC này mô tả cách thêm phân hệ nội dung **mà không thêm tầng kiến trúc nào**.

---

# 2. Vấn đề kỹ thuật

## 2.1 Chưa có đường nào để HTML người dùng gõ đi vào hệ thống an toàn

Repo hiện không có bộ làm sạch HTML nào, vì chưa có chỗ nào nhận HTML. Bài viết là chỗ đầu tiên — và
nó là loại đầu vào nguy hiểm nhất: **người soạn gõ, khách vãng lai xem**. Một `<script>` lọt vào
`content_html` là chạy trên trình duyệt của mọi khách, mãi mãi, cho tới khi có người phát hiện.

## 2.2 Mục lục phải ổn định qua các lần tải

Người ta gửi link `/bai-viet/x#chi-phi-that`. Nếu neo được tính lại ở trình duyệt mỗi lần render,
một thay đổi nhỏ trong thuật toán slug làm **mọi link đã gửi chết trong im lặng**. Cộng thêm: máy chủ
render một đằng, client tính một nẻo là lỗi hydrate của React.

## 2.3 Cache của Next là con dao hai lưỡi

Trang công khai muốn nhanh thì phải được cache. Nhưng cache sai chỗ là "Admin sửa xong mà web không
đổi" — và đó là **đúng vấn đề** mà cả phân hệ này sinh ra để giải. Chiến lược cache phải là một quyết
định tường minh, không phải mặc định của framework.

## 2.4 Chưa có chỗ chạy test

`package.json` không có script `test`, không có test runner. Bốn hàm thuần của phân hệ này (làm sạch,
mục lục, slug, soi SEO) là loại code **bắt buộc phải có test** — chúng là hàng rào bảo mật và là chỗ
sai im lặng.

---

# 3. Mục tiêu kỹ thuật

1. **Không thêm tầng.** Không REST API, không service/repository, không hàng đợi.
2. **Lõi thuần tách khỏi framework.** Làm sạch, mục lục, slug, soi SEO là hàm thuần — test được mà
   không cần database, không cần React.
3. **Một đường ghi duy nhất** cho mỗi loại việc: một hàm lưu bài, một hàm upload ảnh, một hàm đổi
   trạng thái. Không có đường tắt.
4. **Cache tường minh**: mọi action ghi khai rõ nó làm mới đường dẫn nào.
5. **Bám quy ước sẵn có**: bảng/cột tiếng Anh `snake_case`, `uuid` PK, `ActionResult`, Zod ở biên.

---

# 4. Không nằm trong phạm vi

- ❌ Thẻ sản phẩm trong bài — website không có danh mục sản phẩm.
- ❌ Tìm kiếm toàn văn, lịch đăng, phiên bản nội dung, chuyển hướng 301.

---

# 5. Kiến trúc đề xuất

## 5.1 Phân tầng

```text
app/(public)
  /bai-viet/page.tsx            Server Component ──┐
  /bai-viet/[slug]/page.tsx     Server Component ──┼──► lib/blog/queries.ts ──► Drizzle ──► PG
  /sitemap.ts                                    ──┘        (chỉ ĐỌC, chỉ bài published)
  /page.tsx (trang chủ)         Server Component ──► getHomeRails()

app/admin/(protected)/bai-viet
  /page.tsx                     Server Component (kiểm quyền, lấy dữ liệu)
    └─ ArticlesTable.tsx        "use client"  ──► lib/blog/article-actions.ts   ("use server")
  /[id]/page.tsx                Server Component
    └─ ArticleEditor.tsx        "use client"  ──► article-actions + image-actions
                                              └─► lib/blog/seo-check.ts  (thuần, chạy tại chỗ)

lib/blog/
  schema.ts        Zod cho mọi input (một nguồn chân lý)
  html.ts          sanitizeArticleHtml()   — hàm thuần
  toc.ts           extractToc(), slugify()  — hàm thuần
  seo-check.ts     runSeoChecks()           — hàm thuần, KHÔNG gọi mạng
  queries.ts       đọc công khai
  article-actions.ts · category-actions.ts · image-actions.ts · rails-actions.ts
  storage.ts       interface lưu ảnh (R2 | local)
  log.ts           ghi activity_logs
```

Bốn file **thuần** (`html`, `toc`, `seo-check`, và phần `slugify`) không import `next`, không import
`drizzle`, không đọc `process.env`. Đó là điều kiện để test được — và cũng là ranh giới giữ cho phần
khó nhất của phân hệ không bị trộn với framework.

## 5.2 Làm sạch HTML

```ts
// lib/blog/html.ts
import sanitizeHtml from "sanitize-html";

export const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h2", "h3", "h4",                       // ⚠️ KHÔNG h1 — h1 là tiêu đề bài, do trang render
    "p", "br", "hr",
    "strong", "b", "em", "i", "u", "s",
    "ul", "ol", "li",
    "blockquote", "a", "span", "div",
    "table", "thead", "tbody", "tr", "th", "td",
    "img", "figure", "figcaption",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "width", "height"],  // KHÔNG srcset/loading/style
    h2: ["id"], h3: ["id"], h4: ["id"],      // neo mục lục (FR-B04)
    "*": [],                                  // mọi thẻ khác: KHÔNG thuộc tính nào
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesAppliedToAttributes: ["href", "src"],
  allowProtocolRelative: false,               // chặn //evil.com
  disallowedTagsMode: "discard",
  transformTags: {
    // Liên kết ra ngoài luôn kèm rel — chống tabnabbing, và người soạn sẽ không tự nhớ.
    a: (tagName, attribs) => ({
      tagName,
      attribs: isExternal(attribs.href)
        ? { ...attribs, target: "_blank", rel: "noopener noreferrer nofollow" }
        : attribs,
    }),
  },
};

export function sanitizeArticleHtml(raw: string): { html: string; removedTags: string[] };
```

Năm chi tiết **cố ý**, không phải bỏ sót:

| Chi tiết | Vì sao |
| :-- | :-- |
| **Không có `h1`** | Trang đọc render `<h1>` từ `title`. Hai `h1` trên một trang là hỏng ngữ nghĩa và SEO. Mục lục cũng chỉ rút H2/H3. |
| **`img` không có `style`, `srcset`, `loading`** | `style` cho phép che phủ giao diện (`position:fixed`) và là đường vào `url(javascript:…)` trên trình duyệt cũ. `width`/`height` là đủ. |
| **`allowProtocolRelative: false`** | `//evil.com/x.js` thừa hưởng scheme của trang — một cách nạp tài nguyên ngoài mà `allowedSchemes` không bắt được. |
| **`'*': []`** | Mặc định **cấm sạch** thuộc tính. Thêm thuộc tính mới phải khai có chủ đích, chứ không phải "quên chưa cấm". |
| **Không khai `data-*`** | Cho `data-*` chung chung là mở một kênh tùy ý từ ô soạn thảo ra tới trình duyệt khách. Ngày nào cần một `data-` cụ thể thì khai đúng cái đó. |

**Kẹp thêm ở tầng action, `sanitize-html` không làm hộ:**

- `img src` phải bắt đầu bằng **`R2_PUBLIC_URL`** (hoặc `/uploads/` nếu chạy driver local). Ảnh trỏ
  ra host lạ sẽ chết khi bên kia xóa — bài viết thủng lỗ sau vài tháng — và rò referrer của khách.
- `content_html` có trần độ dài (**200.000 ký tự**). Không có trần nghĩa là một lần dán nhầm làm
  nghẽn cả bảng.

### Bộ test đi kèm — viết CÙNG LÚC, không viết sau

| Ca | Kỳ vọng |
| :-- | :-- |
| `<script>alert(1)</script>` | Bị loại |
| `<img src=x onerror=alert(1)>` | Còn `<img>`, **mất** `onerror` |
| `<a href="javascript:alert(1)">` | Mất `href` |
| `<img src="data:image/svg+xml,...">` | Bị loại |
| `<img src="https://ngoai.com/x.jpg">` | Bị loại **ở tầng action** |
| `<h2 id="pham-vi">` | **Giữ nguyên** |
| `<h1>` trong thân | Bị loại |
| `<a href="//evil.com">` | Mất `href` |
| `<div data-gia="1000">` | Mất thuộc tính |
| `<a href="https://ngoai.com">` | Được thêm `rel="noopener noreferrer nofollow"` |

## 5.3 Mục lục — hàm thuần, chạy lúc lưu

```ts
// lib/blog/toc.ts  (HÀM THUẦN — không đụng DB, không đụng React)
export type TocItem = { id: string; text: string; level: 2 | 3 };

/** Bỏ dấu tiếng Việt → thường hóa → gạch nối. Xử `đ` riêng vì NFD không tách được nó. */
export function slugify(input: string): string;

/** Rút mục lục từ HTML ĐÃ LÀM SẠCH và CHÈN `id` vào chính các thẻ đề mục. */
export function extractToc(html: string): { html: string; toc: TocItem[] };
```

Bốn luật:

- **Chạy SAU khi làm sạch**, không phải trước — làm sạch có thể bỏ thẻ và làm mục lục lệch.
- **Trùng thì thêm hậu tố `-2`, `-3`.** Hai đề mục cùng tên trong một bài là chuyện thường; hai `id`
  giống nhau làm trình duyệt luôn nhảy về cái đầu — sai **im lặng**.
- **Đề mục đã có `id` thì giữ nguyên**, không đè. Người ta có thể đã gửi link đó đi rồi.
- **Chỉ H2/H3 vào mục lục.** H4 vẫn được gắn `id` (để link tới được) nhưng không hiện — mục lục bốn
  cấp trên cột hẹp là một đống chữ không ai đọc.

⚠️ `slugify("Đầu tư")` phải ra `dau-tu`, không phải `u-tu`. `String.normalize("NFD")` tách được dấu
thanh nhưng **không** tách `đ` → `d`; phải thay riêng cả `đ` lẫn `Đ` **trước** khi normalize.

## 5.4 Soi SEO — hàm thuần, chạy ở trình duyệt (FR-B05)

```ts
// lib/blog/seo-check.ts  (HÀM THUẦN — không fetch, không import next)
export type SeoIssue = {
  rule: SeoRuleId;
  level: "ok" | "could-be-better" | "should-fix";
  measured: string;   // "Tiêu đề 78 ký tự"
  why: string;        // "Google cắt tiêu đề quanh 60 ký tự trên kết quả tìm kiếm"
  how: string;        // "Rút còn dưới 60 ký tự, giữ từ khóa ở đầu"
};

export type SeoThresholds = {
  minWords: number;          // mặc định 300
  titleMax: number;          // 60
  excerptMin: number;        // 70
  excerptMax: number;        // 160
  keywordDensityMax: number; // 0.03
  disabledRules: SeoRuleId[];
};

export function runSeoChecks(input: SeoInput, t: SeoThresholds): {
  issues: SeoIssue[];
  readiness: number;   // 0..100
};
```

Danh sách luật (mỗi luật là một phép đếm, không hơn):

| Luật | Đo gì |
| :-- | :-- |
| `title-length` | Độ dài tiêu đề so với `titleMax` |
| `title-keyword` | Từ khóa chính có trong tiêu đề, càng gần đầu càng tốt |
| `excerpt-length` | Mô tả ngắn nằm trong `[excerptMin, excerptMax]` |
| `excerpt-keyword` | Từ khóa chính có trong mô tả ngắn |
| `word-count` | Số từ thân bài so với `minWords` |
| `headings` | Có ít nhất một H2 |
| `keyword-in-heading` | Từ khóa xuất hiện ở ít nhất một đề mục |
| `keyword-early` | Từ khóa xuất hiện trong ~100 chữ đầu |
| `keyword-density` | Mật độ **không vượt** `keywordDensityMax` — nhồi từ khóa bị phạt |
| `cover-image` | Có ảnh bìa |
| `image-alt` | Mọi `<img>` trong bài có `alt` không rỗng |
| `internal-link` | Có ít nhất một liên kết nội bộ |
| `slug-length` | Slug không quá dài, không chứa số thứ tự vô nghĩa |

**Ba ràng buộc cứng:**

1. 🔴 `readiness` tính trên **các luật đang bật**. Luật đã tắt phải rời khỏi **cả mẫu số** — nếu
   không, tắt một luật lại làm thanh tụt xuống, và người dùng học được rằng tắt luật là bị phạt.
2. So khớp từ khóa **bỏ dấu + theo ranh giới từ**. Không có ranh giới từ thì `erp` khớp giữa
   `enterprise` và `kho` khớp trong `khó`. Dùng lại `slugify` để chuẩn hóa cả hai vế.
3. **Không gọi mạng.** Hàm này chạy mỗi phím gõ; đi mạng là vừa chậm vừa vô ích.

Từ khóa và ngưỡng lưu ở `localStorage` theo id bài — **không theo người dùng sang máy khác**. Muốn
dùng chung cả đội thì phải thêm cột `articles.focus_keyword`; chưa làm, và ghi ra đây để người sau
biết đó là thiếu sót có ý thức, không phải quên.

## 5.5 Hai dải trang chủ — cấu hình jsonb, không thêm bảng

```ts
// lib/blog/schema.ts
export const railSchema = z.object({
  key: z.string().min(1).max(30),                       // 'gioi_thieu' | 'kien_thuc' | ...
  title: z.string().trim().min(1).max(60),
  visible: z.boolean(),
  source: z.enum(["category", "manual"]),
  categoryIds: z.array(z.string().uuid()).max(5).default([]),
  articleIds: z.array(z.string().uuid()).max(12).default([]),
  limit: z.number().int().min(1).max(12).default(6),
});

export const homeRailsSchema = z.array(railSchema).max(4);
export const HOME_RAILS_KEY = "home_article_rails";
```

**Đọc phải chịu được dữ liệu cũ:**

```ts
export async function getHomeRails(): Promise<Rail[]> {
  const row = await db.select().from(siteSettings).where(eq(siteSettings.key, HOME_RAILS_KEY));
  const parsed = homeRailsSchema.safeParse(row[0]?.value);
  if (!parsed.success) {
    console.warn("[blog] cấu hình dải bài viết không hợp lệ, dùng mặc định", parsed.error.issues[0]);
    return DEFAULT_RAILS;              // trang chủ KHÔNG được vỡ vì một dòng jsonb cũ
  }
  return parsed.data;
}
```

🔴 Đây là luật của mọi thứ lưu bằng jsonb: **schema đổi nhưng dữ liệu cũ vẫn nằm đó**. Đọc mà không
parse là một `undefined.map is not a function` trên trang chủ production vào một ngày đẹp trời.

## 5.6 Luồng dữ liệu — trang chủ

```text
app/page.tsx (Server Component, ISR 5 phút)
  └─ getHomeRails()          → site_settings (1 truy vấn)
     └─ với mỗi dải:
        source='category'  → SELECT ... WHERE status='published' AND category.visible
                                    AND category_id IN (...) ORDER BY published_at DESC LIMIT n
        source='manual'    → SELECT ... WHERE id IN (...) → sắp lại THEO THỨ TỰ ĐÃ CHỌN trong JS
```

🔴 `WHERE id IN (...)` **không giữ thứ tự** người dùng đã xếp — Postgres trả về theo thứ tự nó thích.
Phải sắp lại trong JS theo `articleIds`. Bỏ qua là "tôi kéo bài lên đầu mà nó vẫn nằm giữa", không
lỗi, không log.

Bài trong `articleIds` mà đã bị ẩn/xóa thì **rơi ra im lặng** và dải ngắn đi — không hiện ô trống,
không báo lỗi cho khách. Màn quản trị mới là chỗ cảnh báo *"2 bài trong dải này đang không hiển
thị"*.

## 5.7 Chiến lược cache

| Trang | Chiến lược | Vì sao |
| :-- | :-- | :-- |
| `/` | `export const revalidate = 300` | Nội dung đổi vài lần một tuần; 5 phút là đủ tươi |
| `/bai-viet` | `revalidate = 300` | " |
| `/bai-viet/[slug]` | `revalidate = 300` + `generateStaticParams()` cho bài đã đăng | Trang đọc là thứ được chia sẻ nhiều nhất, phải nhanh |
| `/sitemap.xml` | `revalidate = 3600` | Google không vào mỗi phút |
| `/admin/**` | `dynamic = "force-dynamic"` | Màn quản trị **không bao giờ** được cache — sửa xong phải thấy ngay |

**Mọi action ghi khai rõ nó làm mới cái gì:**

```ts
function revalidateArticle(slug: string) {
  revalidatePath("/admin/bai-viet");
  revalidatePath("/bai-viet");
  revalidatePath(`/bai-viet/${slug}`);
  revalidatePath("/");                 // hai dải trang chủ có thể chứa bài này
}
```

🔴 Đổi **slug** thì phải làm mới **cả slug cũ lẫn slug mới** — nếu không, đường dẫn cũ còn nằm trong
cache và vẫn phục vụ bài như chưa có gì xảy ra.

---

# 6. Ảnh hưởng tới phần khác

| Phần | Thay đổi |
| :-- | :-- |
| `lib/db/schema.ts` | +1 enum, +4 bảng. Bảng `users` **không đổi** |
| `lib/admin/menu.ts` | Gỡ `comingSoon` khỏi *Bài viết* và *Giao diện trang chủ*; icon giữ nguyên |
| `lib/data.ts` | Thêm `{ href: "/bai-viet", label: "Bài viết" }` vào `nav` — 🔴 link **thật**, không phải neo `#` như các mục khác |
| `components/Navbar.tsx` | Phải phân biệt neo `#` (cuộn trong trang) với đường dẫn thật (điều hướng) |
| `app/page.tsx` | Chèn hai dải bài giữa các section hiện có |
| `.env.example` | Ghi chú lại nhóm `R2_*` (đã khai, nay mới thật sự dùng) |
| `package.json` | +3 dependency, +1 devDependency (test), +1 script `test` |
| [`tech-stack.md`](../../../architecture/tech-stack.md) | **Bắt buộc** cập nhật — 3 công nghệ mới |

---

# 7. Thay đổi mô hình dữ liệu

Dự án dùng `drizzle-kit push` (`npm run db:push`), **không có thư mục migration đánh số**. Vì vậy
thay đổi schema là **sửa `lib/db/schema.ts` rồi push**, và thứ tự an toàn phải tự giữ.

## 7.1 Schema Drizzle

```ts
// lib/db/schema.ts  (thêm vào cuối, không đụng phần users)
export const articleStatus = pgEnum("article_status", ["draft", "published", "hidden"]);

export const articleCategories = pgTable("article_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const articles = pgTable("articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  categoryId: uuid("category_id").notNull()
    .references(() => articleCategories.id, { onDelete: "restrict" }),
  excerpt: text("excerpt"),
  coverImage: text("cover_image"),
  contentHtml: text("content_html").notNull().default(""),
  toc: jsonb("toc").$type<TocItem[]>().notNull().default([]),
  status: articleStatus("status").notNull().default("draft"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
}, (t) => ({
  byStatus: index("articles_status_published_at_idx").on(t.status, t.publishedAt.desc()),
  byCategory: index("articles_category_status_idx").on(t.categoryId, t.status, t.publishedAt.desc()),
}));

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: uuid("updated_by").references(() => users.id, { onDelete: "set null" }),
});

export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  actorEmail: text("actor_email").notNull(),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  meta: jsonb("meta").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  byCreated: index("activity_logs_created_at_idx").on(t.createdAt.desc()),
}));

export type Article = typeof articles.$inferSelect;
export type ArticleCategory = typeof articleCategories.$inferSelect;
export type ArticleStatus = (typeof articleStatus.enumValues)[number];
```

⚠️ **`onDelete` khác nhau ở ba chỗ, đều có lý do** — đừng "đồng bộ cho gọn":

| Khóa ngoại | Hành vi | Vì sao |
| :-- | :-- | :-- |
| `articles.category_id` | **RESTRICT** | Xóa danh mục mà `CASCADE` là bốc hơi mọi bài trong đó, không hỏi lại |
| `articles.author_id` | **SET NULL** | Người soạn nghỉ việc không được kéo theo bài — nội dung thuộc về công ty |
| `activity_logs.actor_id` | **SET NULL** + `actor_email` chụp sẵn | Nhật ký phải còn đọc được sau khi tài khoản biến mất, đó là lúc cần nó nhất |

## 7.2 Thứ tự triển khai schema

```bash
# 1. Sửa lib/db/schema.ts
npm run db:push          # tạo enum + 4 bảng
npm run db:seed:blog     # 3 danh mục hạt giống (script mới)
```

Không có dữ liệu cũ nào phải di trú — đây là bảng mới hoàn toàn. Đó là điểm dễ hiếm có của đợt này;
đổi lại, **thứ tự tạo enum trước bảng** phải để `drizzle-kit` lo, đừng tự chạy SQL tay xen vào.

## 7.3 Hạt giống

`scripts/seed-blog.ts` (khuôn theo `scripts/seed-admin.ts` đã có, kể cả `closeDb()` ở cuối):

| Danh mục | slug | Vì sao cần ngay từ đầu |
| :-- | :-- | :-- |
| Giới thiệu | `gioi-thieu` | Chỗ chứa các trang tĩnh sẽ di trú ở T-cuối |
| Chính sách | `chinh-sach` | Bảo mật, điều khoản |
| Kiến thức | `kien-thuc` | Nội dung marketing chính |

Không có danh mục nào thì hai dải trang chủ không chọn được gì và tính năng **trông như hỏng ngay lúc
mở**.

---

# 8. Thiết kế bề mặt gọi được

> 🔴 Không có endpoint REST. Đây là **chữ ký hàm**.

## 8.1 Server action — bài viết (`lib/blog/article-actions.ts`)

Mọi action theo bốn nhịp: **kiểm quyền → validate Zod (`input: unknown`) → thao tác → revalidate**,
trả `ActionResult` như `lib/admin/users-actions.ts` đã làm.

```ts
export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export async function listArticles(input: unknown): Promise<ArticleListPage>;
export async function getArticleForEdit(id: string): Promise<ArticleEditModel | null>;
export async function saveArticle(input: unknown): Promise<ActionResult<{ id: string; removedTags: string[] }>>;
export async function setArticleStatus(input: unknown): Promise<ActionResult>;
export async function softDeleteArticle(id: string): Promise<ActionResult>;
export async function restoreArticle(id: string): Promise<ActionResult>;
export async function hardDeleteArticle(id: string): Promise<ActionResult>;   // chỉ super_admin
```

**`saveArticle` — trình tự bắt buộc, sai thứ tự là sai kết quả:**

```ts
const me = await requireUser();                       // 1. quyền
const data = saveArticleSchema.parse(input);          // 2. Zod
const { html: clean, removedTags } = sanitizeArticleHtml(data.contentHtml);  // 3a. làm sạch
assertLocalImages(clean);                             // 3b. src phải là ảnh của mình
const { html, toc } = extractToc(clean);              // 3c. mục lục — SAU khi làm sạch
await db.insert(articles).values({ ... }).onConflictDoUpdate({ ... });        // 3d. ghi
await writeLog(me, data.id ? "article.update" : "article.create", "article", id);
revalidateArticle(data.slug);                          // 4. cache
return { ok: true, data: { id, removedTags } };
```

`removedTags` trả về để giao diện **nói cho người soạn biết cái gì vừa bị bỏ**. Im lặng bỏ thẻ là
kiểu hỏng đúng bằng việc im lặng nuốt ảnh.

**`setArticleStatus` — luật `published_at`:**

```ts
publishedAt: sql`COALESCE(${articles.publishedAt}, now())`   // chỉ khi chuyển sang 'published'
```

Đóng dấu **lần đầu**, không đổi ở các lần ẩn/hiện sau (Domain R8).

## 8.2 Server action — danh mục (`category-actions.ts`)

```ts
export async function listCategories(): Promise<CategoryRow[]>;   // kèm số bài mỗi danh mục
export async function saveCategory(input: unknown): Promise<ActionResult>;
export async function deleteCategory(id: string): Promise<ActionResult>;
export async function reorderCategories(input: unknown): Promise<ActionResult>;
```

`deleteCategory` **đếm bài trước rồi mới xóa**, và trả câu tiếng Việt nói rõ số bài đang vướng:

> *"Danh mục này còn 7 bài viết. Chuyển các bài sang danh mục khác trước khi xóa."*

Để `RESTRICT` của Postgres ném lỗi rồi hiện nguyên văn `violates foreign key constraint` là đẩy lỗi
kỹ thuật vào mặt người dùng.

## 8.3 Server action — ảnh (`image-actions.ts`)

```ts
export async function uploadArticleImage(formData: FormData): Promise<ActionResult<{ url: string }>>;
```

Năm phép kiểm ở **máy chủ**, không tin trình duyệt:

| Kiểm | Cách |
| :-- | :-- |
| Quyền | `requireUser()` — chưa đăng nhập thì không upload được gì |
| Dung lượng | ≤ **5 MB** |
| Kiểu thật | **Magic bytes** (`FF D8 FF` cho JPEG, `89 50 4E 47` cho PNG, `RIFF…WEBP`) — **không** tin `file.type` hay đuôi tệp |
| Tên tệp | **Sinh ở máy chủ**: `blog/<yyyy>/<mm>/<uuid>.<ext>`. Không dùng tên người dùng gửi lên |
| Nơi lưu | Qua `lib/blog/storage.ts` — một interface, hai cài đặt (R2 / local) |

```ts
// lib/blog/storage.ts — đổi kho lưu chỉ đổi cài đặt, không sửa nghiệp vụ
export interface BlobStorage {
  put(key: string, body: Buffer, contentType: string): Promise<string>;  // trả URL công khai
}
```

## 8.4 Truy vấn công khai (`queries.ts`)

```ts
export async function getPublishedArticles(opts: { categorySlug?: string; page?: number }): Promise<ArticleListPage>;
export async function getArticleBySlug(slug: string): Promise<ArticleDetail | null>;
export async function getRelatedArticles(articleId: string, categoryId: string): Promise<ArticleCard[]>;
export async function getHomeRails(): Promise<{ title: string; articles: ArticleCard[] }[]>;
export async function getSitemapEntries(): Promise<{ slug: string; updatedAt: Date }[]>;
```

**Một điều kiện hiển thị, một chỗ** — không chép lại vào từng truy vấn:

```ts
const visibleArticle = and(
  eq(articles.status, "published"),
  isNull(articles.deletedAt),
  eq(articleCategories.visible, true),
);
```

🔴 Bốn truy vấn công khai đều dùng **đúng** biểu thức này. Chép tay vào từng chỗ là bảo đảm sau ba
tháng có một chỗ quên `deletedAt` — và bài đã xóa hiện lại trên trang chủ.

**Danh sách KHÔNG lấy `content_html`.** Chỉ trang đọc mới cần thân bài; kéo nó vào truy vấn danh sách
là kéo hàng trăm KB cho mỗi lượt tải trang chủ.

---

# 9. Sự kiện & Thông báo

Không có. Phân hệ này **không** bắn thông báo, không gửi email, không có webhook. Dấu vết duy nhất
là `activity_logs`.

Ghi log qua **một** hàm:

```ts
// lib/blog/log.ts
export async function writeLog(actor: SessionUser, action: string, entity: string, entityId?: string, meta?: object);
```

🔴 `meta` **không chứa thân bài, không chứa email khách, không chứa gì nhạy cảm**. Nhật ký để trả lời
*"ai làm gì lúc nào"*, không phải để sao lưu nội dung.

---

# 10. Xử lý lỗi

| Tình huống | Hành vi |
| :-- | :-- |
| Chưa đăng nhập gọi action | `requireUser()` ném → error boundary của `/admin` |
| Zod không hợp lệ | `{ ok: false, error: e.issues[0].message }` — câu tiếng Việt viết sẵn trong schema |
| Slug trùng | Kiểm trước, trả *"Đường dẫn này đã được dùng cho bài khác."* — **không** để Postgres ném `duplicate key` |
| Xóa danh mục còn bài | Đếm trước, trả câu nói rõ số bài (§8.2) |
| Upload sai kiểu/quá nặng | Câu nói rõ giới hạn: *"Chỉ nhận JPEG, PNG, WEBP dưới 5 MB."* |
| Bài không tồn tại / chưa đăng ở tuyến công khai | `notFound()` → 404. **Không** phân biệt "không có" với "chưa đăng" |
| R2 lỗi | Trả `{ ok: false }` kèm câu tiếng Việt; **giữ nguyên nội dung đang soạn**, không mất bài vì hỏng một ảnh |
| Cấu hình dải hỏng schema | Trả `DEFAULT_RAILS`, ghi `console.warn`. Trang chủ **không được vỡ** |

---

# 11. Bảo mật

| Mối lo | Chặn bằng |
| :-- | :-- |
| **XSS lưu trữ** qua thân bài | `sanitize-html` ở máy chủ **lúc ghi** (§5.2) + bộ test |
| **XSS qua JSON-LD** | Thoát `<` khi tuần tự hóa; có ca test `</script>` trong tiêu đề |
| **Upload tệp độc** | Magic bytes + trần dung lượng + tên sinh ở máy chủ (§8.3) |
| **SSRF/leech qua `img src` ngoài** | Chỉ nhận ảnh của chính mình (§5.2) |
| **Leo thang quyền** | `requireUser()` trong **mọi** action — server action là endpoint HTTP công khai, ai cũng POST được vào |
| **Rò nội dung chưa đăng** | Điều kiện hiển thị dùng chung (§8.4); tuyến công khai trả 404, không trả 403 |
| **Tabnabbing** | `rel="noopener noreferrer"` tự gắn cho liên kết ra ngoài (§5.2) |
| **Rò thông tin qua nhật ký** | `meta` không chứa nội dung; không log mật khẩu, token, `DATABASE_URL` |

---

# 12. Hiệu năng

| Điểm | Cách |
| :-- | :-- |
| Trang chủ | Hai dải = **1 + n** truy vấn (n ≤ 4 dải). ISR 5 phút nên thực tế gần như không chạm DB |
| Danh sách | Không `SELECT content_html`; phân trang bằng `LIMIT/OFFSET` (đủ tới vài nghìn bài) |
| Trang đọc | 2 truy vấn: bài + bài liên quan. `generateStaticParams()` cho bài đã đăng |
| Bài liên quan | Cùng danh mục **trước**, thiếu mới bù bằng bài mới nhất. 🔴 Đủ 4 bài rồi thì **không chạy truy vấn bù** — một vòng DB thừa trên mọi trang đọc |
| Soi SEO | Chạy ở trình duyệt; **debounce 300ms** — chạy mỗi ký tự trên bài 3.000 từ là giật ô soạn thảo |
| Ảnh | `next/image` cho ảnh bìa và thẻ; ảnh trong thân bài để nguyên `<img>` (HTML người soạn) |

**Đừng làm ở quy mô này:** cache tầng ứng dụng, read replica, tìm kiếm toàn văn, denormalize số bài
vào danh mục.

---

# 13. Các phương án đã cân nhắc

## 13.1 Tầng dữ liệu

| PA | Đánh đổi | Kết |
| :-- | :-- | :-- |
| **Server action + Server Component** ⭐ | Ít tầng nhất, kiểm quyền một chỗ, không tuần tự hóa thừa | ✅ Chọn |
| Route handler `/api/blog/*` | Có API cho bên thứ ba dùng | ❌ Chưa có bên thứ ba nào. Thêm một chỗ kiểm quyền sẽ trôi khỏi chỗ kia |
| CMS ngoài (Sanity, Strapi) | Không phải tự xây | ❌ Thêm một hệ thống phải vận hành, một khoản thuê bao, và dữ liệu nằm ngoài DB đang có |

## 13.2 Trình soạn thảo

| PA | Đánh đổi | Kết |
| :-- | :-- | :-- |
| **Tiptap (MIT)** ⭐ | Giấy phép sạch, nhẹ, hợp React 18; phải tự dựng thanh công cụ | ✅ Mặc định (PRD Q1) |
| TinyMCE 6 (MIT) | Thanh công cụ đầy đủ, quen tay; v6 không nhận tính năng mới, ⚠️ v7 là GPL | 🟡 Chấp nhận được nếu đọc `LICENSE.txt` sau khi cài |
| Markdown (`react-md-editor`) | Đơn giản nhất, không cần sanitize phức tạp | ❌ Người soạn là marketing/sale, không phải lập trình viên |

## 13.3 Nơi lưu cấu hình dải

| PA | Đánh đổi | Kết |
| :-- | :-- | :-- |
| **`site_settings` (khóa–giá trị jsonb)** ⭐ | Thêm khối cấu hình không cần migration | ✅ Chọn — với điều kiện Zod parse ở cả hai chiều |
| Bảng `home_rails` có cột | Ràng buộc chặt hơn | ❌ Mỗi lần đổi hình dạng là một migration |
| File JSON trong repo | Đơn giản | ❌ Sửa cấu hình phải deploy — đúng vấn đề đang giải |

## 13.4 Slug khi xóa mềm

| PA | Đánh đổi | Kết |
| :-- | :-- | :-- |
| **`UNIQUE` toàn bảng** ⭐ | Bài trong thùng rác vẫn giữ slug | ✅ Chọn — **khôi phục không bao giờ vỡ** |
| Partial unique `WHERE deleted_at IS NULL` | Slug được thả tự do khi xóa | ❌ Một bài mới chiếm mất slug là bài cũ không khôi phục nổi, đúng lúc người dùng đang cứu dữ liệu |

---

# 14. Kế hoạch triển khai

Không có di trú dữ liệu, nên rủi ro nằm ở **thứ tự**, không ở dữ liệu:

1. **Nền** — hàm thuần (làm sạch, mục lục, soi SEO) + test. Chưa đụng DB, chưa đụng UI.
2. **Schema** — sửa `lib/db/schema.ts`, `db:push`, seed danh mục.
3. **Đường ghi** — server action + nhật ký + storage. Kiểm bằng script trước khi có giao diện.
4. **Quản trị** — danh sách, danh mục, màn soạn thảo, khối soi SEO.
5. **Công khai** — danh sách, trang đọc, hai dải trang chủ, menu.
6. **SEO** — sitemap, JSON-LD, Open Graph.
7. **Dọn** — gỡ `comingSoon`, di trú trang tĩnh, cập nhật tài liệu.

🔴 Bước 7 **không được nợ**. Tính năng chạy mà menu vẫn ghi "Sắp có" là tài liệu và sản phẩm nói hai
chuyện khác nhau.

---

# 15. Chiến lược kiểm thử

Repo **chưa có test runner**. Bốn hàm thuần của phân hệ này là loại code bắt buộc phải có test — hàng
rào bảo mật và chỗ sai im lặng.

**Đề xuất: thêm `vitest`** (devDependency, script `npm test`). Cấu hình gần như bằng không cho hàm
thuần, và không đụng tới cách Next build.

*(Phương án không thêm dependency: `node --test` chạy qua `tsx`. Được, nhưng cú pháp assert thô hơn
và không có watch mode — chỉ chọn nếu dứt khoát không muốn thêm devDep nào.)*

| Lớp | Kiểm gì | Cách |
| :-- | :-- | :-- |
| **Hàm thuần** 🔴 | `sanitizeArticleHtml` (10 ca ở §5.2) · `slugify` (tiếng Việt, `đ`, trùng) · `extractToc` (H2/H3, id có sẵn, thứ tự) · `runSeoChecks` (mẫu số khi tắt luật, ranh giới từ) | `vitest`, không cần DB |
| **Server action** | Kiểm quyền (gọi khi chưa đăng nhập → ném) · slug trùng · xóa danh mục còn bài · `published_at` không đổi khi ẩn/hiện | Chạy trên DB Docker local |
| **Tuyến công khai** | Bài `draft`/`hidden`/đã xóa/danh mục ẩn → **404** ở cả 4 đường đọc | Thủ công + kiểm bằng script |
| **Giao diện** | Trang đọc 375px **không cuộn ngang** — đo `scrollWidth > clientWidth`, không tin mắt | Thủ công |
| **SEO** | `sitemap.xml` không chứa bài nháp · JSON-LD với tiêu đề chứa `</script>` | `vitest` cho hàm sinh, thủ công cho trang |

---

# 16. Giám sát

Không có hệ giám sát trong repo. Thứ thay thế được, làm ngay:

- `activity_logs` — ai đăng/sửa/xóa cái gì, đọc được bằng `npm run db:studio`.
- `console.warn` có tiền tố `[blog]` cho các đường suy thoái im lặng: cấu hình dải hỏng schema, thẻ
  bị sanitizer loại, bài trong dải thủ công đã biến mất.
- Màn quản trị **hiện cảnh báo** khi một dải trỏ tới bài không còn hiển thị được — đây là chỗ duy
  nhất người dùng phát hiện ra được, vì phía khách nó chỉ là một dải ngắn hơn.

---

# 17. Câu hỏi còn mở

| # | Câu hỏi | Chặn ai |
| :-- | :-- | :-- |
| **Q1** 🔴 | Tiptap hay TinyMCE 6? (PRD §12.1) | Chặn màn soạn thảo, không chặn phần còn lại |
| **Q2** 🔴 | R2 đã có bucket + khóa + domain chưa? Nếu chưa, làm driver local trước? | Chặn upload ảnh, không chặn phần còn lại |
| **Q3** | Thêm `vitest` được không? (§15) | Chặn việc có test — **không nên bỏ qua** |

Ba câu này đều **không chặn** việc bắt đầu từ bước 1–3 của §14.

---

# Quy tắc quyết định

RFC này chốt **cách xây**. Hành vi chi tiết từng màn ở [Spec](./blog-spec.md); chia việc ở
[Tasks](./blog-tasks.md).

# End
