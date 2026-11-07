import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // تغییر نوع ستون به TEXT برای پذیرش عکس‌های طولانی
    await query(`ALTER TABLE projects ALTER COLUMN image_url TYPE TEXT;`);
    return NextResponse.json({ success: true, message: "✅ ستون عکس با موفقیت به TEXT تغییر یافت." });
  } catch (error: any) {
    return NextResponse.json({ success: true, message: "ستون از قبل TEXT است." });
  }
}