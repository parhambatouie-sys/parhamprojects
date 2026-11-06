import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';

// این مسیر فقط برای بار اول استفاده می‌شود تا جدول نمونه‌کارها ساخته شود
export async function GET() {
  try {
    const sql = `
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        technologies TEXT,
        project_url VARCHAR(255),
        github_url VARCHAR(255),
        image_url VARCHAR(255),
        is_featured BOOLEAN DEFAULT false,
        is_published BOOLEAN DEFAULT true,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await query(sql);
    
    return NextResponse.json({ 
      success: true, 
      message: "✅ جدول projects با موفقیت ساخته شد یا از قبل وجود داشت." 
    });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Failed to create projects table" }, { status: 500 });
  }
}