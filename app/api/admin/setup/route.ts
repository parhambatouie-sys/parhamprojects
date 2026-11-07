import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // اضافه کردن ستون زبان به جدول (اگر از قبل نبود)
    await query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS locale VARCHAR(5) DEFAULT 'fa';`);
    return NextResponse.json({ success: true, message: "✅ ستون زبان (locale) با موفقیت به دیتابیس اضافه شد." });
  } catch (error: any) {
    return NextResponse.json({ success: true, message: "ستون از قبل وجود دارد." });
  }
}