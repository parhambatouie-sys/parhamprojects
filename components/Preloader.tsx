"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // لودینگ بعد از ۳ ثانیه محو میشه
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] bg-[#0a0a0a] flex items-center justify-center overflow-hidden"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            
            {/* 👈 ۱. لایه امضا (بسیار محو و بزرگ در پس‌زمینه) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.2, scale: 1 }} // 👈 کم‌رنگ شد (از 0.7 به 0.2)
              transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
              className="absolute w-[95vw] max-w-[1000px] h-[70vh] mix-blend-screen pointer-events-none"
            >
              <Image 
                src="/signaturennn.png" // 👈 اگر اسم عکست فرق داره اینجا عوضش کن
                alt="Signature Background" 
                fill 
                className="object-contain object-center" // 👈 افکت نور نارنجی دورش حذف شد
              />
            </motion.div>

            {/* 👈 ۲. لایه متن‌ها (دقیقاً روی امضا) */}
            <div className="relative z-10 flex flex-col items-center justify-center w-full px-4">
              
              {/* اسم (Parham) */}
              <div className="overflow-hidden mb-2 md:mb-4">
                <motion.h1 
                  initial={{ y: 80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="text-6xl sm:text-7xl md:text-9xl font-serif text-white tracking-[0.1em] uppercase drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Parham
                </motion.h1>
              </div>

              {/* خط جداکننده نارنجی درخشان */}
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                transition={{ duration: 1.2, delay: 1.2, ease: "easeInOut" }}
                className="h-[2px] md:h-[3px] bg-[#FF7438] mb-4 md:mb-6 w-full max-w-[250px] md:max-w-[500px] shadow-[0_0_20px_#FF7438]"
              />

              {/* فامیلی (Batouie) */}
              <div className="overflow-hidden">
                <motion.p 
                  initial={{ y: -40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 1, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  className="text-xs sm:text-sm md:text-2xl font-sans text-gray-400 tracking-[0.6em] md:tracking-[0.8em] uppercase drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]"
                >
                  Batouie
                </motion.p>
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}