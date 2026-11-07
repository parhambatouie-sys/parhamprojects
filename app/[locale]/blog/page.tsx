import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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
  let posts = [];
  try {
    const result = await query(
      "SELECT * FROM posts WHERE is_published = true AND locale = $1 ORDER BY created_at DESC",
      [locale]
    );
    posts = result.rows;
  } catch (error) {
    console.error("Failed to fetch posts:", error);
  }

  // جدا کردن پست ویژه (اولین پست) از بقیه مقالات
  const featuredPost = posts.length > 0 ? posts[0] : null;
  const otherPosts = posts.length > 1 ? posts.slice(1) : [];

  return (
    <>
      <Header locale={locale} />

      <main className="min-h-screen pt-32 pb-24 px-6 md:pt-44 md:pb-32 relative">
        {/* Background Decoration */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
           <div className="absolute -top-20 start-10 select-none font-mono text-[200px] font-black leading-none tracking-tighter text-foreground/[0.02] md:text-[400px]">
            BLOG
          </div>
          {/* Orange Glow */}
          <div className="absolute top-40 end-20 h-[500px] w-[500px] rounded-full bg-brand/5 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-16 md:mb-24">
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl lg:text-8xl">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
              {t("subtitle")}
            </p>
          </div>

          {/* Featured Post (پست ویژه) */}
          {featuredPost ? (
            <Link
              href={`/${locale}/blog/${featuredPost.slug}`}
              className="group relative mb-20 block overflow-hidden rounded-[2rem] border border-white/10 bg-card md:mb-32"
            >
              {/* تصویر یا گرادیانت پس‌زمینه */}
              {featuredPost.image_url ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={featuredPost.image_url} 
                    alt={featuredPost.title} 
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105 -z-20" 
                  />
                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#111315] via-[#111315]/90 to-[#111315]/40" />
                </>
              ) : (
                <>
                  <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#FF7438]/20 via-[#111315] to-[#111315] opacity-90 transition-transform duration-1000 group-hover:scale-105" />
                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#111315] via-[#111315]/80 to-transparent" />
                </>
              )}
              
              <div className="flex min-h-[450px] flex-col justify-end p-8 md:min-h-[600px] md:p-16 lg:p-20">
                <div className="mb-6 flex items-center gap-3">
                  <span className="rounded-full bg-brand px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest text-brand-foreground shadow-lg">
                    {featuredPost.category}
                  </span>
                  <span className="text-[10px] font-mono tracking-widest text-white/70" dir="ltr">
                    {new Date(featuredPost.created_at).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US')}
                  </span>
                </div>
                <h2 className="max-w-4xl text-3xl font-bold leading-[1.1] text-white transition-colors group-hover:text-brand md:text-5xl lg:text-7xl">
                  {featuredPost.title}
                </h2>
                <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/70 md:text-lg line-clamp-3">
                  {featuredPost.excerpt}
                </p>
                <div className="mt-8 flex items-center gap-3 text-sm font-semibold text-brand">
                  <span>{isRtl ? "مطالعه مقاله" : "Read Article"}</span>
                  <span className="rtl:rotate-180 transition-transform duration-300 group-hover:translate-x-2">→</span>
                </div>
              </div>
            </Link>
          ) : (
             <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-16 text-center text-muted backdrop-blur-md mb-20">
                <p className="text-lg">{isRtl ? "به‌زودی مقالات جدیدی منتشر خواهند شد." : "Articles are coming soon."}</p>
             </div>
          )}

          {/* Editorial List of Other Posts (لیست بقیه مقالات) */}
          {otherPosts.length > 0 && (
            <div className="border-t border-white/10">
              {otherPosts.map((post: any, i: number) => (
                <Link
                  key={post.slug}
                  href={`/${locale}/blog/${post.slug}`}
                  className="group relative block border-b border-white/10 py-10 transition-all duration-300 hover:bg-white/[0.02] md:py-14"
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-[60px_1fr_auto] md:items-center md:gap-10">
                    
                    {/* شماره */}
                    <span className="font-mono text-xs tracking-[0.25em] text-brand/50 transition-colors group-hover:text-brand md:self-start md:pt-2 md:text-sm">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* محتوا */}
                    <div>
                      <h3 className="text-2xl font-bold leading-[1.2] transition-colors group-hover:text-brand md:text-4xl lg:text-5xl">
                        {post.title}
                      </h3>
                      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted md:text-base line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* اطلاعات کناری */}
                    <div className="flex items-center justify-between gap-4 md:flex-col md:items-end md:gap-3 md:self-start">
                      <span className="text-[10px] font-mono tracking-widest text-muted" dir="ltr">
                        {new Date(post.created_at).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US')}
                      </span>
                      <span className="rounded-full border border-white/5 bg-white/[0.02] px-3 py-1 text-[10px] font-mono tracking-widest text-muted">
                        {post.category}
                      </span>
                    </div>

                  </div>

                  {/* دکمه هاور */}
                  <div className="absolute end-6 top-1/2 hidden -translate-y-1/2 opacity-0 transition-all duration-300 group-hover:opacity-100 md:block">
                     <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-lg rtl:rotate-180">→</span>
                  </div>

                  {/* خط هاور */}
                  <span className="pointer-events-none absolute bottom-0 start-0 h-px w-0 bg-brand transition-all duration-700 group-hover:w-full" />
                </Link>
              ))}
            </div>
          )}

        </div>
      </main>

      <Footer locale={locale} />
    </>
  );
}