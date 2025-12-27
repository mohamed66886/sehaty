'use client';

import { useEffect, useState, useRef } from "react";
import { ChartIcon, BellIcon, LockIcon, MobileIcon, CheckIcon, NoteIcon, TrendingUpIcon, ChatIcon, TargetIcon } from "@/components/icons/Icons";

export default function Features() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const features = [
    {
      icon: <ChartIcon className="w-8 h-8" />,
      title: "تقارير شاملة",
      description: "تقارير مفصلة عن الحضور، الواجبات، والنتائج لكل طالب",
      color: "from-blue-500 to-blue-600",
      hoverColor: "group-hover:from-blue-600 group-hover:to-blue-700"
    },
    {
      icon: <BellIcon className="w-8 h-8" />,
      title: "إشعارات فورية",
      description: "إشعارات لحظية لأولياء الأمور عن كل ما يخص أبنائهم",
      color: "from-green-500 to-green-600",
      hoverColor: "group-hover:from-green-600 group-hover:to-green-700"
    },
    {
      icon: <LockIcon className="w-8 h-8" />,
      title: "أمان عالي",
      description: "حماية البيانات وصلاحيات محددة لكل مستخدم",
      color: "from-purple-500 to-purple-600",
      hoverColor: "group-hover:from-purple-600 group-hover:to-purple-700"
    },
    {
      icon: <MobileIcon className="w-8 h-8" />,
      title: "متجاوب مع الجوال",
      description: "استخدم المنصة من أي جهاز - كمبيوتر، تابلت، أو موبايل",
      color: "from-pink-500 to-pink-600",
      hoverColor: "group-hover:from-pink-600 group-hover:to-pink-700"
    },
    {
      icon: <CheckIcon className="w-8 h-8" />,
      title: "تسجيل الحضور",
      description: "تسجيل سهل وسريع لحضور وغياب الطلاب مع إشعارات فورية",
      color: "from-yellow-500 to-yellow-600",
      hoverColor: "group-hover:from-yellow-600 group-hover:to-yellow-700"
    },
    {
      icon: <NoteIcon className="w-8 h-8" />,
      title: "إدارة الواجبات",
      description: "إضافة ومتابعة الواجبات وتقييمها بسهولة",
      color: "from-red-500 to-red-600",
      hoverColor: "group-hover:from-red-600 group-hover:to-red-700"
    },
    {
      icon: <TrendingUpIcon className="w-8 h-8" />,
      title: "متابعة التقدم",
      description: "رسوم بيانية توضح تقدم الطالب الأكاديمي",
      color: "from-indigo-500 to-indigo-600",
      hoverColor: "group-hover:from-indigo-600 group-hover:to-indigo-700"
    },
    {
      icon: <ChatIcon className="w-8 h-8" />,
      title: "التواصل المباشر",
      description: "تواصل سهل بين المعلمين وأولياء الأمور",
      color: "from-teal-500 to-teal-600",
      hoverColor: "group-hover:from-teal-600 group-hover:to-teal-700"
    },
    {
      icon: <TargetIcon className="w-8 h-8" />,
      title: "إدارة الامتحانات",
      description: "جدولة الامتحانات وتسجيل النتائج بكل سهولة",
      color: "from-orange-500 to-orange-600",
      hoverColor: "group-hover:from-orange-600 group-hover:to-orange-700"
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
    <section ref={sectionRef} id="features" className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* خلفية زخرفية */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-4 relative z-10">
        {/* العنوان الرئيسي */}
        <div className={`flex flex-col items-center justify-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
        }`}>
          {/* Title */}
          <h2 className="relative text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
            <span className="text-gray-900">المميزات . </span>
            <span className="text-sky-500">المتكاملة</span>
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
            
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-4">
            كل ما تحتاجه لإدارة مركزك التعليمي في منصة واحدة متكاملة
          </p>
        </div>

        {/* المميزات مع الصورة */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* الصورة على اليمين */}
          <div className={`order-1 lg:order-1 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'
          }`}>
            <img 
              src="/sec.png" 
              alt="منصة حصتي" 
              className="w-3/5 mx-auto h-auto object-cover"
            />
          </div>

          {/* قائمة المميزات على اليسار */}
          <div className="order-2 lg:order-2">
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ 
                    transitionDelay: `${index * 100}ms`
                  }}
                >
                  {/* علامة الصح */}
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
                    <svg 
                      className="w-4 h-4 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={3} 
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  
                  {/* المحتوى */}
                  <div className="flex-1">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-0.5">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* قسم المعلومات الإضافية */}
        <div className={`mt-12 sm:mt-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden mx-2 sm:mx-0 transition-all duration-1000 delay-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="p-6 sm:p-10 md:p-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
              <div className="lg:w-2/3 text-center lg:text-right">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">
                  هل أنت مستعد للتحول الرقمي؟
                </h3>
                <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  انضم إلى مئات المراكز التعليمية التي حسّنت جودة التعليم وزادت كفاءة الإدارة من خلال منصتنا المتكاملة
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto lg:w-auto">
                <button className="px-6 sm:px-7 py-3 bg-white text-primary-700 font-bold rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base">
                  طلب عرض توضيحي
                </button>
                <button className="px-6 sm:px-7 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 text-sm sm:text-base">
                  تواصل معنا
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
