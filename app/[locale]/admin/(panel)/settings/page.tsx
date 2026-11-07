"use client";

import { useState, useEffect, FormEvent } from "react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    site_title: "",
    site_description: "",
    contact_email: "",
    contact_phone: "",
    instagram: "",
    telegram: "",
    whatsapp: "",
    linkedin: "",
    github: "",
  });

  useEffect(() => {
    fetch("/api/admin/settings", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setFormData((prev) => ({ ...prev, ...data.settings }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      if (res.ok) {
        alert("✅ تنظیمات با موفقیت ذخیره شد.");
      } else {
        alert("خطا در ذخیره تنظیمات.");
      }
    } catch (err) {
      alert("خطای شبکه");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-white text-center mt-10">در حال بارگذاری تنظیمات...</div>;

  return (
    <div className="space-y-8 max-w-3xl">
      <header>
        <h1 className="text-3xl font-bold text-foreground">تنظیمات سایت</h1>
        <p className="mt-2 text-muted">اطلاعات کلی و راه‌های ارتباطی خود را ویرایش کنید.</p>
      </header>

      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-[#292D31] p-6 md:p-8 space-y-8 shadow-sm">
        
        {/* اطلاعات عمومی */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-border pb-2 text-foreground">اطلاعات عمومی</h2>
          <div>
            <label className="mb-2 block text-xs text-muted">عنوان سایت</label>
            <input type="text" value={formData.site_title} onChange={(e) => setFormData({...formData, site_title: e.target.value})} placeholder="استودیو پرهام بتوئی" className="w-full rounded border border-border bg-[#111315] px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none" />
          </div>
          <div>
            <label className="mb-2 block text-xs text-muted">توضیحات متا (SEO)</label>
            <textarea rows={3} value={formData.site_description} onChange={(e) => setFormData({...formData, site_description: e.target.value})} placeholder="طراحی و توسعه وب‌سایت‌های اختصاصی..." className="w-full rounded border border-border bg-[#111315] px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none" />
          </div>
        </div>

        {/* اطلاعات تماس */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-border pb-2 text-foreground">اطلاعات تماس</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs text-muted">ایمیل</label>
              <input type="email" value={formData.contact_email} onChange={(e) => setFormData({...formData, contact_email: e.target.value})} dir="ltr" placeholder="hello@parhambatouie.com" className="w-full rounded border border-border bg-[#111315] px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-xs text-muted">شماره تماس</label>
              <input type="text" value={formData.contact_phone} onChange={(e) => setFormData({...formData, contact_phone: e.target.value})} dir="ltr" placeholder="+98912..." className="w-full rounded border border-border bg-[#111315] px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none" />
            </div>
          </div>
        </div>

        {/* شبکه‌های اجتماعی */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-border pb-2 text-foreground">شبکه‌های اجتماعی</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs text-muted">اینستاگرام (آیدی)</label>
              <input type="text" value={formData.instagram} onChange={(e) => setFormData({...formData, instagram: e.target.value})} dir="ltr" placeholder="parham.batouie" className="w-full rounded border border-border bg-[#111315] px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-xs text-muted">تلگرام (آیدی)</label>
              <input type="text" value={formData.telegram} onChange={(e) => setFormData({...formData, telegram: e.target.value})} dir="ltr" placeholder="parham_batouie" className="w-full rounded border border-border bg-[#111315] px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-xs text-muted">واتساپ (شماره)</label>
              <input type="text" value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} dir="ltr" placeholder="98912..." className="w-full rounded border border-border bg-[#111315] px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-xs text-muted">لینکدین (آیدی)</label>
              <input type="text" value={formData.linkedin} onChange={(e) => setFormData({...formData, linkedin: e.target.value})} dir="ltr" placeholder="parham-batouie" className="w-full rounded border border-border bg-[#111315] px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-xs text-muted">گیت‌هاب (آیدی)</label>
              <input type="text" value={formData.github} onChange={(e) => setFormData({...formData, github: e.target.value})} dir="ltr" placeholder="parhambatouie-sys" className="w-full rounded border border-border bg-[#111315] px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none" />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <button type="submit" disabled={saving} className="rounded bg-brand px-8 py-3 text-sm font-semibold text-brand-foreground transition hover:opacity-90 disabled:opacity-50">
            {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>
        </div>

      </form>
    </div>
  );
}