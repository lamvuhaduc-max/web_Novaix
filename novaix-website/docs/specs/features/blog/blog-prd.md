# PRD — Bài viết & Trưng bày nội dung trên website OAlpha

> **Domain gốc:** [`content-article-domain.md`](../../domains/content-article-domain.md)
> **Mã FR:** `FR-B01`…`FR-B14` (nhóm B — Blog)
> **Trạng thái:** 📝 **chưa triển khai** — đang chờ duyệt RFC.

---

# 1. Vấn đề (Problem Statement)

## 1.1 Website không kể được chuyện của chính nó

OAlpha bán **CRM/ERP** — thứ khách doanh nghiệp cân nhắc hàng tháng trời trước khi ký, và hỏi rất
nhiều: triển khai mất bao lâu, dữ liệu Excel cũ chuyển sang thế nào, ERP khác phần mềm kế toán ở đâu,
chi phí thật gồm những gì, có phải đổi lại quy trình đang chạy không.

Website hiện **không có một dòng nào trả lời**. Trang chủ nói được "chúng tôi có 9 module" nhưng
không nói được "đây là cách một chuỗi bán lẻ 12 cửa hàng chuyển từ Excel sang trong 6 tuần". Sale
gõ tay lại cùng một đoạn cho từng khách qua Zalo, và không có link nào để gửi.

Với sản phẩm có chu kỳ mua dài, nội dung **là** kênh bán hàng — không phải trang trí.

## 1.2 Toàn bộ nội dung đang nằm trong mã nguồn

`lib/data.ts` giữ hết chữ của trang chủ. Sửa một câu mô tả module phải: sửa mã → commit → build →
deploy → chờ. Không ai ngoài lập trình viên đổi được.

Hệ quả thật, không phải giả định: mọi thay đổi chữ nghĩa đều xếp hàng chờ một người, và những sửa đổi
nhỏ (sai chính tả, đổi số điện thoại, cập nhật một con số) thì **không ai buồn đề nghị**.

## 1.3 Khu quản trị đang hứa hai tính năng chưa tồn tại

Menu `/admin` đã có **"Bài viết"** và **"Giao diện trang chủ"** (`lib/admin/menu.ts`), bấm vào ra màn
`ComingSoon`. Màn đó **nói thật** — không giả vờ lưu rồi nuốt dữ liệu — nhưng nó là một lời hứa đang
treo trên màn hình mỗi ngày.

## 1.4 Ai bị ảnh hưởng

| Nhóm | Chịu gì |
| :-- | :-- |
| **Khách doanh nghiệp** | Không tìm được câu trả lời, phải nhắn hỏi hoặc rời trang sang đối thủ có blog |
| **Sale** | Trả lời thủ công cùng một câu hỏi mỗi ngày; không có link để gửi |
| **Marketing** | Không có kênh nội dung nào; không có gì để chạy SEO hay đăng lên LinkedIn |
| **Admin** | Không tự đổi được nội dung; nhìn hai mục menu "Sắp có" mỗi lần đăng nhập |
| **Lập trình viên** | Trở thành người gác cổng cho mọi thay đổi chữ nghĩa |

## 1.5 Vì sao cần giải quyết bây giờ

- Website đã chạy thật và có khách vãng lai vào — nhưng không có gì giữ chân họ ngoài một trang giới
  thiệu đọc hết trong 90 giây.
- Khu quản trị, xác thực, phân quyền, kết nối database **đã xong và đang chạy**. Phần khó nhất của
  hạ tầng đã trả tiền rồi; đây là lúc dùng nó.

---

# 2. Mục tiêu (Goals)

| # | Mục tiêu | Đo bằng |
| :-- | :-- | :-- |
| **G1** | Admin tự đăng/sửa/gỡ nội dung **không cần deploy** | Đổi một bài, hiện trên web ở lượt tải kế tiếp — **0** lần build |
| **G2** | Nội dung **ra tới khách được** | Có tuyến công khai + dải trang chủ + trang đọc; kiểm bằng khách vãng lai (chưa đăng nhập, ẩn danh) |
| **G3** | Bài dài đọc được | Trang đọc có chỉ mục trái, nhảy đúng đề mục, link `#neo` gửi được cho người khác |
| **G4** | Bài viết **tìm được trên Google** | `sitemap.xml` có bài; dán link lên Zalo/LinkedIn ra đúng ảnh + tiêu đề |
| **G5** | Người soạn **không cần biết SEO** vẫn viết được bài đúng chuẩn cơ bản | Khối gợi ý tại chỗ, nói rõ *vì sao* + *sửa thế nào*; **không chặn đăng** |
| **G6** | Không mở lỗ bảo mật mới | Nội dung làm sạch ở máy chủ lúc ghi; có bộ test XSS đi kèm và xanh |
| **G7** | Hai mục menu "Sắp có" **biến mất** | `comingSoon` được gỡ khỏi `lib/admin/menu.ts` vì tính năng đã thật |

---

# 3. Không nằm trong phạm vi (Non-Goals)

Nêu rõ để **không phình việc**:

- ❌ **Thẻ sản phẩm trong bài** ("mua ngay"). Website này là trang giới thiệu công ty — **không có
  danh mục sản phẩm, không có giá, không có giỏ hàng**. Muốn dẫn khách đi tiếp thì dùng liên kết
  thường hoặc khối CTA có sẵn.
- ❌ **Bình luận / đánh giá** dưới bài.
- ❌ **Đa tác giả + luồng duyệt bài.** `admin` trở lên soạn và đăng thẳng.
- ❌ **Lịch sử phiên bản / hoàn tác về bản cũ.**
- ❌ **Đặt lịch đăng** (`published_at` tương lai + cron) — repo chưa có chỗ chạy định kỳ.
- ❌ **Đa ngôn ngữ.** Toàn bộ tiếng Việt.
- ❌ **Chuyển hướng 301 khi đổi slug.** Chỉ cảnh báo trên giao diện.
- ❌ **Ô tìm kiếm toàn văn.** Vài chục bài thì lọc theo danh mục là đủ.
- ❌ **Đưa `stats` / `modules` / `steps` của trang chủ vào bảng `articles`.** Đó là cấu trúc trang marketing,
  không phải bài viết — ranh giới ở [Domain §4.8](../../domains/content-article-domain.md#48-ranh-giới-với-nội-dung-trang-chủ-fr-b14).

---

# 4. Người dùng mục tiêu

| Vai trò | Dùng để làm gì | Thấy gì |
| :-- | :-- | :-- |
| `super_admin` | Mọi thứ của `admin`, cộng quản lý thành viên (đã có) | Toàn bộ menu |
| `admin` | Soạn, sửa, đăng, xóa bài; quản lý danh mục; cấu hình hai dải trang chủ | Menu **Bài viết** + **Giao diện trang chủ** |
| **Khách vãng lai** (chưa đăng nhập) | Đọc mọi bài đã đăng | Mục **Bài viết** trên thanh điều hướng + hai dải trang chủ + trang đọc |

Không có vai trò thứ tư. `admin` được toàn quyền nội dung là đúng định nghĩa đã ghi trong
`lib/db/schema.ts`: *"super_admin toàn quyền, admin chỉ nội dung"*.

---

# 5. Hành trình người dùng

## 5.1 Admin soạn một bài hướng dẫn

```
Mở /admin/bai-viet
  → Bấm "Thêm bài viết"
  → Gõ tiêu đề "Triển khai ERP mất bao lâu"   (slug tự sinh: trien-khai-erp-mat-bao-lau)
  → Chọn danh mục "Kiến thức"
  → Nhập từ khóa chính "triển khai ERP"       → khối Soi SEO bắt đầu chấm gợi ý
  → Soạn nội dung, chèn 2 ảnh minh họa
  → Khối bên phải nhắc: "Chưa có mô tả ngắn — Google sẽ tự cắt một đoạn bất kỳ trong bài"
  → Viết mô tả ngắn, thêm ảnh bìa
  → Bấm Lưu     → bài ở trạng thái NHÁP, chưa ai thấy
  → Bấm Xem trước
  → Bấm Đăng    → bài ra web ở lượt tải kế tiếp
```

## 5.2 Admin bày bài lên trang chủ

```
Mở /admin/giao-dien → tab "Dải bài viết"
  → Dải 1: bật · tiêu đề "Về OAlpha"   · nguồn = Danh mục [Giới thiệu, Chính sách] · 6 bài
  → Dải 2: bật · tiêu đề "Kiến thức"   · nguồn = Chọn tay [4 bài đã xếp thứ tự]
  → Lưu  → trang chủ hiện hai dải
```

## 5.3 Khách đọc

```
Vào trang chủ → thấy dải "Kiến thức"
  → Bấm thẻ "Triển khai ERP mất bao lâu"
  → Trang đọc: chỉ mục bên trái, nội dung ở giữa
  → Bấm mục "Giai đoạn khảo sát" → trang cuộn tới đúng đoạn
  → Copy link kèm #giai-doan-khao-sat, gửi Zalo → người kia mở ra đúng đoạn đó
  → Đọc xong thấy 4 bài liên quan ở chân trang
```

---

# 6. Yêu cầu chức năng (Functional Requirements)

## Quản trị

| Mã | Yêu cầu |
| :-- | :-- |
| **FR-B01** | Quản lý bài viết: tạo · sửa · **xóa mềm** · khôi phục từ thùng rác. Danh sách có lọc theo danh mục, trạng thái, từ khóa, **khoảng ngày**; có phân trang và sắp xếp theo cột. |
| **FR-B02** | Quản lý **danh mục bài viết** ở một **tab riêng** cùng màn: tạo · sửa · xóa · sắp thứ tự · ẩn/hiện. **Không xóa được danh mục còn bài.** |
| **FR-B03** | Soạn thảo **rich-text**: đề mục, in đậm/nghiêng, danh sách, bảng, liên kết, trích dẫn, và **chèn ảnh** (upload lên kho ảnh, **không** nhúng base64). |
| **FR-B04** | **Mục lục** tự rút từ đề mục H2/H3 khi lưu; mỗi đề mục được gắn `id` neo **ổn định**. |
| **FR-B05** | **Soi SEO khi soạn**: khối gợi ý ở cột phải, chạy **tại chỗ trong trình duyệt** theo từng ký tự gõ vào, theo **từ khóa chính** người soạn nhập. Mỗi gợi ý nói *hiện trạng đo được* + *vì sao* + *sửa thế nào*. 🔴 **KHÔNG chặn đăng, KHÔNG chấm điểm đúng/sai, KHÔNG tự sửa bài.** Ngưỡng chỉnh được và **tắt được từng luật** — bài chính sách 180 chữ là đúng độ dài của nó. |
| **FR-B06** | **Ba trạng thái**: `draft` · `published` · `hidden`. Chỉ `published` ra công khai. |
| **FR-B10** | Mỗi bài có **ảnh bìa**, **mô tả ngắn** (dùng cho thẻ và `<meta description>`) và **slug sửa được** kèm cảnh báo link cũ sẽ chết. |
| **FR-B11** | Mọi thao tác tạo/sửa/đăng/ẩn/xóa/khôi phục ghi **nhật ký** (ai, lúc nào, bài nào). |
| **FR-B13** | **Upload ảnh** đi qua một đường duy nhất lên **Cloudflare R2**; kiểm kiểu tệp theo nội dung thật và giới hạn dung lượng ở máy chủ. |

## Công khai

| Mã | Yêu cầu |
| :-- | :-- |
| **FR-B07** | **Hai dải bài viết** trên trang chủ, cấu hình độc lập: bật/tắt · tiêu đề dải · **nguồn bài** (theo **danh mục** hoặc **chọn tay từng bài**) · số lượng · thứ tự. Cấu hình nằm ở `/admin/giao-dien`. |
| **FR-B08** | **Trang đọc**: chỉ mục bên **trái** (dính khi cuộn, làm nổi mục đang đọc), nội dung ở **giữa**, **4 bài liên quan** ở chân. Trên điện thoại chỉ mục thu thành một nút mở ra. |
| **FR-B09** | **Trang danh sách** `/bai-viet` có lọc theo danh mục + phân trang, và một **mục "Bài viết"** trên thanh điều hướng. |
| **FR-B12** | **SEO**: `sitemap.xml` (động, chỉ bài đã đăng) · **JSON-LD** `Article` + `BreadcrumbList` ở trang đọc · **Open Graph + Twitter Card**. Không thêm ô nhập SEO riêng — suy từ `title` + `excerpt` + `cover_image`. |

## Dọn dẹp

| Mã | Yêu cầu |
| :-- | :-- |
| **FR-B14** | **Đưa nội dung dài ra khỏi mã nguồn**: các trang chữ dài (*Giới thiệu OAlpha*, *Chính sách bảo mật*, *Điều khoản dịch vụ*) thành bài viết trong danh mục *Giới thiệu* hoặc *Chính sách*. `stats`/`modules`/`steps`/`nav` **ở nguyên** trong `lib/data.ts`. Làm ở **cuối** đợt. |

---

# 7. Quy tắc nghiệp vụ

> Bản đầy đủ ở [Domain §7](../../domains/content-article-domain.md#7-business-rules). Đây là những
> quy tắc PRD muốn nhấn mạnh vì chúng ảnh hưởng tới **trải nghiệm**, không chỉ dữ liệu.

1. **Bài chưa đăng thì gõ đúng địa chỉ cũng không xem được.** `draft`/`hidden` → 404 ở tuyến công
   khai. Không có "link bí mật xem trước" trong đợt này.
2. **Ẩn một danh mục là ẩn cả nhóm.** Một công tắc, một chỗ — để lúc gấp có cách gỡ nhanh.
3. **Ngày đăng đóng dấu một lần.** Ẩn rồi hiện lại **không** làm bài nhảy lên đầu như bài mới.
4. **Xóa là xóa mềm, có thùng rác.** Nội dung dài mất đi không dựng lại được từ trí nhớ.
5. **Nội dung lưu trong DB đã được làm sạch sẵn**, không làm sạch lúc đọc. Làm sạch lúc đọc nghĩa là
   mỗi tuyến đọc phải nhớ gọi — và tuyến nào quên là một lỗ XSS.
6. **Bài viết là nội dung công khai.** Khách vãng lai đọc được — đó là điểm của tính năng.
7. **Soi SEO là gợi ý, không phải cửa kiểm.** Không bao giờ chặn Lưu hay Đăng.

---

# 8. Chỉ số thành công

| Chỉ số | Mốc |
| :-- | :-- |
| Số lần deploy để đổi/thêm nội dung | **0** (hiện tại: mỗi lần đổi = 1 deploy) |
| Nội dung soạn xong → khách thấy | **Lượt tải kế tiếp** (hiện tại: không có kênh nào) |
| Bài mới xuất hiện trong `sitemap.xml` | **Ngay khi đăng** |
| Trang đọc trên điện thoại 375px | **Không cuộn ngang** — đo `scrollWidth > clientWidth`, không tin mắt |
| Bộ test làm sạch HTML | **Xanh**, gồm ca `<script>`, `onerror`, `javascript:`, `data:`, `//evil.com` |
| Mục menu gắn `comingSoon` | **0** cho *Bài viết* và *Giao diện trang chủ* |

---

# 9. Ràng buộc

**Kỹ thuật**

- **Next.js 14 App Router, một ứng dụng duy nhất.** Không dựng REST API cho phân hệ này: trang công
  khai đọc DB thẳng trong Server Component, màn quản trị ghi qua **server action**
  ([Domain §4.1](../../domains/content-article-domain.md#41-không-dựng-tầng-api--dùng-thẳng-server-component--server-action)).
- **Đặt tên bảng/cột bằng tiếng Anh `snake_case`**, khóa chính `uuid`, `timestamp` luôn
  `withTimezone` — bám theo `lib/db/schema.ts` đang có.
- **Không trộn hệ giao diện**: `/admin` dùng MUI + `@tabler/icons-react`; trang công khai dùng
  Tailwind + token nền tối trong `app/globals.css`.
- Client component **không import `lib/db`**. Mọi ghi/đọc qua server action đã gắn kiểm quyền.
- Phân quyền dùng lại `requireUser()` — **không viết lớp kiểm quyền thứ hai**.

**Vận hành**

- Ảnh lưu trên **Cloudflare R2**; `.env.example` đã khai `R2_*` nhưng **chưa có code nào dùng** —
  đợt này là lần đầu, phải kiểm lại khóa và quyền bucket trước khi tin nó chạy.
- Database local chạy Docker cổng **5433**; production là **Neon**. Driver tự chọn theo connection
  string — không hardcode.

**Pháp lý**

- ⚠️ Giấy phép của trình soạn thảo phải được xác nhận **trước khi** viết dòng code thứ hai — xem R1.

---

# 10. Rủi ro

| # | Rủi ro | Mức | Cách giảm |
| :-- | :-- | :-- | :-- |
| **R1** | **Giấy phép trình soạn thảo.** TinyMCE 7 đã đổi sang GPLv2+ (copyleft) cho bản self-host; v6 còn MIT nhưng không nhận tính năng mới. | 🟠 Vừa | Mặc định chọn **Tiptap (MIT)** — sạch giấy phép, hợp React 18. Nếu chọn TinyMCE: **mở `LICENSE.txt` trong gói npm và đọc ngay sau khi cài**, không tin trí nhớ. |
| **R2** | **XSS lưu trữ qua thân bài.** Đây là bề mặt tấn công lớn nhất website này từng có: người soạn gõ HTML, khách vãng lai xem. | 🔴 Cao | `sanitize-html` ở **máy chủ lúc ghi**, allowlist khai theo hướng **cấm sạch rồi mở từng thứ** (`'*': []`). Bộ test XSS viết **cùng lúc** với hàm, không viết sau. |
| **R3** | **Ảnh upload thành đường lên máy chủ.** Kiểm kiểu tệp bằng phần mở rộng là không kiểm gì cả. | 🟠 Vừa | Kiểm **magic bytes**, giới hạn dung lượng, **tên tệp sinh ở máy chủ**, bucket chỉ phục vụ ảnh tĩnh. |
| **R4** | **JSON-LD thoát chuỗi sai.** Tiêu đề chứa `</script>` là thoát khỏi khối JSON-LD và chạy được mã — trên **mọi** trang đọc. | 🟠 Vừa | Thoát `<` khi tuần tự hóa; có ca test riêng cho `</script>` trong tiêu đề. |
| **R5** | **`sitemap.xml` lộ bài nháp** → Google vào URL trả 404, và lộ slug thứ chưa công bố. | 🟠 Vừa | Chỉ liệt kê `status='published'`; có ca test. |
| **R6** | **Slug đổi làm chết link đã gửi.** | 🟠 Vừa | Không tự đổi slug khi sửa tiêu đề bài **đã đăng**; cảnh báo rõ khi người dùng cố ý đổi. |
| **R7** | **Cấu hình dải là jsonb → dữ liệu cũ không khớp schema mới** sau vài lần đổi hình dạng. | 🟠 Vừa | Zod parse ở **cả** đường ghi lẫn đường đọc; đọc hỏng thì trả về cấu hình mặc định và ghi cảnh báo, **không** làm vỡ trang chủ. |
| **R8** | **Nội dung dài kéo chậm truy vấn danh sách.** | 🟢 Thấp | Danh sách **không** `SELECT content_html`. Chỉ trang đọc mới lấy thân bài. |
| **R9** | **Cache của Next giữ bài cũ** sau khi Admin sửa. | 🟠 Vừa | `revalidatePath` đúng đường dẫn ở **mọi** action ghi: `/admin/bai-viet`, `/bai-viet`, `/bai-viet/[slug]`, `/`. Quên là "sửa xong mà web không đổi" — kiểu hỏng im lặng khó chịu nhất. |
| **R10** | **Khối Soi SEO bị hiểu thành bảng chấm điểm**, người soạn nhồi chữ cho qua cửa. | 🟢 Thấp | Không hiện điểm số lớn, không màu đỏ, không chặn đăng. Chữ trên giao diện là *"gợi ý"*, không phải *"lỗi"*. |

---

# 11. Phụ thuộc

**Trong hệ thống** (đã có, dùng lại — **không viết bản thứ hai**)

- `lib/auth/session.ts` — `requireUser()`, `getSessionState()`.
- `lib/db` — kết nối Drizzle, Proxy khởi tạo trễ.
- `components/admin/` — `AdminShell`, `PageHeader`, `ComingSoon` (sẽ bớt việc).
- `lib/admin/theme.ts` — theme MUI; `lib/admin/menu.ts` — menu.
- `app/globals.css` — token màu, `.btn`, `.kicker` cho phần công khai.

**Bên ngoài (mới)**

- **`sanitize-html`** — làm sạch HTML. Bắt buộc.
- **Trình soạn thảo**: `@tiptap/react` (mặc định) hoặc TinyMCE 6 — xem Q1.
- **`@aws-sdk/client-s3`** — đẩy ảnh lên R2.

**Dữ liệu**

- Cần ít nhất 3 danh mục hạt giống: *Giới thiệu*, *Chính sách*, *Kiến thức* — nếu không, hai dải
  trang chủ không có gì để chọn và tính năng trông như hỏng ngay lúc mở.

---

# 12. Câu hỏi còn mở

## 12.1 Cần trả lời trước khi code

| # | Câu hỏi | Đề xuất mặc định |
| :-- | :-- | :-- |
| **Q1** 🔴 | **Trình soạn thảo nào?** | **Tiptap (MIT)** — giấy phép sạch, nhẹ, hợp React 18 + MUI; đổi lại phải tự dựng thanh công cụ (~150 dòng). Chọn TinyMCE 6 cũng được nhưng phải tự đọc `LICENSE.txt` sau khi cài. |
| **Q2** | **R2 đã sẵn sàng chưa?** (bucket, khóa, domain `cdn.oalpha.vn`) | Nếu chưa, **làm driver local trước** (`public/uploads/`) sau đó chuyển — nhưng phải qua **cùng một interface**, không rải `fs` khắp nơi. |

## 12.2 Có mặc định — cứ thế làm nếu không phản đối

| # | Câu hỏi | Đề xuất |
| :-- | :-- | :-- |
| **Q3** | Hai dải có tên cố định hay Admin tự đặt? | **Tự đặt** — đóng cứng là tháng sau muốn đổi phải deploy. |
| **Q4** | Số dải cố định 2 hay cho thêm? | **Mảng jsonb**, khởi tạo 2 dải. Thêm dải là một phần tử, không phải migration. |
| **Q5** | Bài viết mỗi trang ở `/bai-viet`? | **9** (lưới 3×3). |
| **Q6** | Ảnh tối đa mỗi lần upload? | **5 MB**, chỉ `jpeg`/`png`/`webp`. |
| **Q7** | Danh mục có trang riêng (`/bai-viet/danh-muc/[slug]`) không? | **Không** — dùng `/bai-viet?danh_muc=<slug>`. Một trang, một bộ mã, sitemap vẫn khai được. |
| **Q8** | Xóa cứng bài trong thùng rác? | **Có**, nhưng chỉ `super_admin`, và có hộp thoại gõ lại tiêu đề để xác nhận. |

> **Không còn câu chặn ngoài Q1 và Q2.** Trả lời hai câu đó là bắt tay làm được.

---

# Quy tắc đầu ra

PRD này **không** chứa database schema, chữ ký hàm hay code — chúng nằm ở [RFC](./blog-rfc.md).

# End
