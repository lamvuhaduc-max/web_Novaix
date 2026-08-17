import PageHeader from "@/components/admin/PageHeader";
import ArticlesManager from "@/components/admin/blog/ArticlesManager";
import { listArticles } from "@/lib/blog/article-actions";
import { listCategories } from "@/lib/blog/category-actions";

export const metadata = { title: "Bài viết · OAlpha Admin" };
export const dynamic = "force-dynamic";

type Props = {
  searchParams: {
    query?: string;
    categoryId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: string;
  };
};

export default async function PostsPage({ searchParams }: Props) {
  const page = parseInt(searchParams.page || "1", 10);
  const status = (searchParams.status || "all") as any;

  const [articlesData, categories] = await Promise.all([
    listArticles({
      query: searchParams.query,
      categoryId: searchParams.categoryId,
      status,
      startDate: searchParams.startDate,
      endDate: searchParams.endDate,
      page,
      limit: 20,
    }),
    listCategories(),
  ]);

  return (
    <>
      <PageHeader
        title="Quản lý Bài viết & Nội dung"
        description="Soạn thảo, xuất bản tin tức, giải pháp CRM/ERP và quản lý danh mục nội dung của OAlpha."
      />
      <ArticlesManager initialArticles={articlesData} categories={categories} />
    </>
  );
}
