import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// ============================================================
// تعریف منابع به ترتیب اولویت
// ============================================================

interface RateSource {
  name: string;
  url: string;
  extract: (data: any) => number | null;
  timeout: number;
}

const SOURCES: RateSource[] = [
  {
    name: "Nerkhsanj",
    url: "https://nerkh.jahankhahan.shop/data/live.json",
    timeout: 8000,
    extract: (data) => {
      const rate = data?.rates?.dollar;
      return typeof rate === "number" && rate > 0 ? rate : null;
    },
  },
  {
    name: "PriceDB",
    url: "https://api.priceto.day/v1/latest/irr/usd",
    timeout: 8000,
    extract: (data) => {
      const rial = data?.price;
      return typeof rial === "number" && rial > 0 ? Math.round(rial / 10) : null;
    },
  },
  {
    name: "Navasan (GitHub)",
    url: "https://raw.githubusercontent.com/HosseinOdd/Navasan-API/main/data/fiat.json",
    timeout: 8000,
    extract: (data) => {
      const rate = data?.usd?.value;
      return typeof rate === "number" && rate > 0 ? rate : null;
    },
  },
];

// ============================================================
// کش داخلی برای جلوگیری از درخواست‌های تکراری
// ============================================================

let cachedRate: { value: number; fetchedAt: string; source: string } | null = null;
let lastSuccessAt = 0;
let lastAttemptAt = 0;

const SUCCESS_CACHE_MS = 15 * 60 * 1000; // 15 دقیقه کش موفق
const FAILURE_RETRY_MS = 60 * 1000;      // 1 دقیقه تلاش مجدد پس از خطا

// ============================================================
// تابع کمکی برای fetch با timeout
// ============================================================

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================================
// تابع اصلی: تلاش به ترتیب از همه منابع
// ============================================================

async function fetchRateFromSources(): Promise<{ rate: number; source: string } | null> {
  for (const source of SOURCES) {
    try {
      console.log(`[rate] Trying ${source.name}...`);
      const res = await fetchWithTimeout(source.url, source.timeout);

      if (!res.ok) {
        console.log(`[rate] ${source.name} HTTP ${res.status}`);
        continue;
      }

      const data = await res.json();
      const rate = source.extract(data);

      if (rate && rate > 0) {
        console.log(`[rate] ✅ ${source.name} OK: ${rate.toLocaleString()} Toman`);
        return { rate, source: source.name };
      }

      console.log(`[rate] ${source.name}: no valid rate extracted`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.log(`[rate] ❌ ${source.name} failed: ${msg}`);
    }
  }

  return null;
}

// ============================================================
// GET Handler
// ============================================================

export async function GET() {
  const now = Date.now();

  // 1. اگر کش معتبر داریم، برگردان
  if (cachedRate && now - lastSuccessAt < SUCCESS_CACHE_MS) {
    return NextResponse.json({
      rate: cachedRate.value,
      fetchedAt: cachedRate.fetchedAt,
      source: cachedRate.source,
      isLive: true,
    });
  }

  // 2. اگر خیلی زود درخواست داده شده، از کش قدیمی استفاده کن
  if (now - lastAttemptAt < FAILURE_RETRY_MS && !cachedRate) {
    return NextResponse.json(
      { error: "rate_limited", isLive: false, fetchedAt: null, source: null },
      { status: 503 }
    );
  }

  lastAttemptAt = now;

  // 3. تلاش از همه منابع
  const result = await fetchRateFromSources();

  if (result) {
    cachedRate = {
      value: result.rate,
      fetchedAt: new Date().toISOString(),
      source: result.source,
    };
    lastSuccessAt = now;

    return NextResponse.json({
      rate: cachedRate.value,
      fetchedAt: cachedRate.fetchedAt,
      source: cachedRate.source,
      isLive: true,
    });
  }

  // 4. اگر همه منابع شکست خوردند ولی کش قدیمی داریم
  if (cachedRate) {
    console.log("[rate] All sources failed, using stale cache from", cachedRate.source);
    return NextResponse.json({
      rate: cachedRate.value,
      fetchedAt: cachedRate.fetchedAt,
      source: cachedRate.source,
      isLive: false,
    });
  }

  // 5. هیچ داده‌ای نداریم
  console.log("[rate] All sources failed, no cache available");
  return NextResponse.json(
    { error: "unavailable", isLive: false, fetchedAt: null, source: null },
    { status: 503 }
  );
}