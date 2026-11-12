"use client";

import { motion } from "framer-motion";
import { ExternalLink, RotateCw } from "lucide-react";

export function LivePreviewFrame({ url }: { url: string }) {
  return (
    <div className="w-full flex flex-col items-center mt-8 relative">
      
      {/* ==================================================================== */}
      {/* 👈 ۱. نمایش در دسکتاپ (فقط گوشی موبایل با طراحی فوق لوکس) */}
      {/* ==================================================================== */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden md:flex flex-col items-center w-full"
      >
        {/* هاله نورانی پشت گوشی */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand/10 rounded-full blur-[100px] -z-10" />

        {/* قاب گوشی آیفون */}
        <div className="relative w-[340px] h-[700px] bg-black rounded-[3.5rem] border-[8px] border-[#2a2a2a] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/10 group">
          
          {/* افکت شیشه‌ای روی صفحه */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none z-30 mix-blend-overlay group-hover:opacity-50 transition-opacity duration-700" />

          {/* داینامیک آیلند */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-40 flex items-center justify-end px-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a] border border-gray-700/50 shadow-inner" />
          </div>

          {/* نوار وضعیت بالای آیفون */}
          <div className="absolute top-4 left-0 right-0 px-6 flex justify-between items-center z-30 text-[11px] font-semibold text-black mix-blend-difference">
            <span>۹:۴۱</span>
            <div className="flex gap-1.5">
              <span>📶</span>
              <span>🔋</span>
            </div>
          </div>

          {/* صفحه نمایش (Iframe) */}
          <iframe
            src={url}
            className="w-full h-full bg-white rounded-[3rem] pt-6"
            sandbox="allow-scripts allow-same-origin"
            title="Mobile Preview"
          />
        </div>
      </motion.div>

      {/* ==================================================================== */}
      {/* 👈 ۲. نمایش در موبایل (لپ‌تاپ با الزام به افقی گرفتن گوشی) */}
      {/* ==================================================================== */}
      <div className="flex md:hidden flex-col items-center w-full relative">
        
        {/* پیام چرخش گوشی (فقط در حالت عمودی دیده می‌شود) */}
        <div className="portrait:flex landscape:hidden fixed inset-0 z-[9999] bg-[#0a0a0a]/95 backdrop-blur-xl flex-col items-center justify-center text-center p-6">
          <motion.div 
            animate={{ rotate: [0, 90, 90, 0] }} 
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="mb-8 p-6 bg-white/5 rounded-full border border-white/10"
          >
            <RotateCw size={48} className="text-brand" />
          </motion.div>
          <h3 className="text-2xl font-bold text-white mb-3">برای تجربه بهتر</h3>
          <p className="text-gray-400 text-sm max-w-[250px] leading-relaxed">
            لطفاً گوشی خود را به صورت افقی بگیرید تا از نمای کامل دسکتاپ لذت ببرید.
          </p>
        </div>

        {/* قاب مک‌بوک (فقط در حالت افقی دیده می‌شود) */}
        <div className="landscape:flex hidden w-full max-w-[95vw] flex-col items-center justify-center pt-4">
          
          <div className="relative w-full aspect-[16/10] bg-[#1a1a1a] rounded-t-xl border-[6px] border-[#2a2a2a] shadow-2xl overflow-hidden">
            {/* نوار بالای مرورگر */}
            <div className="h-6 bg-[#151515] flex items-center px-4 gap-1.5 border-b border-white/5">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            
            {/* Iframe با عرض دسکتاپ و اسکیل شده */}
            <div className="relative w-full h-[calc(100%-24px)] overflow-hidden bg-white">
              <iframe
                src={url}
                className="absolute top-0 left-0 w-[1280px] h-[800px] origin-top-left"
                style={{ transform: "scale(0.6)" }} // اسکیل کردن برای جا شدن در گوشی
                sandbox="allow-scripts allow-same-origin"
                title="Desktop Preview"
              />
            </div>
          </div>
          
          {/* بدنه زیرین مک‌بوک */}
          <div className="relative w-[105%] h-12 bg-gradient-to-b from-[#e0e0e0] to-[#b0b0b0] dark:from-[#2a2a2a] dark:to-[#1a1a1a] rounded-b-xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex flex-col items-center pt-1">
            <div className="absolute -top-1 w-20 h-1.5 bg-[#1a1a1a] dark:bg-[#111] rounded-b-sm" />
            <div className="w-[90%] h-4 bg-[#c0c0c0] dark:bg-[#333] rounded-sm mb-1 shadow-inner" />
            <div className="w-24 h-2 bg-[#c0c0c0] dark:bg-[#333] rounded-sm shadow-inner" />
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* دکمه مشاهده سایت کامل (در هر دو حالت نمایش داده می‌شود) */}
      {/* ==================================================================== */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-12 flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-sm transition-all hover:scale-105 hover:bg-brand hover:text-brand-foreground shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,116,56,0.4)]"
      >
        <span>مشاهده سایت به صورت کامل</span>
        <ExternalLink size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
      </a>
    </div>
  );
}