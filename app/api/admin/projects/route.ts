import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { sendTelegramNotification } from "@/lib/telegram";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await query("SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC");
    return NextResponse.json({ projects: result.rows });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      title, description, content, gallery_images, // 👈 این دو مورد اضافه شدند
      category, technologies, 
      project_url, github_url, image_url, 
      is_featured, is_published, sort_order, locale
    } = body;

    const result = await query(
      `INSERT INTO projects (title, description, content, gallery_images, category, technologies, project_url, github_url, image_url, is_featured, is_published, sort_order, locale) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        title, description, content || "", gallery_images || "[]", // 👈 به کوئری دیتابیس هم اضافه شدند
        category, technologies, 
        project_url, github_url, image_url, 
        is_featured || false, is_published !== false, sort_order || 0, locale || 'fa'
      ]
    );

    // ارسال پیام به تلگرام
    const message = `➕ **نمونه‌کار جدید ساخته شد!**\n\n📌 عنوان: ${title}\n🌐 زبان: ${locale === 'fa' ? 'فارسی' : 'انگلیسی'}\n📁 دسته: ${category}\n⭐ ویژه: ${is_featured ? 'بله' : 'خیر'}`;
    await sendTelegramNotification(message);

    return NextResponse.json({ success: true, project: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create project" }, { status: 500 });
  }
}