// ============================================================================
// تابع ارتباط با Google Gemini API (با تایم‌اوت و مدل جایگزین اصلاح‌شده)
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

  // 👈 مدل‌هایی که به ترتیب امتحان می‌شوند (مدل دوم اصلاح شد)
  const modelsToTry = ["gemini-3.8-flash", "gemini-3-flash-preview"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      console.log(`Trying Gemini model: ${model}`);
      
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      // ایجاد یک تایم‌اوت ۱۰ ثانیه‌ای برای هر مدل
      const signal = AbortSignal.timeout(10000);

      const response = await fetch(apiUrl, {
        method: "POST", 
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestPayload),
        signal: signal
      });

      const data = await response.json();

      if (response.ok) {
        // اگر مدل جواب داد، متن را استخراج و برمی‌گردانیم
        const resultText = data.candidates[0].content.parts[0].text;
        let cleanText = resultText.trim();
        
        if (cleanText.startsWith("```json")) {
          cleanText = cleanText.replace(/^```json\n/, "").replace(/\n```$/, "");
        } else if (cleanText.startsWith("```")) {
          cleanText = cleanText.replace(/^```\n/, "").replace(/\n```$/, "");
        }
        
        return JSON.parse(cleanText);
      } else {
        // اگر خطا داد (مثل شلوغی یا نبود مدل)
        console.warn(`Model ${model} failed:`, data.error?.message);
        lastError = new Error(data.error?.message || "Gemini API Error");
      }

    } catch (error: any) {
      console.warn(`Error with model ${model}:`, error.message);
      if (error.name === "TimeoutError" || error.name === "AbortError") {
        lastError = new Error("سرورهای گوگل پاسخ ندادند (بیش از ۱۰ ثانیه).");
      } else {
        lastError = error;
      }
    }
  }

  // اگر هر دو مدل خطا دادند، خطای آخر را پرتاب می‌کنیم
  throw lastError;
}