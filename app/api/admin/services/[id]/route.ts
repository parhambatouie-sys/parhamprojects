import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, price, price_toman, price_note, is_inquiry, sort_order, is_published, locale } = body;

    const result = await query(
      `UPDATE services SET 
        title = $1, description = $2, price = $3, price_toman = $4, price_note = $5, 
        is_inquiry = $6, sort_order = $7, is_published = $8, locale = $9 
       WHERE id = $10 RETURNING *`,
      [title, description, price, price_toman, price_note, is_inquiry, sort_order, is_published, locale, id]
    );

    if (result.rowCount === 0) return NextResponse.json({ error: "Service not found" }, { status: 404 });
    return NextResponse.json({ success: true, service: result.rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update service" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await query("DELETE FROM services WHERE id = $1", [id]);
    if (result.rowCount === 0) return NextResponse.json({ error: "Service not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Service deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete service" }, { status: 500 });
  }
}