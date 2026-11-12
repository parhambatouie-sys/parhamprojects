"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, RotateCw, ArrowRight } from "lucide-react";

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

  // 👈 اگر کاربر دکمه "ادامه در حالت عمودی" رو زد، فقط توضیحات و دکمه رو نشون بده
  if (forcePortrait) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white/[0.02] border border-white/5 rounded-3xl my-12">
        <h3 className="text-2xl font-bold mb-4 text-foreground">پیش‌نمایش زنده در حالت عمودی</h3>
        <p className="text-muted mb-8 max-w-md leading-relaxed text-sm">
          برای مشاهده دموی زنده، لطفاً دستگاه خود را به حالت افقی ببرید. یا از دکمه زیر برای مشاهده وب‌سایت کامل در یک تب جدید استفاده کنید.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 bg-brand text-brand-foreground px-8 py-4 rounded-full font-bold text-sm transition-all hover:scale-105 shadow-xl"
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
      {/* 👈 ۱. نمایش در دسکتاپ */}
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
              className="w-full h-full bg-white rounded-[2.5rem] pt-4"
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
      {/* 👈 ۲. نمایش در موبایل */}
      {/* ==================================================================== */}
      <div className="flex md:hidden flex-col w-full relative">
        
        {/* هشدار چرخش گوشی (با کلاس landscape:hidden خودکار محو میشه) */}
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
                لطفاً گوشی خود را به صورت افقی بگیرید تا از نمای کامل دسکتاپ لذت ببرید.
              </p>

              <div className="flex flex-col gap-3 w-full max-w-[280px]">
                {/* دکمه چرخش خودکار حذف شد */}
                <button 
                  onClick={() => setForcePortrait(true)}
                  className="w-full bg-white/10 text-white py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
                >
                  ادامه در حالت عمودی
                </button>
                <button 
                  onClick={() => {
                    const element = document.getElementById("project-details");
                    if (element) element.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full bg-transparent text-gray-400 py-2 rounded-xl text-sm mt-4 hover:text-white flex items-center justify-center gap-2"
                >
                  <ArrowRight size={16} className="rotate-180" /> بازگشت به توضیحات
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* لپ‌تاپ (فقط وقتی گوشی افقی باشه نمایش داده میشه) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="w-full flex-col items-center justify-center pt-4 px-2 landscape:flex hidden"
        >
          <div className="relative w-full max-w-4xl aspect-[16/10] bg-[#1a1a1a] rounded-t-xl border-[4px] border-[#2a2a2a] shadow-2xl overflow-hidden">
            <div className="h-5 bg-[#151515] flex items-center px-3 gap-1.5 border-b border-white/5">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            
            {/* اسکیل کردن دسکتاپ برای جا شدن در صفحه افقی */}
            <div className="relative w-full h-[calc(100%-20px)] overflow-hidden bg-white">
              <iframe
                src={url}
                className="absolute top-0 left-0 w-[1280px] h-[800px] origin-top-left"
                style={{ transform: "scale(0.45)" }}
                sandbox="allow-scripts allow-same-origin"
                title="Desktop Preview"
              />
            </div>
          </div>
          
          {/* بدنه زیرین مک‌بوک */}
          <div className="relative w-full max-w-4xl h-8 bg-gradient-to-b from-[#e0e0e0] to-[#b0b0b0] dark:from-[#2a2a2a] dark:to-[#1a1a1a] rounded-b-xl shadow-[0_10px_20px_rgba(0,0,0,0.5)] flex flex-col items-center pt-1">
            <div className="absolute -top-1 w-16 h-1 bg-[#1a1a1a] dark:bg-[#111] rounded-b-sm" />
            <div className="w-[90%] h-2 bg-[#c0c0c0] dark:bg-[#333] rounded-sm mb-1 shadow-inner" />
            <div className="w-16 h-1.5 bg-[#c0c0c0] dark:bg-[#333] rounded-sm shadow-inner" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}