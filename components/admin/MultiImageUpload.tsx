"use client";

import { useState, ChangeEvent } from "react";

export function MultiImageUpload({ onUpload }: { onUpload: (urls: string[]) => void }) {
  const [uploading, setUploading] = useState(false);
  const [count, setCount] = useState(0);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const base64Images: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 1200; // ابعاد بزرگ‌تر برای گالری
            const scale = MAX_WIDTH / img.width;
            canvas.width = MAX_WIDTH;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/jpeg", 0.6)); // فشرده‌سازی
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
      
      base64Images.push(base64);
    }

    onUpload(base64Images);
    setCount(base64Images.length);
    setUploading(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-muted">آپلود گالری تصاویر (چند عکس)</label>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        disabled={uploading}
        className="text-sm text-foreground file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-brand/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand hover:file:bg-brand/20 disabled:opacity-50"
      />
      {uploading && <span className="text-xs text-brand animate-pulse">در حال پردازش عکس‌ها...</span>}
      {count > 0 && !uploading && <span className="text-xs text-green-400">{count} عکس اضافه شد.</span>}
    </div>
  );
}