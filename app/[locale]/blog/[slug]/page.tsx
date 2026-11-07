import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const baseUrl = "https://parhamprojects.vercel.app";
  
  try {
    const result = await query("SELECT title, excerpt, seo_title, seo_description FROM posts WHERE slug = $1", [slug]);
    if (result.rows.length > 0) {
      const post = result.rows[0];
      return {
        title: post.seo_title || post.title,
        description: post.seo_description || post.excerpt,
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
  } catch (error) {}

  return { title: "Post Not Found" };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Blog");
  const isRtl = locale === "fa";

  let post: any = null;
  try {
    const result = await query("SELECT * FROM posts WHERE slug = $1 AND is_published = true", [slug]);
    if (result.rows.length > 0) post = result.rows[0];
  } catch (error) {
    console.error("Failed to fetch post:", error);
  }

  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.created_at,
    inLanguage: locale === "fa" ? "fa-IR" : "en",
    author: { "@type": "Person", name: post.author },
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
          
          {/* Back Button */}
          <Link
            href={`/${locale}/blog`}
            className="mb-12 inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-brand"
          >
            <span className={isRtl ? "rotate-180" : ""}>←</span>
            {t("backToBlog")}
          </Link>

          {/* Header */}
          <div className="mb-12 md:mb-16">
            <div className="mb-6 flex items-center gap-4">
              <span className="rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-[10px] font-mono tracking-widest text-brand uppercase">
                {post.category}
              </span>
              <span className="text-[11px] font-mono tracking-widest text-muted" dir="ltr">
                {new Date(post.created_at).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US')}
              </span>
            </div>
            
            <h1 className="text-4xl font-bold leading-[1.15] tracking-tight md:text-5xl lg:text-6xl">
              {post.title}
            </h1>
            
            <div className="mt-8 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/20 border border-brand/30 text-brand font-bold text-sm">
                {post.author.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">{post.author}</span>
                <span className="text-[11px] text-muted">{isRtl ? "نویسنده" : "Author"}</span>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          {post.image_url && (
            <div className="relative mb-16 md:mb-24 aspect-video w-full overflow-hidden rounded-3xl border border-white/5 bg-black/40 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.image_url} alt={post.title} className="object-cover w-full h-full" />
            </div>
          )}

          {/* Content (Minimal & Readable) */}
          <div className="prose prose-invert prose-lg max-w-none text-muted leading-[2] md:leading-[2.3]">
            {post.content.split("\n\n").map((paragraph: string, index: number) => {
              // اگر پاراگراف با ## شروع شده بود، آن را به عنوان تیتر نمایش بده
              if (paragraph.trim().startsWith("## ")) {
                return (
                  <h2 key={index} className="mt-16 mb-6 text-2xl font-bold text-foreground md:text-3xl">
                    {paragraph.replace("## ", "")}
                  </h2>
                );
              }
              return (
                <p key={index} className="mb-8 text-base md:text-lg font-light whitespace-pre-wrap">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="relative mt-32 overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#FF7438]/20 via-[#111315] to-[#111315] p-1">
             <div className="rounded-[1.8rem] bg-black/40 p-10 text-center backdrop-blur-md md:p-16">
                <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl">
                  {isRtl ? "پروژه‌ای در ذهن دارید؟" : "Have a project in mind?"}
                </h2>
                <p className="mt-4 text-base text-muted">
                  {isRtl ? "بیایید درباره آن صحبت کنیم و ایده شما را به واقعیت تبدیل کنیم." : "Let's talk about it and turn your idea into reality."}
                </p>
                <Link
                  href={`/${locale}/order`}
                  className="mt-8 inline-flex items-center justify-center gap-3 rounded-md bg-brand px-8 py-4 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
                >
                  {isRtl ? "شروع یک پروژه" : "Start a Project"}
                  <span className="rtl:rotate-180">→</span>
                </Link>
             </div>
          </div>

        </div>
      </main>

      <Footer locale={locale} />
    </>
  );
}