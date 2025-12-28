"use client";

import { useEffect, useState } from "react";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Announcements from "@/components/landing/Announcements";
import Teachers from "@/components/landing/Teachers";
import TopStudents from "@/components/landing/TopStudents";
import Footer from "@/components/landing/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import { useTheme } from "@/contexts/ThemeContext";

export default function HomePage() {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for initial render
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-primary-50 via-white to-primary-50'
      }`}>
        <div className="relative w-[160px] h-[100px]">
          <div className="loader-dot1"></div>
          <div className="loader-dot2"></div>
          <div className="loader-dot3"></div>
        </div>
        <style jsx>{`
          .loader-dot1 {
            position: absolute;
            top: 50%;
            left: 50%;
            z-index: 10;
            width: 160px;
            height: 100px;
            margin-left: -80px;
            margin-top: -50px;
            border-radius: 5px;
            background: #1e3f57;
            animation: dot1_ 3s cubic-bezier(0.55, 0.3, 0.24, 0.99) infinite;
          }

          .loader-dot2 {
            position: absolute;
            top: 50%;
            left: 50%;
            z-index: 11;
            width: 150px;
            height: 90px;
            margin-top: -45px;
            margin-left: -75px;
            border-radius: 3px;
            background: #3c517d;
            animation: dot2_ 3s cubic-bezier(0.55, 0.3, 0.24, 0.99) infinite;
          }

          .loader-dot3 {
            position: absolute;
            top: 50%;
            left: 50%;
            z-index: 12;
            width: 40px;
            height: 20px;
            margin-top: 50px;
            margin-left: -20px;
            border-radius: 0 0 5px 5px;
            background: #6bb2cd;
            animation: dot3_ 3s cubic-bezier(0.55, 0.3, 0.24, 0.99) infinite;
          }

          @keyframes dot1_ {
            3%, 97% {
              width: 160px;
              height: 100px;
              margin-top: -50px;
              margin-left: -80px;
            }
            30%, 36% {
              width: 80px;
              height: 120px;
              margin-top: -60px;
              margin-left: -40px;
            }
            63%, 69% {
              width: 40px;
              height: 80px;
              margin-top: -40px;
              margin-left: -20px;
            }
          }

          @keyframes dot2_ {
            3%, 97% {
              height: 90px;
              width: 150px;
              margin-left: -75px;
              margin-top: -45px;
            }
            30%, 36% {
              width: 70px;
              height: 96px;
              margin-left: -35px;
              margin-top: -48px;
            }
            63%, 69% {
              width: 32px;
              height: 60px;
              margin-left: -16px;
              margin-top: -30px;
            }
          }

          @keyframes dot3_ {
            3%, 97% {
              height: 20px;
              width: 40px;
              margin-left: -20px;
              margin-top: 50px;
            }
            30%, 36% {
              width: 8px;
              height: 8px;
              margin-left: -5px;
              margin-top: 49px;
              border-radius: 8px;
            }
            63%, 69% {
              width: 16px;
              height: 4px;
              margin-left: -8px;
              margin-top: -37px;
              border-radius: 10px;
            }
          }
        `}</style>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900' : 'bg-white'
    }`}>
      <Header />
      <Hero />
            <Teachers />
      <HowItWorks />
      <Features />
      <Footer />
      <FloatingButtons />
    </div>
  );
}
