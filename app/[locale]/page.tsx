import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ServicesSection } from "@/components/ServicesSection";
import { ExchangeWidget } from "@/components/ExchangeWidget";
import { ContactSection } from "@/components/ContactSection";
import { LatestPosts } from "@/components/LatestPosts";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = "https://parhamprojects.vercel.app";
  
  return {
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        "fa-IR": `${baseUrl}/fa`,
        "en": `${baseUrl}/en`,
        "x-default": `${baseUrl}/en`,
      },
    },
  };
}

function SectionLabel({ num, en }: { num?: string; en: string }) {
  return (
    <div className="mb-8 flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.25em] text-muted md:mb-10">
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
      <div className="absolute inset-0 mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid h-full grid-cols-4">
          <div className="border-e border-border/40" />
          <div className="border-e border-border/40" />
          <div className="border-e border-border/40" />
          <div />
        </div>
      </div>
      <div className="absolute -top-12 start-4 select-none font-mono text-[150px] font-black leading-none tracking-tighter text-foreground/[0.025] md:-top-20 md:start-8 md:text-[360px] lg:text-[460px]">
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

  let projects = [];
  try {
    const result = await query(
      "SELECT * FROM projects WHERE is_published = true AND locale = $1 ORDER BY sort_order ASC, created_at DESC",
      [locale]
    );
    projects = result.rows;
  } catch (error) {
    console.error("Failed to fetch projects:", error);
  }

  let dbServices = [];
  try {
    const result = await query(
      "SELECT * FROM services WHERE is_published = true AND locale = $1 ORDER BY sort_order ASC",
      [locale]
    );
    dbServices = result.rows;
  } catch (error) {
    console.error("Failed to fetch services:", error);
  }

  const tHero = await getTranslations("Hero");
  const tServices = await getTranslations("Services");
  const tFeatures = await getTranslations("Features");
  const tWork = await getTranslations("Work");
  const tBio = await getTranslations("Biography");
  const tProcess = await getTranslations("Process");

  const processSteps = ["s1", "s2", "s3", "s4"] as const;
  const features = tFeatures.raw("items") as string[];
  const skills = tBio.raw("skills") as string[];
  const principles = tBio.raw("principles") as string[];

  return (
    <>
      <Header locale={locale} />

      {/* ============ 1. بخش هیرو ============ */}
      <section id="hero" className="relative min-h-[85vh] overflow-hidden px-4 pt-24 pb-12 md:min-h-[92vh] md:px-6 md:pt-44 md:pb-24">
        <Image
          src="/hero-bg.jpg"
          alt="Hero Background"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover object-center -z-20"
        />
        
        <div className="absolute inset-0 -z-10 bg-gradient-to-l from-background/95 via-background/55 to-background/15 md:via-background/40 md:to-transparent" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-56 bg-gradient-to-t from-background via-background/80 to-transparent" />

        {locale === "fa" && (
          <div className="absolute end-4 top-24 z-20 hidden md:block md:end-10 md:top-32">
            <ExchangeWidget locale={locale} />
          </div>
        )}

        <div className="relative mx-auto flex min-h-[70vh] max-w-7xl flex-col justify-end pb-0 md:min-h-[70vh] md:justify-center md:pb-0">
          <div>
            <SectionLabel num="01" en="INTRO" />

            <div className="mt-6 flex flex-wrap gap-3 md:mt-32">
              <Link href="#services" className="rounded-md bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition hover:opacity-90 md:px-7 md:py-3.5">
                {tHero("viewServices")}
              </Link>
              <Link href="#about" className="rounded-md border border-border bg-background/30 px-6 py-3 text-sm font-semibold backdrop-blur-sm transition hover:border-brand/40 md:px-7 md:py-3.5">
                {tHero("ctaSecondary")}
              </Link>
            </div>

            <h1 className="mt-8 text-[clamp(1.8rem,4vw,3.5rem)] font-bold leading-[1.15] tracking-tight md:mt-14 md:whitespace-nowrap">
              {tHero.rich("title", { hl: (chunks) => <span className="stroke-heading-word">{chunks}</span> })}
            </h1>

            <p className="mt-4 text-sm font-medium text-foreground md:mt-5 md:text-lg">
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

      {/* ============ 2. بخش خدمات ============ */}
      <ServicesSection
        locale={locale}
        label="SERVICES"
        title={tServices("title")}
        intro={tServices("intro")}
        ctaNote={tServices("ctaNote")}
        ctaText={tServices("ctaButton")}
        ctaHref={`/${locale}/order`}
        inquiryLabel={tServices("inquiryLabel")}
        services={
          dbServices.length > 0 
          ? dbServices.map((s: any, i: number) => ({
              key: String(s.id),
              num: String(i + 1).padStart(2, '0'),
              title: s.title,
              description: s.description,
              priceNote: s.price_note || "",
              price: s.is_inquiry ? (locale === 'fa' ? 'استعلام قیمت' : 'Request Quote') : s.price,
              priceToman: s.price_toman || "",
              isInquiry: s.is_inquiry
            }))
          : [
              { key: "custom", num: "01", title: tServices("items.custom.title"), description: tServices("items.custom.description"), priceNote: tServices("items.custom.priceNote"), price: tServices("items.custom.price"), priceToman: tServices("items.custom.priceToman"), isInquiry: false },
              { key: "corporate", num: "02", title: tServices("items.corporate.title"), description: tServices("items.corporate.description"), priceNote: tServices("items.corporate.priceNote"), price: tServices("items.corporate.price"), priceToman: tServices("items.corporate.priceToman"), isInquiry: false },
              { key: "development", num: "03", title: tServices("items.development.title"), description: tServices("items.development.description"), priceNote: "", price: tServices("items.development.price"), priceToman: tServices("items.development.priceToman"), isInquiry: true },
            ]
        }
      />

      {/* ============ 3. بخش ویژگی‌ها ============ */}
      <section className="relative overflow-hidden border-t border-border px-4 py-16 md:px-6 md:py-32">
        <div className="pointer-events-none absolute -bottom-40 end-0 -z-20 h-[600px] w-[600px] rounded-full blur-[140px]" style={{ backgroundColor: "rgba(255, 116, 56, 0.04)" }} aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 -z-20 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #D7DCE1 1px, transparent 0)", backgroundSize: "36px 36px" }} aria-hidden="true" />
        <SectionDecoration num="03" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <SectionLabel en="FEATURES" />
          <div className="mb-12 grid gap-6 md:mb-28 md:grid-cols-[1fr_auto] md:items-end md:gap-20">
            <h2 className="text-3xl font-bold leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">{tFeatures("title")}</h2>
            <p className="max-w-xs text-sm leading-relaxed text-muted md:pb-3 md:text-base">{tFeatures("note")}</p>
          </div>
          <div className="grid grid-cols-1 gap-x-16 md:grid-cols-2">
            {features.map((item, i) => (
              <div key={i} className="group relative border-t border-border py-6 md:py-10">
                <div className="flex items-start gap-4 md:gap-7">
                  <span className="shrink-0 font-mono text-xl font-light leading-none tracking-tighter text-muted transition-colors duration-500 group-hover:text-brand md:text-3xl">{String(i + 1).padStart(2, "0")}</span>
                  <p className="pt-0.5 text-sm font-medium leading-relaxed text-foreground/85 transition-colors duration-500 group-hover:text-foreground md:pt-1 md:text-lg">{item}</p>
                </div>
                <span className="pointer-events-none absolute top-0 start-0 h-px w-0 bg-brand transition-all duration-700 group-hover:w-full" />
              </div>
            ))}
          </div>
          <div className="border-t border-border" />
        </div>
      </section>

      {/* ============ 4. بخش نمونه‌کارها ============ */}
      <section id="work" className="relative scroll-mt-24 overflow-hidden border-t border-border px-4 py-16 md:px-6 md:py-32">
        <SectionDecoration num="04" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <SectionLabel en="SELECTED WORK" />
          <div className="grid gap-6 md:grid-cols-2 md:items-end mb-12 md:mb-24">
            <h2 className="text-4xl font-bold leading-none md:text-7xl lg:text-8xl">{tWork("title")}</h2>
            <div>
              <p className="text-sm leading-relaxed text-muted md:text-lg">{tWork("description")}</p>
            </div>
          </div>
          
          {projects.length === 0 ? (
             <div className="rounded-2xl border border-border bg-card/30 p-8 text-center text-muted backdrop-blur-sm md:p-12">
                <p className="text-base md:text-lg">{tWork("comingSoon")}</p>
             </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {projects.map((project: any) => (
                <Link href={`/${locale}/work/${project.id}`} key={project.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#111315]/50 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_20px_40px_-20px_rgba(255,116,56,0.15)]">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/40">
                     {project.image_url ? (
                       // eslint-disable-next-line @next/next/no-img-element
                       <img src={project.image_url} alt={project.title} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" />
                     ) : (<div className="flex h-full items-center justify-center text-muted/50 text-sm font-mono uppercase tracking-widest">No Image</div>)}
                     {project.is_featured && (<div className="absolute top-3 end-3 rounded-full bg-brand px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-brand-foreground shadow-lg md:top-4 md:end-4 md:px-3 md:text-[10px]">Featured</div>)}
                  </div>
                  <div className="flex flex-1 flex-col p-5 md:p-8">
                    <div className="mb-2 flex items-center justify-between gap-4 md:mb-3"><span className="font-mono text-[9px] uppercase tracking-widest text-brand md:text-[10px]">{project.category}</span></div>
                    <h3 className="mb-2 text-xl font-bold leading-tight text-foreground transition-colors duration-300 group-hover:text-brand md:mb-3 md:text-2xl">{project.title}</h3>
                    <p className="mb-5 text-xs leading-relaxed text-muted line-clamp-3 flex-1 md:mb-6 md:text-sm">{project.description}</p>
                    {project.technologies && (
                      <div className="mb-5 flex flex-wrap gap-1.5 md:mb-6 md:gap-2">
                        {project.technologies.split(',').map((tech: string, i: number) => (
                          <span key={i} className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-1 text-[9px] font-mono tracking-wider text-muted md:px-2.5 md:text-[10px]">{tech.trim()}</span>
                        ))}
                      </div>
                    )}
                    <div className="mt-auto pt-4 border-t border-white/[0.06]">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-foreground transition-colors group-hover:text-brand md:text-sm">
                        {locale === 'fa' ? 'مشاهده جزئیات' : 'View Details'}
                        <span className="rtl:rotate-180 transition-transform duration-300 group-hover:translate-x-1">→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ 5. بخش آخرین مقالات ============ */}
      <LatestPosts locale={locale} />

      {/* ============ 6. بخش بیوگرافی ============ */}
      <section id="about" className="relative scroll-mt-24 border-t border-border overflow-hidden">
        
        <div className="relative z-10 mx-auto w-full max-w-7xl md:px-6 md:py-32 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          
          <div className="relative w-full h-[50vh] md:h-[600px] rounded-none md:rounded-3xl overflow-hidden order-1 md:order-none">
            <Image
              src="/bio-bg.jpg"
              alt="Parham Batouie"
              fill
              quality={85}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent md:hidden" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/80 to-transparent md:hidden" />
          </div>

          <div className="flex flex-col items-start text-start max-w-xl px-4 md:px-0 py-8 md:py-0">
            <div className="mb-4 flex items-center justify-start gap-3 text-[10px] font-mono uppercase tracking-[0.25em] text-muted md:mb-6">
              <span className="text-brand">05</span>
              <span className="h-px w-8 bg-border" />
              <span>BIOGRAPHY</span>
            </div>
            
            <h2 className="text-3xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
              {tBio("title")}
            </h2>
            
            <p className="mt-3 text-base font-medium text-brand md:mt-4 md:text-xl text-start">
              {tBio("subtitle")}
            </p>

            <div className="relative mt-8 mb-6 flex flex-col items-start w-full md:mt-10 md:mb-8">
              <svg className="mb-3 h-6 w-6 text-brand/40 md:mb-4 md:h-10 md:w-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              
              <p className="text-base font-medium leading-relaxed text-foreground md:text-xl lg:text-2xl max-w-lg text-start drop-shadow-sm">
                {tBio("p1")}
              </p>
            </div>

            <div className="space-y-4 text-sm leading-relaxed text-muted md:space-y-5 md:text-base max-w-lg text-start drop-shadow-sm">
              <p>{tBio("p2")}</p>
              <p>{tBio("p3")}</p>
            </div>

            <div className="mt-8 inline-flex flex-row items-center justify-start gap-3 rounded-full border border-white/10 bg-background/60 px-4 py-2 shadow-lg backdrop-blur-md md:mt-10 md:px-6 md:py-2.5">
              <span className="flex h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-brand md:h-2 md:w-2" />
              <span className="text-xs font-semibold tracking-wide text-foreground md:text-base">
                {tBio("experience")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 7. بخش مهارت‌ها ============ */}
      <section className="relative overflow-hidden border-t border-border px-4 py-16 md:px-6 md:py-32">
        <SectionDecoration num="06" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <SectionLabel en="SKILLS & PRINCIPLES" />
          <div className="mb-10 md:mb-16">
            <h2 className="text-2xl font-bold md:text-5xl">{tBio("skillsTitle")}</h2>
            <p className="mt-3 max-w-xl text-sm text-muted md:mt-4 md:text-base">{tBio("skillsSubtitle")}</p>
          </div>
          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <h3 className="mb-4 border-b border-border pb-3 text-[10px] font-mono uppercase tracking-widest text-brand md:mb-6">SKILLS</h3>
              <ul className="space-y-3 md:space-y-4">
                {skills.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground/80 md:text-base">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand md:mt-2" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-4 border-b border-border pb-3 text-[10px] font-mono uppercase tracking-widest text-brand md:mb-6">PRINCIPLES</h3>
              <ul className="space-y-3 md:space-y-4">
                {principles.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground/80 md:text-base">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand md:mt-2" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 8. بخش فرآیند ============ */}
      <section className="relative overflow-hidden border-t border-border px-4 py-16 md:px-6 md:py-32">
        <SectionDecoration num="07" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <SectionLabel en="PROCESS" />
          <h2 className="mb-10 text-2xl font-bold md:mb-16 md:text-5xl">{tProcess("title")}</h2>
          <div className="grid gap-8 md:grid-cols-4 md:gap-10">
            {processSteps.map((step, i) => (
              <div key={step} className="relative">
                <div className="mb-3 flex items-center gap-3 md:mb-4">
                  <span className="text-[10px] font-mono text-brand">0{i + 1}</span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <h3 className="mb-2 text-base font-semibold md:mb-3 md:text-xl">{tProcess(`steps.${step}.title`)}</h3>
                <p className="text-xs leading-relaxed text-muted md:text-sm">{tProcess(`steps.${step}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 9. بخش تماس ============ */}
      <ContactSection locale={locale} />
      <Footer locale={locale} />
    </>
  );
}