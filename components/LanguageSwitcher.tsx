"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function LanguageSwitcher({ locale, className = "" }: { locale: string; className?: string }) {
  const pathname = usePathname();
  
  const getNewPath = (targetLocale: string) => {
    const segments = pathname.split("/");
    if (segments[1] === "fa" || segments[1] === "en") {
      segments[1] = targetLocale;
      return segments.join("/");
    }
    return `/${targetLocale}`;
  };

  // دکمه فعال: گرادیانت نارنجی، درخشش ملایم، سایه داخلی برای حالت ژله‌ای
  const activeClasses = "bg-gradient-to-b from-[#FF8E58] to-[#FF7438] text-[#111315] border border-brand/50 shadow-[0_4px_12px_rgba(255,116,56,0.4),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.2)] transform scale-[1.02]";
  
  // دکمه غیرفعال: شیشه تیره، بدون سایه بیرونی
  const inactiveClasses = "border border-transparent text-muted hover:text-foreground hover:bg-white/5";

  return (
    // قاب اصلی با افکت شیشه‌ای و سایه داخلی که عمق میده
    <div className={`flex items-center rounded-full border border-white/10 bg-[#1A1D21]/80 p-1 backdrop-blur-xl shadow-[inset_0_2px_5px_rgba(0,0,0,0.6),0_2px_10px_rgba(0,0,0,0.2)] ${className}`}>
      <Link
        href={getNewPath("fa")}
        className={`rounded-full px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-all duration-500 ease-out ${
          locale === "fa" ? activeClasses : inactiveClasses
        }`}
      >
        FA
      </Link>
      <Link
        href={getNewPath("en")}
        className={`rounded-full px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-all duration-500 ease-out ${
          locale === "en" ? activeClasses : inactiveClasses
        }`}
      >
        EN
      </Link>
    </div>
  );
}