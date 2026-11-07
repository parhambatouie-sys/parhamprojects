import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { query } from "@/lib/db";

// جلوگیری از کش شدن صفحه برای نمایش فوری مقالات جدید
export const dynamic = 'force-dynamic';

// تولید پارامترهای استاتیک برای زبان‌ها
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// تولید متادیتای سئو برای صفحه وبلاگ
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = "https://parhamprojects.vercel.app";
  const t = await getTranslations({ locale, namespace: "Blog" });

  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: `${baseUrl}/${locale}/blog`,
      languages: {
        "fa-IR": `${baseUrl}/fa/blog`,
        "en": `${baseUrl}/en/blog`,
        "x-default": `${baseUrl}/en/blog`,
      },
    },
  };
}

// تعریف تایپ برای مقالات
type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  created_at: string;
};

// کامپوننت اختصاصی برای هر کارت مقاله
// این کارت برای تمامی مقالات (چه جدید چه قدیم) استفاده می‌شود تا همه یک ظاهر داشته باشند
function ArticleCard({ post, locale, index }: { post: Post; locale: string; index: number }) {
  const isRtl = locale === "fa";
  const date = new Date(post.created_at).toLocaleDateString(
    locale === 'fa' ? 'fa-IR' : 'en-US'
  );

  return (
    <Link
      href={`/${locale}/blog/${post.slug}`}
      className="group relative block border-b border-white/10 py-10 transition-all duration-300 hover:bg-white/[0.02] md:py-14"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[60px_1fr_auto] md:items-center md:gap-10">
        
        {/* شماره مقاله */}
        <span className="font-mono text-xs tracking-[0.25em] text-brand/50 transition-colors group-hover:text-brand md:self-start md:pt-2 md:text-sm">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* محتوای اصلی */}
        <div>
          <h3 className="text-2xl font-bold leading-[1.2] transition-colors group-hover:text-brand md:text-4xl lg:text-5xl">
            {post.title}
          </h3>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted md:text-base line-clamp-2">
            {post.excerpt}
          </p>
        </div>

        {/* اطلاعات جانبی */}
        <div className="flex items-center justify-between gap-4 md:flex-col md:items-end md:gap-3 md:self-start">
          <span className="text-[10px] font-mono tracking-widest text-muted" dir="ltr">
            {date}
          </span>
          <span className="rounded-full border border-white/5 bg-white/[0.02] px-3 py-1 text-[10px] font-mono tracking-widest text-muted">
            {post.category}
          </span>
        </div>
      </div>

      {/* دکمه هاور */}
      <div className="absolute end-6 top-1/2 hidden -translate-y-1/2 opacity-0 transition-all duration-300 group-hover:opacity-100 md:block">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-lg rtl:rotate-180">
          →
        </span>
      </div>

      {/* خط هاور */}
      <span className="pointer-events-none absolute bottom-0 start-0 h-px w-0 bg-brand transition-all duration-700 group-hover:w-full" />
    </Link>
  );
}

// کامپوننت اصلی صفحه
export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Blog");
  const isRtl = locale === "fa";

  // دریافت مقالات از دیتابیس
  let posts: Post[] = [];
  try {
    const result = await query(
      "SELECT * FROM posts WHERE is_published = true AND locale = $1 ORDER BY created_at DESC",
      [locale]
    );
    posts = result.rows;
  } catch (error) {
    console.error("Failed to fetch posts:", error);
  }

  return (
    <>
      <Header locale={locale} />
      <main className="min-h-screen pt-32 pb-24 px-6 md:pt-44 md:pb-32 relative">
        
        {/* پس‌زمینه */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-20 start-10 select-none font-mono text-[200px] font-black leading-none tracking-tighter text-foreground/[0.02] md:text-[400px]">
            BLOG
          </div>
        </div>

        <div className="mx-auto max-w-7xl">
          {/* سربرگ صفحه */}
          <div className="mb-16 md:mb-24">
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl lg:text-8xl">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
              {t("subtitle")}
            </p>
          </div>

          {/* لیست مقالات */}
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card/30 p-12 text-center text-muted backdrop-blur-sm">
              <p className="text-lg">
                {isRtl ? "به‌زودی مقالات جدیدی منتشر خواهند شد." : "Articles are coming soon."}
              </p>
            </div>
          ) : (
            <div className="border-t border-white/10">
              {posts.map((post, index) => (
                <ArticleCard 
                  key={post.id} 
                  post={post} 
                  locale={locale} 
                  index={index} 
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer locale={locale} />
    </>
  );
}