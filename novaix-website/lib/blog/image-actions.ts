"use server";

import { rethrowIfNextControlFlow } from "@/lib/next-errors";

import { requireUser } from "@/lib/auth/session";
import { getStorageDriver } from "@/lib/blog/storage";
import type { ActionResult } from "@/lib/blog/schema";
import { randomUUID } from "node:crypto";

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

export async function uploadArticleImage(
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  try {
    await requireUser();

    const file = formData.get("file") as File | null;
    if (!file) {
      return { ok: false, error: "Vui lòng chọn tệp ảnh để upload." };
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_SIZE) {
      return { ok: false, error: "Dung lượng ảnh vượt quá giới hạn 5 MB." };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const detected = detectImageMimeType(buffer);
    if (!detected) {
      return {
        ok: false,
        error: "Định dạng tệp không hợp lệ. Hệ thống chỉ chấp nhận ảnh JPEG, PNG và WebP.",
      };
    }

    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const uuidStr = randomUUID();
    const storageKey = `blog/${yyyy}/${mm}/${uuidStr}.${detected.ext}`;

    const storage = getStorageDriver();
    const publicUrl = await storage.put(storageKey, buffer, detected.mime);

    return { ok: true, data: { url: publicUrl } };
  } catch (err: any) {
    rethrowIfNextControlFlow(err);
    console.error("[blog] Upload ảnh thất bại:", err);
    return { ok: false, error: err.message || "Lỗi upload ảnh lên hệ thống." };
  }
}
