import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return NextResponse.json({ 
      error: "❌ توکن یا چت آیدی در تنظیمات ورسل (Environment Variables) پیدا نشد!" 
    }, { status: 500 });
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "🎉 تبریک! اتصال سایت به تلگرام با موفقیت انجام شد.\n\nاز این به بعد هر سفارشی که در سایت ثبت شود، من اینجا به شما اطلاع می‌دهم.",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: "❌ خطا در ارسال پیام از طرف تلگرام", details: data }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "✅ پیام تستی با موفقیت به تلگرام شما ارسال شد. لطفاً تلگرام خود را چک کنید." 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}