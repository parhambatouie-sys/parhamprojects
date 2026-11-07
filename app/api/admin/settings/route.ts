import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { sendTelegramNotification } from "@/lib/telegram";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await query("SELECT * FROM settings");
    const settings = result.rows.reduce((acc: any, row: any) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    for (const [key, value] of Object.entries(body)) {
      await query(
        `INSERT INTO settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
        [key, String(value)]
      );
    }

    // ارسال پیام به تلگرام
    await sendTelegramNotification(`⚙️ **تنظیمات سایت آپدیت شد.**\n\n(عنوان، توضیحات، شبکه‌های اجتماعی یا اطلاعات تماس تغییر کرد)`);

    return NextResponse.json({ success: true, message: "تنظیمات با موفقیت ذخیره شد." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save settings" }, { status: 500 });
  }
}