export default function AdminServicesPage() {
  const services = [
    { id: 1, title: "طراحی وب‌سایت اختصاصی", price: "$66", active: true },
    { id: 2, title: "طراحی وب‌سایت شرکتی", price: "$66", active: true },
    { id: 3, title: "توسعه و پیاده‌سازی", price: "استعلامی", active: true },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">مدیریت خدمات</h1>
        <p className="mt-2 text-xs text-muted md:text-sm">لیست خدمات و قیمت‌های شما.</p>
      </header>

      <div className="rounded-xl border border-border bg-[#292D31] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-right text-sm">
            <thead>
              <tr className="border-b border-border bg-black/20 text-xs text-muted">
                <th className="px-4 py-4 font-medium md:px-6">نام خدمت</th>
                <th className="px-4 py-4 font-medium md:px-6">قیمت پایه</th>
                <th className="px-4 py-4 font-medium md:px-6">وضعیت</th>
                <th className="px-4 py-4 text-left font-medium md:px-6">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {services.map((service) => (
                <tr key={service.id} className="transition hover:bg-white/[0.02]">
                  <td className="px-4 py-4 font-medium text-foreground md:px-6">{service.title}</td>
                  <td className="px-4 py-4 font-mono text-xs text-brand md:text-sm" dir="ltr">{service.price}</td>
                  <td className="px-4 py-4 text-xs text-green-500 md:text-sm">فعال</td>
                  <td className="flex gap-3 px-4 py-4 text-left text-xs md:px-6 md:text-sm">
                    <button className="text-brand hover:underline">ویرایش</button>
                    <button className="text-red-400 hover:underline">حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}