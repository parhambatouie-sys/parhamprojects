"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Order = {
  id: number;
  status: string;
};

export default function AdminDashboard() {
  const params = useParams();
  const locale = params.locale as string;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
        setLoading(false);
      });
  }, []);

  const totalOrders = orders.length;
  const newOrders = orders.filter((o) => o.status === "new").length;
  
  const activeProjects = 8; 
  const revenue = "۱۸.۵M";

  const stats = [
    { label: "کل سفارش‌ها", value: totalOrders.toString(), color: "foreground", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { label: "سفارش‌های جدید", value: newOrders.toString().padStart(2, '0'), color: "brand", icon: "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "پروژه‌های فعال", value: activeProjects.toString().padStart(2, '0'), color: "foreground", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
    { label: "درآمد این ماه (تومان)", value: revenue, color: "foreground", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  if (loading) return <div className="text-white text-center mt-10">در حال بارگذاری آمار...</div>;

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
            <span>Live Dashboard</span>
          </div>
          <h1 className="text-4xl font-bold text-white">سلام پرهام 👋</h1>
          <p className="mt-2 text-sm text-muted">خلاصه وضعیت سایت در یک نگاه</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted transition hover:text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {newOrders > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-brand-foreground border-2 border-[#111315]">
                {newOrders}
              </span>
            )}
          </div>

          <Link
            href={`/${locale}/admin/orders`}
            className="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground transition hover:opacity-90"
          >
            مشاهده سفارش‌ها ←
          </Link>
        </div>
      </header>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-brand/30 hover:bg-white/[0.03]">
            <div className="relative flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color === "brand" ? "bg-brand/10 text-brand" : "bg-white/[0.04] text-muted"}`}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                </svg>
              </div>
            </div>
            <div className="relative mt-6">
              <p className="text-sm text-muted">{stat.label}</p>
              <p className={`mt-2 font-mono text-4xl font-bold tracking-tighter ${stat.color === "brand" ? "text-brand" : "text-white"}`}>
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}