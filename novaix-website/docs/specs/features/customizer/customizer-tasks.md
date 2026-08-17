# Tasks — Sửa chữ trang chủ trực tiếp

> **PRD:** [`customizer-prd.md`](./customizer-prd.md) · **RFC:** [`customizer-rfc.md`](./customizer-rfc.md) ·
> **Spec:** [`customizer-spec.md`](./customizer-spec.md) · **Domain:** [`home-content-domain.md`](../../domains/home-content-domain.md)
>
> **Trạng thái:** 📝 chưa bắt đầu.

---

# 0. Điểm chặn cần chốt trước

| # | Câu hỏi | Chặn task | Mặc định nếu không có phản hồi |
| :-- | :-- | :-- | :-- |
| **C1** 🔴 | Nhóm B (bài viết) làm trước hay nhóm C? | T3 | **B trước** — nó tạo `site_settings` + `activity_logs`. Nếu C chạy trước thì **T3 gánh thêm việc tạo hai bảng đó** |
| **C2** | Thêm `vitest`? | T1 | **Có.** `deepMerge` và `resolveHomeContent` là chỗ hỏng im lặng điển hình — không test thì chỉ phát hiện khi trang chủ trắng |
| **C3** | Bề rộng chế độ điện thoại | T7 | **390px**, nghiệm thu thêm ở 375px |

**C1 và C2 không chặn T1–T2.** Cứ bắt đầu từ lược đồ và bóc chữ.

### ❌ Không nằm trong phạm vi — không có task tương ứng

| Bị loại | Vì sao |
| :-- | :-- |
| Sửa màu · phông · bo góc · bố cục · thứ tự khối | Đợt này **chỉ chữ** — [Domain §4.8](../../domains/home-content-domain.md#48-chỉ-sửa-chữ--không-sửa-màu-bố-cục-ảnh) |
| Đổi/upload ảnh | Dùng lại `BlobStorage` của nhóm B ở một đợt sau |
| Lịch sử phiên bản ở máy chủ · link xem trước chia sẻ được | Cần nháp ở máy chủ, tức là bỏ quyết định §4.6 |
| Bật/tắt từng khối | Là đổi bố cục, không phải sửa chữ |

---

# 1. Bảng công việc

**Ước tính tổng: 7–9 ngày làm việc.** Cột *PT* = phụ thuộc.

| # | Task | Lớp | PT | Độ khó |
| :-- | :-- | :-- | :-- | :-- |
| **T1** | Lược đồ + bản mặc định + merge (hàm thuần) + test | Lib | C2 | 🟠 Vừa |
| **T2** | 🔴 **Bóc chữ khỏi 13 component** — nhận props | FE | T1 | 🔴 Cao |
| **T3** | Đọc nội dung ở trang chủ (`queries.ts`) | BE | T1, C1 | 🟢 Thấp |
| **T4** | Server action lưu + chống ghi đè + nhật ký | BE | T3 | 🟠 Vừa |
| **T5** | Chế độ xem trước `?preview=1` + `PreviewBridge` | FE | T2 | 🟠 Vừa |
| **T6** | Cầu `postMessage` hai chiều + kiểm origin | FE | T5 | 🟠 Vừa |
| **T7** | Khung màn: iframe trái + thanh công cụ + Desktop/Mobile | FE | T6 | 🟠 Vừa |
| **T8** | Bản kê trường (`fields.ts`) cho đủ 13 khối | Lib | T1 | 🟠 Vừa |
| **T9** | Panel dựng động: ô chữ, ô số, đếm ký tự, báo lỗi | FE | T7, T8 | 🔴 Cao |
| **T10** | Sửa danh sách: thêm · xóa · kéo đổi thứ tự | FE | T9 | 🟠 Vừa |
| **T11** | Nháp · hoàn tác/làm lại · đặt lại | FE | T9 | 🔴 Cao |
| **T12** | Liên kết hai chiều panel ⇄ khung xem trước | FE | T9 | 🟠 Vừa |
| **T13** | Nối tab *Dải bài viết* (FR-B07) vào cùng màn | FE | T7 | 🟢 Thấp |
| **T14** | Gỡ `comingSoon` · xóa `lib/data.ts` · dọn import | FE | T2, T9 | 🟢 Thấp |
| **T15** | Cập nhật **tài liệu** *(bắt buộc, không được nợ)* | Docs | mọi task | 🟠 Vừa |

**Thứ tự chạy:** T1 → **T2 (xong hẳn, ổn định)** → T3–T4 → T5–T7 → T8–T12 → T13–T15.

🔴 **Không bắt đầu T5 khi T2 chưa xong.** Vừa bóc chữ vừa dựng cầu xem trước là lúc lỗi bố cục và lỗi
luồng dữ liệu trộn vào nhau, không biết cái nào gây ra cái nào.

---

# T1 — Lược đồ + mặc định + merge

**File:** `lib/site-content/schema.ts` · `defaults.ts` · `merge.ts` · `merge.test.ts`

- `homeContentSchema` cho đủ 13 khối ([RFC §5.5](./customizer-rfc.md#55-lược-đồ-nội-dung)); mọi chuỗi
  có `max`, mọi mảng có `min`/`max`, thông báo lỗi **tiếng Việt viết ngay trong schema**.
- `DEFAULT_HOME_CONTENT` — chép chữ hiện tại **nguyên từng ký tự** từ `lib/data.ts` và từ 13
  component. Đây là bản kê chuẩn cho T2 đối chiếu.
- `deepMerge` + `resolveHomeContent` ([RFC §5.6](./customizer-rfc.md#56--đọc-safeparse--merge-sâu-với-mặc-định)).
- Tiêu đề Hero tách **ba mảnh** (`titleLead` · `titleHighlight` · `titleTail`) để giữ được cụm chữ
  gradient giữa câu.

🔴 Comment ngay đầu `defaults.ts`:

```ts
// Đây là NỘI DUNG MẶC ĐỊNH, chỉ dùng khi database chưa có bản nào hoặc bản đó hỏng.
// Website đang chạy đọc nội dung từ site_settings.home_content — SỬA FILE NÀY KHÔNG ĐỔI TRANG ĐANG CHẠY.
// Muốn đổi chữ trên web: /admin/giao-dien
```

**Test:** mảng bị **thay** chứ không trộn theo chỉ số · `null` không bị coi là "chưa có" · thiếu khóa
→ lấy mặc định của khóa đó · rác hoàn toàn → về nguyên bản mặc định · merge **trước** parse.

---

# T2 — 🔴 Bóc chữ khỏi 13 component *(việc lớn nhất của đợt)*

**File:** cả 13 file trong `components/` + `app/page.tsx`

Mỗi khối nhận nội dung qua `props`, **bỏ sạch chuỗi viết cứng**:

| Khối | Việc |
| :-- | :-- |
| `Navbar` | Tên thương hiệu, 5 mục menu, nhãn nút CTA |
| `Hero` | Kicker, **3 mảnh tiêu đề**, mô tả, 2 nút |
| `Stats` | 4 mục số liệu |
| `Marquee` | 8 nhãn lĩnh vực |
| `About` | ❗ Kicker/tiêu đề/mô tả + **3 giá trị** + **4 mốc timeline** — đang viết cứng toàn bộ |
| `Modules` · `Features` · `Process` · `Segments` · `Testimonials` | `SectionHead` (đang cứng) + danh sách (đang ở `data.ts`) |
| `Pricing` | ❗ `SectionHead` + các gói + tính năng từng gói — đang cứng |
| `FAQ` | ❗ `SectionHead` + các cặp hỏi–đáp — đang cứng |
| `CTA` | ❗ Kicker/tiêu đề/mô tả + 4 dòng liên hệ + 3 cam kết + **nhãn form** + thông điệp gửi thành công + tùy chọn 2 ô chọn |
| `Footer` | ❗ Toàn bộ |

Cách làm bắt buộc:

- **Từng khối một, mỗi khối một commit.** 13 khối một lượt là không cách nào biết chỗ nào vỡ.
- **Chữ mặc định giữ nguyên từng ký tự** — kể cả dấu `—`, `·`, khoảng trắng đôi.
- Gộp `SectionHead` vào cùng cây nội dung của khối chứa nó.
- Trường tùy chọn rỗng → **không render** phần tử (không render rỗng).

🔴 **Xong khi:** `npm run build` sạch **và** ảnh chụp toàn trang ở 1440px + 375px **trùng khớp** với
trước khi bóc. Đây là tiêu chí duy nhất đáng tin cho task này.

---

# T3 — Đọc nội dung ở trang chủ

**File:** `lib/site-content/queries.ts` · sửa `app/page.tsx`

- `getHomeContent()` — **một** truy vấn `site_settings`, qua `resolveHomeContent`.
- Trang chủ vẫn ISR được (`revalidate`).
- ⚠️ Nếu nhóm B chưa chạy: task này **gánh thêm** việc tạo `site_settings` + `activity_logs` trong
  `lib/db/schema.ts` + `db:push` (xem [blog-rfc §7.1](../blog/blog-rfc.md#71-schema-drizzle) để dùng
  đúng định nghĩa, **không** khai bản thứ hai lệch nhau).

**Xong khi:** xóa hàng `home_content` khỏi DB → trang chủ vẫn chạy bằng bản mặc định.

---

# T4 — Server action lưu

**File:** `lib/site-content/actions.ts`

- `getHomeContentForEdit()` trả `{ content, updatedAt }` — `updatedAt` là **mốc chống ghi đè**.
- `saveHomeContent(input)` đủ bốn nhịp: `requireUser()` → Zod → so mốc → ghi + nhật ký +
  `revalidatePath("/")`.
- 🔴 So mốc **trong chính câu `UPDATE`** (`WHERE updated_at = $base`) và kiểm số hàng bị ảnh hưởng —
  đọc-rồi-ghi còn một khe hở.
- `diffSections` trả **tên khối đã đổi** cho nhật ký. **Không** ghi nội dung vào `meta`.
- Trần tổng kích thước đối tượng ~**256 KB**.

**Xong khi:** hai phiên giả lập — phiên sau lưu **bị từ chối** kèm giờ của phiên trước.

---

# T5 — Chế độ xem trước

**File:** sửa `app/page.tsx` · `components/preview/PreviewBridge.tsx`

- `?preview=1` → render qua `PreviewBridge` (client), khởi tạo bằng **bản đã áp dụng**.
- 🔴 **`HomeSections` dùng chung** cho cả nhánh thật lẫn nhánh preview. Hai cây render riêng sẽ trôi
  khỏi nhau, và sai lệch chỉ lộ ra sau khi đã áp dụng.
- `generateMetadata` → `robots: noindex, nofollow` khi có cờ.
- Nhánh preview **không cache**.

**Xong khi:** mở `/?preview=1` bằng tay → thấy đúng trang chủ hiện tại, mã nguồn có `noindex`.

---

# T6 — Cầu `postMessage`

**File:** `lib/site-content/preview-bridge.ts` + phần nghe trong `PreviewBridge`

- 4 loại thông điệp ([RFC §5.3](./customizer-rfc.md#53-giao-thức-postmessage--hợp-đồng-hai-chiều)).
- 🔴 **Kiểm `e.origin` ở cả hai đầu**; cha luôn gửi kèm `targetOrigin` cụ thể, **không** `"*"`.
- Cha **xếp hàng** nội dung cho tới khi nhận `preview:ready`.
- **Không** đổi `src`, **không** `reload()` khi nội dung đổi.

**Xong khi:** có ca test khẳng định thông điệp từ origin khác **bị bỏ qua**; và gõ chữ → iframe đổi
mà **không mất vị trí cuộn**.

---

# T7 — Khung màn + thanh công cụ

**File:** `app/admin/(protected)/giao-dien/page.tsx` · `components/admin/customizer/CustomizerShell.tsx`

- Bố cục chia đôi, panel phải **380px**, hai vùng cuộn độc lập.
- Thanh công cụ: ✕ · 🖥/📱 · chỉ báo trạng thái · *Mặc định* · *Hoàn tác* · **Lưu & áp dụng** ·
  *Xem trang thật*.
- Chân màn: *Cập nhật gần nhất: … · <tên người>*.
- Đổi Desktop/Mobile chỉ đổi bề rộng iframe — **không** tải lại, **không** mất vị trí cuộn.
- Dưới 900px: hiện câu *"Sửa nội dung trang chủ cần màn hình rộng hơn. Vui lòng dùng máy tính."*
- `export const dynamic = "force-dynamic"`.

---

# T8 — Bản kê trường

**File:** `lib/site-content/fields.ts` · `fields.test.ts`

- Khai 13 khối × các trường: nhãn tiếng Việt, kiểu ô, `max`, bắt buộc hay không, nhiều dòng hay không.
- Với danh sách: `min`, `max`, hàm dựng mục trống, hàm sinh nhãn hiển thị của từng mục.
- Hai hàm thuần `getAt` / `setAt` theo `path` chấm. 🔴 `setAt` **trả đối tượng mới**, không sửa tại
  chỗ — sửa tại chỗ thì React không thấy state đổi và khung xem trước **đứng im**, kiểu hỏng khó lần
  nhất của cả màn.

🔴 **Test khớp ba nguồn:** mọi `path` trong `fields.ts` phải tồn tại trong `DEFAULT_HOME_CONTENT`, và
mọi trường bắt buộc của schema phải có mặt trong `fields.ts`. Ca test này bắt đúng lỗi *"thêm trường
mà quên khai vào panel"* — lỗi sẽ xảy ra, chỉ là chưa biết lúc nào.

---

# T9 — Panel dựng động *(🔴 khó nhất)*

**File:** `components/admin/customizer/SectionPanel.tsx` · `FieldInput.tsx`

- Dựng từ `fields.ts`, **không viết tay 130 ô**.
- Accordion 13 nhóm, mở một gập một; mỗi nhóm có nút **[Đặt lại]** riêng.
- Ô nhập: đếm ký tự (`28/60`), cam ở 90%, đỏ khi vượt; ô bắt buộc rỗng → viền đỏ.
- Nhóm chứa ô lỗi → **chấm đỏ ở đầu nhóm**, kể cả khi đang gập.
- `useReducer` một hành động `SET_FIELD { path, value }` cho mọi ô — **không** 130 `useState`.
- Ô nhập giữ state cục bộ để gõ mượt; đẩy sang iframe **debounce ~80ms**.
- Chú thích *"Chữ thuần — thẻ HTML sẽ hiện nguyên văn"* ở các trường dễ bị gõ HTML.

**Xong khi:** gõ 200 ký tự → tab Network **không có lời gọi nào**, và ô nhập **không giật**.

---

# T10 — Sửa danh sách

**File:** `components/admin/customizer/ListField.tsx`

- Mỗi mục gập/mở; nhãn hiển thị lấy từ **tiêu đề của chính mục đó**, không phải "Mục 1, Mục 2".
- Kéo ⠿ đổi thứ tự → khung xem trước đổi **ngay trong lúc kéo**.
- Xóa: hộp thoại **hiện tên mục**. Ở mức tối thiểu → nút khóa + chú thích *"Cần ít nhất N mục"*.
- Thêm: mục mới có chữ mẫu, tự mở, khung xem trước cuộn tới. Ở mức tối đa → nút khóa + chú thích.

---

# T11 — Nháp · hoàn tác · đặt lại *(🔴 nhiều bẫy)*

**File:** `components/admin/customizer/useDraft.ts` · `useUndo.ts`

- Nháp `localStorage`, debounce **500ms**, kèm `baseUpdatedAt`.
- Khôi phục có hỏi lại; 🔴 **mốc lệch → cảnh báo mạnh** *"Bản nháp này được tạo trước khi … cập nhật
  lúc 14:05. Dùng tiếp sẽ ghi đè thay đổi của họ."*
- Xóa nháp sau khi lưu thành công. *Bỏ bản nháp* có xác nhận.
- Hoàn tác/làm lại tối đa **50 bước**; 🔴 **gom nhóm theo trường + ~500ms** để lùi theo câu chữ chứ
  không theo từng ký tự.
- *Đặt lại* (nhóm và toàn bộ) **cũng là một bước hoàn tác được**, và **không tự lưu**.
- Chỉ báo `Sach` nghĩa là **trùng bản đã lưu** — hoàn tác về đúng bản cũ phải làm nó về "Đã lưu".
- `beforeunload` khi còn thay đổi chưa lưu.

---

# T12 — Liên kết hai chiều panel ⇄ xem trước

- Mở nhóm → gửi `preview:scroll-to` → iframe cuộn mượt tới khối.
- Bấm khối trong iframe → gửi `preview:section-click` → panel mở đúng nhóm, cuộn tới, làm nổi 1 giây.
- Mỗi khối trên trang chủ cần một mỏ neo ổn định (`data-section="hero"`) — đặt trong T2 để khỏi phải
  sửa lại 13 file lần nữa.

---

# T13 — Nối tab *Dải bài viết*

- Hai tab trong cùng màn: *Nội dung trang chủ* (C) · *Dải bài viết* (B, FR-B07).
- Dùng chung khung xem trước bên trái.
- Nếu nhóm B chưa làm: để tab đó **hiện `ComingSoon` ngay trong tab**, không bỏ tab đi — bỏ rồi thêm
  lại là sửa bố cục màn hai lần.

---

# T14 — Dọn

- Gỡ `comingSoon` khỏi *Giao diện trang chủ* trong `lib/admin/menu.ts`.
- 🔴 **Xóa `lib/data.ts`** và mọi import trỏ tới nó. Để lại là hai nguồn nội dung, và người sau sẽ
  sửa nhầm bản không còn ai đọc.
- Kiểm không còn chuỗi tiếng Việt viết cứng trong `components/*.tsx`.

---

# T15 — Cập nhật tài liệu *(BẮT BUỘC)*

| File | Sửa gì |
| :-- | :-- |
| `README.md` | 🔴 Câu *"`lib/data.ts` — toàn bộ nội dung tập trung tại đây, sửa text ở đây"* **không còn đúng**. Thay bằng: nội dung sửa ở `/admin/giao-dien`, mặc định nằm ở `lib/site-content/defaults.ts` |
| [`coding-style.md`](../../../conventions/coding-style.md) | Viết lại mục *"Nội dung — tập trung ở `lib/data.ts`"*; bổ sung luật *"chữ hiển thị lấy từ props, không viết cứng trong component"* |
| [`content-article-domain.md`](../../domains/content-article-domain.md) | §4.8 đã ghi nhận nhóm C — kiểm lại còn khớp sau khi làm xong |
| [`tech-stack.md`](../../../architecture/tech-stack.md) | Ghi nhận `site_settings` là nơi lưu nội dung trang chủ (và `vitest` nếu C1 chọn thêm) |
| PRD/RFC/Spec | Ghi lại chỗ nào làm khác thiết kế |

🔴 Cập nhật tài liệu **cùng PR** với code. PR sau nghĩa là không bao giờ.

---

# 2. Rủi ro theo task

| Task | Rủi ro | Giảm bằng |
| :-- | :-- | :-- |
| T1 | `deepMerge` trộn mảng theo chỉ số → mục đã xóa sống lại | Test riêng cho hành vi mảng |
| T2 | Bóc chữ làm vỡ bố cục, không ai biết chỗ nào | Từng khối một commit + so ảnh trước/sau |
| T2 | Chữ mặc định bị gõ lại sai một dấu | Chép nguyên văn, không gõ tay |
| T4 | Ghi đè im lặng công người khác | So mốc trong chính câu `UPDATE` |
| T4 | Quên `revalidatePath("/")` → "lưu xong mà web không đổi" | Có trong tiêu chí nghiệm thu |
| T6 | Nhận `postMessage` từ origin lạ | Kiểm `origin` hai đầu + ca test |
| T8 | Thêm trường mà quên khai vào panel | Test khớp ba nguồn |
| T9 | File panel phình to không ai dám sửa | Dựng động từ bản kê, tách `FieldInput`/`ListField` ngay từ đầu |
| T9 | Gõ giật vì render lại cả cây | State cục bộ ở ô + debounce + `memo` khối nặng |
| T11 | Hoàn tác lùi từng ký tự | Gom nhóm theo trường + thời gian |
| T11 | Nháp cũ đè bản mới của người khác | Lưu kèm `baseUpdatedAt` + cảnh báo |
| T14 | Xóa `lib/data.ts` khi còn chỗ import | `npm run build` bắt được — chạy trước khi commit |

---

# 3. Định nghĩa HOÀN THÀNH

Một task xong khi **tất cả** đúng:

- [ ] `npm run build` **không lỗi type**, `npm run lint` sạch.
- [ ] Hàm thuần có test và test **xanh**.
- [ ] Chuỗi hiển thị **tiếng Việt**, kể cả thông báo lỗi.
- [ ] Client component **không** `import { db }`.
- [ ] Server action đủ bốn nhịp: quyền → Zod (`input: unknown`) → thao tác → `revalidatePath`.
- [ ] Không `dangerouslySetInnerHTML` ở bất kỳ đâu trong phân hệ này.
- [ ] `postMessage` luôn có `targetOrigin` cụ thể và kiểm `origin` khi nhận.
- [ ] File dưới ngưỡng của [coding-style](../../../conventions/coding-style.md), hoặc đã tách.
- [ ] Tiêu chí nghiệm thu tương ứng ở [Spec §10](./customizer-spec.md#10-tiêu-chí-nghiệm-thu) đã tick.

# End
