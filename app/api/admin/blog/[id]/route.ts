import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { sendTelegramNotification } from "@/lib/telegram";

export const dynamic = 'force-dynamic';

// دریافت اطلاعات یک مقاله خاص (برای ویرایش)
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await query("SELECT * FROM posts WHERE id = $1", [id]);
    
    if (result.rowCount === 0) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    
    return NextResponse.json({ post: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch post" }, { status: 500 });
  }
}

// ویرایش مقاله
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, slug, excerpt, content, category, image_url, author, seo_title, seo_description, locale, is_published } = body;

    const result = await query(
      `UPDATE posts SET title = $1, slug = $2, excerpt = $3, content = $4, category = $5, image_url = $6, 
        author = $7, seo_title = $8, seo_description = $9, locale = $10, is_published = $11 WHERE id = $12 RETURNING *`,
      [title, slug, excerpt, content, category, image_url, author, seo_title, seo_description, locale, is_published, id]
    );

    if (result.rowCount === 0) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    await sendTelegramNotification(`✏️ **یک مقاله ویرایش شد.**\n\n📌 عنوان: ${title}`);
    return NextResponse.json({ success: true, post: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update post" }, { status: 500 });
  }
}

// حذف مقاله
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await query("DELETE FROM posts WHERE id = $1", [id]);
    if (result.rowCount === 0) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    await sendTelegramNotification(`🗑️ **یک مقاله حذف شد!**\n\n🆔 شناسه: ${id}`);
    return NextResponse.json({ success: true, message: "Post deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete post" }, { status: 500 });
  }
}