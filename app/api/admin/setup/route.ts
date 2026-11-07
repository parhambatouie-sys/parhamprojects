import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // ۱. آپدیت‌های مربوط به جدول پروژه‌ها (نمونه‌کارها)
    await query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS locale VARCHAR(5) DEFAULT 'fa';`);
    await query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS content TEXT;`);
    await query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS gallery_images TEXT;`);
    
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

    // ۳. ساخت جدول تنظیمات سایت (Settings)
    await query(`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ۴. جدید: ساخت جدول مقالات وبلاگ (Posts)
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

    return NextResponse.json({ success: true, message: "✅ تمام جداول (پروژه‌ها، خدمات، تنظیمات و مقالات) با موفقیت آماده شدند." });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}