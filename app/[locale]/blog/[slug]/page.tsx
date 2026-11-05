import Link from "next/link";
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

  return (
    <>
      <Header locale={locale} />
      <main className="min-h-screen pt-32 pb-24 px-6 md:pt-44 md:pb-32">
        <article className="mx-auto max-w-3xl">
          <Link href={`/${locale}/blog`} className="mb-10 inline-flex items-center gap-2 text-sm text-muted transition hover:text-brand">
            <span className="rtl:rotate-180">←</span>
            {t("backToBlog")}
          </Link>
          <div className="mb-12">
            <h1 className="text-3xl font-bold leading-[1.15] tracking-tight md:text-5xl lg:text-6xl">
              {post.title[locale as "fa" | "en"]}
            </h1>
            <div className="mt-6 flex items-center gap-6 text-[10px] font-mono tracking-widest text-muted">
              <span>{t("publishedOn")} <span dir="ltr">{post.date}</span></span>
              <span>{post.readTime} {t("readTime")}</span>
            </div>
          </div>
          <div className="prose prose-invert prose-lg max-w-none text-muted leading-relaxed">
            {post.content[locale as "fa" | "en"].split("\n\n").map((paragraph, index) => (
              <p key={index} className="mb-6">{paragraph}</p>
            ))}
          </div>
        </article>
      </main>
      <Footer locale={locale} />
    </>
  );
}