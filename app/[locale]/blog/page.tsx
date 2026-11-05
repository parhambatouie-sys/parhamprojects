import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { posts } from "@/lib/posts";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Blog");

  return (
    <>
      <Header locale={locale} />
      <main className="min-h-screen pt-32 pb-24 px-6 md:pt-44 md:pb-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 md:mb-24">
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
              {t("title")}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted md:mt-6 md:text-lg">
              {t("subtitle")}
            </p>
          </div>
          <div className="border-t border-border">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/${locale}/blog/${post.slug}`}
                className="group grid grid-cols-1 gap-4 border-b border-border py-8 transition-colors hover:bg-white/[0.015] md:grid-cols-[1fr_auto] md:items-center md:gap-10 md:py-12"
              >
                <div>
                  <h2 className="text-2xl font-semibold transition-colors group-hover:text-brand md:text-4xl">
                    {post.title[locale as "fa" | "en"]}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted md:mt-4 md:text-base">
                    {post.excerpt[locale as "fa" | "en"]}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-mono tracking-widest text-muted md:flex-col md:items-end md:gap-2">
                  <span dir="ltr">{post.date}</span>
                  <span>{post.readTime} {t("readTime")}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </>
  );
}