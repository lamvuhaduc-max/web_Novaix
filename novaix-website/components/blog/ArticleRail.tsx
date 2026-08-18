import Link from "next/link";
import ArticleCard from "./ArticleCard";
import type { PublicArticleCard } from "@/lib/blog/queries";
import type { ArticlesContent } from "@/lib/site-content/schema";
// Dùng helper chung: bản chép tay ở đây chỉ nhận hex 6 ký tự, nên màu hợp lệ
// như #fff (schema cho phép) bị âm thầm thay bằng màu mặc định.
import { safeHex } from "@/lib/site-content/color";

export type HomeRailData = {
  title: string;
  articles: PublicArticleCard[];
};

export default function ArticleRail({
  rails,
  content,
}: {
  rails: HomeRailData[];
  content?: ArticlesContent;
}) {
  const activeRails = rails.filter((r) => r.articles.length > 0);

  if (activeRails.length === 0) {
    return null;
  }

  const isCustom = Boolean(content?.customColors);

  const customStyle: React.CSSProperties & Record<string, string> = isCustom
    ? {
        backgroundColor: safeHex(content?.bgColor, "#030712"),
        "--articles-kicker-color": safeHex(content?.kickerColor, "#2dd4bf"),
        "--articles-title-color": safeHex(content?.titleColor, "#eef2fb"),
        "--articles-cat-color": safeHex(content?.categoryBadgeColor, "#2dd4bf"),
        "--articles-cat-bg": safeHex(content?.categoryBadgeBg, "#0b1120"),
        "--articles-card-title": safeHex(content?.cardTitleColor, "#eef2fb"),
        "--articles-card-desc": safeHex(content?.cardDescColor, "#9aa6c4"),
        "--articles-card-bg": safeHex(content?.cardBgColor, "#0d1424"),
        "--articles-readmore-color": safeHex(content?.readMoreColor, "#2dd4bf"),
      }
    : {};

  return (
    <section
      data-section="articles"
      className="relative z-10 py-20 border-t border-slate-800/80 transition-colors"
      style={{
        backgroundColor: isCustom ? safeHex(content?.bgColor, "#030712") : undefined,
        ...customStyle,
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-16">
          {activeRails.map((rail, idx) => (
            <div key={idx} className="space-y-8">
              {/* Header section title */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="mb-2">
                    <span className="kicker">
                      Tin tức & Kiến thức
                    </span>
                  </div>
                  <h2
                    className="mt-2 text-2xl font-extrabold sm:text-3xl"
                    style={{
                      color: isCustom
                        ? safeHex(content?.titleColor, "#eef2fb")
                        : "var(--articles-title-color, #ffffff)",
                    }}
                  >
                    {rail.title}
                  </h2>
                </div>

                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1 text-sm font-semibold transition-colors"
                  style={{
                    color: isCustom
                      ? safeHex(content?.readMoreColor, "#2dd4bf")
                      : "var(--articles-readmore-color, var(--theme-primary, #2dd4bf))",
                  }}
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
