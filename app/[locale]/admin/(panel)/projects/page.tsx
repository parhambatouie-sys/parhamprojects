"use client";

import { useState, useEffect, FormEvent } from "react";
import { MultiImageUpload } from "@/components/admin/MultiImageUpload";
import { ImageUpload } from "@/components/admin/ImageUpload";

type Project = {
  id: number;
  title: string;
  description: string;
  content: string; // <-- اضافه شد
  category: string;
  technologies: string;
  project_url: string;
  github_url: string;
  image_url: string;
  gallery_images: string; // <-- اضافه شد
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  locale: string;
};

const initialFormData = {
  title: "",
  description: "",
  content: "", // <-- اضافه شد
  category: "شرکتی",
  technologies: "",
  project_url: "",
  github_url: "",
  image_url: "",
  gallery_images: "[]", // <-- اضافه شد
  is_featured: false,
  is_published: true,
  sort_order: 0,
  locale: "fa",
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCaseStudyOpen, setIsCaseStudyOpen] = useState(false); // استیت برای باز و بسته کردن بخش اختصاصی

  const fetchProjects = () => {
    setLoading(true);
    fetch("/api/admin/projects", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.projects) setProjects(data.projects);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openModal = (project?: Project) => {
    if (project) {
      setCurrentProject(project);
      setFormData({
        title: project.title,
        description: project.description || "",
        content: project.content || "", // <-- اضافه شد
        category: project.category || "شرکتی",
        technologies: project.technologies || "",
        project_url: project.project_url || "",
        github_url: project.github_url || "",
        image_url: project.image_url || "",
        gallery_images: project.gallery_images || "[]", // <-- اضافه شد
        is_featured: project.is_featured,
        is_published: project.is_published,
        sort_order: project.sort_order,
        locale: project.locale || "fa",
      });
    } else {
      setCurrentProject(null);
      setFormData(initialFormData);
    }
    setIsCaseStudyOpen(false); // بستن بخش اختصاصی هنگام باز کردن فرم جدید
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const url = currentProject ? `/api/admin/projects/${currentProject.id}` : "/api/admin/projects";
    const method = currentProject ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchProjects();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`خطا در ذخیره پروژه: ${errData.error || "خطای نامشخص"}`);
      }
    } catch (err) {
      alert("خطای شبکه");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("آیا از حذف این نمونه‌کار مطمئن هستید؟")) return;
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) fetchProjects();
    } catch (err) {
      alert("خطا در حذف");
    }
  };

  if (loading) return <div className="text-white text-center mt-10">در حال بارگذاری نمونه‌کارها...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <header>
          <h1 className="text-3xl font-bold text-foreground">مدیریت نمونه‌کارها</h1>
          <p className="mt-2 text-muted">پروژه‌های خود را برای سایت فارسی و انگلیسی مدیریت کنید.</p>
        </header>
        <button 
          onClick={() => openModal()}
          className="rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
        >
          + افزودن پروژه جدید
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-border bg-[#292D31] p-10 text-center text-muted">هنوز هیچ نمونه‌کاری ثبت نکرده‌اید.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project.id} className="rounded-xl border border-border bg-[#292D31] p-6 shadow-sm overflow-hidden flex flex-col">
              <div className="mb-4 aspect-video rounded-lg bg-black/50 flex items-center justify-center text-muted text-sm border border-border/50 overflow-hidden relative">
                {project.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.image_url} alt={project.title} className="object-cover w-full h-full" />
                ) : ("[بدون تصویر]")}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded bg-black/40 px-2 py-0.5 text-[10px] font-mono border border-white/10 text-muted">
                  {project.locale === 'fa' ? '🇮🇷 فارسی' : '🇬🇧 English'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-foreground truncate">{project.title}</h3>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted flex-1">
                <span className="rounded bg-border px-2 py-1">{project.category}</span>
                <span className={project.is_published ? "text-green-500" : "text-yellow-500"}>{project.is_published ? "منتشر شده" : "پیش‌نویس"}</span>
                {project.is_featured && <span className="text-brand">★ ویژه</span>}
              </div>
              <div className="mt-6 flex gap-2">
                <button onClick={() => openModal(project)} className="flex-1 rounded border border-border py-2 text-xs font-medium transition hover:bg-white/5">ویرایش</button>
                <button onClick={() => handleDelete(project.id)} className="rounded border border-red-500/30 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10">حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-[#292D31] p-6 shadow-2xl my-8">
            <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-xl font-bold text-foreground">{currentProject ? "ویرایش نمونه‌کار" : "افزودن نمونه‌کار جدید"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted hover:text-red-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs text-muted">عنوان پروژه *</label>
                  <input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full rounded-md border border-border bg-[#111315] px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted">زبان سایت (دسته‌بندی اصلی)</label>
                  <select value={formData.locale} onChange={(e) => setFormData({...formData, locale: e.target.value})} className="w-full rounded-md border border-border bg-[#111315] px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none font-semibold">
                    <option value="fa">🇮🇷 فارسی</option>
                    <option value="en">🇬🇧 English</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs text-muted">دسته‌بندی (مثلا: شرکتی، فروشگاهی)</label>
                  <input value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full rounded-md border border-border bg-[#111315] px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted">ترتیب نمایش (عدد)</label>
                  <input type="number" value={formData.sort_order} onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})} className="w-full rounded-md border border-border bg-[#111315] px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none" dir="ltr" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-muted">توضیحات</label>
                <textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full rounded-md border border-border bg-[#111315] px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none resize-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs text-muted">تکنولوژی‌ها (با کاما جدا کنید)</label>
                  <input value={formData.technologies} onChange={(e) => setFormData({...formData, technologies: e.target.value})} className="w-full rounded-md border border-border bg-[#111315] px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none" dir="ltr" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted">لینک پروژه (اختیاری)</label>
                  <input value={formData.project_url} onChange={(e) => setFormData({...formData, project_url: e.target.value})} className="w-full rounded-md border border-border bg-[#111315] px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none" dir="ltr" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                  <ImageUpload onUpload={(url: string) => setFormData({...formData, image_url: url})} />
                  {formData.image_url && <p className="mt-2 text-xs text-green-400 truncate">تصویر آپلود شد</p>}
                </div>
                <div className="flex flex-col gap-3 mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_published} onChange={(e) => setFormData({...formData, is_published: e.target.checked})} className="h-4 w-4 accent-brand" />
                    <span className="text-sm text-foreground">منتشر شده</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({...formData, is_featured: e.target.checked})} className="h-4 w-4 accent-brand" />
                    <span className="text-sm text-foreground">پروژه ویژه (Featured)</span>
                  </label>
                </div>
              </div>

              {/* بخش اختصاصی صفحه نمونه‌کار (آکاردئون) */}
              <div className="border border-border rounded-lg overflow-hidden bg-black/10 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsCaseStudyOpen(!isCaseStudyOpen)}
                  className="w-full flex items-center justify-between p-4 text-sm font-semibold text-foreground hover:bg-white/5 transition"
                >
                  <span>🎨 محتوای صفحه اختصاصی (Case Study)</span>
                  <span>{isCaseStudyOpen ? "▲" : "▼"}</span>
                </button>
                
                {isCaseStudyOpen && (
                  <div className="p-4 border-t border-border space-y-4">
                    <div>
                      <label className="mb-1 block text-xs text-muted">متن کامل و جزئیات (Case Study)</label>
                      <textarea rows={6} value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} placeholder="درباره چالش‌ها، راهکارها و جزئیات این پروژه بنویسید..." className="w-full rounded-md border border-border bg-[#111315] px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none resize-y" />
                    </div>
                    <div>
                      <label className="mb-3 block text-xs text-muted">گالری تصاویر (چند عکس)</label>
                      <MultiImageUpload onUpload={(urls: string[]) => setFormData({...formData, gallery_images: JSON.stringify(urls)})} />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t border-border pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-white/5">انصراف</button>
                <button type="submit" disabled={isSubmitting} className="rounded-md bg-brand px-6 py-2 text-sm font-semibold text-brand-foreground transition hover:opacity-90 disabled:opacity-50">{isSubmitting ? "در حال ذخیره..." : "ذخیره پروژه"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}