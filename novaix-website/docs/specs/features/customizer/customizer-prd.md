# PRD — Sửa chữ trang chủ trực tiếp (Home Content Customizer)

> **Domain gốc:** [`home-content-domain.md`](../../domains/home-content-domain.md)
> **Mã FR:** `FR-C01`…`FR-C13` (nhóm C — Customizer)
> **Trạng thái:** 📝 **chưa triển khai** — đang chờ duyệt RFC.
> **Liên quan:** dùng chung màn `/admin/giao-dien` với [dải bài viết (FR-B07)](../blog/blog-prd.md).

---

# 1. Vấn đề (Problem Statement)

## 1.1 Sửa một câu chữ tốn một lần deploy

Toàn bộ chữ trên trang chủ nằm trong mã nguồn. Đổi số điện thoại, sửa một lỗi chính tả, cập nhật câu
mô tả module — tất cả đều đi qua: **sửa mã → commit → build → deploy → chờ**.

Việc đáng lẽ tính bằng phút đang tính bằng ngày, và nó lặp lại **hằng tuần**.

## 1.2 Chữ còn không nằm ở chỗ README nói

README ghi *"`lib/data.ts` — toàn bộ nội dung tập trung tại đây, sửa text ở đây"*. Câu đó **không
còn đúng**:

| Nằm ở `lib/data.ts` | Viết cứng trong component |
| :-- | :-- |
| `stats`, `sectors`, `modules`, `features`, `steps`, `segments`, `testimonials`, `nav` | Tiêu đề Hero · toàn bộ khối *Về chúng tôi* (3 giá trị + 4 mốc lịch sử) · 6 khối tiêu đề section · bảng giá · câu hỏi thường gặp · thông tin liên hệ · nhãn form · chân trang |

**Quá nửa số chữ hiển thị đang rải trong 13 file `.tsx`.** Người mới vào sửa `lib/data.ts` rồi không
hiểu vì sao chữ trên màn không đổi.

## 1.3 Không ai dám sửa vì không thấy trước kết quả

Đổi một tiêu đề từ 6 chữ thành 14 chữ có làm vỡ bố cục trên điện thoại không? Hiện chỉ biết **sau
khi deploy**. Hệ quả là chữ nghĩa cứ để nguyên, kể cả khi đã lỗi thời.

## 1.4 Menu quản trị đang hứa đúng việc này

`/admin/giao-dien` — *"Giao diện trang chủ"* — đã có trên menu và trả về màn `ComingSoon`.

## 1.5 Ai bị ảnh hưởng

| Nhóm | Chịu gì |
| :-- | :-- |
| **Marketing / nội dung** | Không tự sửa được một chữ nào; phải mô tả thay đổi cho lập trình viên rồi chờ |
| **Ban giám đốc** | Muốn đổi thông điệp chính của công ty phải mở một ticket kỹ thuật |
| **Sale** | Số hotline, giờ làm việc, địa chỉ sai thì không có cách nào sửa nhanh |
| **Lập trình viên** | Thành người gác cổng cho mọi thay đổi chữ nghĩa — việc không cần kỹ năng của họ |
| **Khách** | Đọc nội dung lỗi thời vì chi phí sửa quá cao so với giá trị |

---

# 2. Mục tiêu (Goals)

| # | Mục tiêu | Đo bằng |
| :-- | :-- | :-- |
| **G1** | Sửa mọi chữ trên trang chủ **không cần deploy** | Đổi bất kỳ trường nào trong bản kê §5.3 của Domain → hiện trên web, **0** lần build |
| **G2** | **Thấy ngay trong lúc gõ** | Gõ một ký tự → khung bên trái đổi trong **cùng khung hình**, không nhấp nháy, không mất vị trí cuộn |
| **G3** | Cái nhìn thấy **đúng bằng** cái khách thấy | Khung xem trước là trang chủ thật, cuộn được, bấm được; có nút xem bản điện thoại |
| **G4** | Người dùng **dám thử** | Có bản nháp, hoàn tác, đặt lại về mặc định; sai thì bỏ, không mất gì |
| **G5** | Không ai vô tình đẩy nội dung dở dang ra web | Chỉ *Lưu & áp dụng* mới ra khách; đóng tab giữa chừng không ảnh hưởng trang thật |
| **G6** | Không mất công của người khác | Người kia lưu trước → lần lưu sau **bị chặn** kèm thông báo, không ghi đè im lặng |
| **G7** | Mục menu "Sắp có" biến mất | `comingSoon` được gỡ khỏi *Giao diện trang chủ* |

---

# 3. Không nằm trong phạm vi (Non-Goals)

- ❌ **Đổi màu, phông chữ, bo góc** — đợt này **chỉ chữ**. Lý do ở [Domain §4.8](../../domains/home-content-domain.md#48-chỉ-sửa-chữ--không-sửa-màu-bố-cục-ảnh).
- ❌ **Đổi thứ tự các khối / kéo thả bố cục.** Chạm vào `app/page.tsx` là bài toán khác.
- ❌ **Đổi ảnh** (logo, ảnh nền, ảnh minh họa).
- ❌ **Bật/tắt từng khối.** *(Cân nhắc cho đợt sau — xem Q5.)*
- ❌ **Lịch sử phiên bản / khôi phục bản đã lưu trước đó.** Chỉ có hoàn tác trong phiên đang mở.
- ❌ **Link xem trước chia sẻ được** cho người duyệt không có tài khoản.
- ❌ **Sửa chữ cho trang khác** ngoài trang chủ (`/bai-viet`, trang đọc).
- ❌ **Đa ngôn ngữ.**
- ❌ **Soạn thảo rich-text trong panel.** Chữ ở đây là chữ thuần — in đậm, chèn link, chèn ảnh là
  chuyện của [bài viết](../blog/blog-prd.md).

---

# 4. Người dùng mục tiêu

| Vai trò | Dùng để làm gì |
| :-- | :-- |
| `admin` | Sửa toàn bộ chữ trang chủ, áp dụng ra web |
| `super_admin` | Y hệt `admin` (không có đặc quyền riêng ở phân hệ này) |
| **Khách** | Không biết phân hệ này tồn tại — chỉ thấy trang chủ với nội dung mới nhất |

---

# 5. Hành trình người dùng

## 5.1 Sửa nhanh một dòng chữ

```
Mở /admin/giao-dien
  → Bên trái hiện trang chủ thật, bên phải là panel các khối
  → Mở nhóm "Hero"
  → Sửa tiêu đề "Hệ thống hóa toàn bộ vận hành..." → "Số hóa vận hành..."
  → Chữ bên trái đổi NGAY khi đang gõ (không bấm gì thêm)
  → Bấm 📱 để xem trên bản điện thoại — tiêu đề vẫn gọn, không tràn
  → Bấm "Lưu & áp dụng"
  → Mở oalpha.vn ở tab khác: chữ mới đã ở đó
```

## 5.2 Thử rồi đổi ý

```
Sửa 6 chỗ trong khối "Bảng giá"
  → Nhìn tổng thể thấy dài quá
  → Bấm "Hoàn tác" vài lần → về từng bước trước
  → Vẫn không ưng → bấm "Đặt lại" ngay tại nhóm Bảng giá → về bản gốc
  → Các nhóm khác GIỮ NGUYÊN thứ vừa sửa
  → Bấm "Lưu & áp dụng"
```

## 5.3 Bị ngắt giữa chừng

```
Đang sửa dở khối "Về chúng tôi" → máy sập / lỡ đóng tab
  → Mở lại /admin/giao-dien
  → Báo: "Đã khôi phục bản nháp chưa lưu."  [Dùng tiếp] [Bỏ bản nháp]
  → Bấm Dùng tiếp → mọi thứ về đúng chỗ đang dở
  ⚠️ Trong lúc đó trang chủ thật KHÔNG hề đổi — vì chưa ai bấm Lưu
```

## 5.4 Hai người cùng sửa

```
An mở màn lúc 14:00 · Bình mở màn lúc 14:02
Bình bấm Lưu lúc 14:05  → thành công
An bấm Lưu lúc 14:07
  → Bị chặn: "Người khác vừa cập nhật nội dung lúc 14:05.
              Tải lại để xem bản mới nhất trước khi lưu."
  → An tải lại, đối chiếu, sửa lại phần của mình, lưu
```

---

# 6. Yêu cầu chức năng (Functional Requirements)

| Mã | Yêu cầu |
| :-- | :-- |
| **FR-C01** | **Bố cục chia đôi**: khung xem trước bên **trái** (trang chủ thật, cuộn được, bấm được), panel sửa chữ bên **phải**. Thanh công cụ trên cùng: Desktop/Mobile · trạng thái bản nháp · *Mặc định* · *Hoàn tác* · **Lưu & áp dụng**. |
| **FR-C02** | 🔴 **Sửa là thấy ngay (live)**: mỗi ký tự gõ vào panel làm khung xem trước đổi tương ứng — **không** bấm nút, **không** tải lại trang, **không** mất vị trí cuộn, **không** ghi database. |
| **FR-C03** | **Panel nhóm theo khối**, mở/gập, **đúng thứ tự các khối trên trang**. Mở một nhóm → khung xem trước **cuộn tới** khối đó. Bấm vào một khối trong khung xem trước → panel **mở đúng nhóm** tương ứng. |
| **FR-C04** | **Sửa danh sách**: các mục lặp (module, bước triển khai, câu hỏi, lời chứng, mục menu…) **thêm · xóa · đổi thứ tự** được, trong giới hạn số mục tối thiểu/tối đa của từng danh sách. |
| **FR-C05** | **Xem bản Desktop / Điện thoại**: đổi bề rộng khung xem trước, giữ nguyên nội dung đang sửa và vị trí cuộn. |
| **FR-C06** | **Bản nháp tự lưu** trong trình duyệt sau mỗi lần gõ. Mở lại màn có nháp cũ → báo *"Đã khôi phục bản nháp chưa lưu"* kèm lựa chọn **dùng tiếp** hoặc **bỏ**. 🔴 Bản nháp **không bao giờ** ra tới khách. |
| **FR-C07** | **Hoàn tác / Làm lại** theo từng bước sửa, trong phiên đang mở. |
| **FR-C08** | **Đặt lại về mặc định** — cho **từng nhóm** và cho **toàn bộ**. Đặt lại **không** tự lưu; vẫn phải bấm *Lưu & áp dụng*. |
| **FR-C09** | **Lưu & áp dụng**: ghi nội dung, làm mới cache trang chủ, nội dung mới ra web ở lượt tải kế tiếp. |
| **FR-C10** | **Ràng buộc nhập**: mỗi trường có giới hạn độ dài và **đếm ký tự hiện tại/tối đa**; trường **bắt buộc không được rỗng**; vượt giới hạn thì cảnh báo tại ô và **chặn lưu**. |
| **FR-C11** | Mỗi lần *Lưu & áp dụng* ghi **nhật ký** (ai, lúc nào, **những khối nào đã đổi**). |
| **FR-C12** | **Trang chủ đọc chữ từ database**, thiếu khóa nào thì lấy **bản mặc định trong mã**. Dữ liệu hỏng lược đồ → dùng nguyên bản mặc định; **trang chủ không bao giờ vỡ**. |
| **FR-C13** | **Chặn ghi đè**: nếu người khác đã lưu sau thời điểm mình mở màn, lần lưu này **bị từ chối** kèm thông báo nói rõ **lúc nào**. |

---

# 7. Quy tắc nghiệp vụ

> Bản đầy đủ ở [Domain §7](../../domains/home-content-domain.md#7-business-rules). Những cái ảnh
> hưởng trực tiếp tới trải nghiệm:

1. **Gõ không lưu.** Chỉ *Lưu & áp dụng* mới đổi thứ khách thấy.
2. **Đặt lại không tự lưu.** Nút đặt lại mà tự ghi luôn là cách nhanh nhất để xóa công người khác
   bằng một cú bấm nhầm.
3. **Hoàn tác chỉ sống trong phiên.** Đóng tab là hết — và giao diện phải nói rõ điều đó.
4. **Trường bắt buộc không được rỗng.** Tiêu đề rỗng không phải "ẩn tiêu đề", nó là một khoảng trắng
   vô nghĩa giữa trang.
5. **Chữ là chữ thuần.** Gõ `<b>đậm</b>` vào ô thì trên trang hiện đúng chuỗi `<b>đậm</b>` — không
   phải chữ đậm. Đây là **có chủ đích**, không phải thiếu sót.
6. **Danh sách có trần và sàn.** Lưới 9 module còn 1 mục là bố cục hỏng; 40 mục là trang chủ thành
   catalog.
7. **Bản nháp nằm trên máy đang dùng**, không đi theo người dùng sang máy khác.

---

# 8. Chỉ số thành công

| Chỉ số | Mốc |
| :-- | :-- |
| Số lần deploy để sửa chữ trang chủ | **0** (hiện tại: mỗi lần sửa = 1 deploy) |
| Thời gian từ "muốn đổi một câu" tới "khách thấy" | **Dưới 2 phút** (hiện tại: tính bằng ngày) |
| Độ trễ từ lúc gõ tới lúc khung xem trước đổi | **Trong cùng khung hình** — người dùng không cảm nhận được độ trễ |
| Số chữ trên trang chủ **không** sửa được từ `/admin` | **0** trong bản kê Domain §5.3 |
| Chuỗi tiếng Việt còn viết cứng trong `components/*.tsx` | **0** |
| Nội dung nháp lọt ra khách | **0** — không có đường nào để lọt |
| Trang chủ vỡ vì dữ liệu jsonb cũ/hỏng | **0** — có bản mặc định đỡ |

---

# 9. Ràng buộc

**Kỹ thuật**

- **Không thêm bảng** — dùng `site_settings` đã khai ở phân hệ Bài viết.
- **Không thêm dependency** — iframe và `postMessage` là API sẵn có của trình duyệt.
- Panel dùng **MUI**; khung xem trước là **trang chủ Tailwind nền tối** — hai hệ giao diện **phải
  cách ly bằng iframe**, không nhúng thẳng vào nhau.
- Client component **không** `import { db }`; ghi qua server action đủ bốn nhịp.
- Trang chủ vẫn phải **nhanh**: đọc nội dung là **một** truy vấn, và trang vẫn ISR được.

**Tổ chức**

- 🔴 Việc lớn nhất **không phải** panel mà là **bóc ~130 chuỗi chữ** ra khỏi 13 component. Phải làm
  trước và làm gọn một lần.
- Sau đợt này, sửa chữ trong mã (`defaults.ts`) **không còn** đổi được trang đang chạy — phải ghi rõ
  trong README và ngay đầu file.

---

# 10. Rủi ro

| # | Rủi ro | Mức | Cách giảm |
| :-- | :-- | :-- | :-- |
| **R1** | 🔴 **Khung xem trước nhận nội dung từ nguồn lạ.** Trang bất kỳ nhúng `/?preview=1` rồi bơm chữ tùy ý → dựng được ảnh chụp "trang OAlpha" nói bất cứ điều gì. | 🔴 Cao | Kiểm `event.origin` ở **cả hai đầu**; preview chỉ nhận từ đúng gốc của site; có ca test. |
| **R2** | **Bóc chữ làm hỏng giao diện** — 13 component sửa cùng lúc, sót một chỗ là vỡ bố cục. | 🟠 Vừa | Bóc **từng khối một**, mỗi khối một commit, so ảnh trước/sau. Chữ mặc định **giữ nguyên từng ký tự**. |
| **R3** | **Trang chủ vỡ vì jsonb cũ** sau khi schema đổi. | 🔴 Cao | `safeParse` + merge sâu với mặc định + `console.warn`. Có ca test với dữ liệu thiếu khóa và dữ liệu rác. |
| **R4** | **Mất bản nháp** khi đóng tab / sập máy. | 🟠 Vừa | Tự lưu `localStorage` sau mỗi lần gõ; khôi phục có hỏi lại. |
| **R5** | **Nháp cũ đè bản mới của người khác** khi khôi phục. | 🟠 Vừa | Nháp lưu kèm mốc thời gian bản đã áp dụng; mốc lệch → cảnh báo trước khi dùng tiếp. |
| **R6** | **Hai người ghi đè nhau.** | 🟠 Vừa | So mốc `updated_at` lúc lưu (FR-C13). |
| **R7** | **Người dùng tưởng đã lưu** vì thấy trang bên trái đã đổi. | 🟠 Vừa | Nút *Lưu & áp dụng* **đổi màu/nhấn mạnh khi có thay đổi chưa lưu**; cảnh báo `beforeunload`; chữ trạng thái nói rõ *"Chưa lưu"*. |
| **R8** | **Gõ bị giật** vì cả trang render lại mỗi ký tự. | 🟠 Vừa | Ô nhập giữ state cục bộ, gửi sang iframe có debounce ngắn; đo trên khối nặng nhất (Bảng giá). |
| **R9** | **Dev sửa `defaults.ts` mà trang không đổi**, mất buổi đi tìm. | 🟢 Thấp | Comment ngay đầu file + một mục trong README + ghi trong `coding-style`. |
| **R10** | **Trường rỗng làm vỡ bố cục.** | 🟢 Thấp | Trường bắt buộc chặn rỗng; trường tùy chọn rỗng thì **không render** phần tử. |

---

# 11. Phụ thuộc

**Trong hệ thống**

- `site_settings` + `activity_logs` — **do [phân hệ Bài viết](../blog/blog-tasks.md) tạo (T4)**.
  ⚠️ Nếu nhóm C chạy trước, phải tự tạo hai bảng đó trong task schema của mình.
- `requireUser()` (`lib/auth/session.ts`), `AdminShell`, `PageHeader`, theme MUI.
- `app/page.tsx` + 13 component trong `components/`.

**Bên ngoài**

- Không có. Không thêm gói npm nào.

---

# 12. Câu hỏi còn mở

## 12.1 Cần trả lời trước khi code

| # | Câu hỏi | Đề xuất mặc định |
| :-- | :-- | :-- |
| **Q1** | Nhóm C và nhóm B (bài viết) — làm cái nào trước? | **B trước** (nó tạo `site_settings` + `activity_logs`). Nếu làm C trước thì task schema của C phải gánh hai bảng đó. |
| **Q2** | Panel và tab *Dải bài viết* ở chung màn `/admin/giao-dien`? | **Có**, hai tab, chung một khung xem trước. Hai màn riêng cho cùng một trang chủ là hai chỗ để lạc. |

## 12.2 Có mặc định — cứ thế làm nếu không phản đối

| # | Câu hỏi | Đề xuất |
| :-- | :-- | :-- |
| **Q3** | Bề rộng khung xem trước ở chế độ Mobile? | **390px** (iPhone 14/15). Kiểm bố cục thêm ở **375px** khi nghiệm thu. |
| **Q4** | Số bước hoàn tác? | **50** — đủ cho một phiên sửa dài, không đủ để ngốn bộ nhớ. |
| **Q5** | Cho bật/tắt từng khối luôn? | **Không đợt này.** Tắt một khối là đổi bố cục trang, và nó đẻ ra câu hỏi "tắt Hero thì trang chủ còn gì". |
| **Q6** | Sửa được emoji trong các mục (`🤝`, `🏭`…)? | **Có** — chúng là ký tự chữ, nằm ngay trong ô nội dung của mục. Không làm bộ chọn emoji riêng. |
| **Q7** | Bỏ bản nháp có cần xác nhận? | **Có** — một hộp thoại. Bỏ nhầm là mất trắng công đang dở. |
| **Q8** | Có nút "Xem trang thật" không? | **Có**, mở `/` ở tab mới — để đối chiếu bản đã áp dụng với bản đang sửa. |

---

# Quy tắc đầu ra

PRD này **không** chứa schema, chữ ký hàm hay code — chúng nằm ở [RFC](./customizer-rfc.md).

# End
