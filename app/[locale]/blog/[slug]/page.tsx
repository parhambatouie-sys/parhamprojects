import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { query } from "@/lib/db";
import React from "react";

export const dynamic = 'force-dynamic';

// ============================================================================
// تولید متادیتای سئو
// ============================================================================
export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
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
  } catch (error) {
    console.error("Metadata Fetch Error:", error);
  }
  return { title: "Post Not Found" };
}

// ============================================================================
// تابع ضدتکرار (حذف متن‌های تکراری)
// ============================================================================
function removeRepeatedText(text: string): string {
  if (!text) return "";
  let cleaned = text.trim();
  const pattern = /([\s\S]{200,}?)\1+/g;
  const match = pattern.exec(cleaned);
  if (match) {
    const dupText = match[1];
    cleaned = cleaned.replace(dupText + dupText, dupText);
    return removeRepeatedText(cleaned);
  }
  return cleaned;
}

// ============================================================================
// پارسر هوشمند محتوا (تبدیل مارک‌داون و HTML به المان‌های زیبا)
// ============================================================================
function formatContent(content: string) {
  if (!content) return null;

  // پاکسازی اولیه و حذف عکس‌های داخل متن
  let cleaned = content.replace(/!\[.*?\]\(.*?\)/gi, '').replace(/<img[^>]*>/gi, '').trim();
  cleaned = removeRepeatedText(cleaned);

  const isHtml = /<[a-z][\s\S]*>/i.test(cleaned);

  // اگر محتوا HTML بود (توسط هوش مصنوعی تولید شده باشد)
  if (isHtml) {
    let htmlFormatted = cleaned;
    
    // جایگزینی تگ‌ها با کلاس‌های خوانا و مینیمال
    htmlFormatted = htmlFormatted.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '<h1 class="text-3xl md:text-4xl font-bold text-foreground mt-16 mb-8 leading-tight">$1</h1>');
    htmlFormatted = htmlFormatted.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '<h2 class="text-2xl md:text-3xl font-bold text-foreground mt-12 mb-6 leading-snug">$1</h2>');
    htmlFormatted = htmlFormatted.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '<h3 class="text-xl md:text-2xl font-bold text-foreground mt-8 mb-4">$1</h3>');
    htmlFormatted = htmlFormatted.replace(/<p[^>]*>(.*?)<\/p>/gi, '<p class="mb-8 text-base md:text-lg leading-[2] text-muted font-light">$1</p>');
    htmlFormatted = htmlFormatted.replace(/<ul[^>]*>/gi, '<ul class="mb-8 list-disc list-inside space-y-3 text-base md:text-lg leading-[1.8] text-muted font-light marker:text-brand">');
    htmlFormatted = htmlFormatted.replace(/<ol[^>]*>/gi, '<ol class="mb-8 list-decimal list-inside space-y-3 text-base md:text-lg leading-[1.8] text-muted font-light marker:text-brand">');
    htmlFormatted = htmlFormatted.replace(/<li[^>]*>(.*?)<\/li>/gi, '<li class="pl-2">$1</li>');
    htmlFormatted = htmlFormatted.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '<strong class="font-bold text-foreground">$1</strong>');
    htmlFormatted = htmlFormatted.replace(/<b[^>]*>(.*?)<\/b>/gi, '<strong class="font-bold text-foreground">$1</strong>');
    htmlFormatted = htmlFormatted.replace(/<em[^>]*>(.*?)<\/em>/gi, '<em class="italic text-foreground/80">$1</em>');
    htmlFormatted = htmlFormatted.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '<blockquote class="border-s-4 border-brand ps-6 my-10 italic text-lg md:text-xl text-foreground/80">$1</blockquote>');

    return <div className="max-w-none" dangerouslySetInnerHTML={{ __html: htmlFormatted }} />;
  }

  // اگر محتوا مارک‌داون (Markdown) بود
  const lines = cleaned.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol', items: string[] } | null = null;
  
  const processInline = (text: string) => {
    let t = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-foreground/80">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-white/10 px-2 py-1 rounded text-sm text-brand font-mono">$1</code>');
    return <span dangerouslySetInnerHTML={{ __html: t }} />;
  };

  const flushList = (key: number) => {
    if (!currentList) return;
    const ListTag = currentList.type;
    elements.push(
      <ListTag key={`list-${key}`} className={`mb-8 ps-6 space-y-3 text-base md:text-lg leading-[1.8] text-muted font-light list-inside ${currentList.type === 'ul' ? 'list-disc' : 'list-decimal'} marker:text-brand`}>
        {currentList.items.map((item, i) => (
          <li key={i} className="pl-2">{processInline(item)}</li>
        ))}
      </ListTag>
    );
    currentList = null;
  };

  let pBuffer: string[] = [];
  
  const flushParagraph = (key: number) => {
    if (pBuffer.length === 0) return;
    const text = pBuffer.join(' ');
    elements.push(
      <p key={`p-${key}`} className="mb-8 text-base md:text-lg leading-[2] text-muted font-light">
        {processInline(text)}
      </p>
    );
    pBuffer = [];
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    if (!trimmed) {
      flushParagraph(index);
      flushList(index);
      return;
    }

    if (trimmed.startsWith('### ')) {
      flushParagraph(index); flushList(index);
      elements.push(<h3 key={`h3-${index}`} className="text-xl md:text-2xl font-bold text-foreground mt-10 mb-4">{processInline(trimmed.replace('### ', ''))}</h3>);
    } else if (trimmed.startsWith('## ')) {
      flushParagraph(index); flushList(index);
      elements.push(<h2 key={`h2-${index}`} className="text-2xl md:text-3xl font-bold text-foreground mt-14 mb-6 leading-snug">{processInline(trimmed.replace('## ', ''))}</h2>);
    } else if (trimmed.startsWith('# ')) {
      flushParagraph(index); flushList(index);
      elements.push(<h1 key={`h1-${index}`} className="text-3xl md:text-4xl font-bold text-foreground mt-16 mb-8 leading-tight">{processInline(trimmed.replace('# ', ''))}</h1>);
    } else if (trimmed.startsWith('> ')) {
      flushParagraph(index); flushList(index);
      elements.push(<blockquote key={`quote-${index}`} className="border-s-4 border-brand ps-6 my-10 italic text-lg md:text-xl text-foreground/80">{processInline(trimmed.replace('> ', ''))}</blockquote>);
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushParagraph(index);
      if (currentList?.type !== 'ul') { flushList(index); currentList = { type: 'ul', items: [] }; }
      currentList.items.push(trimmed.substring(2));
    } else if (/^\d+\.\s/.test(trimmed)) {
      flushParagraph(index);
      if (currentList?.type !== 'ol') { flushList(index); currentList = { type: 'ol', items: [] }; }
      currentList.items.push(trimmed.replace(/^\d+\.\s/, ''));
    } else {
      flushList(index);
      pBuffer.push(trimmed);
    }
  });
  
  flushParagraph(9999);
  flushList(9999);

  return <div className="max-w-none">{elements}</div>;
}

// ============================================================================
// کامپوننت اصلی صفحه مقاله
// ============================================================================
export default async function BlogPostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
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
    publisher: { "@type": "Organization", name: "Parham Batouie", logo: { "@type": "ImageObject", url: "https://parhamprojects.vercel.app/og-image.png" } },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://parhamprojects.vercel.app/${locale}/blog/${post.slug}` }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      <Header locale={locale} />

      <main className="min-h-screen pt-32 pb-24 md:pt-44 md:pb-32 relative">
        {/* نور پس‌زمینه ملایم برای خوانایی بیشتر */}
        <div className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-brand/5 blur-[120px]" />

        <div className="mx-auto max-w-3xl px-6">
          
          {/* دکمه بازگشت */}
          <Link
            href={`/${locale}/blog`}
            className="mb-12 inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-brand"
          >
            <span className={isRtl ? "rotate-180" : ""}>←</span>
            {t("backToBlog")}
          </Link>

          {/* هدر مقاله (عنوان، تاریخ و نویسنده) */}
          <div className="mb-12 text-center md:mb-16">
            <div className="mb-6 flex items-center justify-center gap-4">
              <span className="rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-[10px] font-mono tracking-widest text-brand uppercase">
                {post.category}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold leading-[1.2] tracking-tight md:text-5xl lg:text-6xl text-foreground">
              {post.title}
            </h1>
            
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 text-sm text-muted">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand font-bold text-xs">
                  {post.author.charAt(0)}
                </div>
                <span className="font-semibold text-foreground">{post.author}</span>
              </div>
              <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />
              <span className="font-mono text-xs tracking-widest" dir="ltr">
                {new Date(post.created_at).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'en-US')}
              </span>
            </div>
          </div>

          {/* تصویر کاور (بزرگ و باکیفیت) */}
          {post.image_url && (
            <div className="relative mb-16 md:mb-20 aspect-[16/9] w-full overflow-hidden rounded-2xl md:rounded-3xl border border-white/5 bg-black/40 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={post.image_url} 
                alt={post.title} 
                className="object-cover w-full h-full" 
              />
            </div>
          )}

          {/* محتوای اصلی مقاله */}
          <div className="relative">
            {formatContent(post.content)}

            {/* امضای گرافیکی محو در انتهای مقاله */}
            <div className="pointer-events-none absolute bottom-0 end-0 opacity-10 mix-blend-screen pb-4 pe-4 md:pb-8 md:pe-8">
              <div
                className="signature-mask h-24 w-48 md:h-32 md:w-64"
                style={{ maskPosition: isRtl ? "right center" : "left center", WebkitMaskPosition: isRtl ? "right center" : "left center" }}
              />
            </div>
          </div>

          {/* بخش دعوت به اقدام (CTA) */}
          <div className="mt-24 md:mt-32 pt-10 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-12">
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