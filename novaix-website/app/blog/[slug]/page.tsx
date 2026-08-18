import { notFound } from "next/navigation";
import Link from "next/link";
import SiteNavbar from "@/components/site/SiteNavbar";
import SiteFooter from "@/components/site/SiteFooter";
import Toc from "@/components/blog/Toc";
import InlineToc from "@/components/blog/InlineToc";
import ArticleCard from "@/components/blog/ArticleCard";
import { getArticleBySlug, getRelatedArticles } from "@/lib/blog/queries";
import { wrapResponsiveTables } from "@/lib/blog/html";

export const revalidate = 300; // Cache ISR 5 phút

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props) {
  const article = await getArticleBySlug(params.slug);
  if (!article) return {};

  return {
    title: `${article.title} · OAlpha`,
    description: article.excerpt || article.title,
    openGraph: {
      title: article.title,
      description: article.excerpt || article.title,
      images: article.coverImage ? [article.coverImage] : [],
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const article = await getArticleBySlug(params.slug);
  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(article.id, article.category.id);
  const formattedDate = article.publishedAt
    ? dateFormatter.format(new Date(article.publishedAt))
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <SiteNavbar />

      <main className="flex-grow pt-28 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation theo Mockup */}
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6 overflow-hidden text-ellipsis whitespace-nowrap">
            <Link href="/" className="hover:text-teal-400 transition-colors">
              Trang chủ
            </Link>
            <span className="text-slate-600">&gt;</span>
            <Link href="/blog" className="hover:text-teal-400 transition-colors">
              Bài viết
            </Link>
            <span className="text-slate-600">&gt;</span>
            <Link
              href={`/blog?danh_muc=${article.category.slug}`}
              className="hover:text-teal-400 transition-colors"
            >
              {article.category.name}
            </Link>
            <span className="text-slate-600">&gt;</span>
            <span className="text-slate-200 font-medium truncate min-w-0">
              {article.title}
            </span>
          </nav>

          {/* Header Bài viết theo Mockup */}
          <div className="max-w-4xl mb-6">
            {/* Tag Badge Danh mục */}
            <div className="mb-3">
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300">
                {article.category.name}
              </span>
            </div>

            {/* Tiêu đề H1 vừa vặn */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight mb-3">
              {article.title}
            </h1>

            {/* Ngày đăng */}
            {formattedDate && (
              <time className="block text-xs text-slate-400 mb-4 font-medium">
                {formattedDate}
              </time>
            )}

            {/* Mô tả ngắn (Excerpt) */}
            {article.excerpt && (
              <p className="text-base text-slate-300 leading-relaxed font-normal mb-6 p-3.5 rounded-xl bg-slate-900/60 border-l-4 border-teal-400">
                {article.excerpt}
              </p>
            )}
          </div>

          {/* Bố cục 2 cột (Cột trái Mục lục + Cột phải Nội dung) theo Mockup */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Cột trái (Mục lục Sidebar dính - Desktop) */}
            {article.toc.length > 0 && (
              <aside className="hidden lg:block lg:col-span-4">
                <Toc items={article.toc} />
              </aside>
            )}

            {/* Cột chính (Nội dung bài viết) */}
            <article
              className={`${
                article.toc.length > 0 ? "lg:col-span-8" : "lg:col-span-12"
              } max-w-4xl`}
            >
              {/* Mục lục Inline hiển thị trên thiết bị di động */}
              <div className="block lg:hidden">
                <InlineToc items={article.toc} />
              </div>

              {/* Ảnh bìa bài viết */}
              {article.coverImage && (
                <div className="relative aspect-[21/9] max-h-[380px] w-full rounded-2xl overflow-hidden mb-8 border border-slate-800 bg-slate-900">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {/* Nội dung HTML định dạng prose vừa vặn */}
              <div
                className="prose prose-sm md:prose-base prose-invert max-w-none 
                  prose-headings:font-bold prose-headings:text-white prose-headings:scroll-mt-28 prose-headings:tracking-tight
                  prose-h1:text-2xl md:prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4
                  prose-h2:text-lg md:prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
                  prose-h3:text-base md:prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
                  prose-h4:text-sm md:prose-h4:text-base prose-h4:mt-4 prose-h4:mb-2
                  prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-5 prose-p:text-sm md:prose-p:text-base
                  prose-a:text-teal-400 prose-a:underline hover:prose-a:text-teal-300
                  prose-strong:text-white prose-strong:font-bold
                  prose-ul:list-disc prose-ul:pl-5 prose-ul:my-5 prose-li:mb-1.5 prose-li:text-sm md:prose-li:text-base prose-li:text-slate-300
                  prose-ol:list-decimal prose-ol:pl-5 prose-ol:my-5 prose-ol:text-sm md:prose-ol:text-base prose-ol:text-slate-300
                  prose-blockquote:border-l-4 prose-blockquote:border-teal-400 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-400 prose-blockquote:bg-slate-900/40 prose-blockquote:py-2 prose-blockquote:rounded-r-lg
                  prose-img:rounded-2xl prose-img:border prose-img:border-slate-800 prose-img:my-6
                  prose-table:w-full prose-table:border-collapse prose-table:my-6
                  prose-th:bg-slate-900 prose-th:p-3 prose-th:border prose-th:border-slate-800 prose-th:text-left prose-th:text-white prose-th:text-xs md:prose-th:text-sm
                  prose-td:p-3 prose-td:border prose-td:border-slate-800 prose-td:text-slate-300 prose-td:text-xs md:prose-td:text-sm"
                dangerouslySetInnerHTML={{ __html: wrapResponsiveTables(article.contentHtml) }}
              />
            </article>
          </div>

          {/* Khối Bài viết liên quan ở chân trang */}
          {relatedArticles.length > 0 && (
            <div className="mt-20 pt-12 border-t border-slate-800/80">
              <h3 className="text-2xl font-bold text-white mb-8">
                Bài viết liên quan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedArticles.map((rel) => (
                  <ArticleCard key={rel.id} article={rel} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
