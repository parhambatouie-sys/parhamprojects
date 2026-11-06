import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const form = await request.formData();
    const file = form.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'هیچ فایلی ارسال نشده است.' }, { status: 400 });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'توکن BLOB_READ_WRITE_TOKEN در تنظیمات ورسل وجود ندارد.' }, { status: 500 });
    }

    // اتصال مستقیم به API ورسل بدون نیاز به پکیج
    const response = await fetch(`https://blob.vercel-storage.com/${encodeURIComponent(file.name)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-api-version': '7',
        'x-content-type': file.type,
        'x-add-random-suffix': '1',
      },
      body: file,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vercel API Error:', errorText);
      throw new Error(`خطای ورسل: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json({ url: data.url });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: error.message || 'خطا در آپلود به ورسل' }, { status: 500 });
  }
}