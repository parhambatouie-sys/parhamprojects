import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { posts } from "@/lib/posts";

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

  const featuredPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <>
      <Header locale={locale} />

      <main className="min-h-screen pt-32 pb-24 px-6 md:pt-44 md:pb-32">
        <div className="mx-auto max-w-7xl">
          
          {/* Header */}
          <div className="mb-16 md:mb-24">
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
              {t("title")}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted md:mt-6 md:text-lg">
              {t("subtitle")}
            </p>
          </div>

          {/* Featured Post */}
          <Link
            href={`/${locale}/blog/${featuredPost.slug}`}
            className="group relative mb-20 block overflow-hidden rounded-2xl border border-border md:mb-28"
          >
            {/* Placeholder Gradient for Featured Image */}
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top_right,#111315,#292D31,#FF7438)] opacity-80" />
            <div className="absolute inset-0 -z-10 bg-black/40 transition-colors group-hover:bg-black/20" />
            
            <div className="flex min-h-[400px] flex-col justify-end p-8 md:min-h-[500px] md:p-14 lg:p-20">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-white backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
                Featured
              </div>
              <h2 className="max-w-3xl text-3xl font-bold leading-[1.15] text-white transition-colors group-hover:text-brand md:text-5xl lg:text-6xl">
                {featuredPost.title[locale as "fa" | "en"]}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80 md:mt-6 md:text-lg">
                {featuredPost.excerpt[locale as "fa" | "en"]}
              </p>
              <div className="mt-8 flex items-center gap-6 text-[10px] font-mono tracking-widest text-white/60">
                <span dir="ltr">{featuredPost.date}</span>
                <span>{featuredPost.readTime} {t("readTime")}</span>
              </div>
            </div>
          </Link>

          {/* Grid of Other Posts */}
          <div className="grid grid-cols-1 gap-x-16 md:grid-cols-2">
            {otherPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/${locale}/blog/${post.slug}`}
                className="group relative flex flex-col justify-between border-t border-border py-10 transition-colors hover:bg-white/[0.015] md:py-14"
              >
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <span className="rounded-full border border-border/50 bg-card px-3 py-1 text-[10px] font-mono tracking-widest text-muted">
                      {post.category[locale as "fa" | "en"]}
                    </span>
                    <span className="text-[10px] font-mono tracking-widest text-muted" dir="ltr">
                      {post.date}
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold transition-colors group-hover:text-brand md:text-3xl lg:text-4xl">
                    {post.title[locale as "fa" | "en"]}
                  </h3>
                  <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted md:text-base">
                    {post.excerpt[locale as "fa" | "en"]}
                  </p>
                </div>
                <div className="mt-8 flex items-center justify-between">
                  <span className="text-sm font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100">
                    {t("readMore")} {isRtl ? "←" : "→"}
                  </span>
                  <span className="text-[10px] font-mono tracking-widest text-muted">
                    {post.readTime} {t("readTime")}
                  </span>
                </div>
                {/* Orange Hover Line */}
                <span className="pointer-events-none absolute bottom-0 start-0 h-px w-0 bg-brand transition-all duration-700 group-hover:w-full" />
              </Link>
            ))}
          </div>

        </div>
      </main>

      <Footer locale={locale} />
    </>
  );
}