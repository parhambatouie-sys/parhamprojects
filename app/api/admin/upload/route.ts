import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

// اجبار به اجرا در محیط Node.js برای سازگاری با @vercel/blob
export const runtime = 'nodejs';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const form = await request.formData();
    const file = form.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'هیچ فایلی ارسال نشده است.' }, { status: 400 });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: 'توکن BLOB_READ_WRITE_TOKEN در تنظیمات ورسل وجود ندارد.' }, { status: 500 });
    }

    const blob = await put(file.name, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json(blob);
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: error.message || 'خطا در آپلود به ورسل' }, { status: 500 });
  }
}