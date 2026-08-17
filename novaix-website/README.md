# NovAIX — Website giải pháp công nghệ doanh nghiệp

Landing page cho **NovAIX** — công ty giải pháp công nghệ (CRM · ERP và các module nghiệp vụ giúp doanh nghiệp hệ thống hóa quy trình). Xây dựng bằng **Next.js 14 (App Router)** + **Three.js** (react-three-fiber) + Tailwind CSS + Framer Motion.

## Yêu cầu
- Node.js >= 18.18

## Chạy dự án
```bash
npm install
npm run dev      # mở http://localhost:3000
```

## Build production
```bash
npm run build
npm start
```

## Cấu trúc
```
app/
  layout.tsx        # font (Bricolage Grotesque + Manrope), metadata SEO
  page.tsx          # ghép toàn bộ section
  globals.css       # design tokens (màu, hiệu ứng grain, nút, kicker)
components/
  HeroScene.tsx     # 3D node-network bằng react-three-fiber (Three.js)
  Hero.tsx          # tiêu đề lớn + CTA + Stats (đếm số)
  Marquee.tsx       # dải lĩnh vực chạy ngang
  Modules.tsx       # 9 module: CRM, ERP, Kho, Kế toán, HRM, Quy trình, BI, AI, Tích hợp
  Features.tsx      # vì sao chọn NovAIX + vòng tròn orbit
  Process.tsx       # 5 bước triển khai
  Segments.tsx      # giải pháp theo đối tượng
  Testimonials.tsx  # cảm nhận khách hàng (nội dung minh họa)
  CTA.tsx           # kêu gọi đặt demo
  Footer.tsx        # liên hệ: 14 Đường 41, An Khánh, HCM
lib/data.ts         # toàn bộ nội dung tập trung tại đây — sửa text ở đây
```

## Khu quản trị (`/admin`)

Giao diện MUI theo template Modernize, database Postgres qua Drizzle, đăng nhập email/mật khẩu bằng Auth.js v5.

### Thiết lập
```bash
cp .env.example .env           # điền AUTH_SECRET (npx auth secret) và R2_*
npm run db:up                  # bật Postgres trong Docker (cổng 5433)
npm run db:push                # tạo bảng
npm run db:seed                # tạo Super Admin đầu tiên từ SEED_ADMIN_*
npm run dev                    # http://localhost:3000/admin/login
```

### Postgres local
`docker-compose.yml` dựng container riêng `oalpha-postgres`, dữ liệu nằm trong volume
`novaix-website_oalpha-pgdata` nên không mất khi tắt container.

Map ra **cổng 5433** (không phải 5432) để tránh đụng Postgres của dự án khác trên cùng máy.

```bash
npm run db:up      # bật
npm run db:down    # tắt (dữ liệu vẫn còn)
npm run db:studio  # xem/sửa dữ liệu bằng Drizzle Studio
```

### Local ↔ Neon
`lib/db/index.ts` tự chọn driver theo `DATABASE_URL`: chứa `neon.tech` thì dùng driver HTTP của Neon,
còn lại dùng `postgres-js` cho Postgres thường. Chuyển môi trường chỉ cần đổi connection string.

### Phân quyền
| Vai trò | Quyền |
|---|---|
| `admin` | Bài viết, sửa chữ giao diện trang chủ |
| `super_admin` | Toàn bộ quyền của admin + quản lý thành viên |

Chặn ở ba lớp: `middleware.ts` (edge), layout server `app/admin/(protected)/layout.tsx`,
và `requireSuperAdmin()` trong mỗi server action.

### Phiên đăng nhập
Một cookie JWE `httpOnly` do Auth.js phát hành (không dùng cặp access/refresh token — xem
`lib/auth/config.ts`). Hạn tối đa 8 giờ, tự gia hạn sau mỗi 1 giờ hoạt động.

`lib/auth/session.ts` đối chiếu cookie với database ở mỗi request, nên khóa tài khoản
hoặc đổi vai trò có hiệu lực ngay, không phải chờ token hết hạn. Khi phiên bị thu hồi,
layout chuyển sang route `/admin/logout` để xóa cookie (server component không ghi được cookie).

### Cấu trúc
```
app/admin/
  layout.tsx              # MUI theme + font Plus Jakarta Sans
  login/page.tsx          # đăng nhập
  (protected)/            # mọi trang cần đăng nhập
    layout.tsx            # sidebar + header
    page.tsx              # bảng điều khiển
    giao-dien/            # sửa chữ trang chủ (chưa code)
    bai-viet/             # quản lý bài viết (chưa code)
    thanh-vien/           # quản lý thành viên
lib/
  admin/menu.ts           # định nghĩa menu + lọc theo vai trò
  admin/theme.ts          # token màu Modernize
  admin/users-actions.ts  # server actions CRUD thành viên
  auth/                   # cấu hình Auth.js (config.ts chạy được trên edge)
  db/                     # schema Drizzle + chọn driver
```

## Tùy chỉnh nhanh
- **Nội dung**: sửa trong `lib/data.ts` — **một chỗ duy nhất**, đừng rải chữ vào JSX của component.
- **Màu sắc**: đổi biến trong `app/globals.css` và `tailwind.config.ts` (accent `#2dd4bf`, `#38bdf8`, `#fbbf24`).
- **Hiệu ứng 3D**: chỉnh số node `N`, khoảng nối `maxDist`, tốc độ xoay trong `components/HeroScene.tsx`.
- **Thông tin liên hệ**: email/điện thoại trong `CTA.tsx` và `Footer.tsx` — 🔴 đây là **nợ kỹ thuật**, phải chuyển về `lib/data.ts` rồi lên `/admin/giao-dien` (xem luật 3 dưới đây).

---

## Luật làm việc trên repo này

Chi tiết đầy đủ ở [`CLAUDE.md`](../CLAUDE.md) (gốc repo). Ba luật bắt buộc:

### 1. Trước khi code — đọc tài liệu

Đọc [`docs/conventions/coding-style.md`](docs/conventions/coding-style.md) (**mọi lần**),
[`docs/architecture/tech-stack.md`](docs/architecture/tech-stack.md), và tài liệu của đúng phân hệ
đang đụng tới trong [`docs/specs/`](docs/specs/).

Phần lớn quyết định ở đây là quyết định *có lý do*, và lý do nằm trong docs chứ không trong code.
Viết trước rồi đọc sau là viết lại thứ đã bị loại bỏ có chủ ý.

### 2. Sau khi code — cập nhật tài liệu trong CÙNG commit

| Thay đổi | Phải cập nhật |
| :-- | :-- |
| Thêm/bỏ/nâng thư viện, đổi hạ tầng | `docs/architecture/tech-stack.md` |
| Thêm biến môi trường | `.env.example` **và** bảng biến môi trường trong `tech-stack.md` |
| Thêm/đổi script `package.json` | Bảng lệnh trong `tech-stack.md` + README này |
| Đổi schema database | `docs/specs/domains/*` |
| Thêm/đổi hành vi một tính năng | `docs/specs/features/<tính-năng>/` |
| Thêm hoặc phá một quy ước code | `docs/conventions/coding-style.md` |

Ghi cả **lý do**, không chỉ kết quả. Tài liệu sai còn tệ hơn không có tài liệu.

### 3. Không set cứng giá trị trong code

🔴 **Giá trị nghiệp vụ và nội dung hiển thị phải sửa được từ `/admin`, không phải sửa code rồi deploy lại.**

Phải đưa vào `/admin`: mọi chữ khách nhìn thấy · thông tin liên hệ · số liệu trưng bày · danh sách
module/dịch vụ/cảm nhận · logo, màu thương hiệu, metadata SEO · ngưỡng nghiệp vụ (số bài mỗi trang…).

Người sửa nội dung là marketing/sale, không phải lập trình viên. Set cứng nghĩa là đổi một số điện
thoại cũng cần người biết code, có quyền deploy, và rảnh — nên thực tế là nội dung sai cứ nằm đó.

**Ngoại lệ:** khóa bí mật và chuỗi kết nối → biến môi trường (không bao giờ vào DB, vì DB nằm trong
mọi bản sao lưu). Hằng số kỹ thuật thuần (`revalidate`, giới hạn kích thước file, allowlist thẻ HTML)
→ hằng số trong code, khai ở một chỗ duy nhất.
