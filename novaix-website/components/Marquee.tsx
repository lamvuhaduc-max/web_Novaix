import type { MarqueeContent } from "@/lib/site-content/schema";

export default function Marquee({ content }: { content: MarqueeContent }) {
  if (content.enabled === false) {
    return null;
  }

  const loop = [...content.items, ...content.items, ...content.items];
  const speed = content.speed || 30;
  const gap = content.gap !== undefined ? content.gap : 160;

  const contentElement = (
    <div
      data-section="marquee"
      className="border-y border-line py-[30px] overflow-hidden relative z-[2] transition-colors"
      style={{ backgroundColor: content.bgColor || "#0b1120" }}
    >
      {content.label && (
        <div className="flex justify-center mb-[18px]">
          <span
            className="text-[12px] font-bold uppercase tracking-[0.16em] px-3.5 py-1 rounded-full"
            style={{
              backgroundColor: content.labelBgColor || "rgba(45,212,191,0.15)",
              color: content.labelTextColor || "#2dd4bf",
            }}
          >
            {content.label}
          </span>
        </div>
      )}

      <div
        className="flex w-max animate-marquee"
        style={{
          gap: `${gap}px`,
          animationDuration: `${speed}s`,
        }}
      >
        {loop.map((s, i) => (
          <span
            key={i}
            className="font-display font-bold text-[22px] whitespace-nowrap transition-colors"
            style={{ color: content.textColor || "#5f6c8a" }}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );

  if (content.link && content.link.trim() !== "") {
    return (
      <a href={content.link} className="block cursor-pointer hover:opacity-90 transition-opacity">
        {contentElement}
      </a>
    );
  }

  return contentElement;
}
