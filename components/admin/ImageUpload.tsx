"use client";

import { useState } from "react";

export function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      
      const data = await res.json();
      onUpload(data.url); // ارسال لینک عکس آپلود شده به فرم
    } catch (error) {
      alert("خطا در آپلود تصویر");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-muted">آپلود تصویر</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="text-sm text-foreground file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-brand/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand hover:file:bg-brand/20 disabled:opacity-50"
      />
      {uploading && <span className="text-xs text-brand animate-pulse">در حال آپلود...</span>}
    </div>
  );
}