"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="bg-white shadow-md sticky top-4 z-50 mx-8 rounded-2xl border border-gray-200 animate-fadeInDown transition-all duration-300 hover:shadow-xl overflow-hidden">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Desktop: Logo and Dark Mode Toggle */}
          <div className="hidden md:flex items-center gap-6 animate-slide-in-right">
            <Link href="/" className="flex items-center gap-3 transition-transform duration-300 hover:scale-105">
              <Image 
                src="/logo.png" 
                alt="حصتي" 
                width={80} 
                height={40}
                className="rounded-lg"
              />
            </Link>

            {/* Professional Ant Design Style Switch */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`relative inline-flex h-8 w-16 items-center justify-between px-1.5 rounded-full transition-all duration-300 focus:outline-none ${
                  isDarkMode ? 'bg-slate-700' : 'bg-orange-400'
                }`}
                role="switch"
                aria-checked={isDarkMode}
              >
                {/* Moon Icon - Always on left */}
                <span className="relative z-10">
                  <svg className="w-3.5 h-3.5 text-white opacity-60" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                </span>
                
                {/* Sun Icon - Always on right */}
                <span className="relative z-10">
                  <svg className="w-3.5 h-3.5 text-white opacity-60" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                </span>

                {/* Large White Circle Handle */}
                <span
                  className={`absolute inline-flex h-7 w-7 rounded-full bg-white shadow-lg transition-transform duration-300 left-0.5 ${
                    isDarkMode ? 'translate-x-0' : 'translate-x-[30px]'
                  }`}
                />
              </button>

            </div>
          </div>

          {/* Mobile: Dark Mode Toggle (Right) */}
          <div className="md:hidden">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`relative inline-flex h-7 w-14 items-center justify-between px-1.5 rounded-full transition-all duration-300 focus:outline-none ${
                isDarkMode ? 'bg-slate-700' : 'bg-orange-400'
              }`}
              role="switch"
              aria-checked={isDarkMode}
            >
              {/* Moon Icon */}
              <span className="relative z-10">
                <svg className="w-3 h-3 text-white opacity-60" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              </span>
              
              {/* Sun Icon */}
              <span className="relative z-10">
                <svg className="w-3 h-3 text-white opacity-60" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              </span>

              {/* Handle */}
              <span
                className={`absolute inline-flex h-6 w-6 rounded-full bg-white shadow-lg transition-transform duration-300 left-0.5 ${
                  isDarkMode ? 'translate-x-0' : 'translate-x-[26px]'
                }`}
              />
            </button>
          </div>

          {/* Mobile: Logo (Center) */}
          <div className="md:hidden absolute left-1/2 transform -translate-x-1/2">
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src="/logo.png" 
                alt="حصتي" 
                width={70} 
                height={35}
                className="rounded-lg"
              />
            </Link>
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center gap-4 animate-slide-in-left">

            {/* Login Button */}
            <Link
              href="/login"
              className="px-6 py-2 text-primary-600 hover:text-primary-700 font-medium border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
            >
              تسجيل الدخول
            </Link>

            {/* Register Button */}
            <Link
              href="/register"
              className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              حساب جديد
            </Link>
          </div>

          {/* Mobile Menu Button (Left) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 animate-slideDown">
            <div className="flex flex-col gap-4">
              <Link
                href="/login"
                className="px-6 py-2 text-center text-primary-600 hover:text-primary-700 font-medium border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors animate-fade-in-up"
                style={{ animationDelay: '0.1s' }}
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 text-center bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors animate-fade-in-up"
                style={{ animationDelay: '0.2s' }}
              >
                حساب جديد
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Scroll Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-2xl overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    </header>
  );
}
