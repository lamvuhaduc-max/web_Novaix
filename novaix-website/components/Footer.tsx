import Image from "next/image";
import type { FooterContent } from "@/lib/site-content/schema";

export default function Footer({ content }: { content: FooterContent }) {
  const columns = content.columns || [];
  const bottomLinks = content.bottomLinks || [];

  return (
    <footer
      data-section="footer"
      className="border-t border-line pt-[60px] pb-9 relative z-[2] transition-colors"
      style={{
        backgroundColor: content.bgColor || "#0b1120",
        color: content.textColor || "#9aa6c4",
      }}
    >
      <div className="wrap">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.6fr_repeat(auto-fit,minmax(140px,1fr))_1.2fr] gap-[34px]">
          {/* Cột Thương hiệu */}
          <div>
            <a href="#" className="flex items-center">
              <Image src="/logo.png" alt="OAlpha" width={120} height={40} className="h-[40px] w-auto" />
            </a>
            <p className="mt-4 max-w-[300px] text-sm opacity-90 leading-relaxed">
              {content.brandDesc}
            </p>
          </div>

          {/* Các cột liên kết tuỳ chỉnh */}
          {columns.map((col, idx) => (
            <div key={idx}>
              <h5 className="text-[13px] uppercase tracking-[0.12em] font-bold text-muted mb-4">
                {col.title}
              </h5>
              <div className="flex flex-col gap-2.5">
                {col.links.map((link, lIdx) => (
                  <a
                    key={lIdx}
                    href={link.href || "#"}
                    className="text-sm opacity-85 hover:opacity-100 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}

          {/* Cột Liên hệ */}
          <div>
            <h5 className="text-[13px] uppercase tracking-[0.12em] font-bold text-muted mb-4">Liên hệ</h5>
            <div className="text-sm flex gap-2.5 items-start mb-2.5 opacity-90">
              📍
              <span>
                <b className="text-ink font-semibold">OAlpha</b>
                <br />
                14 Đường 41, An Khánh, TP. Thủ Đức, HCM
              </span>
            </div>
            <div className="text-sm flex gap-2.5 items-start mb-2.5 opacity-90">
              ✉️<span>OAlphaGlobal@oalpha.vn</span>
            </div>
          </div>
        </div>

        {/* Thanh đáy (Copyright + Bottom Links) */}
        <div className="mt-[46px] pt-6 border-t border-line flex justify-between flex-wrap gap-3 text-[13px] opacity-80">
          <span>{content.copyright}</span>
          <div className="flex gap-4 flex-wrap">
            {bottomLinks.map((bLink, bIdx) => (
              <a
                key={bIdx}
                href={bLink.href || "#"}
                className="hover:text-accent transition-colors"
              >
                {bLink.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
