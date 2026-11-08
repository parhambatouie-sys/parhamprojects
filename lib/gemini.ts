// ============================================================================
// تابع ارتباط با Google Gemini API برای بررسی و بازنویسی مقالات
// ============================================================================
export async function reviewArticle(title: string, content: string, action: "review" | "rewrite") {
  // ۱. دریافت کلید API از متغیرهای محیطی ورسل
  const apiKey = process.env.GEMINI_API_KEY;
  
  // بررسی وجود کلید
  if (!apiKey) {
    throw new Error("کلید GEMINI_API_KEY در تنظیمات ورسل (Environment Variables) وجود ندارد.");
  }

  // ۲. تعیین اینکه آیا درخواست برای "بررسی" است یا "بازنویسی"
  const isRewrite = action === "rewrite";
  
  // ۳. ساخت پرامپت (دستورالعمل) برای هوش مصنوعی
  const systemPrompt = `
    You are an expert SEO editor-in-chief. 
    Analyze the following article strictly based on 5 criteria:
    1. SEO (Keyword usage, headings structure, meta) - 2 points
    2. Depth & Value (No fluff, comprehensive info) - 2 points
    3. Readability & Structure (Markdown, paragraphs, no repetition) - 2 points
    4. Accuracy (No fake stats, no hallucinations) - 2 points
    5. Professional Tone - 2 points
    
    Total score out of 10.
    
    ${isRewrite 
      ? `REWRITE the article to improve its score to a 9 or 10. Fix all weaknesses. Return the rewritten content in Markdown format.` 
      : `Evaluate the article. If it scores below 8, explain exactly what is wrong and why.`}
    
    You MUST return a strict JSON object with these keys:
    "score": (number between 0 and 10),
    "feedback": (string, reasons for the score, especially if below 8),
    "rewritten_title": (string, only if action is rewrite, otherwise empty),
    "rewritten_content": (string in Markdown, only if action is rewrite, otherwise empty)

    Article to review:
    Title: ${title}
    Content: ${content}
  `;

  // ۴. آدرس API با استفاده از مدل جدید Gemini 3.8 Flash
  // طبق خطای قبلی گوگل، مدل 2.0 حذف شده و باید از 3.8 استفاده کنیم
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

  // ۵. آماده‌سازی بدنه درخواست (Payload) طبق استاندارد گوگل
  const requestPayload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: systemPrompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.3, // دمای پایین برای خروجی دقیق‌تر و منطقی‌تر
      responseMimeType: "application/json" // اجبار مدل به تولید خروجی JSON
    }
  };

  try {
    // ۶. ارسال درخواست به گوگل (حتماً باید متد POST باشد)
    const response = await fetch(apiUrl, {
      method: "POST", 
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestPayload)
    });

    // ۷. تبدیل پاسخ به فرمت قابل خواندن
    const data = await response.json();

    // ۸. بررسی خطا در پاسخ گوگل
    if (!response.ok) {
      console.error("Gemini API Error Response:", data);
      throw new Error(data.error?.message || "خطای ناشناخته در ارتباط با Gemini API");
    }

    // ۹. استخراج متن تولید شده توسط هوش مصنوعی
    const resultText = data.candidates[0].content.parts[0].text;
    
    // ۱۰. پاکسازی متن از تگ‌های مارک‌داون (برخی مدل‌ها خروجی JSON را داخل ```json قرار می‌دهند)
    let cleanText = resultText.trim();
    
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```\n/, "").replace(/\n```$/, "");
    }

    // ۱۱. تبدیل متن تمیز شده به یک آبجکت JSON و بازگرداندن آن
    return JSON.parse(cleanText);

  } catch (error: any) {
    console.error("Error in reviewArticle function:", error);
    throw error;
  }
}