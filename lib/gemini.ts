// ============================================================================
// تابع ارتباط با Google Gemini API (نسخه جدید با Interactions API)
// ============================================================================
export async function reviewArticle(title: string, content: string, action: "review" | "rewrite") {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("کلید GEMINI_API_KEY در تنظیمات ورسل وجود ندارد.");
  }

  const isRewrite = action === "rewrite";
  
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

  // 👈 استفاده از نقطه اتصال جدید Interactions API
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/interactions`;

  const requestPayload = {
    model: "gemini-3.8-flash", // مدل جدید و پایدار
    input: systemPrompt
  };

  try {
    // تایم‌اوت ۸ ثانیه‌ای
    const signal = AbortSignal.timeout(8000);

    const response = await fetch(apiUrl, {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey // روش احراز هویت برای Interactions API
      },
      body: JSON.stringify(requestPayload),
      signal: signal 
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error Response:", data);
      throw new Error(data.error?.message || "خطای ناشناخته در ارتباط با Gemini API");
    }

    // استخراج متن از پاسخ Interactions API
    // ساختار پاسخ ممکن است کمی متفاوت باشد، اما فیلد اصلی متن در parts[0].text قرار دارد
    const resultText = data.candidates[0].content.parts[0].text;
    
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