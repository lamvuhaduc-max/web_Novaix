"use client";

import { useEffect, useRef, useState } from "react";
import { stats } from "@/lib/data";

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          let cur = 0;
          const step = target / 60;
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
    }, { threshold: 0.4 });
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

export default function Stats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-[18px] mt-14 panel rounded-[18px] p-[26px] backdrop-blur-sm">
      {stats.map((s) => (
        <div key={s.label}>
          <Counter target={s.target} suffix={s.suffix} />
          <div className="text-[13px] text-muted mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
