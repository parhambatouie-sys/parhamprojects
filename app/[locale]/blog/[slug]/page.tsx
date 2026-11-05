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

      <main className="min-h-screen pt-32 pb-24 md:pt-44 md:pb-32 relative">
        <div className="mx-auto max-w-4xl px-6">
          
          <Link
            href={`/${locale}/blog`}
            className="mb-12 inline-flex items-center gap-2 text-sm font-medium text-brand transition hover:opacity-80"
          >
            <span className={isRtl ? "rotate-180" : ""}>←</span>
            {t("backToBlog")}
          </Link>

          {/* هدر مقاله */}
          <div className="mb-16 md:mb-24 text-center">
            <div className="mb-6 flex items-center justify-center gap-4">
              <span className="rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-[10px] font-mono tracking-widest text-brand">
                {post.category[locale as "fa" | "en"]}
              </span>
            </div>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
              {post.title[locale as "fa" | "en"]}
            </h1>
            <div className="mt-8 flex items-center justify-center gap-4 text-[11px] font-mono tracking-widest text-muted">
              <span className="font-semibold text-foreground uppercase">Parham Batouie</span>
              <span className="h-1 w-1 rounded-full bg-brand" />
              <span dir="ltr">{post.date}</span>
              <span className="h-1 w-1 rounded-full bg-brand" />
              <span>{post.readTime} {t("readTime")}</span>
            </div>
          </div>

          {/* متن مقاله */}
          <div className="prose prose-invert prose-lg max-w-none text-muted leading-[1.9] md:leading-[2]">
            {post.content[locale as "fa" | "en"].split("\n\n").map((paragraph, index) => (
              <p key={index} className="mb-10 text-base md:text-xl font-light">
                {paragraph}
              </p>
            ))}
          </div>

          {/* بخش CTA */}
          <div className="mt-24 rounded-[2rem] border border-white/10 bg-[url('/bio-bg.jpg')] bg-cover bg-center p-1">
             <div className="rounded-[1.8rem] bg-black/70 p-10 text-center backdrop-blur-md md:p-16">
                <h2 className="text-3xl font-bold md:text-5xl">
                  {isRtl ? "پروژه‌ای در ذهن دارید؟" : "Have a project in mind?"}
                </h2>
                <p className="mt-4 text-base text-muted">
                  {isRtl ? "بیایید درباره آن صحبت کنیم." : "Let's talk about it."}
                </p>
                <Link
                  href={`/${locale}/order`}
                  className="mt-10 inline-block rounded-md bg-brand px-10 py-4 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
                >
                  {isRtl ? "شروع یک پروژه" : "Start a Project"}
                </Link>
             </div>
          </div>

        </div>
      </main>

      <Footer locale={locale} />
    </>
  );
}