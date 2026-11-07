import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { query } from "@/lib/db";
import "./globals.css";

const vazirmatn = localFont({
  src: [
    {
      path: "../../public/fonts/Vazirmatn-Variable.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  
  // دریافت عنوان و توضیحات از دیتابیس
  let dbTitle = "";
  let dbDesc = "";
  try {
    const result = await query("SELECT key, value FROM settings WHERE key IN ('site_title', 'site_description')");
    const settings = result.rows.reduce((acc: any, row: any) => ({ ...acc, [row.key]: row.value }), {});
    dbTitle = settings.site_title || "";
    dbDesc = settings.site_description || "";
  } catch (error) {
    console.error("Failed to fetch settings for metadata");
  }

  const t = await getTranslations({ locale, namespace: "Metadata" });
  const baseUrl = "https://parhamprojects.vercel.app";

  return {
    title: dbTitle || t("title"),
    description: dbDesc || t("description"),
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        "fa-IR": `${baseUrl}/fa`,
        "en": `${baseUrl}/en`,
        "x-default": `${baseUrl}/en`,
      },
    },
    openGraph: {
      title: dbTitle || t("title"),
      description: dbDesc || t("description"),
      url: `${baseUrl}/${locale}`,
      siteName: dbTitle || "Parham Batouie",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: dbTitle || "Parham Batouie Portfolio",
        },
      ],
      locale: locale === "fa" ? "fa_IR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dbTitle || t("title"),
      description: dbDesc || t("description"),
      images: ["/og-image.png"],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Parham Batouie",
    url: "https://parhamprojects.vercel.app",
    jobTitle: "Web Designer & Developer",
    sameAs: [
      "https://github.com/parhambatouie-sys"
    ]
  };

  return (
    <html
      lang={locale}
      dir={locale === "fa" ? "rtl" : "ltr"}
      className={vazirmatn.variable}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}