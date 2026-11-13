"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

export function ProjectPreview({ 
  url, 
  title, 
  description,
  imageUrl
}: { 
  url: string; 
  title: string; 
  description: string; 
  imageUrl?: string;
}) {
  return (
    <div className="w-full relative py-12">
      
      {/* ==================================================================== */}
      {/* 👈 ۱. نمایش در دسکتاپ (قاب مرورگر زنده و توضیحات کنارش) */}
      {/* ==================================================================== */}
      <div className="hidden md:grid grid-cols-2 gap-12 items-center w-full max-w-6xl mx-auto">
        
        {/* سمت راست: قاب مرورگر زنده */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full aspect-[16/10] bg-[#1a1a1a] rounded-xl border border-white/10 shadow-2xl overflow-hidden group"
        >
          {/* نوار بالای مرورگر */}
          <div className="h-8 bg-[#151515] flex items-center px-4 gap-2 border-b border-white/5">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
            <div className="mx-auto bg-black/50 rounded-md px-4 py-1 text-[10px] text-gray-400 font-mono w-1/2 text-center truncate">
              {url.replace("https://", "")}
            </div>
          </div>
          
          {/* Iframe زنده */}
          <div className="relative w-full h-[calc(100%-32px)] overflow-hidden bg-white">
            <iframe
              src={url}
              className="w-full h-full border-none"
              sandbox="allow-scripts allow-same-origin"
              title="Desktop Preview"
            />
          </div>
        </motion.div>

        {/* سمت چپ: توضیحات و دکمه */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="flex flex-col items-start text-right pr-4"
        >
          <span className="text-brand font-bold tracking-widest text-xs mb-4 uppercase">LIVE PREVIEW</span>
          <h2 className="text-3xl lg:text-4xl font-bold font-serif mb-6 leading-tight text-foreground">
            {title}
          </h2>
          <p className="text-muted text-base leading-relaxed mb-10 max-w-md">
            {description}
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
        </motion.div>
      </div>

      {/* ==================================================================== */}
      {/* 👈 ۲. نمایش در موبایل (بدون پیش‌نمایش زنده، فقط عکس و دکمه) */}
      {/* ==================================================================== */}
      <div className="flex md:hidden flex-col w-full space-y-6 px-4">
        
        {/* اگر عکسی وجود داشت، نمایش بده */}
        {imageUrl && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-lg relative"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          </motion.div>
        )}

        {/* توضیحات و دکمه */}
        <div className="flex flex-col items-start text-right">
          <h2 className="text-2xl font-bold font-serif mb-3 text-foreground">
            {title}
          </h2>
          <p className="text-muted text-sm leading-relaxed mb-6">
            {description}
          </p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-brand text-brand-foreground px-6 py-4 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg"
          >
            <span>مشاهده وب‌سایت کامل</span>
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}