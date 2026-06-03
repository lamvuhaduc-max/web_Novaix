import { sectors } from "@/lib/data";

export default function Marquee() {
  const loop = [...sectors, ...sectors];
  return (
    <div className="border-y border-line py-[30px] overflow-hidden bg-bg-2 relative z-[2]">
      <div className="text-center text-muted text-[13px] uppercase tracking-[0.16em] mb-[18px]">
        Phù hợp với mọi lĩnh vực kinh doanh
      </div>
      <div className="flex gap-14 w-max animate-marquee">
        {loop.map((s, i) => (
          <span key={i} className="font-display font-bold text-[22px] text-[#5f6c8a] whitespace-nowrap">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
