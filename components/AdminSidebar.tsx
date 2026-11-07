"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminSidebar({
  locale,
  isOpen,
  setIsOpen,
}: {
  locale: string;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: `/${locale}/admin`, label: "داشبورد", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { href: `/${locale}/admin/orders`, label: "سفارش‌ها", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { href: `/${locale}/admin/projects`, label: "نمونه‌کارها", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { href: `/${locale}/admin/blog`, label: "وبلاگ", icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" },
    { href: `/${locale}/admin/services`, label: "خدمات", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { href: `/${locale}/admin/settings`, label: "تنظیمات", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
  ];

  return (
    <>
      {/* Mobile Overlay (پس‌زمینه تیره وقتی منو بازه) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-64 flex-col border-l border-white/[0.06] bg-[#111315]/95 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Orange Accent Line */}
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-brand/40 to-transparent" />

        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-white/[0.06] px-6">
          <Link href={`/${locale}/admin`} className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 border border-brand/30">
              <span className="text-sm font-bold text-brand">PB</span>
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">پنل مدیریت</div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted">Admin Panel</div>
            </div>
          </Link>
          {/* Close button on mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1 text-muted hover:bg-white/10 hover:text-white lg:hidden"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          <div className="mb-4 px-4 text-[10px] font-mono uppercase tracking-widest text-muted/60">
            منو اصلی
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== `/${locale}/admin`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`group relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-brand/10 text-brand"
                    : "text-muted hover:bg-white/[0.03] hover:text-foreground"
                }`}
              >
                {isActive && (
                  <span className="absolute start-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-brand" />
                )}
                <svg
                  className={`h-5 w-5 transition-colors ${isActive ? "text-brand" : "text-muted group-hover:text-foreground"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="space-y-1 border-t border-white/[0.06] p-4">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted transition hover:bg-white/[0.03] hover:text-foreground"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            بازگشت به سایت
          </Link>
          <Link
            href={`/${locale}/admin/login`}
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400/80 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            خروج از حساب
          </Link>
        </div>
      </aside>
    </>
  );
}