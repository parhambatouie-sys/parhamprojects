"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

type ServiceItem = {
  key: string;
  num: string;
  title: string;
  description: string;
  priceNote: string;
  price: string;
  priceToman: string;
  isInquiry: boolean;
};

export function ServicesSection({
  locale,
  label,
  title,
  intro,
  ctaNote,
  ctaText,
  ctaHref,
  inquiryLabel,
  services,
}: {
  locale: string;
  label: string;
  title: string;
  intro: string;
  ctaNote: string;
  ctaText: string;
  ctaHref: string;
  inquiryLabel: string;
  services: ServiceItem[];
}) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const rows = sectionRef.current?.querySelectorAll("[data-reveal]");
    if (!rows || rows.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    rows.forEach((r) => obs.observe(r));
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative scroll-mt-24 overflow-hidden border-t border-border py-24 md:py-32"
    >
      <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden="true">
        <div className="absolute inset-0 mx-auto max-w-7xl px-6">
          <div className="grid h-full grid-cols-4">
            <div className="border-e border-border/40" />
            <div className="border-e border-border/40" />
            <div className="border-e border-border/40" />
            <div />
          </div>
        </div>
        <div className="absolute -top-12 start-4 select-none font-mono text-[200px] font-black leading-none tracking-tighter text-foreground/[0.025] md:-top-20 md:start-8 md:text-[360px] lg:text-[460px]">
          02
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-10 flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.25em] text-muted">
          <span className="h-px w-8 bg-border" />
          <span>{label}</span>
        </div>

        <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-end md:gap-20">
          <h2 className="text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
            {title}
          </h2>
          <p className="max-w-xs text-sm leading-relaxed text-muted md:pb-3 md:text-base">
            {intro}
          </p>
        </div>

        <div className="mt-20 md:mt-28">
          {services.map((s, i) => (
            <Link
              key={s.key}
              href={ctaHref}
              data-reveal
              className="reveal-row group relative block border-t border-border py-10 transition-colors duration-500 hover:bg-white/[0.015] md:py-14 lg:py-16"
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-[60px_1fr_auto] md:items-center md:gap-10">
                <span className="font-mono text-xs tracking-[0.25em] text-muted transition-colors duration-500 group-hover:text-brand md:self-start md:pt-2 md:text-sm">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div>
                  <h3 className="stroke-heading text-3xl font-bold leading-[1.08] tracking-tight md:text-5xl lg:text-6xl">
                    {s.title}
                  </h3>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted md:mt-5 md:text-base">
                    {s.description}
                  </p>
                </div>

                <div className="col-span-2 flex items-center justify-between gap-4 border-t border-border/50 pt-4 md:col-span-1 md:mt-0 md:justify-start md:border-0 md:pt-0 md:self-start">
                  <div className="flex items-baseline gap-3">
                    <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted">
                      {s.isInquiry ? inquiryLabel : s.priceNote}
                    </span>
                    <span
                      className="text-2xl font-bold leading-none text-brand md:text-3xl"
                      dir="ltr"
                    >
                      {s.price}
                    </span>
                    {/* نمایش معادل تومانی فقط در زبان فارسی */}
                    {locale === "fa" && s.priceToman && (
                      <span className="text-xs leading-none text-muted" dir="ltr">
                        {s.priceToman}
                      </span>
                    )}
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border/60 bg-white/[0.02] text-sm text-muted transition-all duration-300 group-hover:border-brand group-hover:bg-brand group-hover:text-brand-foreground">
                    <span className="rtl:rotate-180">→</span>
                  </div>
                </div>
              </div>

              <span className="pointer-events-none absolute bottom-0 start-0 h-px w-0 bg-brand transition-all duration-700 group-hover:w-full" />
            </Link>
          ))}
          <div className="border-t border-border" />
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <p className="max-w-md text-sm text-muted">{ctaNote}</p>
          <Link
            href={ctaHref}
            className="group inline-flex items-center gap-3 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
          >
            {ctaText}
            <span className="transition group-hover:translate-x-1 rtl:rotate-180">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}