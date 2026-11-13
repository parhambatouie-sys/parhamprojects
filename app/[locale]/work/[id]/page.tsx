import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { query } from "@/lib/db";
import { ArrowUpRight, ArrowRight } from "lucide-react";

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
      <main className="min-h-screen pt-24 pb-24 md:pt-32 md:pb-32 relative bg-[#0a0a0a] text-white">
        
        <div className="mx-auto max-w-6xl px-6">
          
          {/* دکمه بازگشت */}
          <Link href={`/${locale}#work`} className="group mb-12 inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition hover:text-white">
            <ArrowRight size={16} className={`transition-transform group-hover:-translate-x-1 ${!isRtl ? 'rotate-180 group-hover:translate-x-1' : ''}`} />
            {isRtl ? "بازگشت به نمونه‌کارها" : "Back to Work"}
          </Link>

          {/* هدر پروژه */}
          <div className="mb-12 md:mb-20 max-w-4xl">
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-mono tracking-widest text-gray-300 uppercase">
                {project.category}
              </span>
              {project.is_featured && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-orange-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                  پروژه ویژه
                </span>
              )}
            </div>
            <h1 className="text-4xl font-bold leading-[1.2] tracking-tight md:text-5xl lg:text-6xl text-balance">
              {project.title}
            </h1>
            <p className="mt-6 text-lg text-gray-400 leading-relaxed max-w-2xl">
              {project.description}
            </p>
          </div>

          {/* 👈 قاب عکس کاور (بازطراحی شده) */}
          {project.image_url && (
            <div className="relative mb-20 md:mb-32 group">
              {/* هاله نورانی پشت عکس */}
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-purple-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10" />
              
              {/* قاب اصلی عکس */}
              <div className="relative w-full max-h-[75vh] aspect-video md:aspect-[21/9] overflow-hidden rounded-2xl md:rounded-[2rem] border border-white/10 bg-[#111] shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={project.image_url} 
                  alt={project.title} 
                  className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-105" 
                />
                {/* گرادیانت برای خوانایی بیشتر در پایین عکس */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
              </div>
            </div>
          )}

          {/* بخش محتوا و اطلاعات */}
          <div className="grid gap-16 md:grid-cols-12 lg:gap-24">
            
            {/* ستون سمت راست: توضیحات (Case Study) */}
            <div className="md:col-span-8">
              <div className="prose prose-invert prose-lg max-w-none text-gray-400 leading-[2] md:leading-[2.2]">
                <h2 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4">
                  {isRtl ? "جزئیات و چالش‌های پروژه" : "Project Details"}
                </h2>
                {(project.content || project.description || "").split('\n').map((paragraph: string, index: number) => (
                  <p key={index} className="mb-6 text-base md:text-lg font-light text-justify">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* ستون سمت چپ: اطلاعات و دکمه‌ها (Sticky) */}
            <div className="md:col-span-4 space-y-8 md:sticky md:top-32 h-fit">
              
              {/* کارت اطلاعات */}
              <div className="rounded-2xl border border-white/10 bg-[#111] p-6 shadow-xl">
                <h3 className="mb-6 text-xs font-mono uppercase tracking-widest text-orange-500">
                  {isRtl ? "اطلاعات پروژه" : "Project Info"}
                </h3>
                
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between border-b border-white/5 pb-3">
                    <span className="text-gray-500">دسته‌بندی</span>
                    <span className="font-medium text-white">{project.category}</span>
                  </div>
                  {project.technologies && (
                    <div className="flex flex-col gap-2 border-b border-white/5 pb-4">
                      <span className="text-gray-500 mb-1">تکنولوژی‌ها</span>
                      <div className="flex flex-wrap gap-1.5">
                        {project.technologies.split(',').map((tech: string, i: number) => (
                          <span key={i} className="rounded bg-white/5 px-2.5 py-1 text-xs font-mono text-gray-300">
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* دکمه مشاهده سایت */}
                <div className="mt-8">
                  {project.project_url ? (
                    <a 
                      href={project.project_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="group flex w-full items-center justify-between rounded-xl bg-orange-500 px-6 py-4 text-sm font-bold text-white transition-all hover:bg-orange-600 hover:scale-[1.02] shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                    >
                      <span>{isRtl ? "مشاهده وب‌سایت زنده" : "Visit Live Website"}</span>
                      <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </a>
                  ) : (
                    <div className="text-center p-4 border border-white/10 rounded-xl text-gray-500 text-sm">
                      لینک دمو ثبت نشده است
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* گالری تصاویر */}
          {gallery.length > 0 && (
            <div className="mt-24 pt-16 border-t border-white/10">
              <h2 className="mb-12 text-center text-2xl md:text-3xl font-bold text-white">
                {isRtl ? "گالری تصاویر" : "Project Gallery"}
              </h2>
              <div className="columns-1 md:columns-2 gap-6 space-y-6">
                {gallery.map((imgUrl, i) => (
                  <div 
                    key={i} 
                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111] break-inside-avoid group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={imgUrl} 
                      alt={`${project.title} gallery ${i}`} 
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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