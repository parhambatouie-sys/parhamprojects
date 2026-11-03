import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MobileMenu } from "./MobileMenu";
import { ExchangeWidget } from "./ExchangeWidget";

export async function Header({ locale }: { locale: string }) {
  const t = await getTranslations("Nav");
  const otherLocale = locale === "fa" ? "en" : "fa";
  const isRtl = locale === "fa";

  const navItems = [
    { href: `/${locale}`, label: t("home") },
    { href: `/${locale}#services`, label: t("services") },
    { href: `/${locale}#work`, label: t("work") },
    { href: `/${locale}#about`, label: t("about") },
    { href: `/${locale}#contact`, label: t("contact") },
  ];

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="relative mx-auto flex h-24 max-w-7xl items-center justify-between px-4 md:h-32 md:ps-4 md:pe-10">
        
        {/* Signature */}
        <Link href={`/${locale}`} className="group flex shrink-0 items-center z-50">
          <div
            className="signature-mask h-12 w-36 transition-opacity duration-300 group-hover:opacity-80 md:h-20 md:w-64 lg:h-24 lg:w-72"
            style={{
              maskPosition: isRtl ? "right center" : "left center",
              WebkitMaskPosition: isRtl ? "right center" : "left center",
            }}
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-6 text-sm md:flex lg:gap-9">
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

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          
          {/* باکس دلار: فقط در موبایل نمایش داده می‌شود (کنار منوی همبرگری) */}
          <div className="block md:hidden">
            <ExchangeWidget locale={locale} />
          </div>

          {/* Desktop Language Switcher */}
          <Link
            href={`/${otherLocale}`}
            className="hidden md:inline-flex group relative items-center gap-2 rounded-lg border border-brand/50 bg-brand/10 px-3.5 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-brand transition-all duration-300 hover:border-brand hover:bg-brand hover:text-brand-foreground md:px-4 md:py-2.5"
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand transition-colors duration-300 group-hover:bg-brand-foreground" />
            {t("switchLanguage")}
          </Link>

          {/* Desktop Order Button */}
          <Link
            href={`/${locale}/order`}
            className="hidden md:inline-block rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground transition hover:opacity-90 md:px-5 md:py-2.5"
          >
            {t("order")}
          </Link>

          {/* Mobile Menu Component */}
          <MobileMenu
            locale={locale}
            navItems={navItems}
            switchLanguage={t("switchLanguage")}
            otherLocale={otherLocale}
            orderLabel={t("order")}
          />
        </div>
      </div>
    </header>
  );
}