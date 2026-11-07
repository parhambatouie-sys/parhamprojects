import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const groq = process.env.GROQ_API_KEY;

  return NextResponse.json({
    has_token: !!token,
    token_start: token ? token.substring(0, 5) + "..." : "خالی است!",
    has_chat_id: !!chatId,
    chat_id_value: chatId || "خالی است!",
    has_groq: !!groq,
  });
}