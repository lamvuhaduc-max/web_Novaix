"use client";

import type { TocItem } from "@/lib/blog/toc";

export default function InlineToc({ items }: { items: TocItem[] }) {
  // Lọc danh sách đề mục H2 để hiển thị trong bảng Mục lục
  const h2Items = items.filter((item) => item.level === 2);

  if (h2Items.length === 0) return null;

  return (
    <div className="mb-8 p-6 bg-surface border border-line rounded-2xl shadow-sm">
      <div className="flex items-center gap-2.5 text-lg font-bold text-ink mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-accent"
        >
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
        <span>Mục lục</span>
      </div>

      <ul className="space-y-3">
        {h2Items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(item.id);
                if (el) {
                  const top = el.getBoundingClientRect().top + window.scrollY - 90;
                  window.scrollTo({ top, behavior: "smooth" });
                  history.replaceState(null, "", `#${item.id}`);
                }
              }}
              className="block text-base text-slate-300 hover:text-accent transition-colors font-medium leading-relaxed"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
