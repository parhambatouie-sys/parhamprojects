"use client";

import { useState, ChangeEvent } from "react";

export function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    // خواندن فایل عکس
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // فشرده‌سازی عکس با استفاده از Canvas
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800; // حداکثر عرض عکس
        const scale = MAX_WIDTH / img.width;
        
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        // تبدیل به فرمت Base64 با کیفیت ۷۰٪ (حجم را بسیار کم می‌کند)
        const base64String = canvas.toDataURL("image/jpeg", 0.7);
        
        onUpload(base64String); // ارسال به فرم
        setUploading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-muted">آپلود تصویر (فشرده‌سازی خودکار)</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="text-sm text-foreground file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-brand/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand hover:file:bg-brand/20 disabled:opacity-50"
      />
      {uploading && <span className="text-xs text-brand animate-pulse">در حال پردازش عکس...</span>}
    </div>
  );
}