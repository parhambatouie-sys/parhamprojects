import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// جلوگیری از کش شدن این مسیر
export const dynamic = 'force-dynamic';

/**
 * این API برای ساخت جداول دیتابیس استفاده می‌شود.
 * با هر بار باز کردن این لینک، مطمئن می‌شویم تمام جداول مورد نیاز وجود دارند.
 */
export async function GET() {
  try {
    // ==========================================
    // ۱. آپدیت‌های مربوط به جدول پروژه‌ها (نمونه‌کارها)
    // ==========================================
    await query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS locale VARCHAR(5) DEFAULT 'fa';`);
    await query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS content TEXT;`);
    await query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS gallery_images TEXT;`);
    
    // ==========================================
    // ۲. ساخت جدول خدمات (Services)
    // ==========================================
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

    // ==========================================
    // ۳. ساخت جدول تنظیمات سایت (Settings)
    // ==========================================
    await query(`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ==========================================
    // ۴. ساخت جدول مقالات وبلاگ (Posts)
    // ==========================================
    await query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        excerpt TEXT,
        content TEXT,
        category VARCHAR(100),
        image_url TEXT,
        author VARCHAR(100) DEFAULT 'Parham Batouie',
        seo_title VARCHAR(255),
        seo_description TEXT,
        locale VARCHAR(5) DEFAULT 'fa',
        is_published BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ==========================================
    // ۵. ساخت جدول وضعیت موقت ربات تلگرام
    // این جدول برای ذخیره موضوع مقاله قبل از انتخاب زبان استفاده می‌شود
    // ==========================================
    await query(`
      CREATE TABLE IF NOT EXISTS tg_state (
        chat_id VARCHAR(50) PRIMARY KEY,
        prompt TEXT
      );
    `);

    return NextResponse.json({ 
      success: true, 
      message: "✅ تمام جداول دیتابیس (پروژه‌ها، خدمات، تنظیمات، مقالات و وضعیت تلگرام) با موفقیت آماده شدند." 
    });
  } catch (error: any) {
    console.error("Setup API Error:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "خطا در ساخت جداول" 
    }, { status: 500 });
  }
}