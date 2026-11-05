"use client";

import { useState, useEffect } from "react";

type Order = {
  id: number;
  name: string;
  contact: string;
  project_type: string;
  created_at: string;
  status: "new" | "reviewing" | "accepted" | "rejected";
  description: string;
  budget: string;
  timeline: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    // تغییر مسیر fetch به مسیر امن ادمین
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
        setLoading(false);
      });
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new": return <span className="rounded-full bg-brand/10 px-3 py-1 text-[10px] whitespace-nowrap text-brand md:text-xs">جدید</span>;
      case "reviewing": return <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-[10px] whitespace-nowrap text-yellow-500 md:text-xs">در حال بررسی</span>;
      case "accepted": return <span className="rounded-full bg-green-500/10 px-3 py-1 text-[10px] whitespace-nowrap text-green-500 md:text-xs">تایید شده</span>;
      case "rejected": return <span className="rounded-full bg-red-500/10 px-3 py-1 text-[10px] whitespace-nowrap text-red-500 md:text-xs">رد شده</span>;
      default: return <span className="rounded-full bg-gray-500/10 px-3 py-1 text-[10px] text-gray-500">نامشخص</span>;
    }
  };

  if (loading) return <div className="text-white text-center mt-10">در حال بارگذاری سفارش‌ها...</div>;

  return (
    <div className="space-y-6 md:space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">مدیریت سفارش‌ها</h1>
        <p className="mt-2 text-xs text-muted md:text-sm">لیست سفارش‌های واقعی ثبت شده در دیتابیس.</p>
      </header>

      <div className="rounded-xl border border-border bg-[#292D31] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-right text-sm">
            <thead>
              <tr className="border-b border-border bg-black/20 text-xs text-muted">
                <th className="px-4 py-4 font-medium md:px-6">شناسه</th>
                <th className="px-4 py-4 font-medium md:px-6">مشتری</th>
                <th className="px-4 py-4 font-medium md:px-6">راه ارتباطی</th>
                <th className="px-4 py-4 font-medium md:px-6">نوع پروژه</th>
                <th className="px-4 py-4 font-medium md:px-6">وضعیت</th>
                <th className="px-4 py-4 text-left font-medium md:px-6">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {orders.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-muted">هیچ سفارشی در دیتابیس وجود ندارد.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="transition hover:bg-white/[0.02]">
                    <td className="px-4 py-4 font-mono text-xs text-muted md:px-6">ORD-{order.id}</td>
                    <td className="px-4 py-4 font-medium text-foreground md:px-6">{order.name}</td>
                    <td className="px-4 py-4 text-xs text-muted md:px-6" dir="ltr">{order.contact}</td>
                    <td className="px-4 py-4 text-xs text-muted md:px-6">{order.project_type}</td>
                    <td className="px-4 py-4 md:px-6">{getStatusBadge(order.status)}</td>
                    <td className="px-4 py-4 text-left md:px-6">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="whitespace-nowrap text-xs text-brand hover:underline md:text-sm"
                      >
                        مشاهده
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Order Details */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-[#292D31] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-lg font-bold text-foreground md:text-xl">جزئیات سفارش ORD-{selectedOrder.id}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-muted hover:text-red-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><p className="text-muted">نام مشتری</p><p className="mt-1 font-medium text-foreground">{selectedOrder.name}</p></div>
                <div><p className="text-muted">راه ارتباطی</p><p className="mt-1 font-medium text-foreground" dir="ltr">{selectedOrder.contact}</p></div>
                <div><p className="text-muted">نوع پروژه</p><p className="mt-1 font-medium text-foreground">{selectedOrder.project_type}</p></div>
                <div><p className="text-muted">بودجه تقریبی</p><p className="mt-1 font-medium text-brand">{selectedOrder.budget || "نامشخص"} تومان</p></div>
                <div><p className="text-muted">زمان تحویل</p><p className="mt-1 font-medium text-foreground">{selectedOrder.timeline || "نامشخص"}</p></div>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-muted mb-2">توضیحات پروژه</p>
                <div className="rounded-lg bg-black/20 p-4 text-foreground leading-relaxed text-xs md:text-sm">
                  {selectedOrder.description}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
              <button onClick={() => setSelectedOrder(null)} className="rounded-md border border-border px-4 py-2 text-xs font-medium text-muted hover:bg-white/5 sm:text-sm">بستن</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}