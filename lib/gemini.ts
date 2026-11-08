export async function reviewArticle(title: string, content: string, action: "review" | "rewrite") {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in Vercel Environment Variables");
  }

  const isRewrite = action === "rewrite";
  
  const systemPrompt = `You are an expert SEO editor-in-chief. 
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
    Content: ${content}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const payload = {
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
      temperature: 0.3,
      responseMimeType: "application/json"
    }
  };

  // 👈 بسیار مهم: متد درخواست باید حتماً POST باشد
  const response = await fetch(url, {
    method: "POST", 
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Gemini Error Data:", data);
    throw new Error(data.error?.message || "Gemini API Error");
  }

  const resultText = data.candidates[0].content.parts[0].text;
  
  // پاکسازی خروجی از تگ‌های مارک‌داون احتمالی که مدل ممکن است برگرداند
  let cleanText = resultText.trim();
  if (cleanText.startsWith("```json")) {
    cleanText = cleanText.replace(/^```json\n/, "").replace(/\n```$/, "");
  } else if (cleanText.startsWith("```")) {
    cleanText = cleanText.replace(/^```\n/, "").replace(/\n```$/, "");
  }

  return JSON.parse(cleanText);
}