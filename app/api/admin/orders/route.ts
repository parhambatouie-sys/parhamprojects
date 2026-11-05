import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// خواندن سفارش‌ها (فقط برای پنل ادمین)
export async function GET() {
  try {
    const result = await query("SELECT * FROM orders ORDER BY created_at DESC");
    return NextResponse.json({ orders: result.rows });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}