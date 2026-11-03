"use client";

import { useState, use } from "react";
import { AdminSidebar } from "@/components/AdminSidebar";

export default function AdminPanelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // استفاده از React.use برای باز کردن Promise و گرفتن locale
  const { locale } = use(params);

  return (
    <div className="relative min-h-screen bg-[#111315]" dir="rtl">
      {/* پس‌زمینه تزئینی */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -top-40 start-1/4 h-[500px] w-[500px] rounded-full bg-brand/[0.03] blur-[120px]" />
        <div className="absolute bottom-0 end-1/4 h-[400px] w-[400px] rounded-full bg-brand/[0.02] blur-[100px]" />
      </div>

      <AdminSidebar locale={locale} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* هدر موبایل */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#111315]/80 px-4 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 border border-brand/30">
            <span className="text-xs font-bold text-brand">PB</span>
          </div>
          <span className="text-sm font-bold text-white">پنل مدیریت</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-white"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {/* محتوای اصلی */}
      <main className="relative min-h-[calc(100vh-4rem)] p-4 md:p-8 lg:mr-64 lg:min-h-screen lg:p-12">
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}