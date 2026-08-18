import { safeHex } from "@/lib/site-content/color";
import type { PartnersContent } from "@/lib/site-content/schema";

export default function Partners({ content }: { content: PartnersContent }) {
  // Chỉ lấy đối tác đang bật và đã có logo. Đối tác mới thêm chưa kịp tải ảnh
  // vẫn nằm trong panel để người dùng bổ sung, nhưng không ra ngoài trang.
  const visible = (content.items || []).filter((p) => p.visible !== false && p.logo);

  if (content.enabled === false || visible.length === 0) {
    return null;
  }

  // Nhân ĐÚNG HAI bản rồi dịch trọn một bản. Nhân ba rồi dịch -50% (như
  // components/Marquee.tsx đang làm) là dịch 1.5 bản — không phải bội số của
  // một bản, nên mỗi vòng lặp lại nội dung nhảy một nhịp, với logo thì rất rõ.
  const loop = [...visible, ...visible];

  const style: React.CSSProperties & Record<string, string | number> = {
    "--partners-gap": `${content.gap}px`,
    "--partners-speed": `${content.speed}s`,
    "--partners-logo-height": `${content.logoHeight}px`,
  };

  if (content.customColors) {
    style.backgroundColor = safeHex(content.bgColor, "#0b1120");
    style["--partners-label-color"] = safeHex(content.labelColor, "#5f6c8a");
  }

  return (
    <section
      data-section="partners"
      className="partners-strip border-y border-line py-8 overflow-hidden relative z-[2]"
      style={style}
      aria-label="Đối tác và khách hàng của OAlpha"
    >
      {content.label && (
        <div className="flex justify-center mb-5">
          <span className="partners-label text-[12px] font-bold uppercase tracking-[0.16em]">
            {content.label}
          </span>
        </div>
      )}

      <div
        className={`partners-viewport ${content.pauseOnHover ? "partners-pausable" : ""}`}
      >
        <div
          className={`partners-track ${content.direction === "phai" ? "partners-reverse" : ""}`}
        >
          {loop.map((p, i) => {
            const logo = (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={p.logo}
                alt={p.name}
                loading="lazy"
                className={`partners-logo ${content.grayscale ? "partners-grayscale" : ""}`}
              />
            );

            return (
              <div
                key={`${p.name}-${i}`}
                className="partners-item"
                /* Bản nhân đôi chỉ để chạy liền mạch — giấu khỏi trình đọc màn hình. */
                aria-hidden={i >= visible.length ? true : undefined}
              >
                {p.link ? (
                  <a href={p.link} target="_blank" rel="noopener noreferrer nofollow">
                    {logo}
                  </a>
                ) : (
                  logo
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
