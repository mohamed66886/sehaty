"use client";

import Link from "next/link";
import { useState } from "react";
import { BookIcon } from "@/components/icons/Icons";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <BookIcon className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold text-primary-600">حصتي</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#hero" className="text-gray-700 hover:text-primary-600 transition-colors">
              الرئيسية
            </a>
            <a href="#features" className="text-gray-700 hover:text-primary-600 transition-colors">
              المميزات
            </a>
            <a href="#how-it-works" className="text-gray-700 hover:text-primary-600 transition-colors">
              طريقة الاستخدام
            </a>
            <a href="#teachers" className="text-gray-700 hover:text-primary-600 transition-colors">
              المدرسين
            </a>
            <a href="#students" className="text-gray-700 hover:text-primary-600 transition-colors">
              الطلاب المميزين
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/register"
              className="btn-primary"
            >
              إنشاء حساب
            </Link>
          </div>

          {/* Mobile Menu Button */}
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
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col gap-4">
              <a
                href="#hero"
                className="text-gray-700 hover:text-primary-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                الرئيسية
              </a>
              <a
                href="#features"
                className="text-gray-700 hover:text-primary-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                المميزات
              </a>
              <a
                href="#how-it-works"
                className="text-gray-700 hover:text-primary-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                طريقة الاستخدام
              </a>
              <a
                href="#teachers"
                className="text-gray-700 hover:text-primary-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                المدرسين
              </a>
              <a
                href="#students"
                className="text-gray-700 hover:text-primary-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                الطلاب المميزين
              </a>
              <hr className="border-gray-200" />
              <Link
                href="/login"
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/register"
                className="btn-primary text-center"
              >
                إنشاء حساب
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
