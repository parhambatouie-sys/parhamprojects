import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { query } from "@/lib/db";
import "./globals.css";

// ============================================================================
// تنظیمات فونت سایت
// ============================================================================
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

// ============================================================================
// تنظیمات Viewport (نمایش در موبایل و رنگ تم)
// ============================================================================
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#111315",
};

// ============================================================================
// تولید پارامترهای استاتیک برای زبان‌ها
// ============================================================================
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// ============================================================================
// تولید متادیتای سئو (عنوان، توضیحات و...)
// ============================================================================
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  
  // دریافت اطلاعات از دیتابیس برای سئوی داینامیک
  let dbTitle = "";
  let dbDesc = "";

  try {
    const result = await query(
      "SELECT key, value FROM settings WHERE key IN ('site_title', 'site_description')"
    );
    
    const settings = result.rows.reduce(
      (acc: any, row: any) => {
        return {        verification: {
      google: `<meta name="google-site-verification" content="aH2hxDMnztrFcsdqC5tPwZE50C5NvsV7jRNIq_9BRxs" />`,
    },
          ...acc,
          [row.key]: row.value
        };
      }, 
      {}
    );
    
    dbTitle = settings.site_title || "";
    dbDesc = settings.site_description || "";
  } catch (error) {
    console.error("Failed to fetch settings for metadata", error);
  }

  const t = await getTranslations({ 
    locale, 
    namespace: "Metadata" 
  });
  
  const baseUrl = "https://parhamprojects.vercel.app";
  const defaultTitle = dbTitle || t("title");
  const defaultDesc = dbDesc || t("description");

  return {
    title: {
      default: defaultTitle,
      template: `%s | ${defaultTitle}`
    },
    description: defaultDesc,
    keywords: [
      "طراحی سایت", 
      "توسعه وب", 
      "پرهام بتوئی", 
      "Next.js", 
      "React", 
      "Web Design",
      "Web Development",
      "Portfolio",
      "Front-end"
    ],
    authors: [
      { 
        name: "Parham Batouie", 
        url: baseUrl 
      }
    ],
    creator: "Parham Batouie",
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        "fa-IR": `${baseUrl}/fa`,
        "en": `${baseUrl}/en`,
        "x-default": `${baseUrl}/en`,
      },
    },
    openGraph: {
      title: defaultTitle,
      description: defaultDesc,
      url: `${baseUrl}/${locale}`,
      siteName: defaultTitle,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: defaultTitle,
        },
      ],
      locale: locale === "fa" ? "fa_IR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: defaultDesc,
      images: ["/og-image.png"],
      creator: "@parhambatouie",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// ============================================================================
// کامپوننت اصلی Layout
// ============================================================================
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // بررسی اعتبار زبان
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  // ==========================================================================
  // داده‌های ساختاریافته JSON-LD (برای موتورهای جستجو مثل گوگل)
  // ==========================================================================
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://parhamprojects.vercel.app/#website",
        url: "https://parhamprojects.vercel.app",
        name: "Parham Batouie",
        description: "طراحی و توسعه وب‌سایت‌های اختصاصی",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://parhamprojects.vercel.app/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Person",
        "@id": "https://parhamprojects.vercel.app/#person",
        name: "Parham Batouie",
        url: "https://parhamprojects.vercel.app",
        jobTitle: "Web Designer & Developer",
        sameAs: [
          "https://github.com/parhambatouie-sys",
          "https://instagram.com/parham.batouie",
          "https://t.me/parham_batouie"
        ]
      }
    ]
  };

  return (
    <html
      lang={locale}
      dir={locale === "fa" ? "rtl" : "ltr"}
      className={vazirmatn.variable}
    >
      <head>
        
        {/* ==================================================================== */}
        {/* اسکریپت داده‌های ساختاریافته (این بخش را به هیچ عنوان پاک نکنید) */}
        {/* ==================================================================== */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ 
            __html: JSON.stringify(jsonLd) 
          }}
        />

        {/* ==================================================================== */}
        {/* ⚠️ محل قرارگیری کدهای اضافی شما (کدهای شخصی خودتان) */}
        {/* ⚠️ اگر کد Google Analytics، Google Tag Manager یا متاتگ‌های دیگری داشتید، */}
        {/* ⚠️ دقیقاً در همین قسمت (زیر این کامنت) کپی و پیست کنید تا پاک نشوند. */}
        {/* ==================================================================== */}
        
        {/* 
        
          [کدهای شخصی شما اینجا قرار می‌گیرند]
          
        */}

      </head>
      
      <body>
        <NextIntlClientProvider>
          {children}
        </NextIntlClientProvider>

        {/* ==================================================================== */}
        {/* ⚠️ محل قرارگیری اسکریپت‌های انتهای body */}
        {/* ⚠️ اگر اسکریپت‌هایی مثل پشتیبانی آنلاین، چت باکس یا کدهای جاوااسکریپت */}
        {/* ⚠️ نیاز به قرارگیری در انتهای body دارند، اینجا قرار دهید. */}
        {/* ==================================================================== */}

        {/* 
        
          [اسکریپت‌های شخصی شما اینجا قرار می‌گیرند]
          
        */}

      </body>
    </html>
  );
}