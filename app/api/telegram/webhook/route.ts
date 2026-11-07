import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // افزایش زمان پاسخ‌دهی برای هوش مصنوعی

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const myChatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !myChatId) {
      return NextResponse.json({ error: "توکن یا چت آیدی در تنظیمات ورسل وجود ندارد." }, { status: 500 });
    }

    // ==========================================
    // ۱. بررسی دکمه‌های شیشه‌ای (Callback Query)
    // ==========================================
    if (body.callback_query) {
      const { data, message } = body.callback_query;
      const callbackChatId = message.chat.id;

      // بررسی امنیتی: فقط خود شما اجازه کلیک دارید
      if (callbackChatId.toString() === myChatId) {
        if (data.startsWith("publish_")) {
          const postId = data.split("_")[1];
          
          // انتشار مقاله در دیتابیس
          await query("UPDATE posts SET is_published = true WHERE id = $1", [postId]);

          // ویرایش پیام تلگرام و حذف دکمه
          await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: callbackChatId,
              message_id: message.message_id,
              text: `✅ **مقاله با موفقیت در سایت منتشر شد!**\n\n📌 عنوان: ${message.text.split('\n\n')[1].replace('📌 عنوان: ', '')}\n\nمشاهده در سایت: https://parhamprojects.vercel.app/fa/blog`,
              parse_mode: "Markdown",
            }),
          });
        }
      }
      
      // بستن حالت لودینگ دکمه
      await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query_id: body.callback_query.id }),
      });

      return NextResponse.json({ ok: true });
    }

    // ==========================================
    // ۲. بررسی پیام‌های متنی (دریافت پرامپت)
    // ==========================================
    if (body.message && body.message.text) {
      const chatId = body.message.chat.id;
      const userText = body.message.text;

      // بررسی امنیتی: اگر کسی غیر از شما پیام داد، نادیده بگیر
      if (chatId.toString() !== myChatId) {
        return NextResponse.json({ ok: true });
      }

      // ارسال پیام "در حال تولید" به تلگرام شما
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "⏳ در حال نوشتن مقاله با هوش مصنوعی... لطفاً چند لحظه صبر کنید.",
        }),
      });

      // پرامپت سیستم برای هوش مصنوعی (سئو محور و فارسی)
      const systemPrompt = `You are an expert SEO copywriter. 
      Write a highly engaging and SEO-optimized blog post in Persian (Farsi) based on this topic: "${userText}".
      The tone should be professional and friendly.
      
      You MUST respond strictly with a valid JSON object containing exactly these keys:
      "title": "A catchy SEO title (max 60 chars)",
      "slug": "an-english-url-slug-for-the-post",
      "excerpt": "A compelling meta description (max 160 chars)",
      "content": "The full article in Markdown format (use ## for headings, plenty of paragraphs)",
      "category": "یک دسته‌بندی مناسب (مثلاً: تکنولوژی، طراحی وب، سئو)",
      "seo_title": "SEO optimized title (can be same as title)",
      "seo_description": "SEO meta description"
      
      Do not include any markdown code blocks like \`\`\`json in the response. Just output the raw JSON.`;

      // اتصال به Groq API
      const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [{ role: "user", content: systemPrompt }],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      });

      const aiData = await aiResponse.json();

      if (!aiResponse.ok) {
        throw new Error(aiData.error?.message || "خطا در ارتباط با هوش مصنوعی");
      }

      const postData = JSON.parse(aiData.choices[0].message.content);

      // ذخیره مقاله در دیتابیس (به صورت پیش‌نویس - is_published: false)
      const dbResult = await query(
        `INSERT INTO posts (title, slug, excerpt, content, category, author, seo_title, seo_description, locale, is_published) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        [
          postData.title, postData.slug, postData.excerpt, postData.content, 
          postData.category, "Parham Batouie", postData.seo_title, postData.seo_description, 
          "fa", false // پیش‌نویس
        ]
      );

      const postId = dbResult.rows[0].id;
      const previewUrl = `https://parhamprojects.vercel.app/fa/blog/${postData.slug}`;

      // ارسال مقاله و دکمه شیشه‌ای "انتشار" به تلگرام
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `📝 **مقاله جدید آماده شد!**\n\n📌 عنوان: ${postData.title}\n\n📄 خلاصه:\n${postData.excerpt}\n\n👇 برای انتشار در سایت، روی دکمه زیر کلیک کنید:`,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "🚀 انتشار در سایت", callback_data: `publish_${postId}` }],
              [{ text: "🔗 لینک پیش‌نمایش", url: previewUrl }]
            ]
          }
        }),
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Telegram Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}