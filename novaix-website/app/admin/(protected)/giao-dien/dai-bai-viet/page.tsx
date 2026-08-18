import PageHeader from "@/components/admin/PageHeader";
import RailsEditor from "@/components/admin/blog/RailsEditor";
import { getHomeRailsConfig } from "@/lib/blog/rails-config";
import { listCategories } from "@/lib/blog/category-queries";
import { listArticles } from "@/lib/blog/article-actions";

export const metadata = { title: "Dải bài viết trang chủ · OAlpha Admin" };
export const dynamic = "force-dynamic";

/**
 * Tách khỏi /admin/giao-dien vì route đó đã dành cho trình chỉnh sửa nội dung
 * trang chủ (customizer). Hai màn hình cùng sửa trang chủ nhưng khác đối tượng:
 * customizer sửa chữ và màu của các section tĩnh, màn này chọn bài viết hiển thị.
 */
export default async function HomeRailsPage() {
  const [initialRails, categories, articlesPage] = await Promise.all([
    getHomeRailsConfig(),
    listCategories(),
    listArticles({ status: "published", limit: 100 }),
  ]);

  return (
    <>
      <PageHeader
        title="Dải bài viết trang chủ"
        description="Chọn những bài viết được giới thiệu ở phần cuối trang chủ công khai."
      />
      <RailsEditor
        initialRails={initialRails}
        categories={categories}
        articlesList={articlesPage.items}
      />
    </>
  );
}
