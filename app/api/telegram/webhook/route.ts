import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * این فایل وب‌هوک تلگرام است.
 * هر پیامی که به ربات ارسال شود، به اینجا فرستاده می‌شود و اینجا پردازش می‌شود.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const myChatId = process.env.TELEGRAM_CHAT_ID;

    // بررسی وجود کلیدهای امنیتی
    if (!token || !myChatId) {
      console.error("Missing Telegram Credentials");
      return NextResponse.json({ error: "Missing config" }, { status: 500 });
    }

    // ==========================================
    // بخش اول: بررسی دکمه‌های شیشه‌ای (Callback Query)
    // ==========================================
    if (body.callback_query) {
      const { data, message } = body.callback_query;
      const chatId = message.chat.id;
      const messageId = message.message_id;

      // امنیت: اگر کسی غیر از من پیام داد، نادیده بگیر
      if (chatId.toString() !== myChatId) {
        return NextResponse.json({ ok: true });
      }

      // ------------------------------------------
      // حالت ۱: اگر روی دکمه انتخاب زبان کلیک شد
      // ------------------------------------------
      if (data.startsWith("lang_")) {
        const lang = data.split("_")[1];
        
        // پیدا کردن موضوع ذخیره شده در دیتابیس
        const stateRes = await query("SELECT prompt FROM tg_state WHERE chat_id = $1", [chatId.toString()]);
        
        if (stateRes.rows.length === 0) {
          await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              chat_id: chatId, 
              message_id: messageId, 
              text: "❌ موضوع پیدا نشد. لطفاً دوباره پیام بدهید." 
            })
          });
          return NextResponse.json({ ok: true });
        }

        const prompt = stateRes.rows[0].prompt;
        // پاک کردن موضوع از دیتابیس
        await query("DELETE FROM tg_state WHERE chat_id = $1", [chatId.toString()]);

        // نمایش پیام در حال تولید
        await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
          method: "POST", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            chat_id: chatId, 
            message_id: messageId, 
            text: `⏳ در حال نوشتن مقاله (${lang === 'fa' ? 'فارسی' : 'انگلیسی'})...\n\nموضوع: ${prompt}` 
          })
        });

        // ساخت پرامپت برای هوش مصنوعی
        const systemPrompt = `You are an expert SEO copywriter. 
        Write a highly engaging and SEO-optimized blog post in ${lang === 'fa' ? 'Persian (Farsi)' : 'English'} based on this topic: "${prompt}".
        
        You MUST respond strictly with a valid JSON object containing exactly these keys:
        "title": "Catchy SEO title",
        "slug": "english-url-slug",
        "excerpt": "Meta description",
        "content": "Full article in Markdown",
        "category": "Category",
        "seo_title": "SEO title",
        "seo_description": "SEO desc"
        
        Do not include markdown blocks like \`\`\`json. Just raw JSON.`;

        // اتصال به هوش مصنوعی
        const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST", 
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.GROQ_API_KEY}` },
          body: JSON.stringify({ 
            model: "openai/gpt-oss-120b", 
            messages: [{ role: "user", content: systemPrompt }], 
            temperature: 0.7, 
            response_format: { type: "json_object" } 
          })
        });

        const aiData = await aiResponse.json();
        if (!aiResponse.ok) {
          throw new Error(aiData.error?.message || "AI Error");
        }

        const postData = JSON.parse(aiData.choices[0].message.content);

        // ذخیره در دیتابیس (به صورت پیش‌نویس)
        const dbResult = await query(
          `INSERT INTO posts (title, slug, excerpt, content, category, author, seo_title, seo_description, locale, is_published) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
          [postData.title, postData.slug, postData.excerpt, postData.content, postData.category, "Parham Batouie", postData.seo_title, postData.seo_description, lang, false]
        );

        const postId = dbResult.rows[0].id;
        const previewUrl = `https://parhamprojects.vercel.app/${lang}/blog/${postData.slug}`;

        // ارسال پیام نهایی با دکمه انتشار
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: `📝 **مقاله آماده شد!**\n\n📌 عنوان: ${postData.title}\n🌐 زبان: ${lang === 'fa' ? 'فارسی' : 'انگلیسی'}\n\n👇 برای انتشار کلیک کنید:`,
            parse_mode: "Markdown",
            reply_markup: { 
              inline_keyboard: [
                [{ text: "🚀 انتشار در سایت", callback_data: `publish_${postId}_${lang}` }], 
                [{ text: "🔗 پیش‌نمایش", url: previewUrl }]
              ] 
            }
          })
        });
        
        await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, { 
          method: "POST", headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify({ callback_query_id: body.callback_query.id }) 
        });
        return NextResponse.json({ ok: true });
      }

      // ------------------------------------------
      // حالت ۲: اگر روی دکمه انتشار کلیک شد
      // ------------------------------------------
      if (data.startsWith("publish_")) {
        const [_, postId, lang] = data.split("_");
        
        // تغییر وضعیت در دیتابیس
        await query("UPDATE posts SET is_published = true WHERE id = $1", [postId]);
        
        await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
          method: "POST", 
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            chat_id: chatId, 
            message_id: messageId, 
            text: `✅ **مقاله با موفقیت منتشر شد!**\n\nمشاهده در سایت: https://parhamprojects.vercel.app/${lang}/blog`, 
            parse_mode: "Markdown" 
          })
        });
        
        await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, { 
          method: "POST", headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify({ callback_query_id: body.callback_query.id }) 
        });
        return NextResponse.json({ ok: true });
      }
    }

    // ==========================================
    // بخش دوم: دریافت پیام متنی جدید از کاربر
    // ==========================================
    if (body.message && body.message.text) {
      const chatId = body.message.chat.id;
      const userText = body.message.text;

      // امنیت
      if (chatId.toString() !== myChatId) {
        return NextResponse.json({ ok: true });
      }

      // ذخیره موضوع در دیتابیس
      await query(`
        CREATE TABLE IF NOT EXISTS tg_state (chat_id VARCHAR(50) PRIMARY KEY, prompt TEXT);
        INSERT INTO tg_state (chat_id, prompt) VALUES ($1, $2) ON CONFLICT (chat_id) DO UPDATE SET prompt = $2;
      `, [chatId.toString(), userText]);

      // پرسیدن زبان از کاربر
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🌐 لطفاً زبان مقاله را انتخاب کنید:\n\n📝 موضوع: ${userText}`,
          reply_markup: { 
            inline_keyboard: [
              [{ text: "🇮🇷 فارسی", callback_data: "lang_fa" }, { text: "🇬🇧 English", callback_data: "lang_en" }]
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