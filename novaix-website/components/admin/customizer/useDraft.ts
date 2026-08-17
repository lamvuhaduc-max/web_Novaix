"use client";

import { useEffect, useRef, useState } from "react";
import type { HomeContent } from "@/lib/site-content/schema";

const DRAFT_STORAGE_KEY = "home_content_draft";

export type StoredDraft = {
  v: 1;
  content: HomeContent;
  baseUpdatedAt: string | null;
  savedAt: string;
};

export function useDraft(
  initialContent: HomeContent,
  baseUpdatedAt: string | null,
  isDirty: boolean,
  currentContent: HomeContent
) {
  const [draftDetected, setDraftDetected] = useState<StoredDraft | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Kiểm tra xem có bản nháp nào trong localStorage khi khởi tạo không
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredDraft;
        if (parsed && parsed.v === 1 && parsed.content) {
          // Chỉ coi là nháp nếu nội dung khác với initialContent
          if (JSON.stringify(parsed.content) !== JSON.stringify(initialContent)) {
            setDraftDetected(parsed);
          } else {
            localStorage.removeItem(DRAFT_STORAGE_KEY);
          }
        }
      }
    } catch {
      // Bỏ qua nếu localStorage bị vô hiệu hóa
    }
  }, [initialContent]);

  // Tự động ghi vào localStorage khi có thay đổi (debounce 500ms)
  useEffect(() => {
    if (!isDirty) return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      try {
        const draft: StoredDraft = {
          v: 1,
          content: currentContent,
          baseUpdatedAt,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      } catch {
        // Bỏ qua lỗi hạn mức localStorage
      }
    }, 500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [currentContent, isDirty, baseUpdatedAt]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}
    setDraftDetected(null);
  };

  return {
    draftDetected,
    clearDraft,
  };
}
