/** Mã màu hex 3, 6 hoặc 8 ký tự. */
export const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX_COLOR.test(value.trim());
}

/**
 * Trả về màu an toàn để ghép vào CSS.
 *
 * Bắt buộc dùng ở MỌI chỗ nhận màu do người dùng nhập rồi đưa vào style —
 * kể cả `sx` của MUI: Emotion biên dịch `sx={{ bgcolor: value }}` thành một
 * luật CSS thật, nên một chuỗi như `red; } * { display: none } .x {` sẽ đóng
 * sớm khai báo và áp luật của kẻ gõ vào lên toàn bộ trang.
 */
export function safeHex(value: unknown, fallback: string): string {
  return isHexColor(value) ? (value as string).trim() : fallback;
}
