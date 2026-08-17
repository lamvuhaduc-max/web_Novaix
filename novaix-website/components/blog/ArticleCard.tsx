import Link from "next/link";
import Image from "next/image";
import type { PublicArticleCard } from "@/lib/blog/queries";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export default function ArticleCard({ article }: { article: PublicArticleCard }) {
  const publishedDate = article.publishedAt
    ? dateFormatter.format(new Date(article.publishedAt))
    : null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/50 hover:shadow-xl hover:shadow-teal-500/10">
      {/* Cover Image Container */}
      <Link href={`/blog/${article.slug}`} className="relative aspect-[16/9] w-full overflow-hidden bg-slate-800">
        {article.coverImage ? (
          <img
            src={article.coverImage}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-3xl">
            📝
          </div>
        )}

        {/* Category Badge */}
        {article.category && (
          <span className="absolute left-3 top-3 rounded-full border border-teal-500/30 bg-slate-950/80 px-3 py-1 text-xs font-semibold text-teal-300 backdrop-blur-sm">
            {article.category.name}
          </span>
        )}
      </Link>

      {/* Card Content Body */}
      <div className="flex flex-1 flex-col p-5">
        {publishedDate && (
          <time className="mb-2 text-xs font-medium text-slate-400">
            {publishedDate}
          </time>
        )}

        <h3 className="mb-2 text-lg font-bold leading-snug text-slate-100 transition-colors group-hover:text-teal-400">
          <Link href={`/blog/${article.slug}`}>
            {article.title}
          </Link>
        </h3>

        {article.excerpt && (
          <p className="mb-4 line-clamp-2 text-sm text-slate-400">
            {article.excerpt}
          </p>
        )}

        <div className="mt-auto pt-2">
          <Link
            href={`/blog/${article.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 transition-colors hover:text-teal-300"
          >
            Đọc tiếp
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
