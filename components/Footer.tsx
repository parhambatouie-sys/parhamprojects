import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function Footer({ locale }: { locale: string }) {
  const tNav = await getTranslations("Nav");
  const t = await getTranslations("Footer");
  const isRtl = locale === "fa";

  const navItems = [
    { href: `/${locale}`, label: tNav("home") },
    { href: `/${locale}#services`, label: tNav("services") },
    { href: `/${locale}#work`, label: tNav("work") },
    { href: `/${locale}/blog`, label: tNav("blog") },
    { href: `/${locale}#about`, label: tNav("about") },
    { href: `/${locale}#contact`, label: tNav("contact") },
  ];

  return (
    <footer className="relative border-t border-border bg-background px-4 py-10 md:px-6 md:py-16">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 md:gap-10">
        
        {/* Top Row: Signature & Navigation */}
        <div className="flex w-full flex-col items-center justify-between gap-8 lg:flex-row lg:gap-8">
          
          {/* Signature & Tagline */}
          <Link href={`/${locale}`} className="group relative flex shrink-0 items-center justify-center">
            <div
              className="signature-mask h-24 w-64 opacity-60 transition-opacity duration-300 group-hover:opacity-100 md:h-36 md:w-96 lg:h-40 lg:w-[420px]"
              style={{
                maskPosition: isRtl ? "right center" : "left center",
                WebkitMaskPosition: isRtl ? "right center" : "left center",
              }}
            />
            <span className="absolute font-mono text-[9px] uppercase tracking-[0.25em] text-foreground md:text-xs">
              {t("tagline")}
            </span>
          </Link>

          {/* Navigation Links (Horizontal on Mobile, Centered) */}
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs md:gap-8 md:text-sm lg:justify-end">
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

        </div>

        {/* Bottom Row: Copyright Text */}
        <div className="w-full border-t border-border/50 pt-6 mt-2">
          <p className="text-center font-mono text-[9px] tracking-widest text-muted md:text-xs">
            {t("rights")}
          </p>
        </div>

      </div>
    </footer>
  );
}