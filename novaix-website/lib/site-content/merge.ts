import { DEFAULT_HOME_CONTENT } from "./defaults";
import { homeContentSchema, type HomeContent } from "./schema";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Merge sâu hai object với quy tắc:
 * 1. Mảng thì THAY THẾ hoàn toàn, không merge theo index.
 * 2. Chỉ merge đệ quy khi cả hai đều là plain object.
 * 3. Nếu target có giá trị undefined, giữ nguyên base; nếu target có null hoặc giá trị khác thì ghi đè.
 */
export function deepMerge<T extends Record<string, unknown>>(base: T, override: Record<string, unknown>): T {
  const result: Record<string, unknown> = { ...base };

  for (const key of Object.keys(override)) {
    const baseVal = base[key];
    const overVal = override[key];

    if (overVal === undefined) {
      continue;
    }

    if (Array.isArray(overVal)) {
      result[key] = overVal;
    } else if (isPlainObject(baseVal) && isPlainObject(overVal)) {
      result[key] = deepMerge(baseVal, overVal);
    } else {
      result[key] = overVal;
    }
  }

  return result as T;
}

/**
 * Đọc dữ liệu từ DB (hoặc bất kỳ nguồn raw nào),
 * merge với DEFAULT_HOME_CONTENT và parse an toàn.
 * KHÔNG BAO GIỜ làm vỡ trang chủ.
 */
export function resolveHomeContent(raw: unknown): HomeContent {
  const override = isPlainObject(raw) ? raw : {};
  const merged = deepMerge(DEFAULT_HOME_CONTENT as unknown as Record<string, unknown>, override);
  const parsed = homeContentSchema.safeParse(merged);

  if (parsed.success) {
    return parsed.data;
  }

  console.warn("[home-content] Dữ liệu DB không hợp lệ, dùng bản mặc định:", parsed.error.issues[0]);
  return DEFAULT_HOME_CONTENT;
}
