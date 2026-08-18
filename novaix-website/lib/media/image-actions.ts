"use server";

import { randomUUID } from "node:crypto";
import { requireUser } from "@/lib/auth/session";
import { rethrowIfNextControlFlow } from "@/lib/next-errors";
import { getStorageDriver } from "@/lib/blog/storage";

export type UploadResult = { ok: true; data: { url: string } } | { ok: false; error: string };

/** Thư mục hợp lệ trên R2. Allowlist chứ KHÔNG nội suy thô: chuỗi "../" trong
 *  storage key sẽ ghi tệp ra ngoài thư mục dự định. */
const FOLDERS = {
  blog: { prefix: "blog", maxBytes: 5 * 1024 * 1024 },
  partners: { prefix: "partners", maxBytes: 2 * 1024 * 1024 },
} as const;

export type UploadFolder = keyof typeof FOLDERS;

/**
 * Nhận dạng định dạng ảnh bằng magic byte.
 *
 * KHÔNG tin `file.type` hay phần mở rộng tên tệp — cả hai đều do trình duyệt
 * gửi lên và sửa được. Cố ý không nhận SVG: SVG là XML chạy được <script>,
 * đặt trên cùng tên miền là XSS trong ngữ cảnh trang OAlpha.
 */
function detectImageMimeType(buffer: Buffer): { ext: string; mime: string } | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: "jpg", mime: "image/jpeg" };
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { ext: "png", mime: "image/png" };
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return { ext: "webp", mime: "image/webp" };
  }
  return null;
}

/** Nhận ra tệp SVG để báo lỗi nói rõ việc cần làm, thay vì "định dạng không hợp lệ". */
function looksLikeSvg(buffer: Buffer): boolean {
  const head = buffer.toString("utf8", 0, Math.min(buffer.length, 300)).trimStart().toLowerCase();
  return head.startsWith("<svg") || head.startsWith("<?xml");
}

function isFolder(value: unknown): value is UploadFolder {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(FOLDERS, value);
}

/**
 * Tải một tấm ảnh lên kho lưu trữ (R2 ở production, đĩa local khi chạy dev).
 *
 * Dùng chung cho ảnh bài viết và logo đối tác — đừng chép hàm này ra chỗ thứ
 * hai: lần siết bảo mật sau sẽ chỉ chạm một bản, bản kia hỏng trong im lặng.
 */
export async function uploadImage(formData: FormData): Promise<UploadResult> {
  try {
    await requireUser();

    const rawFolder = formData.get("folder");
    if (!isFolder(rawFolder)) {
      return { ok: false, error: "Thư mục lưu trữ không hợp lệ." };
    }
    const { prefix, maxBytes } = FOLDERS[rawFolder];

    const file = formData.get("file") as File | null;
    if (!file) {
      return { ok: false, error: "Vui lòng chọn tệp ảnh để tải lên." };
    }

    if (file.size > maxBytes) {
      const mb = Math.round(maxBytes / (1024 * 1024));
      return { ok: false, error: `Dung lượng ảnh vượt quá giới hạn ${mb} MB.` };
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (looksLikeSvg(buffer)) {
      return {
        ok: false,
        error: "Không nhận tệp SVG. Vui lòng xuất logo sang PNG nền trong suốt.",
      };
    }

    const detected = detectImageMimeType(buffer);
    if (!detected) {
      return {
        ok: false,
        error: "Định dạng tệp không hợp lệ. Hệ thống chỉ chấp nhận ảnh JPEG, PNG và WebP.",
      };
    }

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const storageKey = `${prefix}/${yyyy}/${mm}/${randomUUID()}.${detected.ext}`;

    const url = await getStorageDriver().put(storageKey, buffer, detected.mime);

    return { ok: true, data: { url } };
  } catch (err: any) {
    rethrowIfNextControlFlow(err);
    console.error("[media] Tải ảnh lên thất bại:", err);
    return { ok: false, error: err?.message || "Lỗi tải ảnh lên hệ thống." };
  }
}
