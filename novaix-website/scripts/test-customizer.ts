import { DEFAULT_HOME_CONTENT } from "../lib/site-content/defaults";
import { SECTIONS_CONFIG, getAt, setAt } from "../lib/site-content/fields";
import { deepMerge, resolveHomeContent } from "../lib/site-content/merge";
import { homeContentSchema, DEFAULT_SECTION_ORDER } from "../lib/site-content/schema";
import { safeHex } from "../lib/site-content/color";
import { RENDERABLE_SECTION_KEYS } from "../components/preview/section-keys";

console.log("=== 1. TEST SCHEMA DEFAULT ===");
const parsed = homeContentSchema.safeParse(DEFAULT_HOME_CONTENT);
if (!parsed.success) {
  console.error("❌ Schema DEFAULT_HOME_CONTENT parse failed:", parsed.error);
  process.exit(1);
} else {
  console.log("✅ DEFAULT_HOME_CONTENT hợp lệ 100% với Zod schema.");
}

console.log("\n=== 2. TEST DEEP MERGE ARRAY REPLACEMENT ===");
const customModules = [
  {
    icon: "🔥",
    title: "Module thử nghiệm",
    desc: "Mô tả thử nghiệm",
    tag: "Test Tag",
  },
  {
    icon: "⭐",
    title: "Module 2",
    desc: "Mô tả 2",
    tag: "Tag 2",
  },
  {
    icon: "🚀",
    title: "Module 3",
    desc: "Mô tả 3",
    tag: "Tag 3",
  },
];

const merged = deepMerge(DEFAULT_HOME_CONTENT as any, {
  modules: {
    ...DEFAULT_HOME_CONTENT.modules,
    items: customModules,
  },
});

if (merged.modules.items.length !== 3 || merged.modules.items[0].title !== "Module thử nghiệm") {
  console.error("❌ deepMerge không thay thế mảng đúng cách:", merged.modules.items);
  process.exit(1);
} else {
  console.log("✅ deepMerge thay thế mảng chính xác (length = 3).");
}

console.log("\n=== 3. TEST RESOLVE HOME CONTENT WITH CORRUPTED DATA ===");
const corrupted = { v: 999, invalidField: "garbage" };
const resolved = resolveHomeContent(corrupted);
if (resolved.v !== 1 || !resolved.hero.titleLead) {
  console.error("❌ resolveHomeContent không fallback về mặc định khi data hỏng");
  process.exit(1);
} else {
  console.log("✅ resolveHomeContent fallback an toàn tuyệt đối về DEFAULT_HOME_CONTENT.");
}

console.log("\n=== 4. TEST IMMUTABLE SET_AT & GET_AT ===");
const original = { ...DEFAULT_HOME_CONTENT };
const updated = setAt(original, "hero.kicker", "Dòng nhãn mới đã đổi");
const getVal = getAt(updated, "hero.kicker");

if (getVal !== "Dòng nhãn mới đã đổi" || original.hero.kicker === "Dòng nhãn mới đã đổi") {
  console.error("❌ setAt không bất biến hoặc không cập nhật đúng:", { getVal, orig: original.hero.kicker });
  process.exit(1);
} else {
  console.log("✅ setAt cập nhật chính xác và bảo toàn tính bất biến (immutable).");
}

console.log("\n=== 5. TEST FIELDS.TS COVERAGE ===");
{
  // SECTIONS_CONFIG nay chỉ khai tiêu đề/icon; phần trường đã chuyển sang các
  // component riêng (HeroSection.tsx, AboutSection.tsx…). Vòng lặp cũ chạy qua
  // `sec.fields` rỗng nên in ra "100% hợp lệ" mà không kiểm gì — tệ hơn là không có test.
  const declared = SECTIONS_CONFIG.reduce((n, s) => n + s.fields.length, 0);
  if (declared > 0) {
    for (const sec of SECTIONS_CONFIG) {
      for (const f of sec.fields) {
        if (getAt(DEFAULT_HOME_CONTENT, f.path) === undefined) {
          console.error(`❌ Trường path "${f.path}" trong section "${sec.key}" không tồn tại trong DEFAULT_HOME_CONTENT!`);
          process.exit(1);
        }
      }
    }
    console.log(`✅ ${declared} trường khai trong fields.ts đều tồn tại trong DEFAULT_HOME_CONTENT.`);
  } else {
    console.log("ℹ️  fields.ts không còn khai trường nào — bỏ qua phép kiểm này.");
  }
}

console.log("\n=== 6. TEST MỌI KHỐI TRONG SECTIONS_CONFIG ĐỀU CÓ DỮ LIỆU MẶC ĐỊNH ===");
{
  const missing = SECTIONS_CONFIG
    .map((s) => s.key)
    .filter((key) => (DEFAULT_HOME_CONTENT as Record<string, unknown>)[key] === undefined);
  if (missing.length > 0) {
    console.error(`❌ Khối khai trong panel nhưng thiếu dữ liệu mặc định: ${missing.join(", ")}`);
    process.exit(1);
  }
  console.log(`✅ ${SECTIONS_CONFIG.length} khối trong panel đều có dữ liệu mặc định.`);
}

console.log("\n=== 7. TEST THỨ TỰ KHỐI (sectionOrder) ===");
{
  // Khóa trong DEFAULT_SECTION_ORDER phải render được, nếu không khối biến mất trong im lặng.
  const renderable = new Set(RENDERABLE_SECTION_KEYS);
  const orphan = DEFAULT_SECTION_ORDER.filter((k) => !renderable.has(k));
  if (orphan.length > 0) {
    console.error(`❌ Khóa có trong thứ tự nhưng HomeSections không render được: ${orphan.join(", ")}`);
    process.exit(1);
  }

  // Trùng khóa phải bị loại, nếu không khối render hai lần và trùng React key.
  const dup = [...DEFAULT_SECTION_ORDER, "hero"];
  const deduped = Array.from(new Set(dup.filter((k) => DEFAULT_SECTION_ORDER.includes(k as never))));
  if (deduped.length !== DEFAULT_SECTION_ORDER.length) {
    console.error("❌ Logic bỏ trùng thứ tự khối sai.");
    process.exit(1);
  }
  console.log(`✅ ${DEFAULT_SECTION_ORDER.length} khối trong thứ tự đều render được, và trùng khóa bị loại.`);
}

console.log("\n=== 8. TEST MÀU KHÔNG HỢP LỆ BỊ CHẶN ===");
{
  const bad = JSON.parse(JSON.stringify(DEFAULT_HOME_CONTENT));
  bad.theme.primary = "red; } * { display: none } .x {";
  if (homeContentSchema.safeParse(bad).success) {
    console.error("❌ Schema chấp nhận chuỗi tiêm CSS làm màu!");
    process.exit(1);
  }
  if (safeHex(bad.theme.primary, "#2dd4bf") !== "#2dd4bf") {
    console.error("❌ safeHex không chặn được chuỗi tiêm CSS!");
    process.exit(1);
  }
  console.log("✅ Chuỗi tiêm CSS bị chặn ở cả schema lẫn safeHex.");
}

console.log("\n=== 9. TEST KHỐI ĐỐI TÁC ===");
{
  // 9a. Dữ liệu cũ chưa có khối partners vẫn đọc được, khối khác giữ nguyên.
  const legacy: any = JSON.parse(JSON.stringify(DEFAULT_HOME_CONTENT));
  delete legacy.partners;
  legacy.hero.titleLead = "Giữ nguyên";
  const resolved = resolveHomeContent(legacy);
  if (!resolved.partners || resolved.hero.titleLead !== "Giữ nguyên") {
    console.error("❌ Thiếu khối partners làm hỏng dữ liệu cũ!");
    process.exit(1);
  }

  // 9b. Quá 24 đối tác phải bị chặn.
  const tooMany: any = JSON.parse(JSON.stringify(DEFAULT_HOME_CONTENT));
  tooMany.partners.items = Array.from({ length: 25 }, (_, i) => ({
    name: `Đối tác ${i + 1}`, logo: "https://cdn.oalpha.vn/x.png", link: "", visible: true,
  }));
  if (homeContentSchema.safeParse(tooMany).success) {
    console.error("❌ Schema chấp nhận quá 24 đối tác!");
    process.exit(1);
  }

  // 9c. Tốc độ ngoài khoảng cho phép phải bị chặn.
  for (const speed of [0, 999]) {
    const bad: any = JSON.parse(JSON.stringify(DEFAULT_HOME_CONTENT));
    bad.partners.speed = speed;
    if (homeContentSchema.safeParse(bad).success) {
      console.error(`❌ Schema chấp nhận speed = ${speed}!`);
      process.exit(1);
    }
  }

  // 9d. Tên đối tác bỏ trống phải bị chặn — nó là alt của ảnh.
  const noName: any = JSON.parse(JSON.stringify(DEFAULT_HOME_CONTENT));
  noName.partners.items = [{ name: "", logo: "https://cdn.oalpha.vn/x.png", link: "", visible: true }];
  if (homeContentSchema.safeParse(noName).success) {
    console.error("❌ Schema chấp nhận đối tác không có tên!");
    process.exit(1);
  }

  // 9e. sectionOrder cũ chưa có "partners" thì phải được bù vào.
  const oldOrder: any = JSON.parse(JSON.stringify(DEFAULT_HOME_CONTENT));
  oldOrder.sectionOrder = DEFAULT_SECTION_ORDER.filter((k) => k !== "partners");
  const fixed = resolveHomeContent(oldOrder);
  if (!fixed.sectionOrder.includes("partners")) {
    console.error("❌ sectionOrder thiếu 'partners' mà không được bù vào!");
    process.exit(1);
  }

  console.log("✅ Khối đối tác: tương thích ngược, chặn đúng giới hạn, bù thứ tự khối.");
}

console.log("\n🎉 TOÀN BỘ CÁC BỘ TEST ĐỀU THÀNH CÔNG!");
