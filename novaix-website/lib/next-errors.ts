/**
 * `redirect()` và `notFound()` của Next hoạt động bằng cách ném ra một Error
 * mang thuộc tính `digest` đặc biệt, để framework bắt ở tầng ngoài cùng.
 *
 * Server action nào bọc thân hàm trong try/catch đều sẽ nuốt mất lỗi này,
 * khiến chuyển hướng không xảy ra và người dùng nhận về chuỗi "NEXT_REDIRECT".
 * Mọi khối catch phải gọi hàm dưới đây trước khi xử lý lỗi nghiệp vụ.
 */
export function rethrowIfNextControlFlow(err: unknown): void {
  const digest = (err as { digest?: unknown })?.digest;
  if (typeof digest === "string" && (digest.startsWith("NEXT_REDIRECT") || digest === "NEXT_NOT_FOUND")) {
    throw err;
  }
}
