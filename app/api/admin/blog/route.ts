import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { sendTelegramNotification } from "@/lib/telegram";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await query("SELECT * FROM posts ORDER BY created_at DESC");
    return NextResponse.json({ posts: result.rows });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, excerpt, content, category, image_url, author, seo_title, seo_description, locale, is_published } = body;

    const result = await query(
      `INSERT INTO posts (title, slug, excerpt, content, category, image_url, author, seo_title, seo_description, locale, is_published) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [title, slug, excerpt, content, category, image_url, author || 'Parham Batouie', seo_title || title, seo_description || excerpt, locale || 'fa', is_published !== false]
    );

    await sendTelegramNotification(`📝 **مقاله جدیدی منتشر شد!**\n\n📌 عنوان: ${title}\n🌐 زبان: ${locale === 'fa' ? 'فارسی' : 'انگلیسی'}`);
    
    return NextResponse.json({ success: true, post: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create post" }, { status: 500 });
  }
}