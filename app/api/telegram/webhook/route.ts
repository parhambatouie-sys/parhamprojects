import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: Request) {
  console.log("=== WEBHOOK HIT ==="); // لاگ تست
  
  try {
    const body = await request.json();
    console.log("Received Body:", JSON.stringify(body).substring(0, 200)); // لاگ دریافت پیام

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const myChatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !myChatId) {
      console.error("Missing token or chat id");
      return NextResponse.json({ error: "Missing config" }, { status: 500 });
    }

    // ۱. بررسی دکمه‌های شیشه‌ای
    if (body.callback_query) {
      console.log("Callback Query received:", body.callback_query.data);
      const { data, message } = body.callback_query;
      const chatId = message.chat.id;
      const messageId = message.message_id;

      if (chatId.toString() !== myChatId) {
        console.log("Unauthorized chat id:", chatId);
        return NextResponse.json({ ok: true });
      }

      if (data.startsWith("lang_")) {
        console.log("Language selected:", data);
        const lang = data.split("_")[1];
        
        const stateRes = await query("SELECT prompt FROM tg_state WHERE chat_id = $1", [chatId.toString()]);
        if (stateRes.rows.length === 0) {
          console.log("No prompt found for chat id");
          await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, message_id: messageId, text: "❌ موضوع پیدا نشد. لطفاً دوباره پیام بدهید." })
          });
          return NextResponse.json({ ok: true });
        }

        const prompt = stateRes.rows[0].prompt;
        await query("DELETE FROM tg_state WHERE chat_id = $1", [chatId.toString()]);

        await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, message_id: messageId, text: `⏳ در حال نوشتن مقاله (${lang === 'fa' ? 'فارسی' : 'انگلیسی'})...\n\nموضوع: ${prompt}` })
        });

        console.log("Calling Groq API...");
        const systemPrompt = `You are an expert SEO copywriter. 
        Write a highly engaging and SEO-optimized blog post in ${lang === 'fa' ? 'Persian (Farsi)' : 'English'} based on this topic: "${prompt}".
        You MUST respond strictly with a valid JSON object containing exactly these keys:
        "title", "slug", "excerpt", "content", "category", "seo_title", "seo_description"`;

        const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.GROQ_API_KEY}` },
          body: JSON.stringify({ model: "openai/gpt-oss-120b", messages: [{ role: "user", content: systemPrompt }], temperature: 0.7, response_format: { type: "json_object" } })
        });

        console.log("Groq API Status:", aiResponse.status);
        const aiData = await aiResponse.json();
        if (!aiResponse.ok) {
          console.error("Groq Error:", aiData);
          throw new Error(aiData.error?.message || "AI Error");
        }

        const postData = JSON.parse(aiData.choices[0].message.content);
        console.log("AI Generated Title:", postData.title);

        const dbResult = await query(
          `INSERT INTO posts (title, slug, excerpt, content, category, author, seo_title, seo_description, locale, is_published) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
          [postData.title, postData.slug, postData.excerpt, postData.content, postData.category, "Parham Batouie", postData.seo_title, postData.seo_description, lang, false]
        );

        const postId = dbResult.rows[0].id;
        const previewUrl = `https://parhamprojects.vercel.app/${lang}/blog/${postData.slug}`;

        console.log("Sending final message to Telegram...");
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: `📝 **مقاله آماده شد!**\n\n📌 عنوان: ${postData.title}\n🌐 زبان: ${lang === 'fa' ? 'فارسی' : 'انگلیسی'}\n\n👇 برای انتشار کلیک کنید:`,
            parse_mode: "Markdown",
            reply_markup: { inline_keyboard: [[{ text: "🚀 انتشار در سایت", callback_data: `publish_${postId}_${lang}` }], [{ text: "🔗 پیش‌نمایش", url: previewUrl }]] }
          })
        });
        
        await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ callback_query_id: body.callback_query.id }) });
        return NextResponse.json({ ok: true });
      }

      if (data.startsWith("publish_")) {
        console.log("Publishing post...");
        const [_, postId, lang] = data.split("_");
        await query("UPDATE posts SET is_published = true WHERE id = $1", [postId]);
        await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, message_id: messageId, text: `✅ **مقاله منتشر شد!**\n\nمشاهده: https://parhamprojects.vercel.app/${lang}/blog`, parse_mode: "Markdown" })
        });
        await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ callback_query_id: body.callback_query.id }) });
        return NextResponse.json({ ok: true });
      }
    }

    // ۲. دریافت پیام متنی جدید
    if (body.message && body.message.text) {
      console.log("New text message received:", body.message.text);
      const chatId = body.message.chat.id;
      const userText = body.message.text;

      if (chatId.toString() !== myChatId) {
        console.log("Unauthorized chat id:", chatId);
        return NextResponse.json({ ok: true });
      }

      console.log("Saving prompt to database...");

            await query(`
        INSERT INTO tg_state (chat_id, prompt) 
        VALUES ($1, $2) 
        ON CONFLICT (chat_id) 
        DO UPDATE SET prompt = $2
      `, [chatId.toString(), userText]);

      console.log("Sending language selection message...");
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🌐 لطفاً زبان مقاله را انتخاب کنید:\n\n📝 موضوع: ${userText}`,
          reply_markup: { inline_keyboard: [[{ text: "🇮🇷 فارسی", callback_data: "lang_fa" }, { text: "🇬🇧 English", callback_data: "lang_en" }]] }
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