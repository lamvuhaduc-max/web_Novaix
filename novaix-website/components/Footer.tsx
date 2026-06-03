export default function Footer() {
  return (
    <footer className="border-t border-line pt-[60px] pb-9 bg-bg-2 relative z-[2]">
      <div className="wrap">
        <div className="grid grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1.2fr] gap-[34px]">
          <div>
            <a href="#" className="flex items-center gap-2.5 font-display font-extrabold text-xl">
              <span className="w-[30px] h-[30px] rounded-[9px] grid place-items-center text-[15px] text-[#04121a]"
                style={{ background: "linear-gradient(135deg,#2dd4bf,#38bdf8)", boxShadow: "var(--glow)" }}>
                N
              </span>
              Nov<span className="text-accent">AIX</span>
            </a>
            <p className="mt-4 max-w-[300px] text-[#9aa6c4] text-sm">
              Giải pháp công nghệ giúp doanh nghiệp Việt hệ thống hóa quy trình và vận hành bằng dữ liệu.
            </p>
          </div>
          <div>
            <h5 className="text-[13px] uppercase tracking-[0.12em] text-muted mb-4">Sản phẩm</h5>
            {["CRM", "ERP", "HRM", "Kế toán", "BI & Báo cáo"].map((x) => (
              <a key={x} href="#modules" className="block text-[#9aa6c4] text-sm mb-2.5 hover:text-accent">{x}</a>
            ))}
          </div>
          <div>
            <h5 className="text-[13px] uppercase tracking-[0.12em] text-muted mb-4">Công ty</h5>
            {[["Giải pháp", "#giai-phap"], ["Quy trình", "#quy-trinh"], ["Khách hàng", "#khach-hang"], ["Liên hệ", "#lien-he"]].map(([l, h]) => (
              <a key={l} href={h} className="block text-[#9aa6c4] text-sm mb-2.5 hover:text-accent">{l}</a>
            ))}
          </div>
          <div>
            <h5 className="text-[13px] uppercase tracking-[0.12em] text-muted mb-4">Liên hệ</h5>
            <div className="text-sm text-[#9aa6c4] flex gap-2.5 items-start mb-2.5">
              📍<span><b className="text-ink">NovAIX</b><br />14 Đường 41, An Khánh, TP. Thủ Đức, HCM</span>
            </div>
            <div className="text-sm text-[#9aa6c4] flex gap-2.5 items-start mb-2.5">
              ✉️<span>contact@novaix.vn</span>
            </div>
          </div>
        </div>
        <div className="mt-[46px] pt-6 border-t border-line flex justify-between flex-wrap gap-3 text-muted text-[13px]">
          <span>© 2026 NovAIX. Mọi quyền được bảo lưu.</span>
          <span>Chính sách bảo mật · Điều khoản</span>
        </div>
      </div>
    </footer>
  );
}
