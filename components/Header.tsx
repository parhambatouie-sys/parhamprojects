import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MobileMenu } from "./MobileMenu";
import { ExchangeWidget } from "./ExchangeWidget";
import { LanguageSwitcher } from "./LanguageSwitcher";

export async function Header({ locale }: { locale: string }) {
  const t = await getTranslations("Nav");
  const isRtl = locale === "fa";

  const navItems = [
    { href: `/${locale}`, label: t("home") },
    { href: `/${locale}#services`, label: t("services") },
    { href: `/${locale}#work`, label: t("work") },
    { href: `/${locale}/blog`, label: t("blog") },
    { href: `/${locale}#about`, label: t("about") },
    { href: `/${locale}#contact`, label: t("contact") },
  ];

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="relative mx-auto flex h-24 max-w-7xl items-center justify-between px-4 md:h-32 md:ps-4 md:pe-10">
        
        <Link href={`/${locale}`} className="group flex shrink-0 items-center z-50">
          <div
            className="signature-mask h-12 w-36 transition-opacity duration-300 group-hover:opacity-80 md:h-20 md:w-64 lg:h-24 lg:w-72"
            style={{
              maskPosition: isRtl ? "right center" : "left center",
              WebkitMaskPosition: isRtl ? "right center" : "left center",
            }}
          />
        </Link>

        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-6 text-sm md:flex lg:gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative whitespace-nowrap text-muted transition hover:text-foreground"
            >
              {item.label}
              <span className="absolute -bottom-1.5 start-0 h-px w-0 bg-brand transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="block md:hidden">
            <ExchangeWidget locale={locale} />
          </div>

          {/* دکمه شیشه‌ای تغییر زبان */}
          <div className="hidden md:block">
            <LanguageSwitcher locale={locale} />
          </div>

          <Link
            href={`/${locale}/order`}
            className="hidden md:inline-block rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground transition hover:opacity-90 md:px-5 md:py-2.5"
          >
            {t("order")}
          </Link>

          <MobileMenu
            locale={locale}
            navItems={navItems}
            switchLanguage={t("switchLanguage")}
            otherLocale={locale === "fa" ? "en" : "fa"} 
            orderLabel={t("order")}
          />
        </div>
      </div>
    </header>
  );
}