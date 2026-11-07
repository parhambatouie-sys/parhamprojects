import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';

// گرفتن تنظیمات
export async function GET() {
  try {
    const result = await query("SELECT * FROM settings");
    // تبدیل آرایه به یک آبجکت (برای راحتی فرانت‌اند)
    const settings = result.rows.reduce((acc: any, row: any) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// ذخیره تنظیمات (Upsert)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // حلقه روی تمام کلیدها و ذخیره/آپدیت آن‌ها
    for (const [key, value] of Object.entries(body)) {
      await query(
        `INSERT INTO settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
        [key, String(value)]
      );
    }

    return NextResponse.json({ success: true, message: "تنظیمات با موفقیت ذخیره شد." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save settings" }, { status: 500 });
  }
}