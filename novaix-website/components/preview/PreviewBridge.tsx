"use client";

import { useEffect, useState } from "react";
import HomeSections from "./HomeSections";
import type { PreviewMessage, SectionKey } from "@/lib/site-content/preview-bridge";
import type { HomeContent } from "@/lib/site-content/schema";
import type { PublicArticleCard } from "@/lib/blog/queries";

export default function PreviewBridge({
  initial,
  articleRails = [],
}: {
  initial: HomeContent;
  articleRails?: { title: string; articles: PublicArticleCard[] }[];
}) {
  const [content, setContent] = useState<HomeContent>(initial);

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      // 🔴 BẮT BUỘC: Kiểm tra an toàn nguồn gốc
      if (e.origin !== window.location.origin) return;

      const msg = e.data as PreviewMessage;
      if (!msg || typeof msg !== "object") return;

      if (msg.type === "preview:content" && msg.content) {
        setContent(msg.content);
      }

      if (msg.type === "preview:scroll-to" && msg.section) {
        const el = document.querySelector(`[data-section="${msg.section}"]`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }

    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const sectionEl = target.closest("[data-section]") as HTMLElement | null;
      if (sectionEl) {
        const section = sectionEl.getAttribute("data-section") as SectionKey;
        if (section && window.parent) {
          window.parent.postMessage(
            { type: "preview:section-click", section } satisfies PreviewMessage,
            window.location.origin
          );
        }
      }
    }

    window.addEventListener("message", handleMessage);
    document.addEventListener("click", handleClick);

    // Thông báo cho cửa sổ cha (panel) là iframe đã sẵn sàng nhận dữ liệu
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        { type: "preview:ready" } satisfies PreviewMessage,
        window.location.origin
      );
    }

    return () => {
      window.removeEventListener("message", handleMessage);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return <HomeSections content={content} articleRails={articleRails} />;
}
