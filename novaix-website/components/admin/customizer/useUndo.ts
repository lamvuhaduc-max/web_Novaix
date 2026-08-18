"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HomeContent } from "@/lib/site-content/schema";

const MAX_HISTORY = 50;

export function useUndo(initialContent: HomeContent) {
  const [history, setHistory] = useState<HomeContent[]>([initialContent]);
  const [pointer, setPointer] = useState(0);

  const lastFieldRef = useRef<string | null>(null);
  const lastTimeRef = useRef<number>(0);

  const current = history[pointer] ?? initialContent;
  const canUndo = pointer > 0;
  const canRedo = pointer < history.length - 1;

  const pushState = useCallback(
    (nextContent: HomeContent, fieldPath?: string) => {
      const now = Date.now();
      const isSameField = fieldPath && fieldPath === lastFieldRef.current;
      const isWithinGroupTime = now - lastTimeRef.current < 600;

      setHistory((prev) => {
        const sliced = prev.slice(0, pointer + 1);

        // Nếu đang gõ tiếp vào cùng 1 ô trong khoảng 600ms -> ghi đè state hiện tại thay vì đẩy bước mới
        if (isSameField && isWithinGroupTime && sliced.length > 1) {
          const updated = [...sliced];
          updated[updated.length - 1] = nextContent;
          return updated;
        }

        const nextHistory = [...sliced, nextContent];
        if (nextHistory.length > MAX_HISTORY) {
          nextHistory.shift();
        }
        return nextHistory;
      });

      setPointer((prev) => {
        if (isSameField && isWithinGroupTime && prev > 0) {
          return prev;
        }
        return Math.min(pointer + 1, MAX_HISTORY - 1);
      });

      lastFieldRef.current = fieldPath || null;
      lastTimeRef.current = now;
    },
    [pointer]
  );

  const undo = useCallback(() => {
    if (canUndo) {
      setPointer((p) => p - 1);
    }
  }, [canUndo]);

  const redo = useCallback(() => {
    if (canRedo) {
      setPointer((p) => p + 1);
    }
  }, [canRedo]);

  const resetHistory = useCallback((content: HomeContent) => {
    setHistory([content]);
    setPointer(0);
    lastFieldRef.current = null;
    lastTimeRef.current = 0;
  }, []);

  // Bắt phím tắt Ctrl+Z / Ctrl+Y
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (!cmdOrCtrl) return;

      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA");

      // Nếu không ở trong input hoặc nhấn Ctrl+Shift+Z / Ctrl+Y
      if (e.key.toLowerCase() === "z" && !e.shiftKey) {
        if (!isInput && canUndo) {
          e.preventDefault();
          undo();
        }
      } else if ((e.key.toLowerCase() === "z" && e.shiftKey) || e.key.toLowerCase() === "y") {
        if (!isInput && canRedo) {
          e.preventDefault();
          redo();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  return {
    current,
    canUndo,
    canRedo,
    undo,
    redo,
    pushState,
    resetHistory,
  };
}
