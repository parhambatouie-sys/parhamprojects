import { NextResponse } from "next/server";
import { query } from "@/lib/db";
// @ts-ignore
import { search, SafeSearchType } from "duck-duck-scrape";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// تابع کمکی برای ارسال پیام
async function sendMessage(chatId: string | number, text: string, replyMarkup?: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: "Markdown", ...(replyMarkup && { reply_markup: replyMarkup }) }),
  });
}

// تابع کمکی برای ویرایش پیام
async function editMessage(chatId: string | number, messageId: number, text: string, replyMarkup?: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, message_id: messageId, text: text, parse_mode: "Markdown", ...(replyMarkup && { reply_markup: replyMarkup }) }),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const myChatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !myChatId) return NextResponse.json({ error: "Missing config" }, { status: 500 });

    // ==========================================
    // بخش اول: بررسی دکمه‌های شیشه‌ای
    // ==========================================
    if (body.callback_query) {
      const { data, message } = body.callback_query;
      const chatId = message.chat.id;
      const messageId = message.message_id;

      if (chatId.toString() !== myChatId) return NextResponse.json({ ok: true });

      // ۱. انتخاب زبان
      if (data.startsWith("lang_")) {
        const lang = data.split("_")[1];
        
        const stateRes = await query("SELECT prompt FROM tg_state WHERE chat_id = $1", [chatId.toString()]);
        if (stateRes.rows.length === 0) {
          await editMessage(chatId, messageId, "❌ موضوع پیدا نشد. لطفاً دوباره پیام بدهید.");
          return NextResponse.json({ ok: true });
        }

        const prompt = stateRes.rows[0].prompt;
        await query("UPDATE tg_state SET language = $1 WHERE chat_id = $2", [lang, chatId.toString()]);

        await editMessage(chatId, messageId, `⏳ در حال تحلیل موضوع و ساخت پرامپت عکس با ابعاد استاندارد...`);

        // از هوش مصنوعی می‌خواهیم پرامپت انگلیسی با ابعاد مناسب بدهد
        const promptSystem = `Based on this blog topic: "${prompt}", write a short, descriptive English prompt (max 60 words) to generate a high-quality, modern, and professional cover image for a blog post. 
        IMPORTANT: The prompt MUST include the aspect ratio "16:9" or specify "wide format, 1920x1080 resolution". 
        Just output the prompt text, nothing else.`;
        
        const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.GROQ_API_KEY}` },
          body: JSON.stringify({ model: "openai/gpt-oss-120b", messages: [{ role: "user", content: promptSystem }], temperature: 0.7 })
        });

        const aiData = await aiResponse.json();
        const imagePrompt = aiData.choices[0].message.content.trim();

        await query("UPDATE tg_state SET image_prompt = $1 WHERE chat_id = $2", [imagePrompt, chatId.toString()]);

        await editMessage(
          chatId, 
          messageId, 
          `✅ زبان انتخاب شد: ${lang === 'fa' ? 'فارسی' : 'انگلیسی'}\n\n🎨 **پرامپت عکس (برای کپی کردن در هوش مصنوعی):**\n\n\`${imagePrompt}\`\n\n📸 حالا عکس تولید شده (با ابعاد 16:9) را برای من ارسال کنید:`
        );
        return NextResponse.json({ ok: true });
      }

      // ۲. انتخاب زمان انتشار
      if (data.startsWith("time_")) {
        const timeChoice = data.split("_")[1];
        const stateRes = await query("SELECT * FROM tg_state WHERE chat_id = $1", [chatId.toString()]);
        if (stateRes.rows.length === 0 || !stateRes.rows[0].post_data) {
          await editMessage(chatId, messageId, "❌ اطلاعات مقاله پیدا نشد. لطفاً دوباره تلاش کنید.");
          return NextResponse.json({ ok: true });
        }

        const postData = JSON.parse(stateRes.rows[0].post_data);
        let publishAt = null;

        if (timeChoice === "now") {
          publishAt = new Date();
        } else if (timeChoice === "1h") {
          publishAt = new Date(Date.now() + 60 * 60 * 1000);
        } else if (timeChoice === "tomorrow") {
          publishAt = new Date();
          publishAt.setDate(publishAt.getDate() + 1);
          publishAt.setHours(9, 0, 0, 0);
        }

        const isPublished = timeChoice === "now" ? true : false;
        
        const dbResult = await query(
          `INSERT INTO posts (title, slug, excerpt, content, category, author, seo_title, seo_description, image_url, locale, is_published, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
          [postData.title, postData.slug, postData.excerpt, postData.content, postData.category, "Parham Batouie", postData.seo_title, postData.seo_description, stateRes.rows[0].image_url, stateRes.rows[0].language, isPublished, publishAt]
        );

        const postId = dbResult.rows[0].id;
        const previewUrl = `https://parhamprojects.vercel.app/${stateRes.rows[0].language}/blog/${postData.slug}`;

        const statusText = timeChoice === "now" 
          ? "منتشر شد!" 
          : `زمان‌بندی شد برای ${publishAt ? publishAt.toLocaleString('fa-IR') : 'نامشخص'}`;

        await editMessage(chatId, messageId, `✅ **مقاله ${statusText}**\n\n🔗 لینک پیش‌نمایش:\n${previewUrl}\n\n📌 شناسه مقاله: ${postId}`);
        
        await query("DELETE FROM tg_state WHERE chat_id = $1", [chatId.toString()]);
        await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ callback_query_id: body.callback_query.id }) });
        return NextResponse.json({ ok: true });
      }
    }

    // ==========================================
    // بخش دوم: دریافت پیام‌های متنی و عکس
    // ==========================================
    if (body.message) {
      const chatId = body.message.chat.id;
      const text = body.message.text;
      const photo = body.message.photo;

      if (chatId.toString() !== myChatId) return NextResponse.json({ ok: true });

      // اگر عکس فرستاد
      if (photo) {
        const stateRes = await query("SELECT * FROM tg_state WHERE chat_id = $1", [chatId.toString()]);
        if (stateRes.rows.length === 0 || !stateRes.rows[0].language) {
          await sendMessage(chatId, "⚠️ لطفاً ابتدا موضوع مقاله را بفرستید و زبان را انتخاب کنید.");
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

          // ==========================================
          // پیام وضعیت: شروع جستجو
          // ==========================================
          await sendMessage(chatId, "🔍 در حال جستجو در اینترنت برای پیدا کردن اطلاعات به‌روز و دقیق...");

          // جستجوی DuckDuckGo
          let searchContext = "";
          try {
            const searchResults = await search(prompt, { safeSearch: SafeSearchType.MODERATE });
            searchContext = searchResults.results.slice(0, 5).map(r => 
              `Title: ${r.title}\nSnippet: ${r.description}`
            ).join('\n\n');
            console.log("DuckDuckGo Search Success");
          } catch (e) {
            console.error("DuckDuckGo Search Failed:", e);
          }

          // ==========================================
          // پیام وضعیت: شروع نوشتن
          // ==========================================
          await sendMessage(chatId, "✍️ اطلاعات دریافت شد. در حال نوشتن و ساختاردهی مقاله با هوش مصنوعی...");

          // پرامپت حرفه‌ای با استفاده از اطلاعات جستجو
          const systemPrompt = `You are an expert SEO copywriter and technical content creator. 
          Write a highly engaging, technically accurate, and SEO-optimized blog post in ${lang === 'fa' ? 'Persian (Farsi)' : 'English'} based on this topic: "${prompt}".
          
          ${searchContext ? `Here is some real-time information from the web about this topic:\n${searchContext}\n\nUse this information to ensure your article is up-to-date and accurate.` : ''}
          
          CRITICAL RULES:
          1. Tone: Professional, friendly, and educational.
          2. Structure: H1 title, Introduction, Body with H2 and H3 headings, FAQ (3-6 questions), and a Conclusion.
          3. NO FAKE DATA: Do not invent statistics, quotes, or fake URLs.
          4. SEO: Naturally use the main keyword in the title, intro, and headings.
          5. Length: Aim for a comprehensive guide (approx 800-1200 words).
          
          You MUST respond strictly with a valid JSON object containing exactly these keys:
          "title": "A catchy SEO H1 title",
          "slug": "an-english-url-slug",
          "excerpt": "A compelling meta description (max 160 chars)",
          "content": "The full article in Markdown format (Use ## for H2, ### for H3, ** for bold)",
          "category": "A suitable category (e.g., Technology, Web Design, AI)",
          "seo_title": "SEO optimized title",
          "seo_description": "SEO meta description"
          
          Do not include markdown code blocks like \`\`\`json in the response. Just output the raw JSON.`;

          const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.GROQ_API_KEY}` },
            body: JSON.stringify({ model: "openai/gpt-oss-120b", messages: [{ role: "user", content: systemPrompt }], temperature: 0.7, response_format: { type: "json_object" } })
          });

          const aiData = await aiResponse.json();
          if (!aiResponse.ok) throw new Error(aiData.error?.message || "AI Error");

          const postData = JSON.parse(aiData.choices[0].message.content);

          await query("UPDATE tg_state SET post_data = $1 WHERE chat_id = $2", [JSON.stringify(postData), chatId.toString()]);

          await sendMessage(chatId, `📝 **پیش‌نمایش مقاله (با اطلاعات به‌روز):**\n\n📌 عنوان: ${postData.title}\n📄 خلاصه: ${postData.excerpt}\n\n⏰ **چه زمانی منتشر شود؟**`, {
            inline_keyboard: [
              [{ text: "🚀 همین الان", callback_data: `time_now` }],
              [{ text: "🕐 یک ساعت دیگر", callback_data: `time_1h` }],
              [{ text: "🌅 فردا صبح (۹ صبح)", callback_data: `time_tomorrow` }],
            ]
          });
        }
        return NextResponse.json({ ok: true });
      }

      // اگر متن فرستاد
      if (text) {
        await query(`
          CREATE TABLE IF NOT EXISTS tg_state (
            chat_id VARCHAR(50) PRIMARY KEY, prompt TEXT, language VARCHAR(5), 
            image_prompt TEXT, image_url TEXT, post_data TEXT
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