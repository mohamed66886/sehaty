'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Announcement {
  id: number;
  title: string;
  description: string;
  image: string;
  bgColor: string;
}

const announcements: Announcement[] = [
  {
    id: 1,
    title: 'تخفيضات خاصة على الاشتراكات الجديدة',
    description: 'احصل على خصم 30% على جميع الباقات للطلاب الجدد. العرض لفترة محدودة!',
    image: '/images/announcements/promo.jpg',
    bgColor: 'from-primary-600 to-primary-800'
  },
  {
    id: 2,
    title: 'انضم لأفضل منصة تعليمية في مصر',
    description: 'أكثر من 10,000 طالب يثقون بنا. ابدأ رحلتك التعليمية اليوم مع أفضل المعلمين.',
    image: '/images/announcements/education.jpg',
    bgColor: 'from-blue-600 to-blue-800'
  },
  {
    id: 3,
    title: 'دورات مجانية للمراجعة النهائية',
    description: 'استعد للامتحانات مع دورات المراجعة المجانية. سجل الآن وابدأ التحضير!',
    image: '/images/announcements/exam.jpg',
    bgColor: 'from-green-600 to-green-800'
  },
  {
    id: 4,
    title: 'نظام متابعة متقدم للأهالي',
    description: 'تابع تقدم أبنائك لحظة بلحظة من خلال تطبيقنا. الآن مع إشعارات فورية!',
    image: '/images/announcements/tracking.jpg',
    bgColor: 'from-purple-600 to-purple-800'
  }
];

export default function Announcements() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">
            الإعلانات والعروض
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 px-4">
            لا تفوت آخر العروض والأخبار المهمة
          </p>
        </div>

        {/* Main Slider */}
        <div className="relative">
          {/* Slider Container */}
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl">
            {announcements.map((announcement, index) => (
              <div
                key={announcement.id}
                className={`transition-all duration-500 ease-in-out ${
                  index === currentIndex
                    ? 'opacity-100 relative'
                    : 'opacity-0 absolute inset-0 pointer-events-none'
                }`}
              >
                <div className={`relative min-h-[450px] sm:min-h-[500px] md:h-[500px] bg-gradient-to-br ${announcement.bgColor}`}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                      backgroundSize: '30px 30px'
                    }}></div>
                  </div>

                  {/* Content */}
                  <div className="relative h-full flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 md:px-16 py-8 sm:py-10 md:py-12 gap-6 md:gap-8">
                    {/* Text Content */}
                    <div className="w-full md:flex-1 text-white text-center md:text-right z-10 order-2 md:order-1">
                      <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-5 md:mb-6 leading-tight px-2">
                        {announcement.title}
                      </h3>
                      <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-7 md:mb-8 leading-relaxed opacity-90 px-2 max-w-2xl mx-auto md:mx-0">
                        {announcement.description}
                      </p>
                      <button className="bg-white text-gray-900 px-6 sm:px-7 md:px-8 py-2.5 sm:py-3 rounded-full font-semibold hover:bg-gray-100 active:scale-95 transition-all shadow-lg text-sm sm:text-base">
                        اعرف المزيد
                      </button>
                    </div>

                    {/* Image Placeholder */}
                    <div className="w-full md:flex-1 max-w-sm md:max-w-md order-1 md:order-2">
                      <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-80 bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl flex items-center justify-center border-2 border-white/20 shadow-xl">
                        <div className="text-center text-white/80">
                          <svg
                            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-3 md:mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="text-xs sm:text-sm">صورة توضيحية</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows - Hidden on small mobile */}
          <button
            onClick={goToPrevious}
            className="hidden sm:block absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 md:p-3 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 z-20"
            aria-label="السابق"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="hidden sm:block absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 md:p-3 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 z-20"
            aria-label="التالي"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-5 md:mt-6">
            {announcements.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all ${
                  index === currentIndex
                    ? 'w-6 sm:w-7 md:w-8 bg-primary-600'
                    : 'w-1.5 sm:w-2 bg-gray-300 hover:bg-gray-400 active:bg-gray-500'
                } h-1.5 sm:h-2 rounded-full`}
                aria-label={`الانتقال إلى الإعلان ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 sm:mt-4 h-1 bg-gray-200 rounded-full overflow-hidden max-w-md mx-auto">
          <div
            className="h-full bg-primary-600 transition-all duration-[5000ms] ease-linear"
            style={{
              width: isAutoPlaying ? '100%' : '0%',
              transition: isAutoPlaying ? 'width 5s linear' : 'width 0.3s'
            }}
            key={currentIndex}
          />
        </div>
      </div>
    </section>
  );
}
