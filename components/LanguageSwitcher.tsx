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

  return (
    <div className={`flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] ${className}`}>
      <Link
        href={getNewPath("fa")}
        className={`transition-colors duration-300 ${
          locale === "fa" ? "text-brand" : "text-muted hover:text-foreground"
        }`}
      >
        FA
      </Link>
      <span className="text-border/50">/</span>
      <Link
        href={getNewPath("en")}
        className={`transition-colors duration-300 ${
          locale === "en" ? "text-brand" : "text-muted hover:text-foreground"
        }`}
      >
        EN
      </Link>
    </div>
  );
}