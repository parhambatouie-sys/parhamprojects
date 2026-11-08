import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // ۱. گرفتن تعداد سفارش‌ها و وضعیت آن‌ها
    const ordersRes = await query("SELECT status FROM orders");
    const totalOrders = ordersRes.rows.length;
    const newOrders = ordersRes.rows.filter((o: any) => o.status === "new").length;

    // ۲. گرفتن تعداد نمونه‌کارها (پروژه‌ها)
    const projectsRes = await query("SELECT COUNT(*) FROM projects");
    const totalProjects = parseInt(projectsRes.rows[0].count, 10);

    // ۳. گرفتن تعداد مقالات وبلاگ
    const postsRes = await query("SELECT COUNT(*) FROM posts");
    const totalPosts = parseInt(postsRes.rows[0].count, 10);

    return NextResponse.json({
      totalOrders,
      newOrders,
      totalProjects,
      totalPosts,
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}