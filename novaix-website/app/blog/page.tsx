import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/blog/ArticleCard";
import { getPublishedArticles } from "@/lib/blog/queries";
import { listCategories } from "@/lib/blog/category-actions";

export const metadata = {
  title: "Bài viết & Tin tức · OAlpha",
  description:
    "Tổng hợp kiến thức chuyển đổi số, CRM, ERP và các câu chuyện triển khai giải pháp quản trị doanh nghiệp thành công.",
};

export const revalidate = 300; // Cache 5 phút (ISR)

type Props = {
  searchParams: {
    danh_muc?: string;
    trang?: string;
  };
};

export default async function PublicArticlesListPage({ searchParams }: Props) {
  const page = parseInt(searchParams.trang || "1", 10);
  const categorySlug = searchParams.danh_muc;

  const [data, categories] = await Promise.all([
    getPublishedArticles({
      categorySlug,
      page,
      limit: 9,
    }),
    listCategories(),
  ]);

  const visibleCategories = categories.filter((c) => c.visible);

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-28 pb-20">
        <div className="wrap">
          {/* Section Header */}
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-bold tracking-widest text-accent uppercase mb-2 block">
              Góc kiến thức & Tin tức
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-ink tracking-tight mb-4">
              Bài viết Chuyển đổi số & Quản trị Doanh nghiệp
            </h1>
            <p className="text-muted text-base md:text-lg leading-relaxed">
              Kinh nghiệm triển khai CRM, ERP, tự động hóa quy trình và các giải pháp thực chiến giúp doanh nghiệp tối ưu vận hành.
            </p>
          </div>

          {/* Categories Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-line no-scrollbar">
            <Link
              href="/blog"
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
                !categorySlug
                  ? "bg-accent text-white"
                  : "bg-surface text-muted hover:text-ink border border-line"
              }`}
            >
              Tất cả bài viết
            </Link>

            {visibleCategories.map((cat) => {
              const isActive = categorySlug === cat.slug;
              return (
                <Link
                  key={cat.id}
                  href={`/blog?danh_muc=${cat.slug}`}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-accent text-white"
                      : "bg-surface text-muted hover:text-ink border border-line"
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>

          {/* Articles Grid */}
          {data.items.length === 0 ? (
            <div className="text-center py-20 bg-surface border border-line rounded-2xl p-8">
              <div className="text-4xl mb-3">📰</div>
              <h3 className="text-xl font-bold text-ink mb-2">Chưa có bài viết nào</h3>
              <p className="text-muted text-sm mb-6">
                Chưa có bài viết xuất bản trong danh mục này.
              </p>

              {categorySlug && (
                <Link href="/blog" className="btn btn-primary">
                  Xem tất cả bài viết
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {data.items.map((art) => (
                <ArticleCard key={art.id} article={art} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => {
                const isCurrent = p === data.page;
                const params = new URLSearchParams();
                if (categorySlug) params.set("danh_muc", categorySlug);
                params.set("trang", p.toString());

                return (
                  <Link
                    key={p}
                    href={`/blog?${params.toString()}`}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium text-sm transition-colors ${
                      isCurrent
                        ? "bg-accent text-white"
                        : "bg-surface text-muted hover:text-ink border border-line"
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
