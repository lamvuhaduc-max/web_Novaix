"use server";

import { uploadImage } from "@/lib/media/image-actions";
import type { ActionResult } from "@/lib/blog/schema";

/**
 * Tải ảnh cho trình soạn bài viết.
 *
 * Giữ nguyên chữ ký cũ để ArticleEditor không phải sửa; toàn bộ phần khó
 * (kiểm quyền, giới hạn dung lượng, nhận dạng bằng magic byte, từ chối SVG,
 * đẩy lên R2) nằm ở lib/media/image-actions.ts và dùng chung với logo đối tác.
 */
export async function uploadArticleImage(
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  formData.set("folder", "blog");
  return uploadImage(formData);
}
