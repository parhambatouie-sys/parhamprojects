import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      title, description, category, technologies, 
      project_url, github_url, image_url, 
      is_featured, is_published, sort_order, locale 
    } = body;

    const result = await query(
      `UPDATE projects SET 
        title = $1, description = $2, category = $3, technologies = $4, 
        project_url = $5, github_url = $6, image_url = $7, 
        is_featured = $8, is_published = $9, sort_order = $10, locale = $11 
       WHERE id = $12 RETURNING *`,
      [
        title, description, category, technologies, 
        project_url, github_url, image_url, 
        is_featured, is_published, sort_order, locale, id
      ]
    );

    if (result.rowCount === 0) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    return NextResponse.json({ success: true, project: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await query("DELETE FROM projects WHERE id = $1", [id]);
    if (result.rowCount === 0) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Project deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete project" }, { status: 500 });
  }
}