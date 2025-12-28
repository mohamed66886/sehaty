'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { getTeacher } from '@/lib/firebase/firestore';
import type { Teacher } from '@/types';
import { UserIcon, MailIcon, PhoneIcon, LockIcon, CheckIcon, AlertIcon } from '@/components/icons/Icons';
import { useTheme } from '@/contexts/ThemeContext';

interface ClassItem {
  id: string;
  name: string;
  subject: string;
  price: string;
  schedule: string;
  duration: string;
}

function SubscribeForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const teacherId = searchParams.get('teacherId');
  const classId = searchParams.get('classId');
  const { isDarkMode } = useTheme();

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadData() {
      if (!teacherId || !classId) {
        setError('معلومات المدرس أو الصف غير موجودة');
        setLoading(false);
        return;
      }

      try {
        // Load teacher data
        const teacherData = await getTeacher(teacherId);
        setTeacher(teacherData);

        // Load class data
        const classDoc = await getDoc(doc(db, 'classes', classId));
        if (classDoc.exists()) {
          setSelectedClass({
            id: classDoc.id,
            ...classDoc.data(),
          } as ClassItem);
        } else {
          setError('الصف غير موجود');
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [teacherId, classId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'الاسم مطلوب';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'الاسم يجب أن يكون 3 أحرف على الأقل';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الموبايل مطلوب';
    } else if (!/^(01)[0-9]{9}$/.test(formData.phone)) {
      newErrors.phone = 'رقم الموبايل غير صحيح (يجب أن يبدأ بـ 01 ويحتوي على 11 رقم)';
    }

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!teacherId || !classId) {
      setError('معلومات الاشتراك غير مكتملة');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);

      // Create pending subscription document
      await setDoc(doc(db, 'pendingSubscriptions', user.uid), {
        studentUid: user.uid,
        studentName: formData.name,
        studentEmail: formData.email,
        studentPhone: formData.phone,
        teacherId: teacherId,
        teacherName: teacher?.name || '',
        classId: classId,
        className: selectedClass?.name || '',
        status: 'pending', // pending, approved, rejected
        emailVerified: false,
        createdAt: serverTimestamp(),
      });

      // Redirect to email verification page
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      console.error('Error creating subscription:', err);
      
      if (err.code === 'auth/email-already-in-use') {
        setError('البريد الإلكتروني مستخدم بالفعل. يرجى تسجيل الدخول أو استخدام بريد آخر');
      } else if (err.code === 'auth/weak-password') {
        setError('كلمة المرور ضعيفة جداً');
      } else {
        setError('حدث خطأ أثناء إنشاء الاشتراك. يرجى المحاولة مرة أخرى');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-primary-50 via-white to-primary-50'
      }`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-16 w-16 border-b-4 mx-auto mb-4 ${
            isDarkMode ? 'border-sky-500' : 'border-primary-600'
          }`}></div>
          <p className={`text-lg transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error && !teacher) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-primary-50 via-white to-primary-50'
      }`}>
        <div className="text-center max-w-md mx-auto px-4">
          <AlertIcon className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h2 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>حدث خطأ</h2>
          <p className={`mb-6 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>{error}</p>
          <Link
            href="/"
            className={`inline-block text-white px-8 py-3 rounded-xl font-semibold transition-colors ${
              isDarkMode ? 'bg-sky-600 hover:bg-sky-700' : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-primary-50 via-white to-primary-50'
    }`}>
      {/* Header */}
      <div className={`shadow-md transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-800' : 'bg-white'
      }`}>
        <div className="container mx-auto px-3 sm:px-4 lg:px-8 max-w-7xl py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <Link
              href={`/teacher/${teacherId}`}
              className={`flex items-center gap-1.5 sm:gap-2 hover:text-primary-600 transition-colors flex-shrink-0 ${
                isDarkMode ? 'text-gray-300 hover:text-sky-400' : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-semibold text-sm sm:text-base">العودة</span>
            </Link>
            <h1 className={`text-base sm:text-xl font-bold text-center flex-1 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>الاشتراك في الصف</h1>
            <div className="w-16 sm:w-20"></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-8 max-w-4xl py-4 sm:py-6 md:py-12">
        <div className="grid md:grid-cols-5 gap-4 sm:gap-6 md:gap-8">
          {/* Subscription Summary - Side Panel */}
          <div className="md:col-span-2 order-2 md:order-1">
            <div className={`rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 md:sticky md:top-24 transition-colors duration-300 ${
              isDarkMode ? 'bg-slate-800' : 'bg-white'
            }`}>
              <h2 className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>ملخص الاشتراك</h2>
              
              {teacher && (
                <div className="mb-6">
                  <div className={`text-sm mb-1 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>المدرس</div>
                  <div className={`text-lg font-semibold transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{teacher.name}</div>
                </div>
              )}

              {selectedClass && (
                <>
                  <div className="mb-6">
                    <div className={`text-sm mb-1 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>الصف</div>
                    <div className={`text-lg font-semibold transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{selectedClass.name}</div>
                  </div>

                  <div className="mb-6">
                    <div className={`text-sm mb-1 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>المادة</div>
                    <div className={`text-lg font-semibold transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{selectedClass.subject}</div>
                  </div>

                  <div className="mb-6">
                    <div className={`text-sm mb-1 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>الموعد</div>
                    <div className={`text-base font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>{selectedClass.schedule}</div>
                  </div>

                  <div className="mb-6">
                    <div className={`text-sm mb-1 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>مدة الحصة</div>
                    <div className={`text-base font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>{selectedClass.duration}</div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>السعر الشهري</span>
                      <span className={`text-2xl font-bold transition-colors duration-300 ${
                        isDarkMode ? 'text-sky-400' : 'text-primary-600'
                      }`}>{selectedClass.price}</span>
                    </div>
                  </div>
                </>
              )}

              <div className={`mt-6 rounded-xl p-4 transition-colors duration-300 ${
                isDarkMode ? 'bg-sky-900/30' : 'bg-blue-50'
              }`}>
                <div className="flex items-start gap-2">
                  <CheckIcon className={`w-5 h-5 mt-1 flex-shrink-0 transition-colors duration-300 ${
                    isDarkMode ? 'text-sky-400' : 'text-blue-600'
                  }`} />
                  <p className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-sky-100' : 'text-blue-900'
                  }`}>
                    سيقوم المدرس بمراجعة طلب الاشتراك وسيتم التواصل معك عبر البريد الإلكتروني أو الواتساب
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Form */}
          <div className="md:col-span-3 order-1 md:order-2">
            <div className={`rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-5 md:p-6 lg:p-8 transition-colors duration-300 ${
              isDarkMode ? 'bg-slate-800' : 'bg-white'
            }`}>
              <h2 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>بيانات الاشتراك</h2>

              {error && (
                <div className={`mb-6 border rounded-xl p-4 transition-colors duration-300 ${
                  isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-2">
                    <AlertIcon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className={`transition-colors duration-300 ${
                      isDarkMode ? 'text-red-300' : 'text-red-800'
                    }`}>{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className={`block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    الاسم الكامل *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base rounded-lg sm:rounded-xl border-2 focus:outline-none focus:ring-4 transition-all ${
                        errors.name 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                          : isDarkMode
                          ? 'bg-slate-900 border-slate-700 text-white focus:border-sky-500 focus:ring-sky-900/30'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-primary-500 focus:ring-primary-100'
                      }`}
                      placeholder="أدخل اسمك الكامل"
                    />
                    <UserIcon className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                  {errors.name && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className={`block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    البريد الإلكتروني *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base rounded-lg sm:rounded-xl border-2 focus:outline-none focus:ring-4 transition-all ${
                        errors.email 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                          : isDarkMode
                          ? 'bg-slate-900 border-slate-700 text-white focus:border-sky-500 focus:ring-sky-900/30'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-primary-500 focus:ring-primary-100'
                      }`}
                      placeholder="example@email.com"
                      dir="ltr"
                    />
                    <MailIcon className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                  {errors.email && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className={`block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    رقم الموبايل *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base rounded-lg sm:rounded-xl border-2 focus:outline-none focus:ring-4 transition-all ${
                        errors.phone 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                          : isDarkMode
                          ? 'bg-slate-900 border-slate-700 text-white focus:border-sky-500 focus:ring-sky-900/30'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-primary-500 focus:ring-primary-100'
                      }`}
                      placeholder="01xxxxxxxxx"
                      dir="ltr"
                    />
                    <PhoneIcon className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                  {errors.phone && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.phone}</p>}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className={`block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    كلمة المرور *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base rounded-lg sm:rounded-xl border-2 focus:outline-none focus:ring-4 transition-all ${
                        errors.password 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                          : isDarkMode
                          ? 'bg-slate-900 border-slate-700 text-white focus:border-sky-500 focus:ring-sky-900/30'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-primary-500 focus:ring-primary-100'
                      }`}
                      placeholder="أدخل كلمة المرور"
                    />
                    <LockIcon className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                  {errors.password && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.password}</p>}
                  <p className={`mt-1 text-xs transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>يجب أن تكون 6 أحرف على الأقل</p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className={`block text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    تأكيد كلمة المرور *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base rounded-lg sm:rounded-xl border-2 focus:outline-none focus:ring-4 transition-all ${
                        errors.confirmPassword 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                          : isDarkMode
                          ? 'bg-slate-900 border-slate-700 text-white focus:border-sky-500 focus:ring-sky-900/30'
                          : 'bg-white border-gray-200 text-gray-900 focus:border-primary-500 focus:ring-primary-100'
                      }`}
                      placeholder="أعد إدخال كلمة المرور"
                    />
                    <LockIcon className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 transform active:scale-95 sm:hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:cursor-not-allowed ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 disabled:from-gray-600 disabled:to-gray-700'
                      : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-gray-400 disabled:to-gray-500'
                  }`}
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                      <span>جاري الاشتراك...</span>
                    </div>
                  ) : (
                    'تأكيد الاشتراك'
                  )}
                </button>

                <p className={`text-center text-xs sm:text-sm leading-relaxed transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  بالاشتراك، أنت توافق على{' '}
                  <Link href="/terms" className={`font-semibold transition-colors ${
                    isDarkMode ? 'text-sky-400 hover:text-sky-500' : 'text-primary-600 hover:text-primary-700'
                  }`}>
                    الشروط والأحكام
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={
      <SuspenseFallback />
    }>
      <SubscribeForm />
    </Suspense>
  );
}

function SuspenseFallback() {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-primary-50 via-white to-blue-50'
    }`}>
      <div className="text-center">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto ${
          isDarkMode ? 'border-sky-400' : 'border-primary-600'
        }`}></div>
        <p className={`mt-4 transition-colors duration-300 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>جاري التحميل...</p>
      </div>
    </div>
  );
}
