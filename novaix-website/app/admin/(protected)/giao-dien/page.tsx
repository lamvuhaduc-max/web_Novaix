import PageHeader from "@/components/admin/PageHeader";
import RailsEditor from "@/components/admin/blog/RailsEditor";
import { getHomeRailsConfig } from "@/lib/blog/rails-config";
import { listCategories } from "@/lib/blog/category-queries";
import { listArticles } from "@/lib/blog/article-actions";

export const metadata = { title: "Quản lý Giao diện Trang chủ · OAlpha Admin" };
export const dynamic = "force-dynamic";

export default async function LayoutSettingsPage() {
  const [initialRails, categories, articlesPage] = await Promise.all([
    getHomeRailsConfig(),
    listCategories(),
    listArticles({ status: "published", limit: 100 }),
  ]);

  return (
    <>
      <PageHeader
        title="Quản lý Giao diện Trang chủ"
        description="Tùy chỉnh các dải bài viết nổi bật hiển thị trên giao diện trang chủ công khai của OAlpha."
      />
      <RailsEditor
        initialRails={initialRails}
        categories={categories}
        articlesList={articlesPage.items}
      />
    </>
  );
}
