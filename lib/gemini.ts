// ============================================================================
// تابع ارتباط با Google Gemini API برای بررسی و بازنویسی مقالات
// ============================================================================
export async function reviewArticle(title: string, content: string, action: "review" | "rewrite") {
  // دریافت کلید API از متغیرهای محیطی
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("کلید GEMINI_API_KEY در تنظیمات ورسل وجود ندارد.");
  }

  const isRewrite = action === "rewrite";
  
  // ساخت پرامپت
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

  // آدرس API (استفاده از مدل پایدار 1.5-flash)
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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
      temperature: 0.3
    }
  };

  try {
    // ایجاد یک سیگنال برای لغو درخواست پس از ۸ ثانیه (برای جلوگیری از گیر کردن ورسل)
    const signal = AbortSignal.timeout(8000);

    const response = await fetch(apiUrl, {
      method: "POST", 
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestPayload),
      signal: signal 
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error Response:", data);
      throw new Error(data.error?.message || "خطای ناشناخته در ارتباط با Gemini API");
    }

    const resultText = data.candidates[0].content.parts[0].text;
    
    // پاکسازی خروجی از تگ‌های مارک‌داون
    let cleanText = resultText.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```\n/, "").replace(/\n```$/, "");
    }

    return JSON.parse(cleanText);

  } catch (error: any) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      throw new Error("سرورهای گوگل پاسخ ندادند (بیش از ۸ ثانیه). لطفاً مجدداً تلاش کنید.");
    }
    throw error;
  }
}