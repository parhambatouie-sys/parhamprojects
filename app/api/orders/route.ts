import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// ثبت سفارش جدید (از طرف مشتری) - فقط متد POST عمومی است
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, contact, projectType, description, budget, timeline } = body;

    const result = await query(
      `INSERT INTO orders (name, contact, project_type, description, budget, timeline) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [name, contact, projectType, description, budget, timeline]
    );

    return NextResponse.json({ success: true, id: result.rows[0].id }, { status: 201 });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
  }
}