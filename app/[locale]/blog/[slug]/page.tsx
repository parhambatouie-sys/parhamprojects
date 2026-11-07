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
    const result = await query("SELECT title, excerpt, seo_title, seo_description, image_url FROM posts WHERE slug = $1", [slug]);
    if (result.rows.length > 0) {
      const post = result.rows[0];
      const title = post.seo_title || post.title;
      const description = post.seo_description || post.excerpt;
      const image = post.image_url || "/og-image.png";

      return {
        title: title,
        description: description,
        alternates: {
          canonical: `${baseUrl}/${locale}/blog/${slug}`,
          languages: {
            "fa-IR": `${baseUrl}/fa/blog/${slug}`,
            "en": `${baseUrl}/en/blog/${slug}`,
            "x-default": `${baseUrl}/en/blog/${slug}`,
          },
        },
        openGraph: {
          title: title,
          description: description,
          url: `${baseUrl}/${locale}/blog/${slug}`,
          images: [{ url: image, width: 1200, height: 630, alt: title }],
          type: "article",
          locale: locale === "fa" ? "fa_IR" : "en_US",
        },
        twitter: {
          card: "summary_large_image",
          title: title,
          description: description,
          images: [image],
        },
      };
    }
  } catch (error) {}

  return { title: "Post Not Found" };
}

// تابع اختصاصی برای تمیز کردن تگ‌های HTML و تبدیل آن‌ها به استایل‌های زیبای سایت
function formatContent(content: string) {
  if (!content) return null;

  // بررسی اینکه آیا محتوا شامل تگ‌های HTML است یا خیر
  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  if (isHtml) {
    // اگر HTML بود، تگ‌های اصلی را با استایل‌های Tailwind جایگزین می‌کنیم
    let formatted = content;
    
    // جایگزینی تیترها
    formatted = formatted.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '<h1 class="text-3xl md:text-4xl font-bold text-foreground mt-12 mb-6">$1</h1>');
    formatted = formatted.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '<h2 class="text-2xl md:text-3xl font-bold text-foreground mt-10 mb-4">$1</h2>');
    formatted = formatted.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '<h3 class="text-xl md:text-2xl font-bold text-foreground mt-8 mb-4">$1</h3>');
    
    // جایگزینی پاراگراف‌ها
    formatted = formatted.replace(/<p[^>]*>(.*?)<\/p>/gi, '<p class="mb-6 text-base md:text-lg leading-relaxed text-muted font-light">$1</p>');
    
    // جایگزینی لیست‌ها
    formatted = formatted.replace(/<ul[^>]*>/gi, '<ul class="mb-6 list-disc list-inside space-y-2 text-base md:text-lg text-muted font-light">');
    formatted = formatted.replace(/<ol[^>]*>/gi, '<ol class="mb-6 list-decimal list-inside space-y-2 text-base md:text-lg text-muted font-light">');
    formatted = formatted.replace(/<li[^>]*>(.*?)<\/li>/gi, '<li class="mb-2">$1</li>');
    
    // جایگزینی متن‌های بولد و ایتالیک
    formatted = formatted.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '<strong class="font-bold text-foreground">$1</strong>');
    formatted = formatted.replace(/<b[^>]*>(.*?)<\/b>/gi, '<strong class="font-bold text-foreground">$1</strong>');
    formatted = formatted.replace(/<em[^>]*>(.*?)<\/em>/gi, '<em class="italic text-foreground/80">$1</em>');

    // حذف تگ‌های اضافی مثل span یا div
    formatted = formatted.replace(/<(span|div)[^>]*>/gi, '');
    formatted = formatted.replace(/<\/(span|div)>/gi, '');

    return (
      <div 
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: formatted }} 
      />
    );
  }

  // اگر محتوا HTML نبود (متن ساده بود)، آن را با فرمت مارک‌داون نمایش می‌دهیم
  return (
    <div className="prose prose-invert prose-lg max-w-none text-muted leading-[2] md:leading-[2.3]">
      {content.split("\n\n").map((paragraph: string, index: number) => {
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
  );
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
    image: post.image_url || "https://parhamprojects.vercel.app/og-image.png",
    datePublished: post.created_at,
    dateModified: post.created_at,
    inLanguage: locale === "fa" ? "fa-IR" : "en",
    author: { "@type": "Person", name: post.author, url: "https://parhamprojects.vercel.app" },
    publisher: {
      "@type": "Organization",
      name: "Parham Batouie",
      logo: {
        "@type": "ImageObject",
        url: "https://parhamprojects.vercel.app/og-image.png"
      }
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://parhamprojects.vercel.app/${locale}/blog/${post.slug}`
    }
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
            className="mb-12 inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-brand"
          >
            <span className={isRtl ? "rotate-180" : ""}>←</span>
            {t("backToBlog")}
          </Link>

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

          {post.image_url && (
            <div className="relative mb-16 md:mb-24 aspect-video w-full overflow-hidden rounded-3xl border border-white/5 bg-black/40 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.image_url} alt={post.title} className="object-cover w-full h-full" />
            </div>
          )}

          <div className="relative">
            {/* استفاده از تابع فرمت‌کننده برای نمایش زیبای متن */}
            {formatContent(post.content)}

            <div className="pointer-events-none absolute bottom-0 end-0 opacity-20 mix-blend-screen pb-4 pe-4 md:pb-8 md:pe-8">
              <div
                className="signature-mask h-24 w-48 md:h-32 md:w-64"
                style={{
                  maskPosition: isRtl ? "right center" : "left center",
                  WebkitMaskPosition: isRtl ? "right center" : "left center",
                }}
              />
            </div>
          </div>

          <div className="mt-32 pt-10 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-12">
            <div>
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                {isRtl ? "پروژه‌ای در ذهن دارید؟" : "Have a project in mind?"}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted md:text-base">
                {isRtl ? "بیایید درباره آن صحبت کنیم و ایده شما را به واقعیت تبدیل کنیم." : "Let's talk about it and turn your idea into reality."}
              </p>
            </div>
            <Link
              href={`/${locale}/order`}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand px-8 py-3.5 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
            >
              {isRtl ? "شروع یک پروژه" : "Start a Project"}
              <span className="rtl:rotate-180 text-lg leading-none">→</span>
            </Link>
          </div>

        </div>
      </main>

      <Footer locale={locale} />
    </>
  );
}