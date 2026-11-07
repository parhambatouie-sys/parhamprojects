import Link from "next/link";
import { query } from "@/lib/db";

export async function LatestPosts({ locale }: { locale: string }) {
  const isRtl = locale === "fa";
  let posts = [];
  try {
    const result = await query(
      "SELECT * FROM posts WHERE is_published = true AND locale = $1 ORDER BY created_at DESC LIMIT 3",
      [locale]
    );
    posts = result.rows;
  } catch (error) {
    console.error("Failed to fetch latest posts:", error);
  }

  if (posts.length === 0) return null;

  return (
    <section className="relative overflow-hidden border-t border-border px-4 py-16 md:px-6 md:py-32">
      <div className="pointer-events-none absolute -top-20 start-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-brand/5 blur-[100px]" />
      
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col justify-between gap-6 md:mb-20 md:flex-row md:items-end">
          <div>
            <div className="mb-4 flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.25em] text-muted">
              <span className="h-px w-8 bg-border" />
              <span>LATEST INSIGHTS</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
              {isRtl ? "آخرین مقالات" : "Latest Posts"}
            </h2>
          </div>
          <Link 
            href={`/${locale}/blog`} 
            className="inline-flex items-center gap-2 rounded-full border border-border bg-transparent px-6 py-2.5 text-sm font-semibold text-foreground transition hover:bg-white/5"
          >
            {isRtl ? "مشاهده همه" : "View All"}
            <span className="rtl:rotate-180">→</span>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {posts.map((post: any) => (
            <Link 
              key={post.id} 
              href={`/${locale}/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#111315]/40 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_20px_40px_-20px_rgba(255,116,56,0.15)]"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/40">
                {post.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.image_url} alt={post.title} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted/30 text-[10px] font-mono uppercase tracking-widest">No Cover</div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5 md:p-6">
                <div className="mb-3 flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest text-brand md:text-[10px]">
                  <span>{post.category}</span>
                </div>
                <h3 className="mb-2 text-lg font-bold leading-tight text-foreground transition-colors group-hover:text-brand md:text-xl">
                  {post.title}
                </h3>
                <p className="mb-4 text-xs leading-relaxed text-muted line-clamp-2 md:text-sm">
                  {post.excerpt}
                </p>
                <div className="mt-auto pt-4 border-t border-white/5 text-[10px] font-mono tracking-widest text-muted flex justify-between items-center">
                  <span>{post.author}</span>
                  <span dir="ltr">{new Date(post.created_at).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}