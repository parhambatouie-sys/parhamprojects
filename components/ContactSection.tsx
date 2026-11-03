import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function ContactSection({ locale }: { locale: string }) {
  const t = await getTranslations("Contact");

  const socials = [
    { name: t("instagramLabel"), value: t("instagramValue"), href: `https://instagram.com/${t("instagramValue")}` },
    { name: t("whatsappLabel"), value: t("whatsappValue"), href: `https://wa.me/${t("whatsappValue")}` },
    { name: t("telegramLabel"), value: t("telegramValue"), href: `https://t.me/${t("telegramValue")}` },
    { name: t("baleLabel"), value: t("baleValue"), href: `https://ble.ir/${t("baleValue")}` },
  ];

  return (
    <section id="contact" className="relative scroll-mt-24 overflow-hidden border-t border-border px-6 py-16 md:py-32">
      {/* Background Decorations */}
      <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 mx-auto max-w-7xl px-6">
          <div className="grid h-full grid-cols-4">
            <div className="border-e border-border/40" />
            <div className="border-e border-border/40" />
            <div className="border-e border-border/40" />
            <div />
          </div>
        </div>
        {/* عدد 08 در موبایل کوچک‌تر شده */}
        <div className="absolute -top-6 start-4 select-none font-mono text-[120px] font-black leading-none tracking-tighter text-foreground/[0.025] md:-top-20 md:start-8 md:text-[360px] lg:text-[460px]">
          08
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="mb-8 flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.25em] text-muted md:mb-10">
          <span className="text-brand">08</span>
          <span className="h-px w-8 bg-border" />
          <span>CONTACT</span>
        </div>

        <div className="grid gap-12 md:grid-cols-2 md:gap-24 lg:gap-32">
          
          {/* Left Side: Title & CTA */}
          <div className="flex flex-col justify-center">
            <h2 className="text-4xl font-bold leading-[1.1] tracking-tight md:text-7xl">
              {t("title")}
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted md:mt-6 md:text-lg">
              {t("subtitle")}
            </p>
            
            <div className="mt-8 md:mt-10">
              <Link
                href={`/${locale}/order`}
                className="group inline-flex w-full items-center justify-center gap-4 rounded-md border border-border bg-transparent px-8 py-4 text-sm font-semibold text-foreground transition-all duration-300 hover:border-brand hover:bg-brand hover:text-brand-foreground md:w-auto"
              >
                {t("startProject")}
                <span className="transition group-hover:translate-x-1 rtl:rotate-180">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Right Side: Minimal Social Links */}
          <div>
            <h3 className="mb-4 text-[10px] font-mono uppercase tracking-[0.25em] text-muted md:mb-6">
              {t("socialTitle")}
            </h3>
            <div className="flex flex-col border-t border-border">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between border-b border-border py-4 transition-colors hover:bg-white/[0.015] md:py-5"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-base font-medium text-foreground transition-colors group-hover:text-brand md:text-xl">
                      {social.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 md:gap-4">
                    <span className="font-mono text-[10px] tracking-wider text-muted transition-colors group-hover:text-brand md:text-sm" dir="ltr">
                      @{social.value}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-muted transition-all duration-300 group-hover:text-brand group-hover:translate-x-1 rtl:rotate-180 md:w-4 md:h-4">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}