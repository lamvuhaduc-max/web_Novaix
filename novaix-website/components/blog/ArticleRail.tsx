import Link from "next/link";
import ArticleCard from "./ArticleCard";
import type { PublicArticleCard } from "@/lib/blog/queries";

export type HomeRailData = {
  title: string;
  articles: PublicArticleCard[];
};

export default function ArticleRail({ rails }: { rails: HomeRailData[] }) {
  const activeRails = rails.filter((r) => r.articles.length > 0);

  if (activeRails.length === 0) {
    return null;
  }

  return (
    <section className="relative z-10 bg-slate-950 py-20 border-t border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-16">
          {activeRails.map((rail, idx) => (
            <div key={idx} className="space-y-8">
              {/* Header section title */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400"></span>
                    Tin tức & Kiến thức
                  </div>
                  <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
                    {rail.title}
                  </h2>
                </div>

                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-slate-300 transition-colors hover:text-teal-400"
                >
                  Xem tất cả bài viết
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Grid cards */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rail.articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
