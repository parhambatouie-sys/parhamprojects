"use client";

import { useState } from "react";

type Project = {
  id: number;
  title: string;
  category: string;
  status: "منتشر شده" | "پیش‌نویس";
};

export default function AdminProjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // داده‌های تستی
  const [projects, setProjects] = useState<Project[]>([
    { id: 1, title: "وب‌سایت شرکتی آلفا", category: "شرکتی", status: "منتشر شده" },
    { id: 2, title: "فروشگاه آنلاین بتا", category: "فروشگاهی", status: "پیش‌نویس" },
  ]);

  const [newProject, setNewProject] = useState({ title: "", category: "شرکتی" });

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    // اینجا فقط برای شبیه‌سازی ظاهری، پروژه را به لیست اضافه می‌کنیم
    const newId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
    setProjects([...projects, { id: newId, title: newProject.title, category: newProject.category, status: "پیش‌نویس" }]);
    setIsModalOpen(false);
    setNewProject({ title: "", category: "شرکتی" });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <header>
          <h1 className="text-3xl font-bold text-foreground">مدیریت نمونه‌کارها</h1>
          <p className="mt-2 text-muted">پروژه‌های خود را اضافه یا ویرایش کنید.</p>
        </header>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
        >
          + افزودن پروژه جدید
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div key={project.id} className="rounded-xl border border-border bg-[#292D31] p-6 shadow-sm">
            <div className="mb-4 aspect-video rounded-lg bg-black/50 flex items-center justify-center text-muted text-sm border border-border/50">
              [تصویر پروژه]
            </div>
            <h3 className="text-lg font-bold text-foreground">{project.title}</h3>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted">
              <span className="rounded bg-border px-2 py-1">{project.category}</span>
              <span className={project.status === "منتشر شده" ? "text-green-500" : "text-yellow-500"}>{project.status}</span>
            </div>
            <div className="mt-6 flex gap-2">
              <button className="flex-1 rounded border border-border py-2 text-xs font-medium transition hover:bg-white/5">ویرایش</button>
              <button className="rounded border border-red-500/30 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10">حذف</button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-[#292D31] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-xl font-bold text-foreground">افزودن پروژه جدید</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-muted transition hover:text-red-400"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddProject} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-muted">عنوان پروژه</label>
                <input 
                  type="text" 
                  required
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                  className="w-full rounded-md border border-border bg-[#111315] px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none" 
                  placeholder="مثلا: طراحی وب‌سایت فروشگاهی"
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm text-muted">دسته‌بندی</label>
                <select 
                  value={newProject.category}
                  onChange={(e) => setNewProject({...newProject, category: e.target.value})}
                  className="w-full rounded-md border border-border bg-[#111315] px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none appearance-none"
                >
                  <option value="شرکتی">شرکتی</option>
                  <option value="فروشگاهی">فروشگاهی</option>
                  <option value="شخصی">شخصی</option>
                  <option value="سایر">سایر</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-muted">تصویر پروژه</label>
                <div className="flex items-center justify-center rounded-md border border-dashed border-border bg-[#111315] py-6 text-sm text-muted cursor-pointer hover:border-brand/50 transition">
                  برای آپلود کلیک کنید (فعلا غیرفعال)
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted transition hover:bg-white/5 hover:text-foreground"
                >
                  انصراف
                </button>
                <button 
                  type="submit"
                  className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
                >
                  ذخیره پروژه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}