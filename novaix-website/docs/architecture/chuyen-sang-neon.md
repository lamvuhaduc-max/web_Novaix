# Runbook — Chuyển database từ Docker local sang Neon

> **Áp dụng cho:** repo `novaix-website`. Kiến trúc hai driver đã dựng sẵn, xem
> [`tech-stack.md` §4.5](./tech-stack.md).
>
> **Thời gian:** ~15 phút. **Không phải sửa dòng code nào** — chỉ đổi biến môi trường.

---

# 0. Tại sao chỉ cần đổi chuỗi kết nối

`lib/db/index.ts` đọc `DATABASE_URL` rồi **tự chọn driver**:

| Chuỗi kết nối | Driver dùng |
| :-- | :-- |
| chứa `neon.tech` hoặc `neon.build` | `@neondatabase/serverless` — nối qua **HTTP**, hợp serverless |
| còn lại | `postgres-js` — nối qua TCP, dùng cho Docker local |

Schema Drizzle giống hệt nhau ở cả hai bên. Nên toàn bộ việc chuyển đổi gói gọn trong: đổi một dòng
`.env`, tạo bảng, chuyển dữ liệu.

---

# 1. Tạo project trên Neon

1. Vào [neon.tech](https://neon.tech) → **New Project**.
2. Đặt tên `oalpha`, chọn region **Asia Pacific (Singapore)** — gần Việt Nam nhất, giảm độ trễ.
3. Xong project, vào **Connection Details** và lấy chuỗi kết nối:

> 🔴 **Chọn đúng loại "Pooled connection"** (có `-pooler` trong hostname).
>
> Chuỗi thường (direct) mở một kết nối TCP riêng cho mỗi request. Trên Vercel, mỗi lượt truy cập là
> một hàm serverless — vài chục lượt đồng thời là cạn hạn mức kết nối và trang trả lỗi. Chuỗi pooled
> đi qua PgBouncer của Neon nên chịu được.

Neon nay thêm `&channel_binding=require` vào cuối chuỗi — **cứ giữ nguyên**. Driver HTTP không
dùng tới nó, còn `drizzle-kit` và `psql` đều hiểu. Chỉ khi `npm run db:push` báo lỗi tham số lạ thì
mới thử bỏ đoạn đó đi.

Chuỗi có dạng:

```
postgresql://<user>:<password>@ep-xxx-xxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

---

# 2. Trỏ `.env` sang Neon

Mở `novaix-website/.env`, đổi **đúng một dòng**:

```diff
- DATABASE_URL="postgresql://oalpha:oalpha@localhost:5433/oalpha"
+ DATABASE_URL="postgresql://<user>:<password>@ep-xxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
```

Giữ nguyên mọi biến khác (`AUTH_SECRET`, `R2_*`, `SEED_ADMIN_*`).

> Đừng xóa dòng cũ — comment lại (`# DATABASE_URL="postgresql://oalpha:oalpha@localhost:5433/oalpha"`)
> để lúc cần quay về local chỉ việc đổi chỗ hai dòng.

---

# 3. Tạo bảng trên Neon

```bash
cd novaix-website
npm run db:push
```

Lệnh này đọc `.env`, thấy chuỗi Neon, tạo toàn bộ bảng và index theo `lib/db/schema.ts`.

Kỳ vọng thấy `[✓] Changes applied`. Nếu báo lỗi kết nối, kiểm tra chuỗi có `?sslmode=require` chưa.

---

# 4. Chuyển dữ liệu đang có

Bỏ qua bước này nếu bạn muốn bắt đầu sạch (khi đó nhảy tới §5).

**Máy bạn không cần cài PostgreSQL client** — script dùng luôn `pg_dump`/`psql` bên trong container
Docker, vốn có sẵn đường ra Internet:

```bash
bash scripts/migrate-to-neon.sh
```

Script tự đọc `DATABASE_URL` trong `.env` (đã trỏ Neon từ §2), nên **chuỗi kết nối kèm mật khẩu
không nằm lại trong lịch sử shell**.

Script làm bốn việc và **dừng lại nếu có gì bất thường**:

| Bước | Kiểm gì | Dừng khi |
| :-- | :-- | :-- |
| 1 | Kết nối được tới Neon | Sai chuỗi kết nối |
| 2 | Neon đã có bảng | Chưa chạy `npm run db:push` ở §3 |
| 3 | Neon còn rỗng | Đã có dữ liệu — tránh ghi đè nhầm |
| 4 | Chuyển dữ liệu rồi đối chiếu số bản ghi | Bất kỳ câu lệnh nào lỗi |

Nó **cố ý bỏ bảng `activity_logs`**: đó là nhật ký thao tác của môi trường dev, mang lên chỉ làm
nhiễu lịch sử thật.

Cuối lệnh sẽ in bảng đối chiếu — số bản ghi trên Neon phải khớp với local.

---

# 5. Nếu bắt đầu sạch (không chuyển dữ liệu)

```bash
npm run db:seed        # tạo tài khoản Super Admin từ SEED_ADMIN_* trong .env
npm run db:seed:blog   # 3 bài viết mẫu + danh mục
```

Đăng nhập xong **đổi mật khẩu ngay** trong `/admin/thanh-vien`.

---

# 6. Kiểm chứng

```bash
npm run dev
```

Mở lần lượt và đối chiếu:

| Kiểm | Kỳ vọng |
| :-- | :-- |
| `/` | Nội dung trang chủ đúng như bản đã chỉnh, không về mặc định |
| `/blog` | Đủ số bài viết |
| `/admin/login` | Đăng nhập được bằng tài khoản cũ |
| `/admin/giao-dien` | Mở ra thấy đúng nội dung đã lưu |
| `/admin/thanh-vien` | Đủ danh sách thành viên |

Nếu trang chủ về nội dung mặc định → bảng `site_settings` chưa được chuyển. Chạy lại §4.

---

# 7. Tắt Postgres local

Sau khi mọi thứ chạy trên Neon:

```bash
npm run db:down
```

Dữ liệu local vẫn nằm trong volume `novaix-website_oalpha-pgdata`, **không mất**. Muốn quay về local
chỉ cần `npm run db:up` và đổi lại `DATABASE_URL`.

---

# 8. Khi deploy lên Vercel

Vào **Project Settings → Environment Variables**, khai đúng các biến này (không commit `.env`):

| Biến | Giá trị |
| :-- | :-- |
| `DATABASE_URL` | Chuỗi **pooled** của Neon |
| `AUTH_SECRET` | **Chuỗi MỚI**, khác chuỗi local — sinh bằng `npx auth secret` |
| `R2_ENDPOINT` · `R2_BUCKET` · `R2_ACCESS_KEY_ID` · `R2_SECRET_ACCESS_KEY` | Như `.env` |
| `R2_PUBLIC_URL` | Nên đổi sang **custom domain** thay vì `r2.dev` — xem cảnh báo bên dưới |
| `STORAGE_DRIVER` | `r2` |

Ba điều dễ quên:

1. **`AUTH_SECRET` production phải khác local.** Dùng chung nghĩa là ai có `.env` của máy dev đều ký
   được phiên đăng nhập hợp lệ trên production.
2. **`SEED_ADMIN_*` không cần khai trên Vercel** — chỉ dùng cho script chạy tay.
3. **URL `r2.dev` bị Cloudflare giới hạn tốc độ và không dùng được cache** — chính Cloudflare khuyến
   cáo không dùng cho production. Gắn custom domain (ví dụ `cdn.oalpha.vn`) vào bucket rồi đổi
   `R2_PUBLIC_URL`. Code không phải sửa gì.

---

# 9. Những thứ **không** phải làm

| | Vì sao |
| :-- | :-- |
| Sửa code | Driver tự chọn theo chuỗi kết nối |
| Cài thêm gói npm | `@neondatabase/serverless` đã có sẵn trong `package.json` |
| Viết migration SQL | `drizzle-kit push` đọc thẳng `schema.ts` |
| Cài PostgreSQL lên máy | Script dùng client trong container Docker |
| Đổi `next.config.mjs` | Không liên quan tới database |

---

# 10. Xử lý sự cố

| Triệu chứng | Nguyên nhân thường gặp |
| :-- | :-- |
| `password authentication failed` | Copy thiếu ký tự cuối chuỗi, hoặc dùng chuỗi của project khác |
| `too many connections` trên production | Đang dùng chuỗi **direct** thay vì **pooled** |
| Trang chủ về nội dung mặc định | Bảng `site_settings` chưa chuyển — chạy lại §4 |
| Đăng nhập báo sai mật khẩu dù đúng | Bảng `users` chưa chuyển; hoặc đang trỏ nhầm database |
| Request đầu tiên sau vài giờ rất chậm | Cold start của Neon ở gói thấp — bình thường, xem [`tech-stack.md` §4.11](./tech-stack.md) |
| `npm run db:push` báo `ECONNREFUSED` | Thiếu `?sslmode=require` ở cuối chuỗi |
| `relation "articles" does not exist` dù bảng vẫn còn | `search_path` rỗng — xem §11 |

---

# 11. Bẫy `search_path` khi nạp dữ liệu qua chuỗi pooled

**Triệu chứng:** `npm run db:push` báo thành công, `\dt` thấy đủ bảng, nhưng ứng dụng lại lỗi
`relation "articles" does not exist`. Trang chủ thì vẫn 200 nhưng hiện **nội dung mặc định** thay vì
nội dung đã lưu — vì `getHomeContent` bọc lỗi lại để không làm sập trang.

**Nguyên nhân:** `pg_dump` luôn chèn sẵn dòng này ở đầu file:

```sql
SELECT pg_catalog.set_config('search_path', '', false);
```

Tham số `false` nghĩa là "áp cho cả phiên", không chỉ giao dịch hiện tại. Với kết nối trực tiếp thì
vô hại — đóng phiên là hết. Nhưng **chuỗi pooled đi qua PgBouncer, nơi kết nối tới máy chủ được dùng
lại giữa nhiều client**: trạng thái đó dính lại và mọi phiên sau đều nhận `search_path` rỗng, nên
truy vấn không có tiền tố schema đều không tìm thấy bảng.

Drizzle sinh câu lệnh dạng `select ... from "articles"` (không kèm `public.`), nên dính trọn.

**Script đã xử lý sẵn** — lọc bỏ dòng đó trước khi nạp, và đặt mặc định ở cấp role. Mục này để khi
bạn tự chạy `psql < dump.sql` bằng tay thì biết đường tránh.

**Nếu đã lỡ dính:**

```bash
# 1. Đặt mặc định ở cấp role (dùng chuỗi DIRECT — bỏ "-pooler" khỏi hostname)
psql "<chuỗi-direct>" -c 'ALTER ROLE CURRENT_USER SET search_path TO "$user", public;'

# 2. Ép các kết nối cũ đăng nhập lại để nhận mặc định mới
psql "<chuỗi-direct>" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity
                          WHERE datname = current_database() AND pid <> pg_backend_pid();"

# 3. Kiểm lại qua chuỗi POOLED — phải ra ["$user", public]
psql "<chuỗi-pooled>" -c "SHOW search_path;"
```

Bước 2 là bắt buộc: `ALTER ROLE` chỉ có hiệu lực lúc đăng nhập, nên kết nối đang nằm sẵn trong pool
vẫn giữ trạng thái hỏng cho tới khi bị hủy.
