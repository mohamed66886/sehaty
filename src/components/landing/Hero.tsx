"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { TeacherIcon, StudentIcon, ParentIcon, AdminIcon } from "@/components/icons/Icons";
import { motion } from "framer-motion";

export default function ModernHero() {
  const [activeCard, setActiveCard] = useState<number | null>(null);

  return (
    <section id="hero" className="min-h-[85vh] bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center relative overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-primary-400/10 blur-3xl animate-pulse" style={{animationDelay: "1s"}}></div>
        <div className="absolute top-3/4 left-1/2 w-48 h-48 rounded-full bg-white/5 blur-3xl animate-pulse" style={{animationDelay: "2s"}}></div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-center">
          {/* محتوى نصي */}
          <motion.div 
            className="text-white w-full text-center lg:text-right lg:w-1/2 order-2 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="mb-4 lg:mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-xs sm:text-sm font-medium mb-4">
                🎓 الحل التعليمي الأمثل للمراكز التعليمية
              </span>
            </motion.div>

            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold mb-4 lg:mb-5 leading-tight px-4 lg:px-0"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <span className="block mb-2 text-white/95">منصة</span>
              <span className="block bg-gradient-to-l from-white via-primary-50 to-white bg-clip-text text-transparent drop-shadow-lg">
                حصتي التعليمية
              </span>
            </motion.h1>
            
            <motion.h2 
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-5 lg:mb-6 leading-snug text-white/90 px-4 lg:px-0"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              نظام إدارة تعليمي متكامل ومتطور
            </motion.h2>
            
            <motion.div 
              className="space-y-4 mb-6 lg:mb-8 max-w-2xl mx-auto lg:mx-0 lg:ml-auto px-4 lg:px-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <p className="text-base sm:text-lg leading-relaxed text-white/85">
                منصة متكاملة تربط بين جميع عناصر العملية التعليمية - المعلمين، الطلاب، أولياء الأمور، والإدارة - في بيئة رقمية احترافية وآمنة.
              </p>
              <div className="flex flex-wrap gap-2.5 sm:gap-3 justify-center lg:justify-start">
                <span className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white/15 backdrop-blur-sm rounded-full text-xs sm:text-sm border border-white/20 text-center whitespace-nowrap">
                  ✓ متابعة الحضور والانصراف
                </span>
                <span className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white/15 backdrop-blur-sm rounded-full text-xs sm:text-sm border border-white/20 text-center whitespace-nowrap">
                  ✓ إدارة الواجبات والاختبارات
                </span>
                <span className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white/15 backdrop-blur-sm rounded-full text-xs sm:text-sm border border-white/20 text-center whitespace-nowrap">
                  ✓ تقارير شاملة ومفصلة
                </span>
              </div>
            </motion.div>
            
            {/* أزرار الإجراءات */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center lg:justify-start px-4 lg:px-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Link
                href="/register"
                className="group relative bg-white text-primary-700 font-bold text-center text-base sm:text-lg py-3.5 sm:py-4 px-8 sm:px-12 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>ابدأ الآن مجاناً</span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </span>
              </Link>
              
              <Link
                href="/login"
                className="group relative border-2 border-white/70 text-white hover:bg-white hover:text-primary-700 font-semibold text-center text-base sm:text-lg py-3.5 sm:py-4 px-8 sm:px-12 rounded-lg backdrop-blur-sm transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>تسجيل الدخول</span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                  </svg>
                </span>
              </Link>
            </motion.div>
          </motion.div>

          {/* تصميم البطاقات */}
          <motion.div 
            className="w-full lg:w-1/2 order-1 lg:order-2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* تصميم للشاشات الكبيرة */}
            <div className="hidden lg:block relative">
              <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/30">
                
                <div className="grid grid-cols-2 gap-5 relative z-10">
                  {[
                    { id: 1, title: "المعلمين", icon: TeacherIcon, color: "from-blue-600 to-blue-500", desc: "إدارة الحصص والدروس بكفاءة" },
                    { id: 2, title: "الطلاب", icon: StudentIcon, color: "from-emerald-600 to-emerald-500", desc: "متابعة التقدم الدراسي" },
                    { id: 3, title: "أولياء الأمور", icon: ParentIcon, color: "from-amber-600 to-amber-500", desc: "تواصل مباشر وفعّال" },
                    { id: 4, title: "الإدارة", icon: AdminIcon, color: "from-purple-600 to-purple-500", desc: "تحكم كامل بالمركز" },
                  ].map((item) => (
                    <motion.div
                      key={item.id}
                      className={`relative overflow-hidden bg-white rounded-xl p-6 text-center cursor-pointer transition-all duration-300 border-2 ${
                        activeCard === item.id ? "scale-105 shadow-2xl border-white" : "shadow-lg border-gray-100"
                      } hover:scale-105 hover:shadow-xl`}
                      onMouseEnter={() => setActiveCard(item.id)}
                      onMouseLeave={() => setActiveCard(null)}
                      whileHover={{ y: -8 }}
                    >
                      
                      {/* أيقونة */}
                      <div className="flex justify-center mb-4">
                        <div className={`p-4 rounded-xl bg-gradient-to-br ${item.color} shadow-md`}>
                          <item.icon className="w-12 h-12 text-white" />
                        </div>
                      </div>
                      
                      {/* العنوان */}
                      <div className="text-gray-900 font-bold text-xl mb-2">{item.title}</div>
                      
                      {/* الوصف */}
                      <div className="text-gray-600 text-sm leading-relaxed h-12 flex items-center justify-center px-2">
                        {item.desc}
                      </div>
                      
                      {/* خط سفلي عند التفاعل */}
                      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color} transition-all duration-300 ${
                        activeCard === item.id ? "opacity-100" : "opacity-0"
                      }`}></div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* عناصر زخرفية هادئة */}
              <motion.div 
                className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/30"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              ></motion.div>
              <motion.div 
                className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/30"
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
              ></motion.div>
            </div>
            
            {/* تصميم للموبايل - مخفي لأن المحتوى النصي يظهر للجميع */}
            <div className="hidden lg:block">
              {/* محتوى فارغ - البطاقات تظهر فقط على الشاشات الكبيرة */}
            </div>
          </motion.div>
        </div>
        
        {/* مؤشر التمرير للأسفل */}
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 hidden lg:block"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <div className="flex flex-col items-center text-white/70">
            <span className="text-sm font-medium mb-2">استكشف المزيد</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-full p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}