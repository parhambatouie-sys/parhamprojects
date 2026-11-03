import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ServicesSection } from "@/components/ServicesSection";
import { ExchangeWidget } from "@/components/ExchangeWidget";
import { ContactSection } from "@/components/ContactSection";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

function SectionLabel({ num, en }: { num?: string; en: string }) {
  return (
    <div className="mb-10 flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.25em] text-muted">
      {num && (
        <>
          <span className="text-brand">{num}</span>
          <span className="h-px w-8 bg-border" />
        </>
      )}
      {!num && <span className="h-px w-8 bg-border" />}
      <span>{en}</span>
    </div>
  );
}

function SectionDecoration({ num }: { num: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 mx-auto max-w-7xl px-6">
        <div className="grid h-full grid-cols-4">
          <div className="border-e border-border/40" />
          <div className="border-e border-border/40" />
          <div className="border-e border-border/40" />
          <div />
        </div>
      </div>
      <div className="absolute -top-12 start-4 select-none font-mono text-[200px] font-black leading-none tracking-tighter text-foreground/[0.025] md:-top-20 md:start-8 md:text-[360px] lg:text-[460px]">
        {num}
      </div>
    </div>
  );
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tHero = await getTranslations("Hero");
  const tServices = await getTranslations("Services");
  const tFeatures = await getTranslations("Features");
  const tWork = await getTranslations("Work");
  const tBio = await getTranslations("Biography");
  const tProcess = await getTranslations("Process");

  const processSteps = ["s1", "s2", "s3", "s4"] as const;
  const features = tFeatures.raw("items") as string[];
  const timeline = tBio.raw("timeline") as { year: string; title: string; desc: string }[];
  const skills = tBio.raw("skills") as string[];
  const principles = tBio.raw("principles") as string[];

  return (
    <>
      <Header locale={locale} />

      {/* ============ 1. HERO ============ */}
      <section id="hero" className="relative min-h-[92vh] overflow-hidden px-6 pt-28 pb-12 md:pt-44 md:pb-24">
        <div className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/hero-bg.jpg')" }} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-l from-background/95 via-background/55 to-background/15 md:via-background/40 md:to-transparent" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-56 bg-gradient-to-t from-background via-background/80 to-transparent" />

        <div className="absolute end-6 top-28 z-20 hidden md:block md:end-10 md:top-32">
          <ExchangeWidget locale={locale} />
        </div>

        <div className="relative mx-auto flex min-h-[75vh] max-w-7xl flex-col justify-end pb-0 md:min-h-[70vh] md:justify-center md:pb-0">
          <div>
            <SectionLabel num="01" en="INTRO" />

            <div className="mt-6 flex flex-wrap gap-3 md:mt-32">
              <Link href="#services" className="rounded-md bg-brand px-7 py-3.5 text-sm font-semibold text-brand-foreground transition hover:opacity-90">
                {tHero("viewServices")}
              </Link>
              <Link href="#about" className="rounded-md border border-border bg-background/30 px-7 py-3.5 text-sm font-semibold backdrop-blur-sm transition hover:border-brand/40">
                {tHero("ctaSecondary")}
              </Link>
            </div>

            <h1 className="mt-8 text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1.15] tracking-tight md:mt-14 md:whitespace-nowrap">
              {tHero.rich("title", { hl: (chunks) => <span className="stroke-heading-word">{chunks}</span> })}
            </h1>

            <p className="mt-4 text-base font-medium text-foreground md:mt-5 md:text-lg">
              {tHero("tagline")}
            </p>

            <div className="mt-8 flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.25em] text-muted md:mt-16">
              <span>{tHero("scrollHint")}</span>
              <span className="h-px w-16 bg-border" />
              <span>↓</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 2. SERVICES ============ */}
      <ServicesSection
        locale={locale}
        label="SERVICES"
        title={tServices("title")}
        intro={tServices("intro")}
        ctaNote={tServices("ctaNote")}
        ctaText={tServices("ctaButton")}
        ctaHref={`/${locale}/order`}
        inquiryLabel={tServices("inquiryLabel")}
        services={[
          { key: "custom", num: "01", title: tServices("items.custom.title"), description: tServices("items.custom.description"), priceNote: tServices("items.custom.priceNote"), price: tServices("items.custom.price"), priceToman: tServices("items.custom.priceToman"), isInquiry: false },
          { key: "corporate", num: "02", title: tServices("items.corporate.title"), description: tServices("items.corporate.description"), priceNote: tServices("items.corporate.priceNote"), price: tServices("items.corporate.price"), priceToman: tServices("items.corporate.priceToman"), isInquiry: false },
          { key: "development", num: "03", title: tServices("items.development.title"), description: tServices("items.development.description"), priceNote: "", price: tServices("items.development.price"), priceToman: tServices("items.development.priceToman"), isInquiry: true },
        ]}
      />

      {/* ============ 3. FEATURES ============ */}
      <section className="relative overflow-hidden border-t border-border px-6 py-24 md:py-32">
        <div className="pointer-events-none absolute -bottom-40 end-0 -z-20 h-[600px] w-[600px] rounded-full blur-[140px]" style={{ backgroundColor: "rgba(255, 116, 56, 0.04)" }} aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 -z-20 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #D7DCE1 1px, transparent 0)", backgroundSize: "36px 36px" }} aria-hidden="true" />
        <SectionDecoration num="03" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <SectionLabel en="FEATURES" />
          <div className="mb-20 grid gap-10 md:mb-28 md:grid-cols-[1fr_auto] md:items-end md:gap-20">
            <h2 className="text-4xl font-bold leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">{tFeatures("title")}</h2>
            <p className="max-w-xs text-sm leading-relaxed text-muted md:pb-3 md:text-base">{tFeatures("note")}</p>
          </div>
          <div className="grid grid-cols-1 gap-x-16 md:grid-cols-2">
            {features.map((item, i) => (
              <div key={i} className="group relative border-t border-border py-8 md:py-10">
                <div className="flex items-start gap-5 md:gap-7">
                  <span className="shrink-0 font-mono text-2xl font-light leading-none tracking-tighter text-muted transition-colors duration-500 group-hover:text-brand md:text-3xl">{String(i + 1).padStart(2, "0")}</span>
                  <p className="pt-1 text-base font-medium leading-relaxed text-foreground/85 transition-colors duration-500 group-hover:text-foreground md:text-lg">{item}</p>
                </div>
                <span className="pointer-events-none absolute top-0 start-0 h-px w-0 bg-brand transition-all duration-700 group-hover:w-full" />
              </div>
            ))}
          </div>
          <div className="border-t border-border" />
        </div>
      </section>

      {/* ============ 4. WORK ============ */}
      <section id="work" className="relative scroll-mt-24 overflow-hidden border-t border-border px-6 py-24 md:py-32">
        <SectionDecoration num="04" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <SectionLabel en="WORK" />
          <div className="grid gap-12 md:grid-cols-2 md:items-end">
            <h2 className="text-4xl font-bold leading-none md:text-7xl">{tWork("title")}</h2>
            <div>
              <div className="mb-4 inline-block rounded-full border border-brand/30 bg-brand/5 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-brand">{tWork("comingSoon")}</div>
              <p className="text-base leading-relaxed text-muted">{tWork("description")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 5. BIOGRAPHY ============ */}
      {/* دقت کن: bg-background حذف شد تا عکس پشت لایه‌ها دیده بشه */}
      <section id="about" className="relative scroll-mt-24 border-t border-border">
        <div className="hidden md:block absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat opacity-70" style={{ backgroundImage: "url('/bio-bg.jpg')" }} />
        <div className="hidden md:block absolute inset-0 -z-10 bg-gradient-to-t from-[#111315] via-[#111315]/85 to-transparent" />
        <div className="hidden md:block absolute inset-x-0 top-0 -z-10 h-40 md:h-56 bg-gradient-to-b from-[#111315] to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-7xl md:px-6 md:py-32 grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-0 items-end">
          
          <div className="relative block w-full h-[65vh] md:hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: "url('/bio-bg.jpg')" }}
            />
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </div>

          <div className="hidden md:block"></div>

          <div className="flex flex-col items-start text-start max-w-xl px-6 py-16 md:px-0 md:py-0 md:mt-48">
            <div className="mb-6 flex items-center justify-start gap-3 text-[10px] font-mono uppercase tracking-[0.25em] text-muted">
              <span className="text-brand">05</span>
              <span className="h-px w-8 bg-border" />
              <span>BIOGRAPHY</span>
            </div>
            
            <h2 className="text-4xl font-bold leading-[1.1] tracking-tight md:text-7xl lg:text-8xl">
              {tBio("title")}
            </h2>
            
            <p className="mt-4 text-lg font-medium text-brand md:text-xl text-start">
              {tBio("subtitle")}
            </p>

            <div className="relative mt-10 mb-8 flex flex-col items-start w-full">
              <svg className="mb-4 h-8 w-8 text-brand/40 md:h-10 md:w-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              
              <p className="text-lg font-medium leading-relaxed text-foreground md:text-xl lg:text-2xl max-w-lg text-start">
                {tBio("p1")}
              </p>
            </div>

            <div className="space-y-5 text-sm leading-relaxed text-muted md:text-base max-w-lg text-start">
              <p>{tBio("p2")}</p>
              <p>{tBio("p3")}</p>
            </div>

            <div className="mt-10 inline-flex flex-row items-center justify-start gap-3 rounded-full border border-white/10 bg-background/60 px-6 py-2.5 shadow-lg backdrop-blur-md">
              <span className="flex h-2 w-2 shrink-0 animate-pulse rounded-full bg-brand" />
              <span className="text-sm font-semibold tracking-wide text-foreground md:text-base">
                {tBio("experience")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 6. SKILLS & PRINCIPLES ============ */}
      <section className="relative overflow-hidden border-t border-border px-6 py-24 md:py-32">
        <SectionDecoration num="06" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <SectionLabel en="SKILLS & PRINCIPLES" />
          <div className="mb-16">
            <h2 className="text-3xl font-bold md:text-5xl">{tBio("skillsTitle")}</h2>
            <p className="mt-4 max-w-xl text-muted">{tBio("skillsSubtitle")}</p>
          </div>
          <div className="grid gap-16 md:grid-cols-2">
            <div>
              <h3 className="mb-6 border-b border-border pb-3 text-[10px] font-mono uppercase tracking-widest text-brand">SKILLS</h3>
              <ul className="space-y-4">
                {skills.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground/80 md:text-base">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-6 border-b border-border pb-3 text-[10px] font-mono uppercase tracking-widest text-brand">PRINCIPLES</h3>
              <ul className="space-y-4">
                {principles.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground/80 md:text-base">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 7. PROCESS ============ */}
      <section className="relative overflow-hidden border-t border-border px-6 py-24 md:py-32">
        <SectionDecoration num="07" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <SectionLabel en="PROCESS" />
          <h2 className="mb-16 text-3xl font-bold md:text-5xl">{tProcess("title")}</h2>
          <div className="grid gap-10 md:grid-cols-4">
            {processSteps.map((step, i) => (
              <div key={step} className="relative">
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-[10px] font-mono text-brand">0{i + 1}</span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <h3 className="mb-3 text-lg font-semibold md:text-xl">{tProcess(`steps.${step}.title`)}</h3>
                <p className="text-sm leading-relaxed text-muted">{tProcess(`steps.${step}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 8. CONTACT ============ */}
      <ContactSection locale={locale} />

      <Footer locale={locale} />
    </>
  );
}