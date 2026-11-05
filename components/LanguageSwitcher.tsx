"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function LanguageSwitcher({ locale, className = "" }: { locale: string; className?: string }) {
  const pathname = usePathname();
  
  // گرفتن آدرس فعلی و تغییر فقط بخش زبان
  const getNewPath = (targetLocale: string) => {
    const segments = pathname.split("/");
    if (segments[1] === "fa" || segments[1] === "en") {
      segments[1] = targetLocale;
      return segments.join("/");
    }
    return `/${targetLocale}`;
  };

  const activeClasses = "bg-gradient-to-b from-brand/40 to-brand/10 text-brand border border-brand/50 shadow-[0_0_15px_rgba(255,116,56,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)]";
  const inactiveClasses = "border border-transparent text-muted hover:text-foreground hover:bg-white/5";

  return (
    <div className={`flex items-center rounded-full border border-white/10 bg-[#111315]/40 p-1 backdrop-blur-xl shadow-inner ${className}`}>
      <Link
        href={getNewPath("fa")}
        className={`rounded-full px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
          locale === "fa" ? activeClasses : inactiveClasses
        }`}
      >
        FA
      </Link>
      <Link
        href={getNewPath("en")}
        className={`rounded-full px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
          locale === "en" ? activeClasses : inactiveClasses
        }`}
      >
        EN
      </Link>
    </div>
  );
}