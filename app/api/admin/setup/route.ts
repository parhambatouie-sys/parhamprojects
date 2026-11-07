import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // ۱. ساخت جدول نمونه‌کارها (اگر نبود)
    await query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS locale VARCHAR(5) DEFAULT 'fa';`);
    
    // ۲. ساخت جدول خدمات (Services)
    await query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price VARCHAR(100),
        price_toman VARCHAR(100),
        price_note VARCHAR(100),
        is_inquiry BOOLEAN DEFAULT false,
        sort_order INTEGER DEFAULT 0,
        is_published BOOLEAN DEFAULT true,
        locale VARCHAR(5) DEFAULT 'fa',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    return NextResponse.json({ success: true, message: "✅ دیتابیس برای خدمات و نمونه‌کارها آماده است." });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}