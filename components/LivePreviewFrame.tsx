"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, RotateCw } from "lucide-react";

export function LivePreviewFrame({ 
  url, 
  title, 
  description 
}: { 
  url: string; 
  title?: string; 
  description?: string; 
}) {
  const [showPortraitWarning, setShowPortraitWarning] = useState(true);
  const [forcePortrait, setForcePortrait] = useState(false);

  // 👈 حالت ۱: وقتی کاربر دکمه "ادامه در حالت عمودی" رو میزنه
  if (forcePortrait) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-white/[0.02] border border-white/5 rounded-3xl my-8 max-w-md mx-auto">
        <h3 className="text-xl font-bold mb-3 text-foreground">پیش‌نمایش وب‌سایت</h3>
        <p className="text-muted mb-8 leading-relaxed text-sm">
          برای مشاهده دموی زنده در این صفحه، گوشی خود را افقی کنید. یا از دکمه زیر برای مشاهده کامل سایت استفاده کنید.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 bg-brand text-brand-foreground px-8 py-3.5 rounded-full font-bold text-sm transition-all hover:scale-105 shadow-xl w-full justify-center"
        >
          <span>مشاهده وب‌سایت کامل</span>
          <ExternalLink size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </a>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      
      {/* ==================================================================== */}
      {/* 👈 حالت ۲: نمایش در دسکتاپ */}
      {/* ==================================================================== */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden md:grid grid-cols-2 gap-16 items-center w-full max-w-6xl mx-auto py-12"
      >
        {/* سمت راست: گوشی مینیمال */}
        <div className="flex justify-center relative perspective-[1000px]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-brand/10 rounded-full blur-[80px] -z-10" />
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="relative w-[320px] h-[660px] bg-[#0a0a0a] rounded-[3rem] border-[6px] border-[#1a1a1a] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/10"
          >
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-40" />
            <iframe
              src={url}
              // 👈 مخفی کردن اسکرول‌بار داخل گوشی
              className="w-full h-full bg-white rounded-[2.5rem] pt-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
              scrolling="no"
              sandbox="allow-scripts allow-same-origin"
              title="Mobile Preview"
            />
          </motion.div>
        </div>

        {/* سمت چپ: توضیحات و دکمه */}
        <div className="flex flex-col items-start text-right pr-8">
          <span className="text-brand font-bold tracking-widest text-sm mb-4">LIVE PREVIEW</span>
          <h2 className="text-3xl md:text-5xl font-bold font-serif mb-6 leading-tight text-foreground">
            {title || "پیش‌نمایش زنده پروژه"}
          </h2>
          <p className="text-muted text-lg leading-relaxed mb-10 max-w-md">
            {description || "این پروژه با استفاده از جدیدترین تکنولوژی‌های وب طراحی و توسعه داده شده است."}
          </p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-sm transition-all hover:scale-105 hover:bg-brand hover:text-brand-foreground shadow-xl"
          >
            <span>مشاهده وب‌سایت کامل</span>
            <ExternalLink size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </a>
        </div>
      </motion.div>

      {/* ==================================================================== */}
      {/* 👈 حالت ۳: نمایش در موبایل */}
      {/* ==================================================================== */}
      <div className="flex md:hidden flex-col w-full relative">
        
        {/* هشدار چرخش گوشی (فقط در حالت عمودی) */}
        <AnimatePresence>
          {showPortraitWarning && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-[#0a0a0a]/95 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6 landscape:hidden"
            >
              <motion.div 
                animate={{ rotate: [0, 90, 90, 0] }} 
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="mb-8 p-6 bg-white/5 rounded-full border border-white/10"
              >
                <RotateCw size={48} className="text-brand" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-3">برای تجربه بهتر</h3>
              <p className="text-gray-400 text-sm max-w-[250px] leading-relaxed mb-10">
                لطفاً گوشی خود را به صورت افقی بگیرید تا نمای کامل دسکتاپ را ببینید.
              </p>

              <div className="flex flex-col gap-3 w-full max-w-[280px]">
                <button 
                  onClick={() => setForcePortrait(true)}
                  className="w-full bg-white/10 text-white py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
                >
                  ادامه در حالت عمودی
                </button>
                {/* 👈 دکمه بازگشت به توضیحات حذف شد */}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 👈 حالت افقی موبایل: نمایش دسکتاپ تمام‌صفحه بدون قاب گوشی */}
        <div className="hidden landscape:fixed landscape:inset-0 landscape:z-[9998] landscape:bg-[#0a0a0a] landscape:flex landscape:w-screen landscape:h-screen landscape:flex-col">
            <iframe
              src={url}
              // مقیاس دهی به سایت دسکتاپ برای جا شدن در صفحه افقی گوشی
              className="w-[1280px] h-[800px] origin-top-left"
              style={{ transform: "scale(0.45)" }} 
              sandbox="allow-scripts allow-same-origin"
              title="Desktop Full Preview"
            />
        </div>
      </div>
    </div>
  );
}