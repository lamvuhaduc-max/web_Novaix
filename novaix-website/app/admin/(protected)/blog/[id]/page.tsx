import { notFound } from "next/navigation";
import ArticleEditor from "@/components/admin/blog/ArticleEditor";
import { getArticleForEdit } from "@/lib/blog/article-actions";
import { listCategories } from "@/lib/blog/category-queries";

export const metadata = { title: "Sửa bài viết · OAlpha Admin" };
export const dynamic = "force-dynamic";

type Props = {
  params: { id: string };
};

export default async function EditArticlePage({ params }: Props) {
  const [article, categories] = await Promise.all([
    getArticleForEdit(params.id),
    listCategories(),
  ]);

  if (!article) {
    notFound();
  }

  return <ArticleEditor article={article} categories={categories} />;
}
