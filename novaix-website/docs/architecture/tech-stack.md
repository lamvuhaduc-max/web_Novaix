# Bộ Công nghệ Chính thức — OAlpha (`novaix-website`)

## Triết lý

OAlpha là **website giới thiệu công ty** kèm một khu quản trị nội bộ `/admin` cho vài tài khoản. Không phải SaaS, không có người dùng cuối đăng ký, không có giao dịch. Vì vậy tiêu chí chọn công nghệ là **ít bộ phận chuyển động nhất** để ba thứ sau luôn đúng:

1. **Trang công khai tải nhanh** — khách vào từ quảng cáo, rời đi sau vài giây chờ.
2. **Khu `/admin` an toàn** — chặn ở máy chủ, không chỉ ẩn nút trên giao diện.
3. **Nội dung sửa được không cần deploy.**

> Toàn hệ là **MỘT ứng dụng Next.js 14 App Router**: không backend riêng, không NestJS, không hàng đợi, không worker, không microservice. Mọi đề xuất thêm tầng phải trả lời được câu hỏi: *"cái nào trong ba mục tiêu trên đang hỏng?"*

⚠️ Thư mục và `package.json` còn mang tên `novaix-website` — đó là **di sản tên cũ**, sản phẩm là **OAlpha**. Chưa đổi vì đổi tên package là đụng đường import, cấu hình deploy và lịch sử git, đổi lấy đúng một chút gọn gàng.

🚫 **Không có thành phần AI nào trong hệ này.** Không khóa API mô hình ngôn ngữ, không sinh nội dung tự động, không embedding, không vector. Nếu bạn thấy `OPENAI_API_KEY` hay `GEMINI_API_KEY` xuất hiện quanh repo này, nó **không** đến từ bất kỳ tài liệu nào trong `docs/`.

---

## 1. Bảng công nghệ chốt

| Thành phần | **Chốt** | Trạng thái |
| :-- | :-- | :-- |
| Khung ứng dụng | **Next.js 14 App Router** + TypeScript 5 | Đang chạy |
| Thư viện giao diện | **React 18** | Đang chạy |
| Style — trang công khai | **Tailwind CSS 3** + token màu trong `app/globals.css` | Đang chạy |
| Style — khu quản trị | **MUI 6** + Emotion + `@mui/material-nextjs`, theme kiểu Modernize ở `lib/admin/theme.ts` | Đang chạy |
| Icon | Emoji trong `lib/data.ts` (công khai) · **`@tabler/icons-react`** + `@mui/icons-material` (admin) | Đang chạy |
| Chuyển động | **`framer-motion` 11** — CHỈ ở trang công khai | Đang chạy |
| 3D mặt tiền | **`three` 0.160** + `@react-three/fiber` + `@react-three/drei` (`HeroScene`) | Đang chạy |
| Xác thực | **Auth.js v5** (`next-auth@5` beta), phiên **JWT** trong cookie, provider Credentials | Đang chạy — xem §4.3 |
| Băm mật khẩu | **`bcryptjs`** — JS thuần, không cần biên dịch native | Đang chạy |
| Kiểm dữ liệu vào | **Zod 4** ở mọi biên nhận dữ liệu ngoài | Đang chạy |
| Cơ sở dữ liệu | **PostgreSQL 17** | Đang chạy |
| Truy cập DB | **Drizzle ORM 0.45** + `drizzle-kit` (`db:push`, `db:studio`) | Đang chạy — xem §4.4 |
| Driver DB | **`@neondatabase/serverless`** (prod) **hoặc** **`postgres-js`** (local) — tự chọn theo chuỗi kết nối | Đang chạy — xem §4.5 |
| DB lúc dev | **Docker `postgres:17-alpine`**, cổng **5433** | Đang chạy |
| Chạy script TypeScript | **`tsx`** (`db:seed`) | Đang chạy |
| Lưu ảnh bài viết | **Cloudflare R2** (S3-compatible) qua công tắc `STORAGE_DRIVER`, phục vụ qua `R2_PUBLIC_URL` | 🟡 Đã khai `.env.example`, dùng thật từ phân hệ bài viết |
| Làm sạch HTML người soạn | **`sanitize-html`** — allowlist, chạy Ở MÁY CHỦ **lúc GHI** | 🟡 Kế hoạch — [blog-rfc](../specs/features/blog/blog-rfc.md) §5.2 |
| Soạn thảo rich-text | **Tiptap (MIT)** trong `/admin` | 🟡 Kế hoạch — blog-rfc §9 |
| Test runner | **Chưa có** — thêm cùng phân hệ bài viết, chỉ để test **hàm thuần** | 🟡 Kế hoạch — xem §4.9 |
| Nơi chạy | **Vercel** (web) + **Neon** (Postgres serverless) | Đang chạy — xem §4.11 |

**Cố ý KHÔNG có trong hệ này:** hàng đợi/worker, Redis, cache tầng ứng dụng, read replica, tìm kiếm toàn văn, realtime/WebSocket, REST API riêng, Docker cho ứng dụng web, thư viện biểu đồ, state manager toàn cục, i18n. Mỗi thứ đó là một bộ phận phải bảo trì mãi mãi để đổi lấy một lợi ích mà quy mô này chưa có.

---

## 2. Cấu trúc mã nguồn

```text
novaix-website/
├── app/
│   ├── layout.tsx                  # metadata SEO + font Google
│   ├── page.tsx                    # ghép các section marketing
│   ├── globals.css                 # token màu, glow, grain, .btn, .kicker
│   ├── icon.png                    # favicon OAlpha
│   ├── api/auth/[...nextauth]/     # route handler DUY NHẤT của dự án
│   └── admin/
│       ├── layout.tsx              # ThemeRegistry (MUI + Emotion cache)
│       ├── login/ · logout/
│       └── (protected)/            # layout gác cổng: getSessionState()
│           ├── page.tsx · thanh-vien/ · bai-viet/ · giao-dien/
├── components/                     # section trang công khai (Tailwind)
│   └── admin/                      # AdminShell · Sidebar · MembersTable … (MUI)
├── lib/
│   ├── auth/    config.ts (Edge-safe) · index.ts (Node) · session.ts
│   ├── db/      index.ts (chọn driver) · schema.ts
│   ├── admin/   menu.ts · theme.ts · users-actions.ts
│   └── data.ts                     # nội dung tĩnh của trang công khai
├── middleware.ts                   # chặn /admin ở tầng Edge
├── scripts/seed-admin.ts           # npm run db:seed
├── docker-compose.yml              # CHỈ Postgres cho dev — không đóng gói web
└── docs/                           # architecture · conventions · specs
```

**Hai vùng giao diện tách bạch, đừng trộn:** không dùng MUI trong `components/*` công khai, không tạo dáng component MUI bằng class Tailwind. Hai hệ token màu không tương thích — công khai nền tối `#070b16`, admin nền sáng `#F2F6FA`. Chi tiết ở [coding-style.md](../conventions/coding-style.md) §0.

---

## 3. Hình dạng lúc chạy

```text
Internet ──► Vercel Edge ──► middleware.ts          (chặn /admin, KHÔNG đụng DB)
                └──► Next.js 14 (Node runtime)
                        ├─ Server Component  ──► Drizzle ──► Neon Postgres (HTTP)
                        ├─ Server Action     ──► Drizzle ──► Neon Postgres
                        └─ /api/auth/*       ──► Auth.js v5
                              ảnh bài viết   ──► Cloudflare R2 (public CDN)
```

Không có tiến trình thường trực nào ngoài chính Next.js. **Không có ngân sách RAM để cân đối** — đó là khác biệt căn bản với hệ tự host: Vercel co giãn theo request, Neon nối qua **HTTP** nên ứng dụng không giữ connection pool.

Lúc dev: `npm run db:up` dựng Postgres trong Docker (cổng **5433**, cố ý tránh 5432 vốn hay bị dự án khác chiếm), `npm run dev` chạy Next trên máy thật.

---

## 4. Ghi chú từng lựa chọn

### 4.1. Next.js 14 App Router, một ứng dụng duy nhất

Trang công khai là nội dung marketing — thứ **bắt buộc** render ở máy chủ để Google đọc được và để khách thấy chữ ngay ở byte đầu tiên. SPA thuần bị loại từ đó.

Đã có SSR thì **Server Action + Server Component thay hẳn tầng API**: form trong `/admin` gọi thẳng một hàm `"use server"`, hàm đó gọi Drizzle. Dựng thêm REST layer ở giữa chỉ để "đúng kiến trúc" là thêm một tầng phải giữ đồng bộ, đổi lấy con số không.

Giữ **14** thay vì nhảy 15: `next-auth@5` còn beta, và React 19 (mặc định của Next 15) là một biến số nữa chồng lên đó. Nâng khi Auth.js v5 ra bản ổn định.

### 4.2. Hai hệ style — có chủ ý, không phải nợ kỹ thuật

Đây là điểm hay bị hiểu nhầm nhất nên nói rõ: **Tailwind cho công khai, MUI cho admin** là một quyết định.

- Trang công khai cần **kiểm soát từng pixel** cho glow/grain/gradient thương hiệu. Component library ở đó là thứ phải ghi đè liên tục.
- Khu admin cần **bảng, form, dialog, phân trang có sẵn** và tính nhất quán. Viết lại một `DataGrid` bằng Tailwind là vài tuần công cho một màn nội bộ mà năm người dùng.

Chi phí đã chấp nhận: MUI + Emotion chỉ nằm trong bundle của `/admin/**` — hai vùng là hai nhánh route khác nhau nên Next tự tách chunk, trang công khai không gánh.

### 4.3. Auth.js v5 — cấu hình bị CHIA ĐÔI vì Edge runtime

Ràng buộc kỹ thuật cứng, sai là **build đỏ hoặc middleware chết lúc chạy**:

- `lib/auth/config.ts` — **chạy được trên Edge**: không import `db`, không import `bcryptjs`. Đây là thứ `middleware.ts` nạp.
- `lib/auth/index.ts` — **Node runtime**: gắn provider Credentials; chỉ ở đây mới được truy vấn DB và so mật khẩu.

Middleware chỉ hỏi *"có phiên hợp lệ không"* rồi cho qua hoặc đá về `/admin/login`. Nó **không** kiểm vai trò và **không** đụng database — Edge không có kết nối TCP tới Postgres, và kiểm quyền ở đó là kiểm sai chỗ.

🔴 **Kiểm quyền thật nằm ở `(protected)/layout.tsx` và trong TỪNG server action** (`getSessionState()`). Middleware là lớp tiện nghi cho trải nghiệm, không phải hàng rào: một action thiếu kiểm quyền là lỗ hổng thật dù middleware có đứng trước nó — server action là một endpoint HTTP, gọi thẳng được.

Phiên **JWT** chứ không phải session lưu DB: mỗi lần kiểm phiên đỡ một vòng truy vấn, và với hạn 8 giờ thì không cần thu hồi tức thì. Cookie **trượt** — `updateAge: 1 giờ` cấp lại cookie theo hoạt động, thay cho refresh token.

### 4.4. Drizzle thay vì Prisma

Schema nhỏ, truy vấn đơn giản, nhưng ba điểm quyết định:

1. **Không có bước generate.** Prisma đòi `prisma generate` sau mỗi lần sửa schema — thêm một bước dễ quên trong CI và lúc dev.
2. **Chạy được trên driver HTTP của Neon** mà không cần engine nhị phân đi kèm — nhẹ hơn hẳn trong môi trường serverless.
3. **Schema là TypeScript.** `typeof users.$inferSelect` là kiểu thật, dùng thẳng trong component, không cần một lớp DTO trung gian chỉ để chép lại cùng các trường.

Đang dùng `drizzle-kit push` (đồng bộ thẳng schema) thay vì migration file — đúng ở giai đoạn schema còn đổi và **chỉ có một môi trường prod**.

🔴 **Ngưỡng đổi:** ngay khi có dữ liệu thật cần bảo toàn qua một thay đổi phá vỡ (đổi tên cột, tách bảng), chuyển sang `drizzle-kit generate` + migration có kiểm soát. `push` sẽ vui vẻ xóa cột để khớp schema.

### 4.5. Một `DATABASE_URL`, hai driver — tự chọn

> Cách chuyển từ Docker local sang Neon: xem runbook [`chuyen-sang-neon.md`](./chuyen-sang-neon.md).

`lib/db/index.ts` đọc chuỗi kết nối rồi tự quyết: chứa `neon.tech`/`neon.build` → driver **HTTP của Neon**; còn lại → **`postgres-js`** với `max: 1` (tránh cạn kết nối khi Next hot-reload liên tục).

Vì sao không bắt khai thêm một biến `DB_DRIVER`: hai nguồn sự thật cho cùng một việc thì sớm muộn cũng lệch nhau, và triệu chứng là *"local chạy, prod không"* — loại lỗi tốn nhiều giờ nhất để tìm.

Kết nối **khởi tạo trễ** qua `Proxy`: `DATABASE_URL` chỉ được đọc khi thực sự có truy vấn, để `next build` không đổ vỡ ở môi trường build chưa có biến môi trường.

### 4.6. `three` / R3F cho Hero — và cái giá của nó

`HeroScene` là điểm nhấn thương hiệu ở màn đầu tiên. Giá phải trả là thật: `three` + R3F + drei là phần **nặng nhất** trong bundle công khai, và `next.config.mjs` phải khai `transpilePackages` cho cả ba (chúng phát hành ESM mà Next 14 không tự xử lý — thiếu dòng đó là lỗi lúc build, không phải lúc chạy).

Hai ràng buộc bắt buộc: cảnh 3D là **client-only** và chỉ nạp ở trang chủ — đừng để nó rơi vào layout dùng chung. Và mọi thứ 3D/chuyển động phải tôn trọng `prefers-reduced-motion`: chuyển động lặp gây chóng mặt thật với người rối loạn tiền đình, và họ đã bày tỏ ý muốn ở cấp hệ điều hành.

### 4.7. `framer-motion` chỉ ở trang công khai

Khu `/admin` **không** nhập `framer-motion`. Nó là công cụ làm việc: chuyển động ở đó chỉ làm chậm thao tác lặp lại nhiều lần mỗi ngày, và cộng thêm bundle vào vùng vốn đã gánh MUI.

### 4.8. Ảnh bài viết: Cloudflare R2 qua một cổng duy nhất

Truy cập qua **một interface** (`lib/blog/storage.ts`), hai cài đặt: `r2` (mặc định) và `local` cho dev. Chọn R2 vì **egress miễn phí** và tương thích S3 — đổi sang S3/B2 sau này là đổi endpoint, không phải viết lại.

🔴 **Mọi ghi file PHẢI qua cổng đó.** Ghi thẳng `fs` một chỗ là chỗ đó rơi lại filesystem của Vercel — nơi file là **ephemeral**, biến mất ở lần deploy kế tiếp, trong im lặng.

🔴 **`img src` trong thân bài phải bắt đầu bằng `R2_PUBLIC_URL`** (hoặc `/uploads/` với driver local). Ảnh trỏ ra miền lạ là một beacon theo dõi khách của mình, đặt vào trang bởi bất kỳ ai soạn được bài.

### 4.9. Chưa có test runner — và điều kiện để thêm

`package.json` hiện không có script `test`. Điều đó **đúng** với những gì đang có: một trang marketing tĩnh và vài màn CRUD, nơi cách kiểm hữu ích nhất là mở trình duyệt ra xem.

Nó ngừng đúng ngay khi phân hệ bài viết vào: `sanitizeArticleHtml`, `slugify`, `extractToc`, `seo-check` là **hàm thuần** — không import `next`, không import React — và làm sạch HTML là **hàng rào bảo mật sai trong im lặng**: một bộ lọc thủng vẫn trả về chuỗi trông hoàn toàn bình thường. Loại code đó bắt buộc phải có test; phần còn lại của repo thì không. Thêm runner cho **lõi thuần**, đừng dựng cả hạ tầng test cho component.

### 4.10. Cache là quyết định tường minh, không phải mặc định framework

Trang công khai muốn nhanh thì phải cache. Nhưng cache sai chỗ là *"Admin sửa xong mà web không đổi"* — đúng thứ vấn đề mà khu quản trị sinh ra để giải.

| Đường dẫn | Chiến lược |
| :-- | :-- |
| `/`, `/bai-viet`, `/bai-viet/[slug]` | `revalidate = 300` (+ `generateStaticParams()` cho bài đã đăng) |
| `/sitemap.xml` | `revalidate = 3600` |
| `/admin/**` | `dynamic = "force-dynamic"` — **không bao giờ** cache |

Mọi action ghi phải khai rõ nó làm mới đường dẫn nào (`revalidatePath`). 🔴 Đổi **slug** thì làm mới **cả slug cũ lẫn slug mới**; bỏ sót thì đường dẫn cũ còn nằm trong cache và vẫn phục vụ bài như chưa có gì xảy ra.

### 4.11. Vercel + Neon thay vì tự host VPS

Cân nhắc thật, không phải mặc định: một VPS + Docker + Caddy rẻ hơn tiền mặt nhưng đắt hơn **thời gian người** — TLS, vá bảo mật OS, sao lưu Postgres, giám sát, và một cuộc gọi lúc 2 giờ sáng khi đĩa đầy. Với một website giới thiệu, đó là chi phí không đổi lấy gì.

Neon cho **branch database** (mỗi preview deploy một nhánh dữ liệu) và PITR sẵn có — nên **không cần cron `pg_dump` tự viết**, thứ mà tự host bắt buộc phải có. Đây cũng là lý do `docker-compose.yml` chỉ chứa Postgres: nó là công cụ dev, không phải hình dạng production.

Đánh đổi đã chấp nhận: Neon có **cold start** ở gói thấp sau thời gian không truy cập — request đầu chậm thêm vài trăm ms. Trang công khai không thấy ảnh hưởng (đã cache 5 phút, phần lớn là nội dung tĩnh); chỉ người mở `/admin` sau kỳ nghỉ mới gặp.

---

## 5. Biến môi trường

Nguồn chuẩn là [`.env.example`](../../.env.example). Bảng dưới giải thích *vì sao*.

| Biến | Ghi chú |
| :-- | :-- |
| `DATABASE_URL` | **Bắt buộc.** Quyết định luôn driver (§4.5). Local: `postgresql://oalpha:oalpha@localhost:5433/oalpha` |
| `AUTH_SECRET` | **Bắt buộc.** Khóa ký JWT phiên — sinh bằng `npx auth secret`. Đổi giá trị này là **đá mọi phiên đang đăng nhập** |
| `AUTH_URL` | Chỉ cần khi deploy ngoài Vercel; Vercel tự set. Sai giá trị → callback đăng nhập quay về sai miền |
| `STORAGE_DRIVER` | `r2` (mặc định) hoặc `local` cho dev |
| `R2_ENDPOINT` · `R2_BUCKET` · `R2_ACCESS_KEY_ID` · `R2_SECRET_ACCESS_KEY` | Khóa ghi vào R2 — **chỉ dùng ở máy chủ**, không bao giờ để lọt vào biến `NEXT_PUBLIC_*` |
| `R2_PUBLIC_URL` | Miền CDN đọc ảnh. Cũng là **tiền tố hợp lệ duy nhất** của `img src` trong thân bài (§4.8) |
| `SEED_ADMIN_NAME` · `SEED_ADMIN_EMAIL` · `SEED_ADMIN_PASSWORD` | Chỉ cho `npm run db:seed`. **Đổi `SEED_ADMIN_PASSWORD` ngay sau lần đăng nhập đầu** — mật khẩu nằm trong `.env` là mật khẩu ai đọc được file cũng có |

> 🚨 **Không có biến nào mang khóa bí mật được đặt tiền tố `NEXT_PUBLIC_`.** Next nhúng thẳng mọi biến `NEXT_PUBLIC_*` vào JavaScript gửi cho trình duyệt — một khóa R2 đặt nhầm tiền tố là khóa ghi đã phát ra Internet, và không có lỗi nào nổ ra để báo.

---

## 6. Lệnh

| Việc | Lệnh |
| :-- | :-- |
| Dev | `npm run dev` |
| Build / chạy production | `npm run build` · `npm run start` |
| Lint | `npm run lint` |
| Bật Postgres dev (Docker) | `npm run db:up` · tắt: `npm run db:down` |
| Đồng bộ schema xuống DB | `npm run db:push` |
| Xem dữ liệu bằng giao diện | `npm run db:studio` |
| Tạo tài khoản super admin đầu tiên | `npm run db:seed` |

> 🚨 **`db:seed` là bước chặn cứng, không phải tiện ích.** Giao diện **không có** luồng nào tạo `super_admin` — bỏ seed là không ai đăng nhập được vào `/admin`, kể cả chủ dự án. Vai trò mặc định của tài khoản tạo qua giao diện là `admin` (chỉ nội dung).

Các lệnh `db:*` nạp `.env` bằng `node --env-file` / `tsx --env-file` nên **phải có file `.env` thật ở gốc `novaix-website/`** — `.env.example` không được đọc.

---

## 7. Ngưỡng phải xem lại tài liệu này

Bảng §1 đúng ở quy mô hiện tại. Bốn dấu hiệu buộc phải mở lại quyết định:

| Dấu hiệu | Cần đổi gì |
| :-- | :-- |
| Có dữ liệu prod phải bảo toàn qua một thay đổi schema phá vỡ | Bỏ `drizzle-kit push`, chuyển sang migration file (§4.4) |
| Bài viết vượt ~500 và cần tìm kiếm | Dùng `pg_trgm` / full-text sẵn có của Postgres — vẫn **không** thêm search engine |
| Có việc chạy lâu hơn giới hạn timeout của serverless function | Đó là lúc đầu tiên hàng đợi được phép đem ra bàn |
| `next-auth@5` ra bản ổn định | Nâng Auth.js, cân nhắc Next 15 / React 19 cùng lúc (§4.1) |

**Đừng làm ở quy mô này:** cache tầng ứng dụng, read replica, microservice, GraphQL, monorepo, state manager toàn cục, denormalize số liệu, và mọi thứ có chữ "AI".

---

## 8. Tài liệu liên quan

- [coding-style.md](../conventions/coding-style.md) — quy ước code, bản đồ hai vùng giao diện
- [content-article-domain.md](../specs/domains/content-article-domain.md) — miền nội dung bài viết
- [blog-rfc.md](../specs/features/blog/blog-rfc.md) — thiết kế kỹ thuật phân hệ bài viết (nguồn của các mục 🟡)
