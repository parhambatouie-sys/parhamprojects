import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';

// ۱. گرفتن لیست تمام نمونه‌کارها (برای پنل ادمین)
export async function GET() {
  try {
    const result = await query("SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC");
    return NextResponse.json({ projects: result.rows });
  } catch (error) {
    console.error("Fetch Projects Error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

// ۲. ایجاد یک نمونه‌کار جدید
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      title, description, category, technologies, 
      project_url, github_url, image_url, 
      is_featured, is_published, sort_order 
    } = body;

    const result = await query(
      `INSERT INTO projects (title, description, category, technologies, project_url, github_url, image_url, is_featured, is_published, sort_order) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        title, description, category, technologies, 
        project_url, github_url, image_url, 
        is_featured || false, is_published !== false, sort_order || 0
      ]
    );

    return NextResponse.json({ success: true, project: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Create Project Error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}