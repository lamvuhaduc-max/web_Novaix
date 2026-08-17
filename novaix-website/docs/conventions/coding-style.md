# Quy ước Code & Nguyên tắc Kỹ thuật (Coding Style)

> **Phạm vi:** repo `novaix-website` — website giới thiệu **OAlpha** (thư mục/README còn mang tên
> NovAIX) kèm khu quản trị `/admin`. Một ứng dụng **Next.js 14 App Router duy nhất**: không có
> backend riêng, không NestJS, không hàng đợi, không worker.

## Mục tiêu

Code là tài sản dài hạn của sản phẩm. Thứ tự ưu tiên:

1. Dễ đọc (Readability).
2. Dễ bảo trì (Maintainability).
3. Đúng đắn (Correctness).
4. Dễ kiểm thử (Testability).
5. Hiệu năng (Performance).
6. Khả năng mở rộng (Scalability).

Code được **đọc lại** nhiều hơn số lần được viết ra. Người đọc kế tiếp có thể là: một lập trình viên khác, một AI agent, hoặc chính bạn trong tương lai.

> **Nhớ quy mô trước khi viết dòng đầu tiên: một trang giới thiệu công khai + vài tài khoản quản trị nội bộ.** Mọi cám dỗ về microservice, cache tầng ứng dụng, hàng đợi, read replica đều **sai** ở đây. Ba thứ đáng đầu tư kỹ thuật: **tốc độ tải trang công khai**, **an toàn của khu `/admin`**, và **nội dung sửa được không cần deploy**.

---

## 0. Bản đồ hệ thống — biết mình đang viết ở vùng nào

Repo có **hai vùng giao diện tách bạch**, khác nhau cả về công nghệ lẫn luật chơi. Nhầm vùng là lỗi thường gặp nhất.

| | Vùng công khai (`app/page.tsx` + `components/*`) | Khu quản trị (`app/admin/**` + `components/admin/*`) |
| :-- | :-- | :-- |
| Style | **Tailwind** + token trong `app/globals.css` | **MUI 6** + theme Modernize ở `lib/admin/theme.ts` |
| Icon | Emoji trong `lib/data.ts` (nội dung) | **`@tabler/icons-react`** |
| Chuyển động | `framer-motion`, `three` / `@react-three/fiber` | Không |
| Dữ liệu | Tĩnh, lấy từ `lib/data.ts` | Postgres qua **Drizzle** |
| Xác thực | Không | **Auth.js v5** (`next-auth@5 beta`), phiên JWT |

```text
app/
├── layout.tsx                    # metadata SEO + font Google
├── page.tsx                      # ghép các section marketing
├── globals.css                   # token màu, glow, grain, .btn, .kicker
├── api/auth/[...nextauth]/       # route handler DUY NHẤT của dự án
└── admin/
    ├── layout.tsx                # ThemeRegistry (MUI + Emotion cache)
    ├── login/ · logout/
    └── (protected)/              # layout gác cổng: getSessionState()
        ├── page.tsx · thanh-vien/ · bai-viet/ · giao-dien/
components/ · components/admin/
lib/  auth/ (config·index·session) · db/ (index·schema) · admin/ (menu·theme·users-actions) · data.ts
middleware.ts                     # chặn /admin ở tầng edge
scripts/seed-admin.ts             # npm run db:seed
```

**Không trộn:** không dùng MUI trong `components/*` công khai, không dùng class Tailwind để tạo dáng cho component MUI trong `components/admin/*`. Hai hệ token màu này không tương thích (trang công khai nền tối `#070b16`, admin nền sáng `#F2F6FA`).

---

## Triết lý Cốt lõi

### Viết code cho con người đọc trước

Không tốt:

```typescript
const x = u.filter(i => i.s === "active").map(i => i.e);
```

Tốt:

```typescript
const emailDangHoatDong = members
  .filter((member) => member.status === "active")
  .map((member) => member.email);
```

Code nên **thể hiện được ý định** (intent), không bắt người đọc phải giải mã.

### Đơn giản hơn là "khôn lỏi"

Nên dùng:
- Logic đơn giản, rõ ràng, tường minh.

Nên tránh:
- Hành vi "ma thuật" (magic), khó đoán.
- Trừu tượng hóa quá mức.
- Generic phức tạp mà không mang lại giá trị rõ ràng.
- Biểu thức một dòng che giấu nghiệp vụ.

### Hàm nhỏ, một trách nhiệm

- Độ dài hàm nên **< 30 dòng**, tối đa khoảng **50 dòng**.
- Mỗi hàm chỉ nên làm **một việc**.

Tốt — mỗi server action là một việc, phần kiểm quyền tách riêng và dùng lại:

```typescript
async function requireSuperAdmin() {          // dùng chung cho mọi action quản lý thành viên
  const me = await requireUser();
  if (me.role !== "super_admin") throw new Error("Bạn không có quyền thực hiện thao tác này.");
  return me;
}
```

---

## Giới hạn Độ dài File

File lớn nhất hiện tại là `components/admin/MembersTable.tsx` (332 dòng). Đó là ngưỡng thực tế của dự án — đừng để nó thành 900.

- **Cảnh báo mềm:** file không nên vượt **400 dòng**; đạt ngưỡng này thì lên kế hoạch tách.
- **Chặn cứng:** không vượt **700 dòng** (trừ `lib/data.ts`, `lib/admin/theme.ts`, `app/globals.css` — cấu hình/nội dung tĩnh, cho phép dài hơn).
- **Ngưỡng theo loại file:**
  - **Server Action** (`lib/**/*-actions.ts`): ~**250 dòng**; quá thì tách theo nhóm nghiệp vụ (`users-actions.ts`, `articles-actions.ts`…).
  - **Page** (`app/**/page.tsx`): ~**80 dòng** — chỉ kiểm quyền, lấy dữ liệu, render component.
  - **Component MUI** (`components/admin/*`): ~**350 dòng**; dialog nhiều bước thì tách thành component con.
  - **Section marketing** (`components/*.tsx`): ~**150 dòng**; nội dung chữ đẩy sang `lib/data.ts`.
- **Hành động:** khi file gần chạm ngưỡng, tách phần nhỏ thành component/hook/helper riêng.

---

## Tách để tái dùng — không nhân đôi logic

Khi một mảng logic có khả năng dùng ở **hơn một chỗ**, tách thành hàm/component dùng chung — TUYỆT ĐỐI không "fork-and-duplicate" (chép sang chỗ thứ hai rồi hai bản trôi dạt).

### Nguyên tắc

- **Tách lõi thuần khỏi phần đặc thù màn hình.** Lõi = kiểm quyền, đọc/ghi DB, validate (test được). Đặc thù = layout, dialog, toast. Ví dụ đã làm: `requireSuperAdmin()` và `ensureAnotherActiveSuperAdmin()` nằm ở `lib/admin/users-actions.ts`, mọi action gọi vào; không action nào chép lại phép kiểm.
- **Thấy mình sắp copy một hàm sang nơi thứ hai → DỪNG, tách ra dùng chung.** Chép lần thứ hai là nợ kỹ thuật: lần nâng cấp sau sẽ chỉ chạm một bản, bản kia hỏng **trong im lặng**.
- **Giao diện cũng vậy:** khối lặp lại (header trang, thẻ trạng thái, hộp thoại xác nhận) tách thành component nhận `props` — đừng dán JSX sang trang khác. Đã có sẵn: `components/admin/PageHeader.tsx`, `ComingSoon.tsx`.

### Cân bằng — KHÔNG trừu tượng hóa sớm

Quy tắc này **không** mâu thuẫn với "Đơn giản hơn khôn lỏi": chỉ tách khi **ĐÃ có** (hoặc chắc chắn sắp có) người dùng thứ hai. Một hàm chỉ có một người gọi thì để yên. Trục quyết định: *"đã có người thứ hai chưa?"*

---

## Đặt Nghiệp vụ đúng Tầng

Dự án **không có tầng controller/service/repository** — đừng dựng chúng lên. Kiến trúc thật là:

```text
Server Component (page/layout)  ─┐
                                 ├──► lib/**-actions.ts  ──► Drizzle ──► PostgreSQL
Client Component ── server action ┘        ▲
                                           └── lib/auth/session.ts (kiểm phiên + vai trò)
```

| Tầng | Được làm | Không được làm |
| :-- | :-- | :-- |
| `app/**/page.tsx`, `layout.tsx` | Kiểm quyền, gọi action lấy dữ liệu, render | Viết logic nghiệp vụ, gọi Drizzle trực tiếp cho thao tác ghi |
| `lib/**/*-actions.ts` (`"use server"`) | **Toàn bộ nghiệp vụ**: kiểm quyền, validate Zod, truy vấn Drizzle, `revalidatePath` | Trả về JSX, đụng vào `window` |
| `components/**` (`"use client"`) | Trạng thái giao diện, gọi server action, hiển thị lỗi | `import { db }`, đọc `process.env` bí mật |
| `lib/db/schema.ts` | Định nghĩa bảng + type suy ra từ bảng | Logic nghiệp vụ |

**Một quy tắc cứng:** client component **không bao giờ** `import { db }`. Mọi ghi/đọc dữ liệu đi qua server action đã gắn kiểm quyền. Chỉ một `import` sai là chuỗi kết nối và toàn bộ schema lọt vào bundle trình duyệt.

---

## Server Action — khuôn mẫu bắt buộc

Mọi action theo đúng bốn nhịp: **kiểm quyền → validate → thao tác → làm mới cache**. Lỗi trả về dưới dạng dữ liệu (`ActionResult`), không ném thẳng ra client.

```typescript
"use server";

export type ActionResult = { ok: true } | { ok: false; error: string };

const createSchema = z.object({
  name: z.string().trim().min(2, "Tên phải từ 2 ký tự."),
  email: z.string().trim().toLowerCase().email("Email không hợp lệ."),
  password: passwordRule,
  role: z.enum(["super_admin", "admin"]),
});

export async function createMember(input: unknown): Promise<ActionResult> {
  try {
    await requireSuperAdmin();                 // 1. quyền — LUÔN đứng đầu
    const data = createSchema.parse(input);    // 2. validate — input là `unknown`

    // 3. thao tác
    await db.insert(users).values({ ...data, passwordHash: await bcrypt.hash(data.password, BCRYPT_ROUNDS) });

    revalidatePath("/admin/thanh-vien");       // 4. làm mới cache
    return { ok: true };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, error: e.issues[0].message };
    return fail(e);
  }
}
```

Bốn luật:

1. **Tham số vào là `unknown`, không phải DTO đã tin cậy.** Server action là **endpoint HTTP công khai** — bất kỳ ai cũng POST được vào nó. Khai `input: CreateMemberDto` là tự lừa mình: TypeScript biến mất lúc chạy.
2. **Kiểm quyền trong chính action**, không dựa vào việc "màn hình này chỉ super admin mới vào được". Middleware và layout chặn *đường đi*, không chặn *lời gọi*.
3. **Thông báo lỗi là tiếng Việt, hướng người dùng làm gì tiếp** ("Email này đã được sử dụng." chứ không phải "duplicate key value violates unique constraint").
4. **`revalidatePath` đúng đường dẫn vừa đổi** — quên là bảng trên màn hình vẫn hiện dữ liệu cũ dù ghi đã thành công. Kiểu hỏng im lặng.

---

## Phân quyền — ba lớp, và vai trò đọc từ database

Hệ thống có **đúng hai vai trò, không phân cấp bậc**:

```typescript
export const userRole = pgEnum("user_role", ["super_admin", "admin"]);
```

- `admin` — quản lý nội dung.
- `super_admin` — thêm quyền quản lý thành viên (`/admin/thanh-vien`).

Vì chỉ có hai vai trò rời rạc, so `===` ở đây là **đúng** (`me.role !== "super_admin"`). Đừng dựng bảng bậc số. Khi nào có vai trò thứ ba nằm giữa, hãy quay lại sửa mục này trước khi viết code.

### Ba lớp gác cổng — cả ba đều cần

| Lớp | Ở đâu | Chặn gì |
| :-- | :-- | :-- |
| **Edge middleware** | `middleware.ts` + `authConfig.callbacks.authorized` | Chưa đăng nhập mà mở `/admin/*` → đá về `/admin/login`. Rẻ, chạy trước mọi thứ |
| **Layout `(protected)`** | `app/admin/(protected)/layout.tsx` → `getSessionState()` | Cookie còn hạn nhưng tài khoản đã bị **khóa/xóa** → `/admin/logout?reason=…` |
| **Server action** | `requireUser()` / `requireSuperAdmin()` | Gọi thẳng action mà không qua giao diện |

> 🚨 **Vì sao không tin `role` trong token.** `role` được nhúng vào JWT lúc đăng nhập và phiên kéo dài 8 giờ. Nếu chỉ đọc token, việc hạ quyền hay khóa tài khoản **không có hiệu lực cho tới khi token hết hạn** — người vừa bị khóa vẫn thao tác thoải mái gần một ngày làm việc. Vì vậy `getSessionState()` đối chiếu lại với database ở **mỗi request**, và bọc `cache()` để nhiều lần gọi trong cùng một request chỉ tốn một truy vấn.

```typescript
export const getSessionState = cache(async (): Promise<SessionState> => { … });
```

`SessionState` là union ba nhánh — `anonymous` / `revoked` / `active` — chứ không phải `User | null`. Phân biệt được "chưa đăng nhập" với "phiên bị thu hồi" là điều kiện để báo cho người dùng biết vì sao họ bị đăng xuất.

### Luật chống tự khóa hệ thống — dev không được bỏ

Ba luật cài trong `lib/admin/users-actions.ts`:

1. **Không tự hạ quyền / tự khóa / tự xóa tài khoản đang đăng nhập.**
2. **Luôn phải còn ít nhất một `super_admin` đang `active`** — `ensureAnotherActiveSuperAdmin()` chạy trước mọi thao tác hạ quyền, khóa, xóa.
3. Chỉ `super_admin` mới gọi được nhóm action này.

Bỏ luật 2 là để ngỏ khả năng **không ai còn vào được khu quản trị nữa** — cách sửa duy nhất khi đó là chạy SQL tay trên production.

> ⚠️ **Hạn chế đã biết:** phép kiểm 2 hiện chạy ở tầng ứng dụng, không có transaction + khóa hàng. Hai super admin bấm hạ quyền lẫn nhau đúng cùng thời điểm về lý thuyết lọt được cả hai. Với quy mô vài tài khoản nội bộ, đây là đánh đổi chấp nhận được — nhưng khi thêm luồng ghi đồng thời khác, hãy bọc lại bằng `db.transaction` + `SELECT … FOR UPDATE`.

---

## Mật khẩu & dữ liệu nhạy cảm

```typescript
const BCRYPT_ROUNDS = 12;                                   // hằng số, không rải số 12 khắp nơi
```

- **Băm bằng `bcryptjs`, 12 vòng.** Không tự nghĩ ra thuật toán băm, không SHA-256 trần.
- **So sánh cả khi không tìm thấy email** — dùng hash giả để thời gian phản hồi không tiết lộ email nào tồn tại:

```typescript
const hash = found?.passwordHash ?? "$2a$10$invalidinvalidinvalid…";
const ok = await bcrypt.compare(parsed.data.password, hash);
if (!found || !ok || found.status !== "active") return null;   // một thông báo chung cho mọi lý do
```

- **`passwordHash` không bao giờ rời khỏi server.** Kiểu trả về của danh sách thành viên là `Omit<User, "passwordHash">`, và truy vấn liệt kê **cột tường minh** thay vì `select()` trần:

```typescript
db.select({ id: users.id, name: users.name, email: users.email, role: users.role, … }).from(users)
```

`select()` không tham số lấy **mọi cột** — thêm một cột nhạy cảm vào schema là nó tự động chảy ra client mà không ai sửa dòng nào.

- **Tuyệt đối không log:** mật khẩu, `passwordHash`, `AUTH_SECRET`, chuỗi `DATABASE_URL`, token phiên.

---

## Truy cập dữ liệu — Drizzle

```typescript
const [existing] = await db
  .select({ id: users.id })
  .from(users)
  .where(eq(users.email, data.email))
  .limit(1);
```

Bốn thói quen:

1. **Liệt kê cột tường minh** (lý do ở mục trên).
2. **`.limit(1)` + destructure `[row]`** khi chỉ cần một hàng — đừng lấy cả bảng rồi `find()` trong JS.
3. **Toán tử từ `drizzle-orm`** (`eq`, `and`, `ne`, `asc`) — không nối chuỗi SQL. Khi buộc phải viết SQL thật, dùng template `sql` và tham số hóa qua `${}`; không `sql.raw()` với dữ liệu người dùng.
4. **`updatedAt: new Date()` trong mọi `update`** — `defaultNow()` chỉ chạy lúc insert.

### `lib/db/index.ts` — ba điều phải biết trước khi sửa

- **`db` là `Proxy` khởi tạo trễ.** `DATABASE_URL` chỉ được đọc khi thực sự truy vấn, để `next build` không đổ vỡ khi biến môi trường chưa có. Đừng thay bằng `export const db = drizzle(...)` ở mức module.
- **Driver tự chọn theo connection string**: chứa `neon.tech` → HTTP driver của Neon (production); còn lại → `postgres-js` (Docker local, cổng **5433**). Không hardcode driver.
- **Script chạy một lần phải gọi `closeDb()`** (xem `scripts/seed-admin.ts`), nếu không tiến trình treo. Server web thì không gọi.

> ⚠️ **`lib/db` và `bcryptjs` không chạy được trên Edge runtime.** Đó là lý do `lib/auth/config.ts` tách riêng khỏi `lib/auth/index.ts`: `config.ts` (middleware nạp) **không import db, không import bcrypt**; provider Credentials gắn ở `index.ts` chạy trên Node runtime. Thêm một `import { db }` vào `config.ts` là hỏng build middleware — thông báo lỗi rất khó lần ra.

---

## Validate đầu vào — Zod

Mọi đầu vào từ ngoài đi qua Zod. Schema đặt cạnh action, **một nguồn chân lý, không khai báo hai lần**:

```typescript
const passwordRule = z
  .string()
  .min(8, "Mật khẩu phải từ 8 ký tự trở lên.")
  .max(72, "Mật khẩu tối đa 72 ký tự.");          // bcrypt cắt cụt sau 72 byte
```

- **Thông báo lỗi viết ngay trong schema, bằng tiếng Việt** — để chỗ hiển thị chỉ việc lấy `e.issues[0].message`.
- **Chuẩn hóa trong schema**, không rải ra ngoài: `.trim()`, `.toLowerCase()` cho email. Nhờ vậy `a@x.vn` và ` A@X.VN ` không tạo hai tài khoản.
- **Type suy ra từ schema** khi cần: `type CreateInput = z.infer<typeof createSchema>` — không khai báo `interface` song song.
- Enum của Zod phải khớp enum của Drizzle (`z.enum(["super_admin", "admin"])` ↔ `pgEnum`). Đổi một bên nhớ đổi bên kia.

---

## Kiểu dữ liệu — suy ra từ schema, đừng gõ lại

```typescript
export type User = typeof users.$inferSelect;
export type UserRole = (typeof userRole.enumValues)[number];
export type MemberRow = Omit<User, "passwordHash">;
```

Không viết `type User = { id: string; name: string; … }` bằng tay. Thêm cột vào bảng mà quên cập nhật type thủ công là lỗi chỉ lộ ra lúc chạy.

### Ngày giờ

- DB: `timestamp("created_at", { withTimezone: true })` — **luôn có timezone**.
- Hiển thị: định dạng ở **tầng giao diện**, bằng `Intl`, khởi tạo formatter **một lần ngoài component**:

```typescript
const dateFormatter = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" });
```

Server action trả về `Date`. Không có hàm nào ở tầng dữ liệu trả về chuỗi `"17/08/2026 09:30"` — chuỗi đó không so sánh được, không sắp xếp được, và sẽ có người parse ngược nó.

---

## Server Component là mặc định — `"use client"` là ngoại lệ

- Không gõ `"use client"` theo phản xạ. Chỉ thêm khi component thật sự cần `useState`/`useEffect`/sự kiện DOM/thư viện chỉ chạy ở trình duyệt.
- **Đẩy `"use client"` xuống càng sâu càng tốt**: `page.tsx` là server component lấy dữ liệu, chỉ phần bảng tương tác mới là client (`MembersTable`).
- **Trang đọc database phải `export const dynamic = "force-dynamic"`**, nếu không Next tĩnh hóa lúc build và màn hình đóng băng ở dữ liệu cũ.
- **Thư viện nặng / chỉ chạy ở trình duyệt thì nạp động**:

```tsx
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });   // three.js — không SSR được
```

- Client component gọi server action qua `useTransition`, không tự dựng `fetch`:

```tsx
startTransition(async () => {
  const res = await updateMember(payload);
  if (!res.ok) return setError(res.error);
  router.refresh();
});
```

---

## Nội dung — tập trung ở `lib/data.ts`

Toàn bộ chữ của trang công khai (module, bước triển khai, cảm nhận khách hàng, menu) nằm ở `lib/data.ts`. Component chỉ `map` ra JSX.

Sửa một dòng mô tả **không được** đụng vào file component. Viết chữ cứng vào JSX là biến việc sửa nội dung thành việc của lập trình viên — đúng cái mà cấu trúc này đang tránh.

---

## Icon

- **Khu `/admin`: `@tabler/icons-react`**, một bộ duy nhất. Không emoji làm nút, không tự vẽ `<svg>`, không trộn `@mui/icons-material` vào cùng một thanh công cụ (hai phong cách nét vẽ cạnh nhau).
- **Icon chọn theo tên trong cấu hình** phải đi qua bản đồ tường minh, không tra động bằng chuỗi:

```typescript
const icons = { dashboard: IconLayoutDashboard, layout: IconLayoutGrid, article: IconArticle, users: IconUsers } as const;
```

Nhờ `as const` + union type ở `MenuItem["icon"]`, gõ sai tên là **lỗi biên dịch** chứ không phải icon rơi về mặc định trong im lặng.

- **Emoji chỉ dùng trong NỘI DUNG** trang công khai (`lib/data.ts`: `icon: "🤝"`) — ở đó nó là hình minh họa của chữ, không phải phần tử điều khiển. Không dùng emoji làm nút bấm ở bất kỳ đâu: mỗi hệ điều hành vẽ một kiểu, không nhận `color`/`size`, và trình đọc màn hình đọc thành tên của nó giữa câu.

---

## Đặt tên

- **Code bằng tiếng Anh** (biến, hàm, file, cột DB). **Chuỗi hiển thị bằng tiếng Việt.**
- **Route segment tiếng Việt không dấu**, khớp với nhãn trên menu: `/admin/thanh-vien`, `/admin/bai-viet`, `/admin/giao-dien`.
- File component: `PascalCase.tsx`. File tiện ích/tầng dữ liệu: `kebab-case.ts`. Nhóm server action: `<domain>-actions.ts`.
- Cột DB `snake_case`, thuộc tính TypeScript `camelCase` — Drizzle nối hai bên: `passwordHash: text("password_hash")`.
- Import nội bộ dùng alias `@/` (`@/lib/db`), không `../../..`.

---

## Comment

Ưu tiên code tự diễn giải. Comment để giải thích **tại sao**, không phải **code làm gì**.

Không tốt:

```typescript
// tăng i lên 1
i++;
```

Tốt (lấy từ chính codebase):

```typescript
// So sánh kể cả khi không tìm thấy user để tránh lộ email nào tồn tại qua thời gian phản hồi.
const hash = found?.passwordHash ?? "$2a$10$invalid…";
```

```typescript
// Postgres thường (Docker local). `max: 1` tránh cạn connection khi Next hot-reload.
localClient = postgres(connectionString, { max: 1 });
```

Dùng JSDoc `/** … */` cho hàm export ở `lib/**` — trình soạn thảo hiện nó ngay tại chỗ gọi.

---

## Hằng số

Không dùng "magic number" — đặt tên cho các ngưỡng nghiệp vụ.

Không tốt:

```typescript
await bcrypt.hash(password, 12);
session: { maxAge: 28800, updateAge: 3600 }
```

Tốt:

```typescript
const BCRYPT_ROUNDS = 12;
export const SIDEBAR_WIDTH = 270;

session: { strategy: "jwt", maxAge: 60 * 60 * 8, updateAge: 60 * 60 },   // 8 giờ, gia hạn mỗi giờ
```

---

## Xử lý Lỗi

Không bao giờ nuốt lỗi im lặng, và không để lỗi kỹ thuật lọt nguyên văn ra màn hình người dùng.

Không tốt:

```typescript
try { await createMember(input); } catch {}
```

Tốt — dịch sang thông báo tiếng Việt, giữ nguyên lỗi Zod chi tiết:

```typescript
function fail(e: unknown): ActionResult {
  const message = e instanceof Error ? e.message : "Đã có lỗi xảy ra.";
  return { ok: false, error: message };
}
```

- **Lỗi lường trước** (email trùng, còn một super admin) → `return { ok: false, error: "…" }`. Đó là dữ liệu, không phải sự cố.
- **Lỗi không lường trước** (mất kết nối DB) → để nó ném lên, Next hiển thị error boundary.
- **Lỗi thiếu cấu hình phải nổ sớm và nói rõ thiếu gì**:

```typescript
throw new Error("Thiếu SEED_ADMIN_NAME / SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD trong .env");
```

---

## Biến môi trường

- Mọi biến mới **phải được thêm vào `.env.example`** kèm một dòng giải thích. Thiếu bước này là người tiếp theo clone repo về không chạy nổi.
- **Chỉ đọc `process.env` ở tầng server** (`lib/db`, `lib/auth`, `scripts/`). Client component đọc bí mật là bí mật vào bundle.
- Biến bắt buộc thì kiểm ngay lúc dùng và ném lỗi có tên biến, không `!` cho qua:

```typescript
if (!connectionString) throw new Error("Thiếu biến môi trường DATABASE_URL.");
```

---

## Code Bất đồng bộ

Luôn:
- Dùng `async/await`; tránh lồng chuỗi `.then()`.
- Chạy song song các tác vụ độc lập bằng `Promise.all` / `Promise.allSettled`.
- Ở client, bọc lời gọi server action trong `useTransition` để có trạng thái `pending` cho nút bấm.

Tránh:
- Việc nặng CPU trong request. Dự án **không có worker** — nếu xuất hiện nhu cầu xử lý nặng (nén ảnh hàng loạt, sinh nội dung AI dài), đó là lúc bàn kiến trúc, **không phải** lúc nhét vào một server action.

---

## Hiệu năng

Không tối ưu quá sớm. Trình tự đúng: **đo lường trước → rồi mới tối ưu điểm nghẽn**.

Ba thứ **không phải tối ưu sớm** — làm ngay từ đầu:

| Thứ | Vì sao không hoãn được |
| :-- | :-- |
| `cache()` quanh `getSessionState()` | Layout + page + action cùng gọi trong một request; thiếu nó là 3 truy vấn cho mỗi lần tải màn hình |
| `dynamic(..., { ssr: false })` cho `HeroScene` | `three` không SSR được và nặng — nhét vào bundle đầu là trang chủ tải chậm hẳn |
| Liệt kê cột tường minh trong `select` | Vừa là bảo mật, vừa là băng thông |

Ngược lại, đây là những thứ **đừng làm** ở quy mô hiện tại: cache tầng ứng dụng, read replica, denormalize, hàng đợi.

---

## Quy tắc khi Sinh code (cho AI hoặc người)

Code mới phải:
- Đúng vùng: Tailwind cho trang công khai, MUI cho `/admin` — không trộn.
- Server Component là mặc định; `"use client"` chỉ khi thật sự cần và đẩy xuống sâu nhất có thể.
- Client component **không import `lib/db`**; mọi thao tác dữ liệu qua server action.
- Server action theo đủ bốn nhịp: **kiểm quyền → validate Zod (`input: unknown`) → thao tác → `revalidatePath`**.
- Kiểm quyền lấy vai trò từ **database** (`requireUser` / `requireSuperAdmin`), không tin `role` trong token.
- Không phá ba luật chống tự khóa hệ thống ở `users-actions.ts`.
- Không để `passwordHash` (hay cột nhạy cảm khác) lọt ra client — `select` liệt kê cột tường minh.
- Type suy ra từ Drizzle schema, không gõ lại bằng tay.
- Trang đọc database khai `export const dynamic = "force-dynamic"`.
- Thông báo lỗi tiếng Việt, hướng người dùng làm gì tiếp.
- Không log mật khẩu, hash, `AUTH_SECRET`, `DATABASE_URL`.
- Biến môi trường mới có mặt trong `.env.example`.

Không sinh ra code chạy được nhưng **không thể bảo trì**.

---

## Lệnh thường dùng

```bash
npm run dev          # http://localhost:3000  ·  /admin/login
npm run build        # kiểm luôn lỗi type
npm run lint
npm run db:up        # Postgres trong Docker, cổng 5433
npm run db:push      # đồng bộ schema (drizzle-kit push)
npm run db:studio    # xem dữ liệu
npm run db:seed      # tạo Super Admin đầu tiên từ SEED_ADMIN_*
```

Đổi `lib/db/schema.ts` xong **phải chạy `npm run db:push`** — schema và database lệch nhau là lỗi lúc chạy, không phải lỗi biên dịch.

---

## Tài liệu liên quan

- [README](../../README.md) — cấu trúc thư mục, thiết lập môi trường, Postgres local (**nguồn chân lý về lệnh & cấu hình**)
- `.env.example` — danh sách biến môi trường
- [naming-convention](./naming-convention.md) · [dev-setup](./dev-setup.md) — *chưa có, viết khi cần*

> ⚠️ Các file còn lại trong `docs/` (`architecture/tech-stack.md`, `specs/**`) được **copy từ dự án
> NH-Quote/VuaHang** và mô tả một hệ thống khác hẳn (NestJS · BullMQ · Redis · Puppeteer). Đừng coi
> chúng là mô tả của repo này cho tới khi được viết lại.
