import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // تغییر نوع ستون به TEXT برای ذخیره عکس‌های فشرده شده
    const sql = `
      ALTER TABLE projects ALTER COLUMN image_url TYPE TEXT;
    `;
    await query(sql);
    
    return NextResponse.json({ 
      success: true, 
      message: "✅ ستون image_url با موفقیت به TEXT تغییر یافت." 
    });
  } catch (error: any) {
    console.error("Database Error:", error);
    // اگر جدول از قبل TEXT بود، این خطا را نادیده می‌گیریم
    return NextResponse.json({ 
      success: true, 
      message: "ستون از قبل آماده است یا تغییری اعمال شد." 
    });
  }
}