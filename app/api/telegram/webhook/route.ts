// ============================================================================
// ایمپورت‌های مورد نیاز
// ============================================================================
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { reviewArticle } from "@/lib/gemini"; 
// @ts-ignore
import { search, SafeSearchType } from "duck-duck-scrape";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// ============================================================================
// توابع کمکی تلگرام
// ============================================================================
async function sendMessage(chatId: string | number, text: string, replyMarkup?: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  const payload: any = {
    chat_id: chatId,
    text: text,
    parse_mode: "Markdown",
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

async function editMessage(chatId: string | number, messageId: number, text: string, replyMarkup?: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  const payload: any = {
    chat_id: chatId,
    message_id: messageId,
    text: text,
    parse_mode: "Markdown",
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// ============================================================================
// پردازشگر اصلی
// ============================================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const myChatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !myChatId) {
      return NextResponse.json({ error: "Missing config" }, { status: 500 });
    }

    // بخش اول: دکمه‌های شیشه‌ای
    if (body.callback_query) {
      const { data, message } = body.callback_query;
      const chatId = message.chat.id;
      const messageId = message.message_id;

      if (chatId.toString() !== myChatId) {
        return NextResponse.json({ ok: true });
      }

      // پاسخ فوری به تلگرام
      await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ callback_query_id: body.callback_query.id }) 
      });

      // دکمه‌های سفارش
      if (data.startsWith("order_")) {
        const parts = data.split("_");
        const action = parts[1];
        const orderId = parts[2];
        
        const newStatus = action === "accept" ? "accepted" : "rejected";
        const statusText = action === "accept" ? "✅ تایید شده" : "❌ رد شده";

        await query("UPDATE orders SET status = $1 WHERE id = $2", [newStatus, orderId]);
        await editMessage(chatId, messageId, `${message.text}\n\n👉 **وضعیت جدید: ${statusText}**`);
        return NextResponse.json({ ok: true });
      }

      // انتخاب زبان
      if (data.startsWith("lang_")) {
        const lang = data.split("_")[1];
        const stateRes = await query("SELECT prompt FROM tg_state WHERE chat_id = $1", [chatId.toString()]);
        
        if (stateRes.rows.length === 0) {
          await editMessage(chatId, messageId, "❌ موضوع پیدا نشد.");
          return NextResponse.json({ ok: true });
        }

        const prompt = stateRes.rows[0].prompt;
        await query("UPDATE tg_state SET language = $1 WHERE chat_id = $2", [lang, chatId.toString()]);

        await editMessage(chatId, messageId, `⏳ در حال تحلیل موضوع...`);

        const promptSystem = `Based on this blog topic: "${prompt}", write a short, descriptive English prompt (max 60 words) to generate a high-quality, modern, and professional cover image for a blog post. 
        IMPORTANT 1: The prompt MUST include the aspect ratio "16:9". 
        IMPORTANT 2: The text written ON the image MUST be in ${lang === 'fa' ? 'Persian (Farsi)' : 'English'} language.
        Just output the prompt text.`;
        
        const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.GROQ_API_KEY}` },
          body: JSON.stringify({ model: "openai/gpt-oss-120b", messages: [{ role: "user", content: promptSystem }], temperature: 0.7 })
        });

        const aiData = await aiResponse.json();
        const imagePrompt = aiData.choices[0].message.content.trim();
        await query("UPDATE tg_state SET image_prompt = $1 WHERE chat_id = $2", [imagePrompt, chatId.toString()]);

        await editMessage(chatId, messageId, `✅ زبان: ${lang === 'fa' ? 'فارسی' : 'انگلیسی'}\n\n🎨 **پرامپت عکس:**\n\n\`${imagePrompt}\`\n\n📸 عکس تولید شده (16:9) را ارسال کنید:`);
        return NextResponse.json({ ok: true });
      }

      // انتخاب زمان انتشار
      if (data.startsWith("time_")) {
        const timeChoice = data.split("_")[1];
        const stateRes = await query("DELETE FROM tg_state WHERE chat_id = $1 RETURNING *", [chatId.toString()]);
        
        if (stateRes.rows.length === 0 || !stateRes.rows[0].post_data) {
          await editMessage(chatId, messageId, "❌ اطلاعات پیدا نشد.");
          return NextResponse.json({ ok: true });
        }

        const postData = JSON.parse(stateRes.rows[0].post_data);
        let publishAt = null;

        if (timeChoice === "now") publishAt = new Date();
        else if (timeChoice === "1h") publishAt = new Date(Date.now() + 60 * 60 * 1000);
        else if (timeChoice === "tomorrow") {
          publishAt = new Date();
          publishAt.setDate(publishAt.getDate() + 1);
          publishAt.setHours(9, 0, 0, 0);
        }

        const isPublished = timeChoice === "now" ? true : false;
        
        const dbResult = await query(
          `INSERT INTO posts (title, slug, excerpt, content, category, author, seo_title, seo_description, image_url, locale, is_published, created_at, ai_score, review_feedback) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
          [postData.title, postData.slug, postData.excerpt, postData.content, postData.category, "Parham Batouie", postData.seo_title, postData.seo_description, stateRes.rows[0].image_url, stateRes.rows[0].language, isPublished, publishAt, postData.ai_score || 0, postData.ai_feedback || null]
        );

        const postId = dbResult.rows[0].id;
        const previewUrl = `https://parhamprojects.vercel.app/${stateRes.rows[0].language}/blog/${encodeURIComponent(postData.slug)}`;
        const statusText = timeChoice === "now" ? "منتشر شد!" : `زمان‌بندی شد.`;

        await editMessage(chatId, messageId, `✅ **مقاله ${statusText}**\n\n🔗 لینک:\n${previewUrl}\n\n📌 شناسه: ${postId}`);
        return NextResponse.json({ ok: true });
      }

      // بررسی با جمینای
      if (data.startsWith("review_ai_")) {
        const postId = data.split("_")[2];
        const stateRes = await query("SELECT * FROM tg_state WHERE chat_id = $1", [chatId.toString()]);
        
        if (stateRes.rows.length === 0 || !stateRes.rows[0].post_data) {
          await editMessage(chatId, messageId, "❌ اطلاعات مقاله پیدا نشد.");
          return NextResponse.json({ ok: true });
        }

        const postData = JSON.parse(stateRes.rows[0].post_data);
        await editMessage(chatId, messageId, "🧐 در حال بررسی دقیق مقاله توسط جمینای...");

        try {
          const reviewData = await reviewArticle(postData.title, postData.content, "review");
          
          const score = reviewData.score;
          const feedback = reviewData.feedback;

          postData.ai_score = score;
          postData.ai_feedback = feedback;

          if (score >= 8) {
            await query("UPDATE tg_state SET post_data = $1 WHERE chat_id = $2", [JSON.stringify(postData), chatId.toString()]);
            await editMessage(chatId, messageId, `✅ **مقاله نمره ${score} از ۱۰ را گرفت!**\n\n👇 آماده انتشار است:`, {
              inline_keyboard: [
                [{ text: "🚀 تایید و انتشار نهایی", callback_data: `time_now` }],
                [{ text: "🔗 مشاهده پیش‌نمایش", url: `https://parhamprojects.vercel.app/${stateRes.rows[0].language}/blog/${encodeURIComponent(postData.slug)}` }]
              ]
            });
          } else {
            await query("UPDATE tg_state SET post_data = $1 WHERE chat_id = $2", [JSON.stringify(postData), chatId.toString()]);
            await editMessage(chatId, messageId, `⚠️ **مقاله نمره ${score} از ۱۰ را گرفت.**\n\nدلایل ضعف:\n${feedback}\n\n👇 برای بازنویسی کلیک کنید:`, {
              inline_keyboard: [
                [{ text: "🔄 بازنویسی دقیق با جمینای", callback_data: `rewrite_ai_${postId}` }],
              ]
            });
          }
        } catch (error: any) {
          // دکمه تلاش مجدد در صورت هرگونه خطا
          await editMessage(
            chatId, 
            messageId, 
            `❌ **خطا در بررسی مقاله:**\n${error.message}\n\n👇 دوباره تلاش کنید:`,
            {
              inline_keyboard: [
                [{ text: "🔄 تلاش مجدد برای بررسی", callback_data: `review_ai_${postId}` }]
              ]
            }
          );
        }
        return NextResponse.json({ ok: true });
      }

      // بازنویسی با جمینای
      if (data.startsWith("rewrite_ai_")) {
        const postId = data.split("_")[2];
        const stateRes = await query("SELECT * FROM tg_state WHERE chat_id = $1", [chatId.toString()]);
        
        if (stateRes.rows.length === 0 || !stateRes.rows[0].post_data) {
          await editMessage(chatId, messageId, "❌ اطلاعات مقاله پیدا نشد.");
          return NextResponse.json({ ok: true });
        }

        const postData = JSON.parse(stateRes.rows[0].post_data);
        await editMessage(chatId, messageId, "🔄 در حال بازنویسی مقاله توسط جمینای...");

        try {
          const rewriteData = await reviewArticle(postData.title, postData.content, "rewrite");

          postData.title = rewriteData.rewritten_title;
          postData.content = rewriteData.rewritten_content;
          postData.ai_score = 0; 
          postData.ai_feedback = null; 

          await query("UPDATE tg_state SET post_data = $1 WHERE chat_id = $2", [JSON.stringify(postData), chatId.toString()]);

          await editMessage(chatId, messageId, `✅ **بازنویسی انجام شد!**`, {
            inline_keyboard: [
              [{ text: "🧐 بررسی مجدد با جمینای", callback_data: `review_ai_${postId}` }],
              [{ text: "🚀 انتشار نسخه بازنویسی شده", callback_data: `time_now` }],
            ]
          });
        } catch (error: any) {
          await editMessage(
            chatId, 
            messageId, 
            `❌ **خطا در بازنویسی:**\n${error.message}\n\n👇 دوباره تلاش کنید:`,
            {
              inline_keyboard: [
                [{ text: "🔄 تلاش مجدد برای بازنویسی", callback_data: `rewrite_ai_${postId}` }]
              ]
            }
          );
        }
        return NextResponse.json({ ok: true });
      }
    }

    // بخش دوم: پیام‌های متنی و عکس
    if (body.message) {
      const chatId = body.message.chat.id;
      const text = body.message.text;
      const photo = body.message.photo;

      if (chatId.toString() !== myChatId) return NextResponse.json({ ok: true });

      if (photo) {
        const stateRes = await query("SELECT * FROM tg_state WHERE chat_id = $1", [chatId.toString()]);
        if (stateRes.rows.length === 0 || !stateRes.rows[0].language) {
          await sendMessage(chatId, "⚠️ ابتدا موضوع و زبان را مشخص کنید.");
          return NextResponse.json({ ok: true });
        }

        await sendMessage(chatId, "⏳ در حال دریافت و بهینه‌سازی عکس...");

        const fileId = photo[photo.length - 1].file_id;
        const fileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
        const fileData = await fileRes.json();
        
        if (fileData.ok) {
          const imageUrl = `https://api.telegram.org/file/bot${token}/${fileData.result.file_path}`;
          const imageResponse = await fetch(imageUrl);
          const imageBuffer = await imageResponse.arrayBuffer();
          const base64Image = `data:image/jpeg;base64,${Buffer.from(imageBuffer).toString('base64')}`;

          await query("UPDATE tg_state SET image_url = $1 WHERE chat_id = $2", [base64Image, chatId.toString()]);

          const prompt = stateRes.rows[0].prompt;
          const lang = stateRes.rows[0].language;

          await sendMessage(chatId, "🔍 در حال جستجو در اینترنت...");
          let searchContext = "";
          try {
            const searchResults = await search(prompt, { safeSearch: SafeSearchType.MODERATE });
            searchContext = searchResults.results.slice(0, 5).map(r => `Title: ${r.title}\nSnippet: ${r.description}`).join('\n\n');
          } catch (e) {}

          await sendMessage(chatId, "✍️ در حال نوشتن مقاله...");

          const systemPrompt = `You are an expert SEO copywriter. Write a blog post in ${lang === 'fa' ? 'Persian' : 'English'} about: "${prompt}". ${searchContext ? `Context: ${searchContext}` : ''}. MAX LENGTH: 700 WORDS. WRITE ONCE. Markdown format. Slug MUST BE ENGLISH. Return JSON with keys: title, slug, excerpt, content, category, seo_title, seo_description.`;

          const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.GROQ_API_KEY}` },
            body: JSON.stringify({ model: "openai/gpt-oss-120b", messages: [{ role: "user", content: systemPrompt }], temperature: 0.5, frequency_penalty: 1.5, response_format: { type: "json_object" } })
          });

          const aiData = await aiResponse.json();
          const postData = JSON.parse(aiData.choices[0].message.content);
          await query("UPDATE tg_state SET post_data = $1 WHERE chat_id = $2", [JSON.stringify(postData), chatId.toString()]);

          await sendMessage(chatId, `📝 **پیش‌نمایش مقاله:**\n\n📌 عنوان: ${postData.title}\n📄 خلاصه: ${postData.excerpt}\n\n👇 **چه کاری انجام دهیم؟**`, {
            inline_keyboard: [
              [{ text: "🧐 بررسی با جمینای (امتیازدهی)", callback_data: `review_ai_${Date.now()}` }],
              [{ text: "🚀 انتشار مستقیم (بدون بررسی)", callback_data: `time_now` }],
            ]
          });
        }
        return NextResponse.json({ ok: true });
      }

      if (text) {
        await query(`
          CREATE TABLE IF NOT EXISTS tg_state (
            chat_id VARCHAR(50) PRIMARY KEY, prompt TEXT, language VARCHAR(5), image_prompt TEXT, image_url TEXT, post_data TEXT
          );
        `);

        await query(`
          INSERT INTO tg_state (chat_id, prompt, language, image_prompt, image_url, post_data) 
          VALUES ($1, $2, NULL, NULL, NULL, NULL) 
          ON CONFLICT (chat_id) DO UPDATE SET prompt = $2, language = NULL, image_prompt = NULL, image_url = NULL, post_data = NULL;
        `, [chatId.toString(), text]);

        await sendMessage(chatId, `🌐 لطفاً زبان مقاله را انتخاب کنید:\n\n📝 موضوع: ${text}`, {
          inline_keyboard: [[{ text: "🇮🇷 فارسی", callback_data: "lang_fa" }, { text: "🇬🇧 English", callback_data: "lang_en" }]]
        });
        return NextResponse.json({ ok: true });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Telegram Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}