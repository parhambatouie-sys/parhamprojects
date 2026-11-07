"use client";

import { useState, useEffect, FormEvent } from "react";

type Service = {
  id: number;
  title: string;
  description: string;
  price: string;
  price_toman: string;
  price_note: string;
  is_inquiry: boolean;
  sort_order: number;
  is_published: boolean;
  locale: string;
};

const initialFormData = {
  title: "",
  description: "",
  price: "",
  price_toman: "",
  price_note: "",
  is_inquiry: false,
  sort_order: 0,
  is_published: true,
  locale: "fa",
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchServices = () => {
    setLoading(true);
    fetch("/api/admin/services", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.services) setServices(data.services);
        setLoading(false);
      });
  };

  useEffect(() => { fetchServices(); }, []);

  const openModal = (service?: Service) => {
    if (service) {
      setCurrentService(service);
      setFormData({
        title: service.title,
        description: service.description || "",
        price: service.price || "",
        price_toman: service.price_toman || "",
        price_note: service.price_note || "",
        is_inquiry: service.is_inquiry,
        sort_order: service.sort_order,
        is_published: service.is_published,
        locale: service.locale,
      });
    } else {
      setCurrentService(null);
      setFormData(initialFormData);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const url = currentService ? `/api/admin/services/${currentService.id}` : "/api/admin/services";
    const method = currentService ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchServices();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`خطا: ${errData.error || "مشکل در ذخیره"}`);
      }
    } catch (err) { alert("خطای شبکه"); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("آیا از حذف این خدمت مطمئن هستید؟")) return;
    await fetch(`/api/admin/services/${id}`, { method: "DELETE", credentials: "include" });
    fetchServices();
  };

  if (loading) return <div className="text-white text-center mt-10">در حال بارگذاری خدمات...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <header>
          <h1 className="text-3xl font-bold text-foreground">مدیریت خدمات</h1>
          <p className="mt-2 text-muted">خدمات و قیمت‌های خود را برای سایت فارسی و انگلیسی مدیریت کنید.</p>
        </header>
        <button onClick={() => openModal()} className="rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground hover:opacity-90">+ افزودن خدمت جدید</button>
      </div>

      {services.length === 0 ? (
        <div className="rounded-xl border border-border bg-[#292D31] p-10 text-center text-muted">هنوز خدمتی ثبت نکرده‌اید.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {services.map((srv) => (
            <div key={srv.id} className="rounded-xl border border-border bg-[#292D31] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded bg-black/40 px-2 py-0.5 text-[10px] font-mono text-muted">
                  {srv.locale === 'fa' ? '🇮🇷 فارسی' : '🇬🇧 English'}
                </span>
                <span className={srv.is_published ? "text-green-500 text-xs" : "text-yellow-500 text-xs"}>
                  {srv.is_published ? "منتشر شده" : "پیش‌نویس"}
                </span>
              </div>
              <h3 className="text-lg font-bold text-foreground">{srv.title}</h3>
              <p className="text-sm text-muted mt-2 line-clamp-2">{srv.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                <div>
                  <span className="text-xs text-muted block">قیمت:</span>
                  <span className="font-mono text-brand font-bold">{srv.is_inquiry ? "استعلامی" : srv.price}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal(srv)} className="rounded border border-border px-3 py-1.5 text-xs hover:bg-white/5">ویرایش</button>
                  <button onClick={() => handleDelete(srv.id)} className="rounded border border-red-500/30 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10">حذف</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-[#292D31] p-6 shadow-2xl my-8">
            <div className="mb-6 flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-xl font-bold text-foreground">{currentService ? "ویرایش خدمت" : "افزودن خدمت"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted hover:text-red-400">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs text-muted">عنوان خدمت *</label>
                  <input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full rounded-md border border-border bg-[#111315] px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted">زبان</label>
                  <select value={formData.locale} onChange={(e) => setFormData({...formData, locale: e.target.value})} className="w-full rounded-md border border-border bg-[#111315] px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none">
                    <option value="fa">🇮🇷 فارسی</option>
                    <option value="en">🇬🇧 English</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-muted">توضیحات</label>
                <textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full rounded-md border border-border bg-[#111315] px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none resize-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-xs text-muted">قیمت اصلی (مثلاً $66)</label>
                  <input value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full rounded-md border border-border bg-[#111315] px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none" dir="ltr" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted">قیمت معادل تومانی</label>
                  <input value={formData.price_toman} onChange={(e) => setFormData({...formData, price_toman: e.target.value})} className="w-full rounded-md border border-border bg-[#111315] px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none" dir="ltr" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted">متن بالای قیمت</label>
                  <input value={formData.price_note} onChange={(e) => setFormData({...formData, price_note: e.target.value})} placeholder="مثلاً شروع از" className="w-full rounded-md border border-border bg-[#111315] px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-4">
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_inquiry} onChange={(e) => setFormData({...formData, is_inquiry: e.target.checked})} className="h-4 w-4 accent-brand" />
                    <span className="text-sm text-foreground">قیمت استعلامی (بدون قیمت ثابت)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_published} onChange={(e) => setFormData({...formData, is_published: e.target.checked})} className="h-4 w-4 accent-brand" />
                    <span className="text-sm text-foreground">منتشر شده</span>
                  </label>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted">ترتیب نمایش (عدد)</label>
                  <input type="number" value={formData.sort_order} onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})} className="w-full rounded-md border border-border bg-[#111315] px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none" dir="ltr" />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t border-border pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm text-muted hover:bg-white/5">انصراف</button>
                <button type="submit" disabled={isSubmitting} className="rounded-md bg-brand px-6 py-2 text-sm font-semibold text-brand-foreground disabled:opacity-50">{isSubmitting ? "در حال ذخیره..." : "ذخیره خدمت"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}