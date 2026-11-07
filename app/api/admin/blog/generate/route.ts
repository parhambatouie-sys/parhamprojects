import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // افزایش زمان پاسخ‌دهی برای هوش مصنوعی

export async function POST(request: Request) {
  try {
    const { topic, tone, language } = await request.json();

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: "کلید DEEPSEEK_API_KEY در تنظیمات ورسل وجود ندارد." }, { status: 500 });
    }

    // پرامپت سیستم با در نظر گرفتن اصول سئو
    const systemPrompt = `You are an expert SEO copywriter and web developer. 
    Write a highly engaging and SEO-optimized blog post in ${language === 'fa' ? 'Persian (Farsi)' : 'English'}.
    The tone should be: ${tone}.
    Topic: ${topic}.
    
    You MUST respond strictly with a valid JSON object containing exactly these keys:
    "title": "A catchy SEO title (max 60 chars)",
    "slug": "an-english-url-slug",
    "excerpt": "A compelling meta description (max 160 chars)",
    "content": "The full article in Markdown format (use ## for headings, plenty of paragraphs)",
    "category": "A suitable category",
    "seo_title": "SEO optimized title (can be same as title)",
    "seo_description": "SEO meta description"
    
    Do not include any markdown code blocks like \`\`\`json in the response. Just output the raw JSON.`;

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "system", content: systemPrompt }],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" } // اجبار دیپ‌سیک به دادن خروجی JSON
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "خطا در ارتباط با DeepSeek");
    }

    const aiContent = JSON.parse(data.choices[0].message.content);
    return NextResponse.json({ success: true, data: aiContent });

  } catch (error: any) {
    console.error("DeepSeek Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate content" }, { status: 500 });
  }
}