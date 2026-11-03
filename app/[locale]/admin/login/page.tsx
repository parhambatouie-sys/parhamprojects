import Link from "next/link";

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111315] px-6" dir="rtl">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-[#292D31] p-8 md:p-10 shadow-2xl">
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">ورود به پنل</h1>
          <p className="mt-2 text-sm text-muted">برای مدیریت سایت، اطلاعات خود را وارد کنید.</p>
        </div>

        <form className="mt-8 space-y-6">
          <div>
            <label className="mb-2 block text-xs font-mono uppercase tracking-widest text-muted">
              ایمیل مدیر
            </label>
            <input
              type="email"
              required
              className="w-full border-b border-border bg-transparent pb-3 text-base text-foreground outline-none transition-colors focus:border-brand"
              dir="ltr"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-mono uppercase tracking-widest text-muted">
              رمز عبور
            </label>
            <input
              type="password"
              required
              className="w-full border-b border-border bg-transparent pb-3 text-base text-foreground outline-none transition-colors focus:border-brand"
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground transition hover:opacity-90 mt-4"
          >
            ورود به پنل
          </button>
        </form>

        <div className="text-center pt-4 border-t border-border/50">
          <Link
            href={`/${locale}`}
            className="text-sm text-muted transition hover:text-brand"
          >
            ← بازگشت به سایت
          </Link>
        </div>

      </div>
    </div>
  );
}