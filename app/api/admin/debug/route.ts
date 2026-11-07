import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  
  return NextResponse.json({
    hasToken: !!token,
    tokenStart: token ? token.substring(0, 10) + "..." : "توکن پیدا نشد!",
    env: process.env.NODE_ENV
  });
}