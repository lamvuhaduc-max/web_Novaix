"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { nav } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-line backdrop-blur-xl transition-colors"
      style={{ background: scrolled ? "rgba(7,11,22,0.75)" : "rgba(7,11,22,0.4)" }}
    >
      <div className="wrap flex items-center justify-between h-[68px]">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="OAlpha" width={120} height={40} className="h-[40px] w-auto" />
        </Link>
        <div className="hidden md:flex gap-7 text-sm font-medium text-muted">
          {nav.map((n) => {
            const targetHref = n.href.startsWith("/")
              ? n.href
              : pathname === "/"
              ? n.href
              : `/${n.href}`;

            return (
              <a key={n.href} href={targetHref} className="hover:text-ink transition-colors">
                {n.label}
              </a>
            );
          })}
        </div>
        <a href={pathname === "/" ? "#lien-he" : "/#lien-he"} className="btn btn-primary">
          Đặt lịch demo →
        </a>
      </div>
    </nav>
  );
}
