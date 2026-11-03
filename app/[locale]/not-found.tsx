"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export default function NotFoundPage() {
  const t = useTranslations("NotFound");
  const pathname = usePathname();
  
  const locale = pathname.split("/")[1] || "fa";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 text-center">
      
      {/* خطوط شبکه‌ای پس‌زمینه (فقط در دسکتاپ نمایش داده می‌شود) */}
      <div className="pointer-events-none absolute inset-0 -z-0 hidden justify-center overflow-hidden md:flex" aria-hidden="true">
        <div className="grid h-full w-full max-w-7xl grid-cols-4 px-6">
          <div className="border-e border-border/40" />
          <div className="border-e border-border/40" />
          <div className="border-e border-border/40" />
          <div />
        </div>
      </div>

      {/* عدد 404 پس‌زمینه */}
      <div className="pointer-events-none absolute inset-0 -z-0 flex select-none items-center justify-center overflow-hidden" aria-hidden="true">
        <span className="translate-y-6 font-mono text-[140px] font-black leading-none tracking-tighter text-foreground/[0.03] sm:text-[200px] md:translate-y-8 md:text-[400px] lg:text-[600px]">
          404
        </span>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center">
        
        {/* برچسب بالا */}
        <div className="mb-6 flex items-center justify-center gap-3 text-[10px] font-mono uppercase tracking-[0.25em] text-muted">
          <span className="text-brand">ERR</span>
          <span className="h-px w-10 bg-border" />
          <span>NOT FOUND</span>
        </div>

        {/* تیتر */}
        <h1 className="text-3xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-4xl md:text-6xl">
          {t("title")}
        </h1>
        
        {/* متن توضیحات */}
        <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-muted sm:text-base md:mt-6 md:text-lg">
          {t("subtitle")}
        </p>

        {/* دکمه بازگشت (تمام‌عرض در موبایل) */}
        <div className="mt-10 w-full sm:mt-12">
          <Link
            href={`/${locale}`}
            className="group flex w-full items-center justify-center gap-3 rounded-lg bg-brand px-8 py-3.5 text-sm font-semibold text-brand-foreground transition hover:opacity-90 sm:inline-flex sm:w-auto sm:px-10 sm:py-4"
          >
            {t("backHome")}
            <span className="transition group-hover:-translate-x-1 rtl:rotate-180">
              ←
            </span>
          </Link>
        </div>
      </div>

      {/* خط پایین صفحه */}
      <div className="absolute bottom-0 left-0 right-0 h-px w-full bg-border" />
    </div>
  );
}