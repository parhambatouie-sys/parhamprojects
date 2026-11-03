import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OrderForm } from "./OrderForm";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Order");

  return (
    <>
      <Header locale={locale} />

      <main className="min-h-screen px-6 pt-32 pb-20 md:pt-40 md:pb-24">
        <div className="mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="mb-12 md:mb-24">
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
              {t("title")}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted md:mt-6 md:text-lg">
              {t("subtitle")}
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
            {/* Left side: Info (Compact on Mobile, without the 1 2 3 circles) */}
            <div className="space-y-6 md:space-y-12">
              <h2 className="text-sm font-semibold text-brand md:text-xl">
                {t("infoTitle")}
              </h2>
              
              <div className="flex flex-col gap-4 md:gap-8">
                {/* Step 1 */}
                <div className="md:border-s-2 md:border-border md:ps-6">
                  <h3 className="text-sm font-medium text-foreground md:text-lg">{t("step1Title")}</h3>
                  <p className="mt-1 hidden text-sm leading-relaxed text-muted md:mt-2 md:block">{t("step1Desc")}</p>
                </div>

                {/* Step 2 */}
                <div className="md:border-s-2 md:border-border md:ps-6">
                  <h3 className="text-sm font-medium text-foreground md:text-lg">{t("step2Title")}</h3>
                  <p className="mt-1 hidden text-sm leading-relaxed text-muted md:mt-2 md:block">{t("step2Desc")}</p>
                </div>

                {/* Step 3 */}
                <div className="md:border-s-2 md:border-border md:ps-6">
                  <h3 className="text-sm font-medium text-foreground md:text-lg">{t("step3Title")}</h3>
                  <p className="mt-1 hidden text-sm leading-relaxed text-muted md:mt-2 md:block">{t("step3Desc")}</p>
                </div>
              </div>
            </div>

            {/* Right side: Form */}
            <div>
              <OrderForm />
            </div>
          </div>
        </div>
      </main>

      <Footer locale={locale} />
    </>
  );
}