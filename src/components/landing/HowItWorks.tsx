'use client';

import { useEffect, useState, useRef } from "react";
import { DocumentIcon, UsersIcon, BookIcon, ChartIcon } from "@/components/icons/Icons";
import { useTheme } from "@/contexts/ThemeContext";

export default function HowItWorks() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const { isDarkMode } = useTheme();
  const steps = [
    {
      step: "1",
      icon: <DocumentIcon className="w-10 h-10 md:w-12 md:h-12" />,
      title: "إنشاء حساب",
      description: "سجل كمعلم أو ولي أمر وأنشئ حسابك في دقائق"
    },
    {
      step: "2",
      icon: <UsersIcon className="w-10 h-10 md:w-12 md:h-12" />,
      title: "إضافة الطلاب",
      description: "أضف بيانات الطلاب وربطهم بالمعلمين وأولياء الأمور"
    },
    {
      step: "3",
      icon: <BookIcon className="w-10 h-10 md:w-12 md:h-12" />,
      title: "إدارة الدراسة",
      description: "سجل الحضور والواجبات والنتائج بشكل منظم"
    },
    {
      step: "4",
      icon: <ChartIcon className="w-10 h-10 md:w-12 md:h-12" />,
      title: "متابعة التقدم",
      description: "تابع التقدم الأكاديمي من خلال التقارير والإحصائيات"
    }
  ];

  // Intersection Observer for scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
        });
      },
      { 
        threshold: 0.3,
        rootMargin: '-50px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} id="how-it-works" className={`py-20 transition-colors duration-300 ${
      isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-white'
    }`}>
      <div className="container mx-auto px-4">
<div className={`flex flex-col items-center justify-center mb-16 transition-all duration-1000 ${
  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
}`}>
  {/* Title */}
  <h2 className="relative text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
    <span className={`transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>كيف تعمل . </span>
    <span className="text-sky-500">المنصة؟</span>


  </h2>

  {/* Curve */}
  <svg
    className="mt-4 w-full max-w-[280px] sm:max-w-[350px] md:max-w-[420px]"
    height="40"
    viewBox="0 0 420 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
  >
    <path
      d="M10 30 C 140 5, 280 5, 410 30"
      stroke="#5BB6E8"
      strokeWidth="5"
      strokeLinecap="round"
      className={`transition-all duration-1000 delay-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        strokeDasharray: isVisible ? '0' : '1000',
        strokeDashoffset: isVisible ? '0' : '1000',
      }}
    />
  </svg>
            
          <p className={`text-lg max-w-2xl mx-auto transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            ابدأ استخدام المنصة في 4 خطوات بسيطة
          </p>
</div>


        {/* Steps Section */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {steps.map((item, index) => (
              <div 
                key={index} 
                className={`relative transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0 scale-100 rotate-0' : 'opacity-0 translate-y-10 scale-50 rotate-12'
                }`}
                style={{ 
                  transitionDelay: `${index * 150}ms`,
                  transformOrigin: 'center center'
                }}
              >
                {/* Step Card */}
                <div className={`rounded-lg p-4 md:p-6 h-full border hover:shadow-lg hover:scale-105 hover:rotate-1 transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-slate-800 border-slate-700 hover:border-sky-500 hover:bg-slate-700 shadow-blue-500/10' 
                    : 'bg-white border-gray-200 hover:border-primary-500'
                }`}>
                  {/* Step Number */}
                  <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full text-white text-base md:text-lg font-bold mb-4 md:mb-6 mx-auto transition-colors duration-300 ${
                    isDarkMode ? 'bg-sky-600' : 'bg-primary-600'
                  }`}>
                    {item.step}
                  </div>
                  
                  {/* Content */}
                  <div className="text-center">
                    {/* Icon Container */}
                    <div className="flex justify-center mb-3 md:mb-4">
                      <div className={`transition-colors duration-300 ${
                        isDarkMode ? 'text-sky-400' : 'text-primary-600'
                      }`}>
                        {item.icon}
                      </div>
                    </div>
                    
                    {/* Title */}
                    <h3 className={`text-base md:text-xl font-bold mb-2 md:mb-3 transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {item.title}
                    </h3>
                    
                    {/* Description */}
                    <p className={`text-xs md:text-sm leading-relaxed transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className={`text-center mt-16 pt-12 border-t transition-all duration-1000 delay-700 ${
            isDarkMode ? 'border-slate-700' : 'border-gray-200'
          } ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h3 className={`text-2xl font-bold mb-3 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              جاهز للبدء؟
            </h3>
            <p className={`text-base max-w-xl mx-auto mb-8 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              انضم إلى المعلمين وأولياء الأمور الذين يستخدمون منصتنا
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="/register"
                className={`inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white rounded-lg transition-colors duration-300 ${
                  isDarkMode ? 'bg-sky-600 hover:bg-sky-700' : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                ابدأ الآن
              </a>
              
              <a
                href="#features"
                className={`inline-flex items-center justify-center px-8 py-3 text-base font-semibold border-2 rounded-lg transition-colors duration-300 ${
                  isDarkMode 
                    ? 'text-sky-400 bg-slate-800 border-sky-500 hover:bg-slate-700' 
                    : 'text-primary-600 bg-white border-primary-600 hover:bg-primary-50'
                }`}
              >
                اعرف المزيد
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}