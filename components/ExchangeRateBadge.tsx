"use client";

import { useEffect, useState } from "react";

type RateData = {
  rate: number;
  fetchedAt: string;
  isLive: boolean;
};

const L = {
  fa: {
    toman: "\u062A\u0648\u0645\u0627\u0646",
    unavailable:
      "\u0646\u0631\u062E \u062F\u0631 \u062F\u0633\u062A\u0631\u0633 \u0646\u06CC\u0633\u062A",
    live: "\u0628\u0647\u200C\u0631\u0648\u0632",
    approx: "\u062A\u0642\u0631\u06CC\u0628\u06CC",
    minutesAgo: "\u062F\u0642\u06CC\u0642\u0647 \u067E\u06CC\u0634",
    numberLocale: "fa-IR",
  },
  en: {
    toman: "Toman",
    unavailable: "Rate unavailable",
    live: "live",
    approx: "approx",
    minutesAgo: "m ago",
    numberLocale: "en-US",
  },
};

export function ExchangeRateBadge({ locale }: { locale: string }) {
  const t = locale === "fa" ? L.fa : L.en;
  const [data, setData] = useState<RateData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let cancelled = false;

    const fetchRate = async () => {
      try {
        const res = await fetch("/api/exchange-rate", { cache: "no-store" });
        if (!res.ok) throw new Error("bad status");
        const json = await res.json();
        if (!cancelled) {
          setData(json);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRate();
    const fetchInterval = setInterval(fetchRate, 5 * 60 * 1000);
    const tickInterval = setInterval(() => setNow(Date.now()), 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(fetchInterval);
      clearInterval(tickInterval);
    };
  }, []);

  if (loading) {
    return (
      <div className="hidden items-center gap-2 rounded-md border border-border/60 bg-card/40 px-2.5 py-1.5 font-mono text-[10px] text-muted md:flex">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
        <span>...</span>
      </div>
    );
  }

  if (error || !data || !data.rate) {
    return (
      <div
        className="hidden items-center gap-2 rounded-md border border-border/60 bg-card/40 px-2.5 py-1.5 text-[10px] text-muted md:flex"
        title={t.unavailable}
      >
        <span>{t.unavailable}</span>
      </div>
    );
  }

  const ageMs = now - new Date(data.fetchedAt).getTime();
  const isStale = ageMs > 2 * 60 * 60 * 1000;

  if (isStale) {
    return (
      <div className="hidden items-center gap-2 rounded-md border border-border/60 bg-card/40 px-2.5 py-1.5 text-[10px] text-muted md:flex">
        <span>{t.unavailable}</span>
      </div>
    );
  }

  const formatted = new Intl.NumberFormat(t.numberLocale).format(data.rate);
  const minutesAgo = Math.floor(ageMs / 60000);
  const timeLabel =
    minutesAgo < 1
      ? data.isLive
        ? t.live
        : t.approx
      : locale === "fa"
        ? `${minutesAgo} ${t.minutesAgo}`
        : `${minutesAgo}${t.minutesAgo}`;

  return (
    <div
      className="hidden items-center gap-2 rounded-md border border-border/60 bg-card/40 px-2.5 py-1.5 text-[10px] md:flex"
      title={timeLabel}
    >
      {data.isLive ? (
        <span className="h-1.5 w-1.5 rounded-full bg-brand" />
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
      )}
      <span className="font-mono text-brand">$</span>
      <span className="font-mono tabular-nums text-foreground" dir="ltr">
        {formatted}
      </span>
      <span className="text-muted">{t.toman}</span>
    </div>
  );
}