import { DEFAULT_HOME_CONTENT } from "../lib/site-content/defaults";
import { SECTIONS_CONFIG, getAt, setAt } from "../lib/site-content/fields";
import { deepMerge, resolveHomeContent } from "../lib/site-content/merge";
import { homeContentSchema } from "../lib/site-content/schema";

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
for (const sec of SECTIONS_CONFIG) {
  for (const f of sec.fields) {
    const val = getAt(DEFAULT_HOME_CONTENT, f.path);
    if (val === undefined) {
      console.error(`❌ Trường path "${f.path}" trong section "${sec.key}" không tồn tại trong DEFAULT_HOME_CONTENT!`);
      process.exit(1);
    }
  }
}
console.log("✅ 100% các field định nghĩa trong fields.ts đều tồn tại trong DEFAULT_HOME_CONTENT!");

console.log("\n🎉 TẤT CẢ 5 BỘ TEST ĐỀU THÀNH CÔNG VƯỢT TRỘI!");
