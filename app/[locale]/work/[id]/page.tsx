import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, id } = await params;
  try {
    const result = await query("SELECT title, description FROM projects WHERE id = $1", [id]);
    if (result.rows.length > 0) return { title: `${result.rows[0].title} | Parham Batouie`, description: result.rows[0].description?.substring(0, 160) };
  } catch (error) {}
  return { title: "Project Not Found" };
}

export default async function ProjectSinglePage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const isRtl = locale === "fa";

  let project: any = null;
  try {
    const result = await query("SELECT * FROM projects WHERE id = $1 AND is_published = true", [id]);
    if (result.rows.length > 0) project = result.rows[0];
  } catch (error) {}
  if (!project) notFound();

  let gallery: string[] = [];
  try { if (project.gallery_images) gallery = JSON.parse(project.gallery_images); } catch (e) {}

  return (
    <>
      <Header locale={locale} />
      <main className="min-h-screen pt-32 pb-24 md:pt-44 md:pb-32 relative bg-background">
        <div className="mx-auto max-w-7xl px-6">
          
          <Link href={`/${locale}#work`} className="mb-12 inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-brand">
            <span className={isRtl ? "rotate-180" : ""}>←</span>{isRtl ? "بازگشت به نمونه‌کارها" : "Back to Work"}
          </Link>

          <div className="mb-16 md:mb-24 max-w-4xl">
            <div className="mb-6 flex items-center gap-4">
              <span className="rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-[10px] font-mono tracking-widest text-brand uppercase">{project.category}</span>
              {project.is_featured && <span className="text-xs font-bold text-brand">★ Featured Project</span>}
            </div>
            <h1 className="text-5xl font-bold leading-[1.1] tracking-tight md:text-7xl lg:text-8xl">{project.title}</h1>
          </div>

          {project.image_url && (
            <div className="relative mb-20 aspect-video w-full overflow-hidden rounded-3xl border border-white/5 bg-black/40 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={project.image_url} alt={project.title} className="object-cover w-full h-full" />
            </div>
          )}

          <div className="grid gap-16 md:grid-cols-[1fr_350px] lg:gap-24">
            <div className="prose prose-invert prose-lg max-w-none text-muted leading-[2] md:leading-[2.2]">
              <h2 className="text-3xl font-bold text-foreground mb-8">{isRtl ? "جزئیات پروژه" : "Project Details"}</h2>
              {(project.content || project.description || "").split('\n').map((paragraph: string, index: number) => (
                <p key={index} className="mb-8 text-base md:text-lg font-light">{paragraph}</p>
              ))}
            </div>

            <div className="space-y-10 md:sticky md:top-32 h-fit">
              {project.technologies && (
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                  <h3 className="mb-4 text-[10px] font-mono uppercase tracking-widest text-brand">{isRtl ? "تکنولوژی‌ها" : "Technologies"}</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.split(',').map((tech: string, i: number) => (
                      <span key={i} className="rounded-md border border-white/5 bg-black/20 px-3 py-1.5 text-xs font-mono text-muted">{tech.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-4 pt-6 border-t border-border">
                {project.project_url && (
                  <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-between rounded-xl bg-brand px-6 py-4 text-sm font-bold text-brand-foreground transition hover:opacity-90">
                    {isRtl ? "مشاهده وب‌سایت" : "Visit Website"}<span className={isRtl ? "rotate-180" : ""}>→</span>
                  </a>
                )}
                {project.github_url && (
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-between rounded-xl border border-border px-6 py-4 text-sm font-bold text-foreground transition hover:bg-white/5">
                    {isRtl ? "سورس کد" : "Source Code"}<span className={isRtl ? "rotate-180" : ""}>→</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {gallery.length > 0 && (
            <div className="mt-24 pt-16 border-t border-border">
              <h2 className="mb-10 text-3xl font-bold text-foreground">{isRtl ? "گالری تصاویر" : "Project Gallery"}</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {gallery.map((imgUrl, i) => (
                  <div key={i} className={`relative overflow-hidden rounded-2xl border border-white/5 bg-black/20 ${i % 3 === 0 ? 'md:col-span-2 aspect-[21/9]' : 'aspect-[4/3]'}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgUrl} alt={`${project.title} gallery ${i}`} className="object-cover w-full h-full transition-transform duration-700 hover:scale-105" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer locale={locale} />
    </>
  );
}