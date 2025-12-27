'use client';

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { BookIcon, EmailIcon, PhoneIcon, LocationIcon, InstagramIcon, FacebookIcon, TwitterIcon, LinkedInIcon } from "@/components/icons/Icons";

export default function Footer() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

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
        threshold: 0.2,
        rootMargin: '-50px'
      }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  return (
    <footer ref={footerRef} className="bg-white text-gray-900">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Mobile Accordion Layout */}
        <div className="md:hidden space-y-4">
          {/* About - Always Visible */}
          <div className={`text-center pb-4 border-b border-gray-200 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <BookIcon className="w-6 h-6 text-primary-600" />
              <h3 className="text-xl font-bold">حصتي</h3>
            </div>
            <p className="text-sm text-gray-600">
              منصة تعليمية متكاملة لإدارة المراكز التعليمية
            </p>
          </div>

          {/* Quick Links Accordion */}
          <div className={`border-b border-gray-200 pb-4 transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <button
              onClick={() => toggleSection('links')}
              className="w-full flex items-center justify-between py-2"
            >
              <h4 className="text-base font-bold">روابط سريعة</h4>
              <svg
                className={`w-5 h-5 transition-transform ${openSection === 'links' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSection === 'links' && (
              <ul className="space-y-2 mt-3">
                <li>
                  <a href="#hero" className="text-sm text-gray-600 hover:text-primary-600 transition-colors block">
                    الرئيسية
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-sm text-gray-600 hover:text-primary-600 transition-colors block">
                    المميزات
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-sm text-gray-600 hover:text-primary-600 transition-colors block">
                    طريقة الاستخدام
                  </a>
                </li>
                <li>
                  <a href="#teachers" className="text-sm text-gray-600 hover:text-primary-600 transition-colors block">
                    المدرسين
                  </a>
                </li>
              </ul>
            )}
          </div>

          {/* Services Accordion */}
          <div className={`border-b border-gray-200 pb-4 transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <button
              onClick={() => toggleSection('services')}
              className="w-full flex items-center justify-between py-2"
            >
              <h4 className="text-base font-bold">الخدمات</h4>
              <svg
                className={`w-5 h-5 transition-transform ${openSection === 'services' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openSection === 'services' && (
              <ul className="space-y-2 mt-3">
                <li>
                  <span className="text-sm text-gray-600 block">إدارة الطلاب</span>
                </li>
                <li>
                  <span className="text-sm text-gray-600 block">تسجيل الحضور</span>
                </li>
                <li>
                  <span className="text-sm text-gray-600 block">إدارة الواجبات</span>
                </li>
                <li>
                  <span className="text-sm text-gray-600 block">إدارة الامتحانات</span>
                </li>
                <li>
                  <span className="text-sm text-gray-600 block">التقارير والإحصائيات</span>
                </li>
              </ul>
            )}
          </div>

          {/* Contact - Always Visible */}
          <div className={`text-center pb-4 transition-all duration-1000 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h4 className="text-base font-bold mb-3">تواصل معنا</h4>
            <ul className="space-y-2">
              <li className="flex items-center justify-center gap-2">
                <EmailIcon className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-gray-600">info@hesaty.com</span>
              </li>
              <li className="flex items-center justify-center gap-2">
                <PhoneIcon className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-gray-600">+20 123 456 7890</span>
              </li>
              <li className="flex items-center justify-center gap-2">
                <LocationIcon className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-gray-600">القاهرة، مصر</span>
              </li>
            </ul>
            
            {/* Social Media */}
            <div className="flex gap-3 mt-4 justify-center">
              <a href="#" className="w-9 h-9 bg-primary-100 hover:bg-primary-200 text-primary-600 rounded-full flex items-center justify-center transition-colors" aria-label="Facebook">
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a href="#" className="w-9 h-9 bg-primary-100 hover:bg-primary-200 text-primary-600 rounded-full flex items-center justify-center transition-colors" aria-label="Twitter">
                <TwitterIcon className="w-5 h-5" />
              </a>
              <a href="#" className="w-9 h-9 bg-primary-100 hover:bg-primary-200 text-primary-600 rounded-full flex items-center justify-center transition-colors" aria-label="Instagram">
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href="#" className="w-9 h-9 bg-primary-100 hover:bg-primary-200 text-primary-600 rounded-full flex items-center justify-center transition-colors" aria-label="LinkedIn">
                <LinkedInIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Desktop Grid Layout */}
        <div className="hidden md:grid md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div className={`transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <BookIcon className="w-6 h-6 text-primary-600" />
              <h3 className="text-xl font-bold">حصتي</h3>
            </div>
            <p className="text-base text-gray-600 mb-4">
              منصة تعليمية متكاملة لإدارة المراكز التعليمية ومتابعة الطلاب لحظة بلحظة
            </p>
          </div>

          {/* Quick Links */}
          <div className={`transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h4 className="text-lg font-bold mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              <li>
                <a href="#hero" className="text-base text-gray-600 hover:text-primary-600 transition-colors">
                  الرئيسية
                </a>
              </li>
              <li>
                <a href="#features" className="text-base text-gray-600 hover:text-primary-600 transition-colors">
                  المميزات
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-base text-gray-600 hover:text-primary-600 transition-colors">
                  طريقة الاستخدام
                </a>
              </li>
              <li>
                <a href="#teachers" className="text-base text-gray-600 hover:text-primary-600 transition-colors">
                  المدرسين
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className={`transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h4 className="text-lg font-bold mb-4">الخدمات</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-base text-gray-600">إدارة الطلاب</span>
              </li>
              <li>
                <span className="text-base text-gray-600">تسجيل الحضور</span>
              </li>
              <li>
                <span className="text-base text-gray-600">إدارة الواجبات</span>
              </li>
              <li>
                <span className="text-base text-gray-600">إدارة الامتحانات</span>
              </li>
              <li>
                <span className="text-base text-gray-600">التقارير والإحصائيات</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className={`transition-all duration-1000 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h4 className="text-lg font-bold mb-4">تواصل معنا</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <EmailIcon className="w-5 h-5 text-primary-600" />
                <span className="text-base text-gray-600">info@hesaty.com</span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneIcon className="w-5 h-5 text-primary-600" />
                <span className="text-base text-gray-600">+20 123 456 7890</span>
              </li>
              <li className="flex items-center gap-2">
                <LocationIcon className="w-5 h-5 text-primary-600" />
                <span className="text-base text-gray-600">القاهرة، مصر</span>
              </li>
            </ul>
            
            {/* Social Media */}
            <div className="flex gap-4 mt-4">
              <a href="#" className="w-10 h-10 bg-primary-100 hover:bg-primary-200 text-primary-600 rounded-full flex items-center justify-center transition-colors" aria-label="Facebook">
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-primary-100 hover:bg-primary-200 text-primary-600 rounded-full flex items-center justify-center transition-colors" aria-label="Twitter">
                <TwitterIcon className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-primary-100 hover:bg-primary-200 text-primary-600 rounded-full flex items-center justify-center transition-colors" aria-label="Instagram">
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-primary-100 hover:bg-primary-200 text-primary-600 rounded-full flex items-center justify-center transition-colors" aria-label="LinkedIn">
                <LinkedInIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`border-t border-gray-200 pt-6 sm:pt-8 text-center mt-6 transition-all duration-1000 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}>
          <p className="text-sm sm:text-base text-gray-600">
            © {new Date().getFullYear()} حصتي. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
