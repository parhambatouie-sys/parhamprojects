import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';

// خواندن سفارش‌ها
export async function GET() {
  try {
    const result = await query("SELECT * FROM orders ORDER BY created_at DESC");
    return NextResponse.json(
      { orders: result.rows },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// حذف سفارش(ها)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id === 'all') {
      // اگر کاربر دکمه "حذف همه" را زد، کل جدول خالی می‌شود
      await query("TRUNCATE TABLE orders RESTART IDENTITY");
      return NextResponse.json({ success: true, message: "All orders deleted completely" });
    } else if (id) {
      // حذف یک سفارش خاص با شناسه
      await query("DELETE FROM orders WHERE id = $1", [id]);
      return NextResponse.json({ success: true, message: "Order deleted" });
    }
    
    return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}