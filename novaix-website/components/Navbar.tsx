"use client";

import { useEffect, useState } from "react";
import { nav } from "@/lib/data";
import Image from "next/image";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
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
        <a href="#" className="flex items-center">
          <Image src="/logo.png" alt="OAlpha" width={120} height={40} className="h-[40px] w-auto" />
        </a>
        <div className="hidden md:flex gap-7 text-sm font-medium text-muted">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="hover:text-ink transition-colors">
              {n.label}
            </a>
          ))}
        </div>
        <a href="#lien-he" className="btn btn-primary">
          Đặt lịch demo →
        </a>
      </div>
    </nav>
  );
}
