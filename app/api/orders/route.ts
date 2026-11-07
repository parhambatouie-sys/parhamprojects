import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { sendTelegramNotification } from "@/lib/telegram";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, contact, projectType, description, budget, timeline } = body;

    const result = await query(
      `INSERT INTO orders (name, contact, project_type, description, budget, timeline) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [name, contact, projectType, description, budget, timeline]
    );

    // ارسال پیام به تلگرام (بعد از ثبت موفق در دیتابیس)
    const message = `🚨 **سفارش جدید ثبت شد!**\n\n👤 نام: ${name}\n📞 تماس: ${contact}\n📁 نوع پروژه: ${projectType}\n💰 بودجه: ${budget || "نامشخص"}\n⏱ زمان: ${timeline || "نامشخص"}\n\n📝 توضیحات:\n${description}`;
    await sendTelegramNotification(message);

    return NextResponse.json({ success: true, id: result.rows[0].id }, { status: 201 });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
  }
}