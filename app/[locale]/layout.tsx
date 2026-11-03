import type { Metadata } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  
  return {
    title: t("title"),
    description: t("description"),
    // تنظیمات Open Graph برای شبکه‌های اجتماعی
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `https://parhambatouie.com/${locale}`,
      siteName: "Parham Batouie",
      images: [
        {
          url: "/og-image.jpg", // یک عکس 1200x630 در پوشه public بگذارید
          width: 1200,
          height: 630,
          alt: "Parham Batouie Portfolio",
        },
      ],
      locale: locale === "fa" ? "fa_IR" : "en_US",
      type: "website",
    },
    // تنظیمات توییتر (X)
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/og-image.jpg"],
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

  return (
    <html
      lang={locale}
      dir={locale === "fa" ? "rtl" : "ltr"}
      className={vazirmatn.variable}
    >
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}