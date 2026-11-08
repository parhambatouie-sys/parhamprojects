import { NextResponse } from "next/server";
import { reviewArticle } from "@/lib/gemini";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { title, content, action } = await request.json();
    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const resultJson = await reviewArticle(title, content, action);

    return NextResponse.json({
      success: true,
      score: resultJson.score,
      feedback: resultJson.feedback,
      rewritten_title: resultJson.rewritten_title || title,
      rewritten_content: resultJson.rewritten_content || content
    });
  } catch (error: any) {
    console.error("Gemini Review Error:", error);
    return NextResponse.json({ error: error.message || "Failed to review article" }, { status: 500 });
  }
}