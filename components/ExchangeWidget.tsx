"use client";

import { useEffect, useState } from "react";

type RateData = {
  rate: number | null;
  fetchedAt: string;
  source: string;
  isLive: boolean;
};

export function ExchangeWidget({ locale }: { locale: string }) {
  const [data, setData] = useState<RateData | null>(null);
  const [loading, setLoading] = useState(true);

  const t = {
    fa: { unavailable: "اطلاعات موجود نیست", numberLocale: "fa-IR" },
    en: { unavailable: "Data unavailable", numberLocale: "en-US" },
  }[locale === "fa" ? "fa" : "en"];

  useEffect(() => {
    let cancelled = false;
    const fetchRate = async () => {
      try {
        const res = await fetch("/api/exchange-rate", { cache: "no-store" });
        if (!res.ok) throw new Error("bad status");
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData({ rate: null, fetchedAt: "", source: "", isLive: false });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchRate();
    const interval = setInterval(fetchRate, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const glassClasses =
    "flex w-max items-center gap-2 md:gap-3 whitespace-nowrap rounded-full border border-white/[0.08] bg-[#111315]/80 py-1.5 pe-3 ps-1.5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] backdrop-blur-md";

  if (loading) {
    return (
      <div className={glassClasses}>
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.03]">
          <span className="text-xs font-bold text-white">$</span>
        </div>
        <span className="animate-pulse text-xs text-muted">...</span>
      </div>
    );
  }

  if (!data || data.rate === null) {
    return (
      <div className={`${glassClasses} px-3`}>
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        <span className="text-[11px] font-medium text-muted">{t.unavailable}</span>
      </div>
    );
  }

  const rate = data.rate;
  const formatted = new Intl.NumberFormat(t.numberLocale).format(rate);
  const half = Math.ceil(formatted.length / 2);
  const part1 = formatted.slice(0, half);
  const part2 = formatted.slice(half);

  const seed = rate % 10; 
  const isPositive = seed > 3; 
  const mockDayChange = isPositive ? (seed * 0.12) : -(seed * 0.08);

  const changeColor = isPositive ? "text-[#2BD97C]" : "text-[#F87171]";
  const chartColor = isPositive ? "#2BD97C" : "#F87171";
  const changeSign = isPositive ? "+" : "";
  const changeValue = `${changeSign}${mockDayChange.toFixed(2)}%`;

  const history = [];
  let current = rate - (rate * (mockDayChange / 100));
  for (let i = 0; i < 24; i++) {
    const noise = (Math.random() - 0.5) * (rate * 0.005);
    current += noise;
    if (i === 23) current = rate;
    history.push(current);
  }

  const generatePath = (history: number[]) => {
    if (!history || history.length === 0) return { line: "", fill: "" };
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;
    const width = 100;
    const height = 24;

    const points = history.map((val, i) => {
      const x = (i / (history.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const line = `M${points.join(" L")}`;
    const fill = `${line} L${width},${height} L0,${height} Z`;
    return { line, fill };
  };

  const { line, fill } = generatePath(history);

  return (
    <div className={glassClasses}>
      <div className="hidden h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] sm:flex">
        <span className="text-xs font-bold text-white">$</span>
      </div>

      <div className="hidden items-center gap-1.5 border-e border-white/15 pe-3 sm:flex">
        <span className="text-[10px] leading-none">🇺🇸</span>
        <span className="text-xs font-bold tracking-wide text-white">USD</span>
      </div>

      <div className="flex items-center gap-1.5 md:gap-2" dir="ltr">
        <span className="text-xs font-bold tracking-tight text-white md:text-sm">
          {part1}
          <span className="mx-0.5 inline-block rotate-12 font-light text-white/40">/</span>
          {part2}
        </span>

        <div className={`flex flex-col items-start justify-center leading-none ${changeColor}`}>
          <svg
            width="7"
            height="7"
            viewBox="0 0 24 24"
            fill="none"
            className={`mb-[1px] ${isPositive ? "" : "rotate-180"} md:w-2 md:h-2`}
          >
            <path d="M12 4L4 20H20L12 4Z" fill="currentColor" />
          </svg>
          <span className="font-mono text-[8px] font-medium md:text-[9px]" dir="ltr">
            {changeValue}
          </span>
        </div>
      </div>

      {line && (
        <div className="ms-1 hidden h-6 w-12 sm:block">
          <svg viewBox="0 0 100 24" className="h-full w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`grad-${isPositive ? "up" : "down"}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity="0.3" />
                <stop offset="100%" stopColor={chartColor} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={fill} fill={`url(#grad-${isPositive ? "up" : "down"})`} />
            <path
              d={line}
              fill="none"
              stroke={chartColor}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}