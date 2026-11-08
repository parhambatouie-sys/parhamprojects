export async function reviewArticle(title: string, content: string, action: "review" | "rewrite") {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing in Vercel");

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

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
      generationConfig: { temperature: 0.3, responseMimeType: "application/json" }
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Gemini API Error");

  return JSON.parse(data.candidates[0].content.parts[0].text);
}