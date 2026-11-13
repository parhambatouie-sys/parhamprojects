import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { sendTelegramNotification } from "@/lib/telegram";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      title, description, content, gallery_images, // 👈 این دو مورد برای ویرایش هم اضافه شدند
      category, technologies, 
      project_url, github_url, image_url, 
      is_featured, is_published, sort_order, locale
    } = body;

    const result = await query(
      `UPDATE projects 
       SET title = $1, description = $2, content = $3, gallery_images = $4, category = $5, technologies = $6, project_url = $7, github_url = $8, image_url = $9, is_featured = $10, is_published = $11, sort_order = $12, locale = $13 
       WHERE id = $14 RETURNING *`,
      [
        title, description, content || "", gallery_images || "[]", 
        category, technologies, 
        project_url, github_url, image_url, 
        is_featured || false, is_published !== false, sort_order || 0, locale || 'fa',
        id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // ارسال پیام به تلگرام
    const message = `✏️ **نمونه‌کار ویرایش شد!**\n\n📌 عنوان: ${title}\n🌐 زبان: ${locale === 'fa' ? 'فارسی' : 'انگلیسی'}\n📁 دسته: ${category}`;
    await sendTelegramNotification(message);

    return NextResponse.json({ success: true, project: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await query("DELETE FROM projects WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete project" }, { status: 500 });
  }
}