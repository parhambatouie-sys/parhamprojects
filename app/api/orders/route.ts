import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, contact, projectType, description, budget, timeline } = body;

    // ثبت سفارش در دیتابیس
    const result = await query(
      `INSERT INTO orders (name, contact, project_type, description, budget, timeline) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [name, contact, projectType, description, budget, timeline]
    );

    const orderId = result.rows[0].id;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const myChatId = process.env.TELEGRAM_CHAT_ID;

    // ارسال پیام همراه با دکمه‌های تایید و رد به تلگرام
    if (token && myChatId) {
      const message = `🚨 **سفارش جدید ثبت شد! (شماره: ${orderId})**\n\n👤 نام: ${name}\n📞 تماس: ${contact}\n📁 نوع: ${projectType}\n💰 بودجه: ${budget || "نامشخص"}\n⏱ زمان: ${timeline || "نامشخص"}\n\n📝 توضیحات:\n${description}`;

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: myChatId,
          text: message,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                { text: "✅ تایید سفارش", callback_data: `order_accept_${orderId}` },
                { text: "❌ رد سفارش", callback_data: `order_reject_${orderId}` }
              ]
            ]
          }
        }),
      });
    }

    return NextResponse.json({ success: true, id: orderId }, { status: 201 });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
  }
}