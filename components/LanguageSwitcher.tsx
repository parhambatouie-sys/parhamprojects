"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function LanguageSwitcher({ 
  locale, 
  label, 
  className 
}: { 
  locale: string; 
  label: string; 
  className?: string;
}) {
  const pathname = usePathname();
  const otherLocale = locale === "fa" ? "en" : "fa";
  
  // آدرس فعلی را به بخش‌ها تقسیم می‌کند و زبان را عوض می‌کند
  const segments = pathname.split("/");
  if (segments[1] === "fa" || segments[1] === "en") {
    segments[1] = otherLocale;
  }
  const newPath = segments.join("/");

  return (
    <Link href={newPath || `/${otherLocale}`} className={className}>
      {label}
    </Link>
  );
}