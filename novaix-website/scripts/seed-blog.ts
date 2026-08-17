import { db } from "../lib/db";
import { articles, articleCategories, users } from "../lib/db/schema";
import { extractToc } from "../lib/blog/toc";
import { eq } from "drizzle-orm";

async function seedBlog() {
  console.log("🌱 Khởi tạo dữ liệu hạt giống danh mục & bài viết...");

  // 1. Tạo danh mục mặc định
  const defaultCategories = [
    {
      name: "Giới thiệu",
      slug: "gioi-thieu",
      description: "Các trang giới thiệu công ty, quy trình và giải pháp OAlpha",
      sortOrder: 1,
      visible: true,
    },
    {
      name: "Chính sách",
      slug: "chinh-sach",
      description: "Chính sách bảo mật, điều khoản sử dụng và quy định dịch vụ",
      sortOrder: 2,
      visible: true,
    },
    {
      name: "Kiến thức",
      slug: "kien-thuc",
      description: "Bài viết chuyên sâu về CRM, ERP, quản trị và chuyển đổi số",
      sortOrder: 3,
      visible: true,
    },
  ];

  const categoryMap = new Map<string, string>();

  for (const cat of defaultCategories) {
    const existing = await db
      .select()
      .from(articleCategories)
      .where(eq(articleCategories.slug, cat.slug));

    if (existing.length === 0) {
      const [inserted] = await db.insert(articleCategories).values(cat).returning();
      categoryMap.set(cat.slug, inserted.id);
      console.log(`  ✓ Đã tạo danh mục: ${cat.name} (${cat.slug})`);
    } else {
      categoryMap.set(cat.slug, existing[0].id);
      console.log(`  - Danh mục đã tồn tại: ${cat.name} (${cat.slug})`);
    }
  }

  // Lấy tác giả admin mẫu nếu có
  const [adminUser] = await db.select().from(users).limit(1);
  const authorId = adminUser ? adminUser.id : null;

  // 2. Tạo bài viết mẫu với thẻ <h2> chuẩn hóa cho Mục lục (TOC)
  const defaultArticles = [
    {
      title: "Giới thiệu Hệ sinh thái Giải pháp Doanh nghiệp OAlpha",
      slug: "gioi-thieu-oalpha",
      categorySlug: "gioi-thieu",
      excerpt: "OAlpha là nền tảng quản trị tổng thể doanh nghiệp kết hợp CRM, ERP và tự động hóa quy trình vận hành toàn diện.",
      coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      status: "published" as const,
      contentHtml: `
        <p>Chào mừng bạn đến với <strong>OAlpha</strong> — giải pháp công nghệ tiên phong đồng hành cùng doanh nghiệp Việt Nam trong hành trình chuyển đổi số toàn diện.</p>
        
        <h2>1. Sứ mệnh và Tầm nhìn của OAlpha</h2>
        <p>Chúng tôi tin rằng mọi doanh nghiệp, từ khởi nghiệp đến các tập đoàn lớn, đều xứng đáng có một hệ thống quản trị hiện đại, linh hoạt và tối ưu chi phí.</p>

        <h2>2. Các Sản phẩm & Giải pháp Trọng tâm</h2>
        <p>Hệ sinh thái OAlpha cung cấp các module chuyên sâu gồm:</p>
        <ul>
          <li><strong>OAlpha CRM:</strong> Quản lý quan hệ khách hàng, tự động hóa phễu bán hàng.</li>
          <li><strong>OAlpha ERP:</strong> Quản trị nguồn lực, kho vận, tài chính và nhân sự.</li>
          <li><strong>OAlpha Automation:</strong> Kết nối quy trình liên phòng ban không mã code.</li>
        </ul>

        <h2>3. Tại sao chọn OAlpha cho Doanh nghiệp bạn?</h2>
        <p>Hệ thống được thiết kế tối ưu cho trải nghiệm người dùng, hạ tầng đám mây bảo mật chuẩn quốc tế và khả năng tùy biến cao theo ngành nghề kinh doanh.</p>

        <h2>4. Lộ trình Triển khai và Đồng hành lâu dài</h2>
        <p>Đội ngũ chuyên gia OAlpha trực tiếp khảo sát nhu cầu, xây dựng kịch bản chuẩn hóa và hỗ trợ đào tạo nhân sự tận nơi 24/7.</p>
      `,
    },
    {
      title: "Chính sách Bảo mật và An toàn Dữ liệu Khách hàng",
      slug: "chinh-sach-bao-mat",
      categorySlug: "chinh-sach",
      excerpt: "Cam kết bảo mật thông tin cá nhân, dữ liệu kinh doanh và quy định xử lý dữ liệu chuẩn hóa của OAlpha.",
      coverImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
      status: "published" as const,
      contentHtml: `
        <p>OAlpha coi trọng việc bảo vệ thông tin riêng tư và dữ liệu kinh doanh của khách hàng trên toàn bộ nền tảng đám mây.</p>

        <h2>1. Phạm vi Thu thập Thông tin</h2>
        <p>Chúng tôi chỉ thu thập các thông tin cần thiết phục vụ việc khởi tạo tài khoản, xác thực giao dịch và vận hành hệ thống.</p>

        <h2>2. Mục đích Sử dụng Dữ liệu</h2>
        <p>Thông tin thu thập được cam kết chỉ sử dụng nội bộ để cung cấp dịch vụ, nâng cấp tính năng và hỗ trợ kỹ thuật kịp thời.</p>

        <h2>3. Biện pháp An ninh & Mã hóa Dữ liệu</h2>
        <p>Toàn bộ dữ liệu được mã hóa SSL/TLS trên đường truyền và lưu trữ tại cơ sở dữ liệu đạt chứng nhận an toàn bảo mật ISO 27001.</p>

        <h2>4. Quyền lợi và Lựa chọn của Người dùng</h2>
        <p>Khách hàng có toàn quyền tra cứu, cập nhật hoặc yêu cầu xóa thông tin cá nhân bất kỳ lúc nào qua cổng quản trị thành viên.</p>
      `,
    },
    {
      title: "Hướng dẫn Xây dựng Phễu Bán hàng và Quản trị CRM Tối ưu 2026",
      slug: "huong-dan-quan-tri-crm-2026",
      categorySlug: "kien-thuc",
      excerpt: "Các chiến lược hiện đại giúp gia tăng tỷ lệ chuyển đổi khách hàng và tự động hóa quy trình chăm sóc đa kênh.",
      coverImage: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
      status: "published" as const,
      contentHtml: `
        <p>Trong kỷ nguyên số, việc thu hút khách hàng chỉ là bước khởi đầu. Chìa khóa thành công nằm ở khả năng tối ưu phễu chuyển đổi và duy trì quan hệ lâu dài qua CRM.</p>

        <h2>1. Định hình Các Giai đoạn Phễu Bán hàng</h2>
        <p>Xây dựng các nấc thang trải nghiệm từ Nhận biết, Quan tâm, Cân nhắc đến Quyết định mua hàng với dữ liệu minh bạch.</p>

        <h2>2. Tự động hóa Chăm sóc Khách hàng Đa kênh</h2>
        <p>Tích hợp Email, SMS, Zalo ZNS và Chatbot để tương tác tự động đúng thời điểm người dùng phát sinh nhu cầu.</p>

        <h2>3. Đo lường Chỉ số Hiệu quả (KPIs & Metrics)</h2>
        <p>Theo dõi các chỉ số quan trọng như Chi phí thu hút (CAC), Giá trị vòng đời (LTV) và Tỷ lệ rời bỏ (Churn Rate) trực tiếp trên báo cáo OAlpha Dashboard.</p>

        <h2>4. Tích hợp Hệ thống CRM vào Quy trình Vận hành Thực tế</h2>
        <p>Kết nối liền mạch bộ phận Marketing, Sales và Customer Support trên cùng một giao diện duy nhất để loại bỏ rào cản thông tin.</p>
      `,
    },
  ];

  for (const art of defaultArticles) {
    const existing = await db.select().from(articles).where(eq(articles.slug, art.slug));
    if (existing.length === 0) {
      const catId = categoryMap.get(art.categorySlug)!;
      const { toc } = extractToc(art.contentHtml);

      await db.insert(articles).values({
        title: art.title,
        slug: art.slug,
        categoryId: catId,
        excerpt: art.excerpt,
        coverImage: art.coverImage,
        contentHtml: art.contentHtml,
        toc,
        status: art.status,
        publishedAt: new Date(),
        authorId,
      });

      console.log(`  ✓ Đã khởi tạo bài viết: ${art.title} (Slug: /blog/${art.slug}) — [Mục lục TOC: ${toc.length} mục H2]`);
    } else {
      console.log(`  - Bài viết đã tồn tại: ${art.title}`);
    }
  }

  console.log("✅ Seed dữ liệu bài viết thành công!");
  process.exit(0);
}

seedBlog().catch((err) => {
  console.error("❌ Seed dữ liệu thất bại:", err);
  process.exit(1);
});
