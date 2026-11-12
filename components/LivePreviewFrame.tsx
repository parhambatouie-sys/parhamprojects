"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Smartphone, ExternalLink } from "lucide-react";

export function LivePreviewFrame({ url }: { url: string }) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  return (
    <div className="w-full flex flex-col items-center mt-4">
      {/* دکمه‌های تغییر دستگاه */}
      <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded-full mb-8 border border-white/10">
        <button
          onClick={() => setDevice("desktop")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
            device === "desktop" ? "bg-brand text-brand-foreground shadow-lg" : "text-muted hover:text-foreground"
          }`}
        >
          <Monitor size={16} /> دسکتاپ
        </button>
        <button
          onClick={() => setDevice("mobile")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
            device === "mobile" ? "bg-brand text-brand-foreground shadow-lg" : "text-muted hover:text-foreground"
          }`}
        >
          <Smartphone size={16} /> موبایل
        </button>
      </div>

      {/* قاب دستگاه‌ها */}
      <div className="relative w-full flex justify-center perspective-[2000px]">
        <AnimatePresence mode="wait">
          {device === "desktop" ? (
            <motion.div
              key="desktop"
              initial={{ opacity: 0, y: 20, rotateX: 10 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-5xl"
            >
              {/* مانیتور */}
              <div className="relative bg-[#1e1e1e] rounded-t-2xl border-[8px] border-[#2a2a2a] shadow-2xl overflow-hidden aspect-[16/10]">
                {/* نوار بالای مرورگر */}
                <div className="h-8 bg-[#151515] flex items-center px-4 gap-2 border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  </div>
                  <div className="mx-auto bg-black/50 rounded-md px-4 py-1 text-[10px] text-muted font-mono w-1/2 text-center truncate">
                    {url.replace("https://", "")}
                  </div>
                </div>
                {/* Iframe با sandbox */}
                <iframe
                  src={url}
                  className="w-full h-full bg-[#0a0a0a]"
                  sandbox="allow-scripts allow-same-origin"
                  title="Desktop Preview"
                />
              </div>
              {/* پایه مانیتور */}
              <div className="relative mx-auto w-1/3 h-4 bg-[#2a2a2a] rounded-b-lg shadow-xl" />
              <div className="relative mx-auto w-1/2 h-2 bg-[#1a1a1a] rounded-full shadow-2xl" />
            </motion.div>
          ) : (
            <motion.div
              key="mobile"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative"
            >
              {/* گوشی موبایل */}
              <div className="relative w-[320px] h-[650px] bg-[#0a0a0a] rounded-[3rem] border-[12px] border-[#2a2a2a] shadow-2xl overflow-hidden">
                {/* داینامیک آیلند */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20" />
                {/* Iframe */}
                <iframe
                  src={url}
                  className="w-full h-full bg-white pt-8"
                  sandbox="allow-scripts allow-same-origin"
                  title="Mobile Preview"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* دکمه مشاهده سایت کامل */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-12 flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-sm transition-all hover:scale-105 hover:bg-brand hover:text-brand-foreground"
      >
        <span>مشاهده سایت به صورت کامل</span>
        <ExternalLink size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
      </a>
    </div>
  );
}