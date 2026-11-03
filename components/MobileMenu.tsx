"use client";

import { useState } from "react";
import Link from "next/link";

export function MobileMenu({
  locale,
  navItems,
  switchLanguage,
  otherLocale,
  orderLabel,
}: {
  locale: string;
  navItems: { href: string; label: string }[];
  switchLanguage: string;
  otherLocale: string;
  orderLabel: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* دکمه همبرگری بسیار ساده و مینیمال */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-[60] flex h-10 w-10 flex-col items-center justify-center gap-[6px]"
        aria-label="Menu"
      >
        <span
          className={`block h-[2px] w-6 bg-foreground transition-transform duration-300 ${
            isOpen ? "translate-y-[8px] rotate-45" : ""
          }`}
        />
        <span
          className={`block h-[2px] w-6 bg-foreground transition-opacity duration-300 ${
            isOpen ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block h-[2px] w-6 bg-foreground transition-transform duration-300 ${
            isOpen ? "-translate-y-[8px] -rotate-45" : ""
          }`}
        />
      </button>

      {/* منوی تمام‌صفحه با پس‌زمینه ۸۵ درصد شفاف (۱۵ درصد تیره) */}
      <div
        className={`fixed inset-0 z-[55] flex flex-col bg-[#111315]/15 backdrop-blur-2xl backdrop-brightness-75 backdrop-saturate-150 transition-all duration-500 ease-in-out ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {/* کلمه MENU در پس‌زمینه */}
        <div className="pointer-events-none absolute inset-0 z-0 flex items-end justify-start overflow-hidden pb-10 ps-6 opacity-40">
          <span className="select-none font-mono text-[35vw] font-black leading-none tracking-tighter text-white/[0.08]">
            MENU
          </span>
        </div>

        {/* محتوای منو */}
        <div className="relative z-10 flex h-full flex-col justify-center px-8">
          
          {/* لینک‌های ناوبری */}
          <nav className="flex flex-col gap-6">
            {navItems.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center transition-all duration-500 ${
                  isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: `${i * 50 + 100}ms` }}
              >
                {/* از سایه (drop-shadow) استفاده شده تا متن روی شیشه شفاف کاملا خوانا باشه */}
                <span className="text-4xl font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] transition-colors group-hover:text-brand">
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* بخش پایین */}
          <div
            className={`mt-20 border-t border-white/20 pt-8 transition-all duration-700 ${
              isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            <Link
              href={`/${locale}/order`}
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-2 text-xl font-semibold text-brand drop-shadow-md transition hover:opacity-80"
            >
              {orderLabel}
              <span className="transition group-hover:translate-x-1 rtl:rotate-180">→</span>
            </Link>
            
            <div className="mt-6">
              <Link
                href={`/${otherLocale}`}
                onClick={() => setIsOpen(false)}
                className="font-mono text-xs uppercase tracking-widest text-white/80 transition hover:text-white"
              >
                {switchLanguage}
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}