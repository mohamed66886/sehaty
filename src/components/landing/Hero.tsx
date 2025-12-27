"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Start animation after component mounts with a small delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="hero" className="bg-white py-12 lg:py-20 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* المحتوى النصي على اليمين */}
          <div className="text-gray-900 w-full lg:w-1/2 text-center lg:text-right order-2 lg:order-1">
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight transition-all duration-1000 ease-out ${
              isVisible ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-20 scale-95'
            }`}>
              <span className="inline font-bold">منصة </span>
              <span className="inline text-[#00A9E0] font-black" style={{ fontFamily: "var(--font-el-messiri)" }}>حصتي</span>
            </h1>
            
            <h2 className={`text-xl sm:text-2xl lg:text-3xl font-semibold mb-8 leading-relaxed text-gray-700 transition-all duration-1000 delay-200 ease-out ${
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
                className="bg-[#00A9E0] text-white font-bold text-lg py-4 px-10 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                ابدأ الآن مجاناً
              </Link>
              
              <Link
                href="/login"
                className="border-2 border-[#00A9E0] text-[#00A9E0] hover:bg-[#00A9E0] hover:text-white font-semibold text-lg py-4 px-10 rounded-xl transition-all duration-300 hover:scale-105"
              >
                تسجيل الدخول
              </Link>
            </div>
          </div>

          {/* الصورة على اليسار */}
          <div className={`w-full lg:w-1/2 order-1 lg:order-2 transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-90 -translate-x-20'
          }`}>
            <div className="relative w-full max-w-2xl mx-auto">
              <Image 
                src="/hero-image.png" 
                alt="منصة سجلاتك التعليمية"
                width={600}
                height={600}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}