export const stats = [
  { target: 40, suffix: "", label: "Module nghiệp vụ" },
  { target: 99, suffix: "%", label: "Uptime cam kết" },
  { target: 60, suffix: "%", label: "Giảm thao tác thủ công" },
  { target: 24, suffix: "/7", label: "Hỗ trợ vận hành" },
];

export const sectors = [
  "Bán lẻ & Chuỗi", "Sản xuất", "Phân phối", "Xây dựng & Nội thất",
  "Logistics", "F&B", "Thương mại điện tử", "Dịch vụ",
];

export const modules = [
  { icon: "🤝", title: "CRM — Quan hệ khách hàng", desc: "Quản lý lead, pipeline bán hàng, chăm sóc và lịch sử tương tác đa kênh (Zalo, email, hotline) trên một màn hình.", tag: "Sales · Marketing · CSKH" },
  { icon: "🏭", title: "ERP — Hoạch định nguồn lực", desc: "Lõi vận hành kết nối đơn hàng, sản xuất, mua hàng và tài chính theo thời gian thực, xuyên suốt toàn doanh nghiệp.", tag: "Core nghiệp vụ" },
  { icon: "📦", title: "Kho & Chuỗi cung ứng", desc: "Tồn kho đa kho, mã vạch/QR, định mức nguyên vật liệu, theo dõi nhập–xuất–tồn và cảnh báo tự động.", tag: "Inventory · SCM" },
  { icon: "💰", title: "Kế toán & Tài chính", desc: "Sổ cái, công nợ phải thu/phải trả, dòng tiền, hóa đơn điện tử và báo cáo tài chính tuân thủ chuẩn Việt Nam.", tag: "Finance" },
  { icon: "👥", title: "HRM — Nhân sự & Chấm công", desc: "Hồ sơ nhân sự, chấm công, tính lương, KPI và quản lý hiệu suất gắn liền với quy trình phê duyệt.", tag: "HR · Payroll" },
  { icon: "📋", title: "Quy trình & Dự án", desc: "Số hóa quy trình phê duyệt, giao việc, theo dõi tiến độ dự án và checklist nghiệm thu theo từng giai đoạn.", tag: "Workflow · BPM" },
  { icon: "📊", title: "BI — Báo cáo & Phân tích", desc: "Dashboard điều hành theo thời gian thực, báo cáo tùy biến và cảnh báo chỉ số kinh doanh quan trọng.", tag: "Analytics" },
  { icon: "🤖", title: "Tự động hóa AI", desc: "Trợ lý AI bóc tách chứng từ, dự báo nhu cầu, gợi ý quyết định và tự động hóa tác vụ lặp lại.", tag: "AI Automation" },
  { icon: "🔗", title: "Tích hợp & API mở", desc: "Kết nối sàn TMĐT, vận chuyển, ngân hàng và phần mềm hiện có qua API & webhook tiêu chuẩn.", tag: "Integration" },
];

export const features = [
  { n: 1, title: "Một nguồn dữ liệu duy nhất", desc: "Mọi phòng ban làm việc trên cùng dữ liệu, loại bỏ file Excel rời rạc và sai lệch số liệu." },
  { n: 2, title: "Tùy biến theo quy trình của bạn", desc: "Cấu hình module và luồng phê duyệt khớp với cách doanh nghiệp đang vận hành, không bắt bạn đổi theo phần mềm." },
  { n: 3, title: "Triển khai theo giai đoạn", desc: "Bắt đầu từ module cấp thiết nhất, mở rộng dần để kiểm soát chi phí và rủi ro." },
  { n: 4, title: "Đồng hành sau triển khai", desc: "Đào tạo, hỗ trợ và tối ưu liên tục để hệ thống thực sự được dùng, không bị bỏ phí." },
];

export const steps = [
  { n: "BƯỚC 01", title: "Khảo sát", desc: "Phân tích quy trình hiện tại, xác định điểm nghẽn và mục tiêu số hóa." },
  { n: "BƯỚC 02", title: "Thiết kế quy trình", desc: "Chuẩn hóa luồng nghiệp vụ và cấu hình module phù hợp với doanh nghiệp." },
  { n: "BƯỚC 03", title: "Triển khai", desc: "Cài đặt, nhập dữ liệu, tích hợp hệ thống cũ và kiểm thử thực tế." },
  { n: "BƯỚC 04", title: "Đào tạo", desc: "Hướng dẫn từng phòng ban sử dụng thành thạo, bàn giao tài liệu vận hành." },
  { n: "BƯỚC 05", title: "Tối ưu", desc: "Theo dõi chỉ số, hỗ trợ liên tục và mở rộng module theo nhu cầu." },
];

export const segments = [
  { icon: "🚀", title: "SME đang tăng trưởng", desc: "Thoát khỏi Excel và phần mềm rời rạc, chuẩn hóa quy trình trước khi mở rộng.", items: ["Triển khai nhanh trong 4–6 tuần", "Gói module thiết yếu", "Chi phí tối ưu theo người dùng"] },
  { icon: "🏢", title: "Doanh nghiệp quy mô", desc: "Hợp nhất nhiều phòng ban, chi nhánh và quy trình phức tạp trên một nền tảng.", items: ["Phân quyền đa cấp", "Quản lý đa chi nhánh", "Tích hợp hệ thống sẵn có"] },
  { icon: "🛠️", title: "Ngành đặc thù", desc: "Sản xuất, xây dựng – nội thất, phân phối với định mức và quy trình riêng.", items: ["Cấu hình quy trình tùy biến", "Quản lý định mức & BOM", "Báo cáo chuyên ngành"] },
];

export const testimonials = [
  { initials: "TM", quote: "Trước đây mỗi phòng dùng một file riêng, đối số liệu cuối tháng rất mệt. Sau khi dùng OAlpha, dữ liệu thông suốt, báo cáo có ngay trong vài phút.", name: "Chị Thu Minh", role: "Giám đốc vận hành · Chuỗi bán lẻ" },
  { initials: "QH", quote: "Module sản xuất và kho giúp chúng tôi kiểm soát định mức nguyên vật liệu chặt chẽ, giảm hao hụt rõ rệt chỉ sau một quý.", name: "Anh Quốc Huy", role: "Quản lý nhà máy · Sản xuất" },
  { initials: "NL", quote: "Đội OAlpha không chỉ bàn giao phần mềm mà còn giúp chúng tôi chuẩn hóa lại quy trình. Đó mới là giá trị thật.", name: "Chị Ngọc Lan", role: "Founder · Doanh nghiệp nội thất" },
];

export const nav = [
  { href: "#ve-chung-toi", label: "Giới thiệu" },
  { href: "#modules", label: "Sản phẩm" },
  { href: "#quy-trinh", label: "Quy trình" },
  { href: "/blog", label: "Bài viết" },
  { href: "#bang-gia", label: "Bảng giá" },
  { href: "#lien-he", label: "Liên hệ" },
];
