'use client';

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAllTeachers } from "@/lib/firebase/firestore";
import type { Teacher } from "@/types";
import { useTheme } from "@/contexts/ThemeContext";

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    async function loadTeachers() {
      try {
        const data = await getAllTeachers();
        setTeachers(data.slice(0, 8)); // عدد الكروت (4 في كل صف)
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadTeachers();
  }, []);

  // Intersection Observer for scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // يظهر لما يدخل ويختفي لما يخرج
          setIsVisible(entry.isIntersecting);
        });
      },
      { 
        threshold: 0, // هيشتغل حتى لو pixel واحد ظاهر
        rootMargin: '-50px 0px -50px 0px' // هيختفي لما يخرج من viewport بـ 50px من فوق أو تحت
      }
    );

    const currentSection = sectionRef.current;

    if (currentSection) {
      observer.observe(currentSection);
    }

    return () => {
      if (currentSection) {
        observer.unobserve(currentSection);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className={`py-20 transition-colors duration-300 ${
      isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-white'
    }`}>
      <div className="container mx-auto px-4 max-w-7xl">

<div className={`flex flex-col items-center justify-center mb-16 transition-all duration-1000 ${
  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
}`}>
  {/* Title */}
  <h2 className="relative text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
    <span className={`transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>اختر </span>
    <span className="text-sky-500">المدرسين</span>

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
</div>


        {/* Grid */}
        {loading ? (
          <p className={`text-center transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>جاري التحميل...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {teachers.map((teacher, index) => {
              const initials = teacher.name
                .split(" ")
                .map(n => n[0])
                .slice(0, 2)
                .join("");

              return (
<Link key={teacher.uid} href={`/teacher/${teacher.uid}`}>
  <div 
    className={`rounded-[32px] rounded-tl-none rounded-br-none p-4 text-center flex flex-col items-center hover:shadow-lg hover:scale-105 hover:rotate-1 transition-all duration-700 cursor-pointer ${
      isDarkMode 
        ? 'bg-slate-800 hover:bg-slate-700 shadow-blue-500/20' 
        : 'bg-[#EAF8FC]'
    } ${
      isVisible ? 'opacity-100 translate-y-0 scale-100 rotate-0' : 'opacity-0 translate-y-10 scale-50 rotate-12'
    }`}
    style={{ 
      transitionDelay: `${index * 100}ms`,
      transformOrigin: 'center center'
    }}
  >
    
    {/* Image */}
    <div className={`w-full max-w-[220px] aspect-square rounded-[28px] rounded-tl-none rounded-br-none overflow-hidden mb-4 ${
      isDarkMode ? 'ring-2 ring-sky-500/30' : ''
    }`}>
      <Image
        src={teacher.photoURL || '/logo.png'}
        alt={teacher.name}
        width={300}
        height={300}
        className={`w-full h-full object-cover transition-all duration-300 ${
          isDarkMode ? 'brightness-90' : ''
        }`}
      />
    </div>

    {/* Name */}
    <h3 className={`text-[22px] font-extrabold mb-2 transition-colors duration-300 ${
      isDarkMode ? 'text-white' : 'text-[#0F172A]'
    }`}>
      {teacher.name}
    </h3>

    {/* Subject */}
    <p className={`text-[18px] leading-snug opacity-90 transition-colors duration-300 ${
      isDarkMode ? 'text-gray-300' : 'text-[#0F172A]'
    }`}>
      {teacher.subjects?.[0] || "المادة"} <br />
      المتكاملة
    </p>
  </div>
</Link>

              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
