"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    // Start animation after component mounts with a small delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="hero" className={`py-12 lg:py-20 relative overflow-hidden transition-colors duration-300 ${
      isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-white'
    }`}>
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* المحتوى النصي على اليمين */}
          <div className={`w-full lg:w-1/2 text-center lg:text-right order-2 lg:order-1 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight transition-all duration-1000 ease-out ${
              isVisible ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-20 scale-95'
            }`}>
              <span className="inline font-bold">منصة </span>
              <span className="inline text-[#00A9E0] font-black" style={{ fontFamily: "var(--font-el-messiri)" }}>حصتي</span>
            </h1>
            
            <h2 className={`text-xl sm:text-2xl lg:text-3xl font-semibold mb-8 leading-relaxed transition-all duration-1000 delay-200 ease-out ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            } ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'
            }`}>
              منصة متكاملة بها كل ما يحتاجه الطالب ليتفوق
            </h2>
            
            {/* أزرار الإجراءات */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-8 transition-all duration-1000 delay-400 ease-out ${
              isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-90'
            }`}>
              <Link
                href="/register"
                className={`font-bold text-lg py-4 px-10 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 ${
                  isDarkMode 
                    ? 'bg-[#00A9E0] text-white hover:bg-[#0090c0]' 
                    : 'bg-[#00A9E0] text-white hover:bg-[#0090c0]'
                }`}
              >
                ابدأ الآن مجاناً
              </Link>
              
              <Link
                href="/login"
                className={`font-semibold text-lg py-4 px-10 rounded-xl transition-all duration-300 hover:scale-105 ${
                  isDarkMode 
                    ? 'border-2 border-[#00A9E0] text-[#00A9E0] hover:bg-[#00A9E0] hover:text-white' 
                    : 'border-2 border-[#00A9E0] text-[#00A9E0] hover:bg-[#00A9E0] hover:text-white'
                }`}
              >
                تسجيل الدخول
              </Link>
            </div>
          </div>

          {/* الصورة على اليسار */}
          <div className={`w-full lg:w-1/2 order-1 lg:order-2 transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-90 -translate-x-20'
          }`}>
            <div className={`relative w-full max-w-2xl mx-auto rounded-2xl overflow-hidden transition-all duration-300 ${
              isDarkMode ? 'shadow-2xl shadow-blue-500/20' : ''
            }`}>
              <Image 
                src="/hero-image.png" 
                alt="منصة سجلاتك التعليمية"
                width={600}
                height={600}
                className={`w-full h-auto transition-all duration-300 ${
                  isDarkMode ? 'brightness-90' : ''
                }`}
                priority
              />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}