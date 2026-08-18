"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { NavContent } from "@/lib/site-content/schema";

export default function Navbar({ content }: { content: NavContent }) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /**
   * Neo "#modules" chỉ nhảy đúng khi đang ở trang chủ. Ở /blog hay /blog/[slug]
   * phải đổi thành "/#modules", nếu không trình duyệt tìm neo ngay trong trang
   * bài viết và không tìm thấy.
   */
  function resolveHref(href: string) {
    if (href.startsWith("/")) return href;
    return isHome ? href : `/${href}`;
  }

  return (
    <nav
      data-section="nav"
      className="fixed top-0 left-0 right-0 z-50 border-b border-line backdrop-blur-xl transition-colors"
      style={{ background: scrolled ? "rgba(7,11,22,0.75)" : "rgba(7,11,22,0.4)" }}
    >
      <div className="wrap flex items-center justify-between h-[68px]">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt={content.brandName} width={120} height={40} className="h-[40px] w-auto" />
        </Link>

        <div className="hidden md:flex gap-7 text-sm font-medium text-muted">
          {content.items
            .filter((n) => n.visible !== false)
            .map((n) => (
              <a key={n.href} href={resolveHref(n.href)} className="hover:text-ink transition-colors">
                {n.label}
              </a>
            ))}
        </div>

        <a href={resolveHref("#lien-he")} className="btn btn-primary">
          {content.ctaLabel}
        </a>
      </div>
    </nav>
  );
}
