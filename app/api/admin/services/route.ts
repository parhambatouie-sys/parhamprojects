import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await query("SELECT * FROM services ORDER BY sort_order ASC, created_at DESC");
    return NextResponse.json({ services: result.rows });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, price, price_toman, price_note, is_inquiry, sort_order, is_published, locale } = body;

    const result = await query(
      `INSERT INTO services (title, description, price, price_toman, price_note, is_inquiry, sort_order, is_published, locale) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [title, description, price, price_toman, price_note, is_inquiry || false, sort_order || 0, is_published !== false, locale || 'fa']
    );

    return NextResponse.json({ success: true, service: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create service" }, { status: 500 });
  }
}