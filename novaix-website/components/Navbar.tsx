"use client";

import { useEffect, useState } from "react";
import { nav } from "@/lib/data";

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
        <a href="#" className="flex items-center gap-2.5 font-display font-extrabold text-xl">
          <span
            className="w-[30px] h-[30px] rounded-[9px] grid place-items-center text-[15px] text-[#04121a]"
            style={{ background: "linear-gradient(135deg,#2dd4bf,#38bdf8)", boxShadow: "var(--glow)" }}
          >
            N
          </span>
          Nov<span className="text-accent">AIX</span>
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
