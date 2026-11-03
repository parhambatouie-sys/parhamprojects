import Link from "next/link";

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const stats = [
    {
      label: "کل سفارش‌ها",
      value: "24",
      change: "+3",
      trend: "up",
      color: "foreground",
      sparkline: [10, 12, 14, 13, 18, 20, 24],
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    },
    {
      label: "سفارش‌های جدید",
      value: "05",
      change: "امروز",
      trend: "neutral",
      color: "brand",
      sparkline: [1, 2, 2, 3, 2, 4, 5],
      icon: "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      label: "پروژه‌های فعال",
      value: "08",
      change: "در حال انجام",
      trend: "neutral",
      color: "foreground",
      sparkline: [2, 3, 5, 6, 6, 7, 8],
      icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
    {
      label: "درآمد این ماه (تومان)",
      value: "۱۸.۵M",
      change: "+۲۵٪",
      trend: "up",
      color: "foreground",
      sparkline: [8, 10, 12, 15, 13, 16, 18.5],
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
  ];

  const recentOrders = [
    { id: "ORD-001", client: "علی رضایی", type: "طراحی وب‌سایت اختصاصی", status: "new", amount: "۲۰,۰۰۰,۰۰۰" },
    { id: "ORD-002", client: "سارا محمدی", type: "وب‌سایت شرکتی", status: "reviewing", amount: "۱۸,۰۰۰,۰۰۰" },
    { id: "ORD-003", client: "رضا کریمی", type: "توسعه و پیاده‌سازی", status: "accepted", amount: "استعلامی" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new": return <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs text-brand"><span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />جدید</span>;
      case "reviewing": return <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 py-1.5 text-xs text-yellow-500"><span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />در حال بررسی</span>;
      case "accepted": return <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1.5 text-xs text-green-500"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />تایید شده</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
            <span>Live Dashboard</span>
          </div>
          <h1 className="text-4xl font-bold text-white">سلام پرهام 👋</h1>
          <p className="mt-2 text-sm text-muted">خلاصه وضعیت سایت در یک نگاه</p>
        </div>

        <div className="flex gap-2">
          <button className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-xs font-medium text-muted transition hover:border-brand/40 hover:text-brand">
            خروجی گزارش
          </button>
          <Link
            href={`/${locale}/admin/orders`}
            className="rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground transition hover:opacity-90"
          >
            مشاهده سفارش‌ها ←
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const max = Math.max(...stat.sparkline);
          const min = Math.min(...stat.sparkline);
          const range = max - min || 1;
          const points = stat.sparkline
            .map((v, idx) => {
              const x = (idx / (stat.sparkline.length - 1)) * 100;
              const y = 30 - ((v - min) / range) * 30;
              return `${x},${y}`;
            })
            .join(" ");

          return (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-brand/30 hover:bg-white/[0.03]"
            >
              {/* Glow on hover */}
              <div className="pointer-events-none absolute -top-20 -end-20 h-40 w-40 rounded-full bg-brand/0 blur-[60px] transition-all duration-700 group-hover:bg-brand/20" />

              {/* Icon + Label */}
              <div className="relative flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color === "brand" ? "bg-brand/10 text-brand" : "bg-white/[0.04] text-muted"}`}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                  </svg>
                </div>
                <span className={`text-[10px] font-mono tracking-wider ${stat.trend === "up" ? "text-green-500" : "text-muted"}`}>
                  {stat.change}
                </span>
              </div>

              {/* Value */}
              <div className="relative mt-6">
                <p className="text-sm text-muted">{stat.label}</p>
                <p className={`mt-2 font-mono text-4xl font-bold tracking-tighter ${stat.color === "brand" ? "text-brand" : "text-white"}`}>
                  {stat.value}
                </p>
              </div>

              {/* Sparkline */}
              <div className="relative mt-4 h-8">
                <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-full w-full">
                  <polyline
                    points={points}
                    fill="none"
                    stroke={stat.color === "brand" ? "#FF7438" : "#7C858D"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.7"
                  />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.06] p-6">
          <div>
            <h2 className="text-lg font-bold text-white">آخرین سفارش‌ها</h2>
            <p className="mt-1 text-xs text-muted">۳ سفارش اخیر ثبت شده</p>
          </div>
          <Link
            href={`/${locale}/admin/orders`}
            className="text-xs font-medium text-brand transition hover:opacity-80"
          >
            مشاهده همه ←
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-white/[0.04] text-[10px] font-mono uppercase tracking-wider text-muted">
                <th className="px-6 py-4 font-medium">شناسه</th>
                <th className="px-6 py-4 font-medium">مشتری</th>
                <th className="px-6 py-4 font-medium">پروژه</th>
                <th className="px-6 py-4 font-medium">مبلغ</th>
                <th className="px-6 py-4 font-medium">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {recentOrders.map((order) => (
                <tr key={order.id} className="transition hover:bg-white/[0.02]">
                  <td className="px-6 py-5 font-mono text-xs text-muted">{order.id}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                        {order.client.charAt(0)}
                      </div>
                      <span className="font-medium text-white">{order.client}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-muted">{order.type}</td>
                  <td className="px-6 py-5 font-mono text-xs text-brand" dir="ltr">{order.amount}</td>
                  <td className="px-6 py-5">{getStatusBadge(order.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-center text-[10px] font-mono uppercase tracking-widest text-muted/50">
        ساخته شده با ♥ توسط پرهام بتوئی
      </p>
    </div>
  );
}