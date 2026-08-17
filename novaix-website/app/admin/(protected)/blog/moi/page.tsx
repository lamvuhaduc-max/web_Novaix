import ArticleEditor from "@/components/admin/blog/ArticleEditor";
import { listCategories } from "@/lib/blog/category-queries";

export const metadata = { title: "Thêm bài viết mới · OAlpha Admin" };
export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const categories = await listCategories();

  return <ArticleEditor categories={categories} />;
}
