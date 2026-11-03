export default function AdminSettingsPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <header>
        <h1 className="text-3xl font-bold text-foreground">تنظیمات سایت</h1>
        <p className="mt-2 text-muted">اطلاعات کلی و راه‌های ارتباطی خود را ویرایش کنید.</p>
      </header>

      <div className="rounded-xl border border-border bg-[#292D31] p-6 md:p-8 space-y-8 shadow-sm">
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-border pb-2 text-foreground">اطلاعات عمومی</h2>
          <div>
            <label className="mb-2 block text-xs text-muted">عنوان سایت</label>
            <input type="text" defaultValue="استودیو پرهام بتوئی" className="w-full rounded border border-border bg-[#111315] px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none" />
          </div>
          <div>
            <label className="mb-2 block text-xs text-muted">توضیحات متا (SEO)</label>
            <textarea rows={3} defaultValue="طراحی و توسعه وب‌سایت‌های اختصاصی..." className="w-full rounded border border-border bg-[#111315] px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-border pb-2 text-foreground">اطلاعات تماس</h2>
          <div>
            <label className="mb-2 block text-xs text-muted">ایمیل</label>
            <input type="email" defaultValue="hello@parhambatouie.com" dir="ltr" className="w-full rounded border border-border bg-[#111315] px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none" />
          </div>
          <div>
            <label className="mb-2 block text-xs text-muted">آیدی اینستاگرام</label>
            <input type="text" defaultValue="parham.batouie" dir="ltr" className="w-full rounded border border-border bg-[#111315] px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none" />
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <button className="rounded bg-brand px-8 py-3 text-sm font-semibold text-brand-foreground transition hover:opacity-90">
            ذخیره تغییرات
          </button>
        </div>

      </div>
    </div>
  );
}