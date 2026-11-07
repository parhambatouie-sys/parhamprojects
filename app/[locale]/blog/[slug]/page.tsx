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
          
          <Link
            href={`/${locale}/blog`}
            className="mb-12 inline-flex items-center gap-2 text-sm font-medium text-brand transition hover:opacity-80"
          >
            <span className={isRtl ? "rotate-180" : ""}>←</span>
            {t("backToBlog")}
          </Link>

          <div className="mb-16 md:mb-24 text-center">
            <div className="mb-6 flex items-center justify-center gap-4">
              <span className="rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-[10px] font-mono tracking-widest text-brand">
                {post.category}
              </span>
            </div>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
              {post.title}
            </h1>
            <div className="mt-8 flex items-center justify-center gap-4 text-[11px] font-mono tracking-widest text-muted">
              <span className="font-semibold text-foreground uppercase">{post.author}</span>
              <span className="h-1 w-1 rounded-full bg-brand" />
              <span dir="ltr">
                {new Date(post.created_at).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US')}
              </span>
            </div>
          </div>

          {post.image_url && (
            <div className="relative mb-16 aspect-video w-full overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.image_url} alt={post.title} className="object-cover w-full h-full" />
            </div>
          )}

          <div className="prose prose-invert prose-lg max-w-none text-muted leading-[1.9] md:leading-[2]">
            {post.content.split("\n\n").map((paragraph: string, index: number) => (
              <p key={index} className="mb-10 text-base md:text-xl font-light whitespace-pre-wrap">
                {paragraph}
              </p>
            ))}
          </div>

          {/* CTA Section */}
          <div className="relative mt-24 overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#FF7438]/20 via-[#111315] to-[#111315] p-1">
             <div className="rounded-[1.8rem] bg-black/40 p-10 text-center backdrop-blur-md md:p-16">
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