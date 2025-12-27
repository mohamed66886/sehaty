'use client';

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAllTeachers } from "@/lib/firebase/firestore";
import type { Teacher } from "@/types";

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else {
            setIsVisible(false); // Reset animation when out of view
          }
        });
      },
      { 
        threshold: 0.3, // يبدأ الـ animation لما 30% من القسم يظهر
        rootMargin: '-50px' // يضيف مسافة قبل ما يبدأ
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
    <section ref={sectionRef} className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">

<div className={`flex flex-col items-center justify-center mb-16 transition-all duration-1000 ${
  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'
}`}>
  {/* Title */}
  <h2 className="relative text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
    <span className="text-gray-900">اختر </span>
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
          <p className="text-center text-gray-500">جاري التحميل...</p>
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
    className={`bg-[#EAF8FC] rounded-[32px] rounded-tl-none rounded-br-none p-4 text-center flex flex-col items-center hover:shadow-lg hover:scale-105 hover:rotate-1 transition-all duration-700 cursor-pointer ${
      isVisible ? 'opacity-100 translate-y-0 scale-100 rotate-0' : 'opacity-0 translate-y-10 scale-50 rotate-12'
    }`}
    style={{ 
      transitionDelay: `${index * 100}ms`,
      transformOrigin: 'center center'
    }}
  >
    
    {/* Image */}
    <div className="w-full max-w-[220px] aspect-square rounded-[28px] rounded-tl-none rounded-br-none overflow-hidden mb-4">
      <Image
        src={teacher.photoURL || '/logo.png'}
        alt={teacher.name}
        width={300}
        height={300}
        className="w-full h-full object-cover"
      />
    </div>

    {/* Name */}
    <h3 className="text-[22px] font-extrabold text-[#0F172A] mb-2">
      {teacher.name}
    </h3>

    {/* Subject */}
    <p className="text-[18px] leading-snug text-[#0F172A] opacity-90">
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
