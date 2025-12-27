'use client';

import { useEffect, useState, useRef } from "react";
import { DocumentIcon, UsersIcon, BookIcon, ChartIcon } from "@/components/icons/Icons";

export default function HowItWorks() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
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
    <section ref={sectionRef} id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4">
<div className={`flex flex-col items-center justify-center mb-16 transition-all duration-1000 ${
  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
}`}>
  {/* Title */}
  <h2 className="relative text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
    <span className="text-gray-900">كيف تعمل . </span>
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
            
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
                <div className="bg-white rounded-lg p-4 md:p-6 h-full border border-gray-200 hover:border-primary-500 hover:shadow-lg hover:scale-105 hover:rotate-1 transition-all duration-300">
                  {/* Step Number */}
                  <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary-600 text-white text-base md:text-lg font-bold mb-4 md:mb-6 mx-auto">
                    {item.step}
                  </div>
                  
                  {/* Content */}
                  <div className="text-center">
                    {/* Icon Container */}
                    <div className="flex justify-center mb-3 md:mb-4">
                      <div className="text-primary-600">
                        {item.icon}
                      </div>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-base md:text-xl font-bold mb-2 md:mb-3 text-gray-900">
                      {item.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className={`text-center mt-16 pt-12 border-t border-gray-200 transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              جاهز للبدء؟
            </h3>
            <p className="text-base text-gray-600 max-w-xl mx-auto mb-8">
              انضم إلى المعلمين وأولياء الأمور الذين يستخدمون منصتنا
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="/register"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors duration-300"
              >
                ابدأ الآن
              </a>
              
              <a
                href="#features"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-primary-600 bg-white border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-colors duration-300"
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