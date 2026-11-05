import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { posts } from "@/lib/posts";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    posts.map((post) => ({ locale, slug: post.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const baseUrl = "https://parhamprojects.vercel.app";
  const post = posts.find((p) => p.slug === slug);

  if (!post) return { title: "404" };

  return {
    title: post.title[locale as "fa" | "en"],
    description: post.excerpt[locale as "fa" | "en"],
    alternates: {
      canonical: `${baseUrl}/${locale}/blog/${slug}`,
      languages: {
        "fa-IR": `${baseUrl}/fa/blog/${slug}`,
        "en": `${baseUrl}/en/blog/${slug}`,
        "x-default": `${baseUrl}/en/blog/${slug}`,
      },
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Blog");
  const post = posts.find((p) => p.slug === slug);

  if (!post) notFound();

  const isRtl = locale === "fa";

  // داده‌های ساختاریافته برای گوگل
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title[locale as "fa" | "en"],
    description: post.excerpt[locale as "fa" | "en"],
    datePublished: post.date,
    inLanguage: locale === "fa" ? "fa-IR" : "en",
    author: { "@type": "Person", name: "Parham Batouie" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Header locale={locale} />

      <main className="min-h-screen pt-32 pb-24 px-6 md:pt-44 md:pb-32">
        <article className="mx-auto max-w-3xl">
          {/* دکمه بازگشت */}
          <Link
            href={`/${locale}/blog`}
            className="mb-10 inline-flex items-center gap-2 text-sm text-muted transition hover:text-brand"
          >
            <span className={isRtl ? "rotate-180" : ""}>←</span>
            {t("backToBlog")}
          </Link>

          {/* هدر مقاله */}
          <div className="mb-14">
            <div className="mb-6 flex items-center gap-3">
              <span className="rounded-full border border-border/50 bg-card px-3 py-1 text-[10px] font-mono tracking-widest text-brand">
                {post.category[locale as "fa" | "en"]}
              </span>
              <span className="text-[10px] font-mono tracking-widest text-muted" dir="ltr">
                {post.date}
              </span>
            </div>
            <h1 className="text-3xl font-bold leading-[1.15] tracking-tight md:text-5xl lg:text-6xl">
              {post.title[locale as "fa" | "en"]}
            </h1>
            <div className="mt-6 flex items-center gap-4 text-sm text-muted border-t border-b border-border py-4">
              <span className="font-semibold text-foreground">Parham Batouie</span>
              <span className="h-1 w-1 rounded-full bg-muted" />
              <span>{post.readTime} {t("readTime")}</span>
            </div>
          </div>

          {/* متن مقاله */}
          <div className="prose prose-invert prose-lg max-w-none text-muted leading-[1.8] md:leading-[2]">
            {post.content[locale as "fa" | "en"].split("\n\n").map((paragraph, index) => (
              <p key={index} className="mb-8 text-base md:text-lg">
                {paragraph}
              </p>
            ))}
          </div>

          {/* بخش دعوت به اقدام (CTA) */}
          <div className="mt-20 rounded-2xl border border-border bg-card p-8 text-center md:p-12">
            <h2 className="text-2xl font-bold md:text-3xl">
              {isRtl ? "پروژه‌ای در ذهن دارید؟" : "Have a project in mind?"}
            </h2>
            <p className="mt-3 text-muted">
              {isRtl ? "بیایید درباره آن صحبت کنیم." : "Let's talk about it."}
            </p>
            <Link
              href={`/${locale}/order`}
              className="mt-8 inline-block rounded-md bg-brand px-8 py-3.5 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
            >
              {isRtl ? "شروع یک پروژه" : "Start a Project"}
            </Link>
          </div>
        </article>
      </main>

      <Footer locale={locale} />
    </>
  );
}