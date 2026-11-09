// ============================================================================
// تابع ارتباط با Google Gemini API برای بررسی و بازنویسی مقالات
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

  // آدرس جدید با مدل 3.8-flash و متد generateContent
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

  const requestPayload = {
    contents: [
      {
        role: "user",
        parts: [{ text: systemPrompt }]
      }
    ],
    generationConfig: {
      temperature: 0.3
    }
  };

  const maxRetries = 1;
  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // 👈 افزایش زمان صبر از ۸ ثانیه به ۲۵ ثانیه
      const signal = AbortSignal.timeout(25000);

      const response = await fetch(apiUrl, {
        method: "POST", 
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestPayload),
        signal: signal 
      });

      const data = await response.json();

      // اگر گوگل گفت شلوغ هستم (503) یا درخواست زیاد دادی (429)، یک بار دیگر تلاش کن
      if (response.status === 503 || response.status === 429) {
        console.warn(`گوگل شلوغ است (${response.status})، تلاش مجدد... (تلاش ${attempt + 1} از ${maxRetries + 1})`);
        lastError = new Error(data.error?.message || "سرورهای گوگل شلوغ هستند، لطفاً کمی بعد دوباره تلاش کنید.");
        await new Promise(resolve => setTimeout(resolve, 2000)); // ۲ ثانیه صبر کن
        continue;
      }

      if (!response.ok) {
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
      lastError = error;
      if (error.name === "TimeoutError" || error.name === "AbortError") {
        console.warn(`پاسخ گوگل طول کشید (بیش از ۲۵ ثانیه)، تلاش مجدد... (تلاش ${attempt + 1} از ${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}