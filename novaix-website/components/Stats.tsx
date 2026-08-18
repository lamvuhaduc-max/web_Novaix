"use client";

import { useEffect, useRef, useState } from "react";
import type { HeroContent } from "@/lib/site-content/schema";

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            let cur = 0;
            const step = Math.max(1, target / 60);
            const iv = setInterval(() => {
              cur += step;
              if (cur >= target) {
                cur = target;
                clearInterval(iv);
              }
              setVal(Math.round(cur));
            }, 22);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="font-display font-extrabold text-[34px] grad-text-2">
      {val}
      {suffix}
    </div>
  );
}

function hexToRgba(hex: string = "#0b1120", opacityPercent: number = 60) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  const alpha = Math.max(0, Math.min(100, opacityPercent)) / 100;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function Stats({
  stats,
  bgColor = "#0b1120",
  bgOpacity = 60,
  borderColor = "#1e293b",
}: {
  stats: HeroContent["stats"];
  bgColor?: string;
  bgOpacity?: number;
  borderColor?: string;
}) {
  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-[18px] mt-14 panel rounded-[18px] p-[26px] backdrop-blur-sm"
      style={{
        backgroundColor: hexToRgba(bgColor, bgOpacity),
        borderColor: borderColor,
      }}
    >
      {stats.map((s, idx) => (
        <div key={idx}>
          <Counter target={s.target} suffix={s.suffix} />
          <div className="text-[13px] text-muted mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

