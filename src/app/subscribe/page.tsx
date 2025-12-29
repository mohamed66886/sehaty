'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { getTeacher } from '@/lib/firebase/firestore';
import type { Teacher } from '@/types';
import { 
  UserIcon, 
  MailIcon, 
  PhoneIcon, 
  LockIcon, 
  CheckIcon, 
  AlertIcon, 
  ChevronLeftIcon, 
  BookIcon, 
  ClockIcon, 
  UsersIcon,
  ShieldIcon,
  EyeIcon,
  EyeOffIcon
} from '@/components/icons/Icons';
import { useTheme } from '@/contexts/ThemeContext';

interface ClassItem {
  id: string;
  name: string;
  subject: string;
  price: string;
  schedule: string;
  duration: string;
  teacherName?: string;
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
          const classData = classDoc.data();
          setSelectedClass({
            id: classDoc.id,
            name: classData.name || '',
            subject: classData.subject || '',
            price: classData.price || '',
            schedule: classData.schedule || '',
            duration: classData.duration || '',
            teacherName: teacherData?.name || ''
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
    return <LoadingState isDarkMode={isDarkMode} />;
  }

  if (error && !teacher) {
    return <ErrorState error={error} isDarkMode={isDarkMode} />;
  }

  return (
    <>
      {/* ========== MOBILE DESIGN ========== */}
      <div className="lg:hidden">
        <div className={`min-h-screen transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gradient-to-b from-gray-900 to-gray-800' 
            : 'bg-gradient-to-b from-gray-50 to-white'
        }`}>
          {/* Mobile Header */}
          <div className={`sticky top-0 z-50 px-4 py-3 border-b transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-900/95 backdrop-blur-sm border-gray-800' 
              : 'bg-white/95 backdrop-blur-sm border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <Link
                href={`/teacher/${teacherId}`}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
              >
                <ChevronLeftIcon className={`w-6 h-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
              </Link>
              
              <h1 className="text-lg font-semibold text-center flex-1">
                الاشتراك في الصف
              </h1>
              
              <div className="w-10"></div>
            </div>
          </div>

          {/* Mobile Content */}
          <div className="p-4">
            {/* Class Summary Card - Mobile */}
            <div className={`rounded-2xl overflow-hidden mb-6 transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gradient-to-b from-gray-800 to-gray-900' 
                : 'bg-gradient-to-b from-white to-gray-50'
            } shadow-xl`}>
              <div className={`p-4 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-primary-900/30 to-blue-900/30' 
                  : 'bg-gradient-to-r from-primary-600 to-blue-600'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <BookIcon className="w-6 h-6 text-white" />
                  <div>
                    <h2 className="text-lg font-bold text-white">ملخص الاشتراك</h2>
                    <p className="text-sm text-white/80">تأكد من المعلومات قبل المتابعة</p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {teacher && (
                  <div className="mb-4">
                    <div className={`text-xs mb-1 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>المدرس</div>
                    <div className="flex items-center gap-3">
                      {teacher.photoURL ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <Image
                            src={teacher.photoURL}
                            alt={teacher.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
                        }`}>
                          <UserIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        </div>
                      )}
                      <div className={`text-sm font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{teacher.name}</div>
                    </div>
                  </div>
                )}

                {selectedClass && (
                  <>
                    <div className="mb-4">
                      <div className={`text-xs mb-1 transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>الصف الدراسي</div>
                      <div className={`text-base font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{selectedClass.name}</div>
                      <div className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>{selectedClass.subject}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className={`p-3 rounded-xl ${
                        isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <ClockIcon className={`w-4 h-4 ${
                            isDarkMode ? 'text-primary-400' : 'text-primary-600'
                          }`} />
                          <div className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>الموعد</div>
                        </div>
                        <div className={`text-sm font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{selectedClass.schedule}</div>
                      </div>
                      <div className={`p-3 rounded-xl ${
                        isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <UsersIcon className={`w-4 h-4 ${
                            isDarkMode ? 'text-purple-400' : 'text-purple-600'
                          }`} />
                          <div className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>المدة</div>
                        </div>
                        <div className={`text-sm font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{selectedClass.duration}</div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className={`rounded-xl p-4 mb-4 ${
                      isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>الرسوم الشهرية</div>
                          <div className={`text-lg font-bold ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>{selectedClass.price}</div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                          isDarkMode 
                            ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50' 
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}>
                          شاملة المواد
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Note */}
                <div className={`rounded-xl p-3 ${
                  isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
                }`}>
                  <div className="flex items-start gap-2">
                    <CheckIcon className={`w-4 h-4 mt-1 ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                    <p className={`text-xs ${
                      isDarkMode ? 'text-blue-200' : 'text-blue-900'
                    }`}>
                      سيتم التواصل معك لتأكيد الاشتراك عبر البريد الإلكتروني أو الواتساب
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Form - Mobile */}
            <div className={`rounded-2xl overflow-hidden mb-6 transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gradient-to-b from-gray-800 to-gray-900' 
                : 'bg-gradient-to-b from-white to-gray-50'
            } shadow-xl`}>
              <div className={`p-4 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-primary-900/30 to-blue-900/30' 
                  : 'bg-gradient-to-r from-primary-600 to-blue-600'
              }`}>
                <div className="flex items-center gap-3">
                  <UserIcon className="w-6 h-6 text-white" />
                  <h2 className="text-lg font-bold text-white">بيانات الاشتراك</h2>
                </div>
              </div>

              <div className="p-4">
                {error && (
                  <div className={`mb-4 rounded-xl p-3 ${
                    isDarkMode 
                      ? 'bg-red-900/20 border border-red-800/50' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      <AlertIcon className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className={`text-sm ${
                        isDarkMode ? 'text-red-300' : 'text-red-800'
                      }`}>{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className={`block text-xs font-semibold mb-2 transition-colors duration-300 ${
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
                        className={`w-full px-4 py-3 pr-10 text-sm rounded-xl border transition-all ${
                          errors.name 
                            ? 'border-red-300 focus:border-red-500 bg-red-50' 
                            : isDarkMode
                            ? 'bg-gray-800 border-gray-700 text-white focus:border-primary-500'
                            : 'bg-white border-gray-200 text-gray-900 focus:border-primary-500'
                        }`}
                        placeholder="أدخل اسمك الكامل"
                      />
                      <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className={`block text-xs font-semibold mb-2 transition-colors duration-300 ${
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
                        className={`w-full px-4 py-3 pr-10 text-sm rounded-xl border transition-all ${
                          errors.email 
                            ? 'border-red-300 focus:border-red-500 bg-red-50' 
                            : isDarkMode
                            ? 'bg-gray-800 border-gray-700 text-white focus:border-primary-500'
                            : 'bg-white border-gray-200 text-gray-900 focus:border-primary-500'
                        }`}
                        placeholder="example@email.com"
                        dir="ltr"
                      />
                      <MailIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className={`block text-xs font-semibold mb-2 transition-colors duration-300 ${
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
                        className={`w-full px-4 py-3 pr-10 text-sm rounded-xl border transition-all ${
                          errors.phone 
                            ? 'border-red-300 focus:border-red-500 bg-red-50' 
                            : isDarkMode
                            ? 'bg-gray-800 border-gray-700 text-white focus:border-primary-500'
                            : 'bg-white border-gray-200 text-gray-900 focus:border-primary-500'
                        }`}
                        placeholder="01xxxxxxxxx"
                        dir="ltr"
                      />
                      <PhoneIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className={`block text-xs font-semibold mb-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      كلمة المرور *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 pr-10 text-sm rounded-xl border transition-all ${
                          errors.password 
                            ? 'border-red-300 focus:border-red-500 bg-red-50' 
                            : isDarkMode
                            ? 'bg-gray-800 border-gray-700 text-white focus:border-primary-500'
                            : 'bg-white border-gray-200 text-gray-900 focus:border-primary-500'
                        }`}
                        placeholder="أدخل كلمة المرور"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOffIcon className="w-4 h-4 text-gray-400" />
                        ) : (
                          <EyeIcon className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                    <p className={`mt-1 text-xs transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>6 أحرف على الأقل</p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className={`block text-xs font-semibold mb-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      تأكيد كلمة المرور *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 pr-10 text-sm rounded-xl border transition-all ${
                          errors.confirmPassword 
                            ? 'border-red-300 focus:border-red-500 bg-red-50' 
                            : isDarkMode
                            ? 'bg-gray-800 border-gray-700 text-white focus:border-primary-500'
                            : 'bg-white border-gray-200 text-gray-900 focus:border-primary-500'
                        }`}
                        placeholder="أعد إدخال كلمة المرور"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showConfirmPassword ? (
                          <EyeOffIcon className="w-4 h-4 text-gray-400" />
                        ) : (
                          <EyeIcon className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
                  </div>

                  {/* Privacy Note */}
                  <div className={`rounded-xl p-3 ${
                    isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-start gap-2">
                      <ShieldIcon className={`w-4 h-4 mt-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`} />
                      <p className={`text-xs ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        بياناتك محمية وستستخدم فقط لأغراض التواصل والاشتراك
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full text-white py-4 px-6 rounded-xl font-bold text-base transition-all duration-300 active:scale-95 shadow-lg ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-primary-600 to-blue-600 disabled:from-gray-700 disabled:to-gray-800'
                        : 'bg-gradient-to-r from-primary-600 to-blue-600 disabled:from-gray-400 disabled:to-gray-500'
                    }`}
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>جاري الاشتراك...</span>
                      </div>
                    ) : (
                      'تأكيد الاشتراك'
                    )}
                  </button>

                  {/* Terms */}
                  <p className={`text-center text-xs leading-relaxed transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    بالاشتراك، أنت توافق على{' '}
                    <Link href="/terms" className={`font-semibold transition-colors ${
                      isDarkMode ? 'text-primary-400 hover:text-primary-500' : 'text-primary-600 hover:text-primary-700'
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

      {/* ========== DESKTOP DESIGN ========== */}
      <div className="hidden lg:block">
        <div className={`min-h-screen transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gradient-to-b from-gray-900 to-gray-800' 
            : 'bg-gradient-to-b from-gray-50 to-white'
        }`}>
          {/* Desktop Header */}
          <div className={`sticky top-0 z-50 py-4 transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-900/95 backdrop-blur-sm border-b border-gray-800' 
              : 'bg-white/95 backdrop-blur-sm border-b border-gray-200'
          }`}>
            <div className="container mx-auto px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <Link
                    href={`/teacher/${teacherId}`}
                    className={`flex items-center gap-2 font-semibold transition-colors hover:text-primary-600 ${
                      isDarkMode ? 'text-gray-300 hover:text-primary-400' : 'text-gray-700 hover:text-primary-600'
                    }`}
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                    العودة
                  </Link>
                  <h1 className={`text-xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>الاشتراك في الصف</h1>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className={`px-4 py-2 rounded-full text-sm ${
                    isDarkMode 
                      ? 'bg-gray-800 text-gray-300 border border-gray-700' 
                      : 'bg-gray-100 text-gray-700 border border-gray-300'
                  }`}>
                    خطوة 1 من 2
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Content */}
          <div className="container mx-auto px-8 py-12 max-w-7xl">
            <div className="grid grid-cols-3 gap-8">
              {/* Left Column - Class Summary */}
              <div className="col-span-1">
                <div className={`rounded-2xl overflow-hidden transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gradient-to-b from-gray-800 to-gray-900' 
                    : 'bg-gradient-to-b from-white to-gray-50'
                } shadow-2xl`}>
                  <div className={`p-6 ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-primary-900/30 to-blue-900/30' 
                      : 'bg-gradient-to-r from-primary-600 to-blue-600'
                  }`}>
                    <div className="flex items-center gap-3">
                      <BookIcon className="w-8 h-8 text-white" />
                      <div>
                        <h2 className="text-xl font-bold text-white">ملخص الاشتراك</h2>
                        <p className="text-sm text-white/80">تأكد من المعلومات قبل المتابعة</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {teacher && (
                      <div className="mb-6">
                        <div className={`text-sm mb-2 transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>المدرس</div>
                        <div className="flex items-center gap-4">
                          {teacher.photoURL ? (
                            <div className="w-12 h-12 rounded-full overflow-hidden">
                              <Image
                                src={teacher.photoURL}
                                alt={teacher.name}
                                width={48}
                                height={48}
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
                            }`}>
                              <UserIcon className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            </div>
                          )}
                          <div>
                            <div className={`text-lg font-bold ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>{teacher.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className={`text-xs ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>متاح للتدريس</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedClass && (
                      <>
                        <div className="mb-6">
                          <div className={`text-sm mb-2 transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>الصف الدراسي</div>
                          <div className={`text-xl font-bold mb-1 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>{selectedClass.name}</div>
                          <div className={`text-base ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>{selectedClass.subject}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className={`p-4 rounded-xl ${
                            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                          }`}>
                            <div className="flex items-center gap-3 mb-3">
                              <ClockIcon className={`w-5 h-5 ${
                                isDarkMode ? 'text-primary-400' : 'text-primary-600'
                              }`} />
                              <div>
                                <div className={`text-xs ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>الموعد</div>
                                <div className={`text-sm font-semibold ${
                                  isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>{selectedClass.schedule}</div>
                              </div>
                            </div>
                          </div>
                          <div className={`p-4 rounded-xl ${
                            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                          }`}>
                            <div className="flex items-center gap-3 mb-3">
                              <UsersIcon className={`w-5 h-5 ${
                                isDarkMode ? 'text-purple-400' : 'text-purple-600'
                              }`} />
                              <div>
                                <div className={`text-xs ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>المدة</div>
                                <div className={`text-sm font-semibold ${
                                  isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>{selectedClass.duration}</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Price */}
                        <div className={`rounded-xl p-5 mb-6 ${
                          isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
                        }`}>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className={`text-sm ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>الرسوم الشهرية</div>
                              <div className={`text-2xl font-bold ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>{selectedClass.price}</div>
                            </div>
                            <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                              isDarkMode 
                                ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50' 
                                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}>
                              شاملة جميع المواد
                            </div>
                          </div>
                          <div className={`text-xs ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-600'
                          }`}>
                            * تشمل رسوم الاشتراك جميع المواد الدراسية للمرحلة
                          </div>
                        </div>
                      </>
                    )}

                    {/* Benefits */}
                    <div className="space-y-3">
                      <h3 className={`text-sm font-semibold ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>مميزات الاشتراك</h3>
                      {[
                        'دروس مباشرة أونلاين',
                        'تسجيلات متاحة 24/7',
                        'اختبارات دورية',
                        'متابعة شخصية من المدرس'
                      ].map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <CheckIcon className={`w-4 h-4 ${
                            isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                          }`} />
                          <span className={`text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Subscription Form */}
              <div className="col-span-2">
                <div className={`rounded-2xl overflow-hidden transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gradient-to-b from-gray-800 to-gray-900' 
                    : 'bg-gradient-to-b from-white to-gray-50'
                } shadow-2xl`}>
                  <div className={`p-8 ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-primary-900/30 to-blue-900/30' 
                      : 'bg-gradient-to-r from-primary-600 to-blue-600'
                  }`}>
                    <div className="flex items-center gap-4">
                      <UserIcon className="w-8 h-8 text-white" />
                      <div>
                        <h2 className="text-2xl font-bold text-white">بيانات الاشتراك</h2>
                        <p className="text-sm text-white/80">أدخل بياناتك الشخصية لإنشاء حساب</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    {error && (
                      <div className={`mb-8 rounded-xl p-4 ${
                        isDarkMode 
                          ? 'bg-red-900/20 border border-red-800/50' 
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex items-start gap-3">
                          <AlertIcon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className={`font-semibold ${
                              isDarkMode ? 'text-red-300' : 'text-red-800'
                            }`}>{error}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        {/* Name */}
                        <div>
                          <label htmlFor="name" className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
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
                              className={`w-full px-4 py-3 pr-12 text-base rounded-xl border transition-all ${
                                errors.name 
                                  ? 'border-red-300 focus:border-red-500 bg-red-50' 
                                  : isDarkMode
                                  ? 'bg-gray-800 border-gray-700 text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-900/30'
                                  : 'bg-white border-gray-200 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                              }`}
                              placeholder="أدخل اسمك الكامل"
                            />
                            <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          </div>
                          {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div>
                          <label htmlFor="email" className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
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
                              className={`w-full px-4 py-3 pr-12 text-base rounded-xl border transition-all ${
                                errors.email 
                                  ? 'border-red-300 focus:border-red-500 bg-red-50' 
                                  : isDarkMode
                                  ? 'bg-gray-800 border-gray-700 text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-900/30'
                                  : 'bg-white border-gray-200 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                              }`}
                              placeholder="example@email.com"
                              dir="ltr"
                            />
                            <MailIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          </div>
                          {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                        </div>

                        {/* Phone */}
                        <div>
                          <label htmlFor="phone" className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
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
                              className={`w-full px-4 py-3 pr-12 text-base rounded-xl border transition-all ${
                                errors.phone 
                                  ? 'border-red-300 focus:border-red-500 bg-red-50' 
                                  : isDarkMode
                                  ? 'bg-gray-800 border-gray-700 text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-900/30'
                                  : 'bg-white border-gray-200 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                              }`}
                              placeholder="01xxxxxxxxx"
                              dir="ltr"
                            />
                            <PhoneIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          </div>
                          {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone}</p>}
                        </div>

                        {/* Password */}
                        <div>
                          <label htmlFor="password" className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            كلمة المرور *
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              id="password"
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-3 pr-12 text-base rounded-xl border transition-all ${
                                errors.password 
                                  ? 'border-red-300 focus:border-red-500 bg-red-50' 
                                  : isDarkMode
                                  ? 'bg-gray-800 border-gray-700 text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-900/30'
                                  : 'bg-white border-gray-200 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                              }`}
                              placeholder="أدخل كلمة المرور"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2"
                            >
                              {showPassword ? (
                                <EyeOffIcon className="w-5 h-5 text-gray-400" />
                              ) : (
                                <EyeIcon className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                          </div>
                          {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                          <p className={`mt-2 text-sm transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-500'
                          }`}>يجب أن تكون 6 أحرف على الأقل</p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <label htmlFor="confirmPassword" className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            تأكيد كلمة المرور *
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              id="confirmPassword"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-3 pr-12 text-base rounded-xl border transition-all ${
                                errors.confirmPassword 
                                  ? 'border-red-300 focus:border-red-500 bg-red-50' 
                                  : isDarkMode
                                  ? 'bg-gray-800 border-gray-700 text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-900/30'
                                  : 'bg-white border-gray-200 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                              }`}
                              placeholder="أعد إدخال كلمة المرور"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2"
                            >
                              {showConfirmPassword ? (
                                <EyeOffIcon className="w-5 h-5 text-gray-400" />
                              ) : (
                                <EyeIcon className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                          </div>
                          {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>}
                        </div>
                      </div>

                      {/* Privacy and Terms */}
                      <div className={`rounded-xl p-6 ${
                        isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-start gap-4">
                          <ShieldIcon className={`w-6 h-6 ${
                            isDarkMode ? 'text-primary-400' : 'text-primary-600'
                          }`} />
                          <div>
                            <h4 className={`text-lg font-semibold mb-2 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>حماية البيانات</h4>
                            <p className={`text-sm mb-4 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              بياناتك محمية وسيتم استخدامها فقط لأغراض التواصل وتأكيد الاشتراك. لن نشارك معلوماتك مع أي جهة خارجية.
                            </p>
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id="terms"
                                className="w-4 h-4 rounded"
                                required
                              />
                              <label htmlFor="terms" className={`text-sm ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                أوافق على{' '}
                                <Link href="/terms" className="font-semibold text-primary-600 hover:text-primary-700">
                                  الشروط والأحكام
                                </Link>{' '}
                                و{' '}
                                <Link href="/privacy" className="font-semibold text-primary-600 hover:text-primary-700">
                                  سياسة الخصوصية
                                </Link>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={submitting}
                          className={`w-full text-white py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl ${
                            isDarkMode
                              ? 'bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 disabled:from-gray-700 disabled:to-gray-800'
                              : 'bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500'
                          }`}
                        >
                          {submitting ? (
                            <div className="flex items-center justify-center gap-3">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                              <span>جاري إنشاء الحساب...</span>
                            </div>
                          ) : (
                            'إنشاء الحساب والمتابعة'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Loading Component
function LoadingState({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-b from-gray-900 to-gray-800' 
        : 'bg-gradient-to-b from-gray-50 to-white'
    }`}>
      {/* Mobile Loading */}
      <div className="lg:hidden text-center">
        <div className={`animate-spin rounded-full h-16 w-16 border-b-4 mx-auto mb-6 ${
          isDarkMode ? 'border-primary-500' : 'border-primary-600'
        }`}></div>
        <p className={`text-lg font-medium transition-colors duration-300 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>جاري تحميل البيانات...</p>
        <p className={`text-sm mt-2 transition-colors duration-300 ${
          isDarkMode ? 'text-gray-500' : 'text-gray-500'
        }`}>يرجى الانتظار قليلاً</p>
      </div>
      
      {/* Desktop Loading */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-center gap-8">
          <div className="space-y-4">
            <div className="w-64 h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
            <div className="w-48 h-4 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse mx-auto"></div>
          </div>
          <div className="space-y-4 w-96">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Error Component
function ErrorState({ error, isDarkMode }: { error: string, isDarkMode: boolean }) {
  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-b from-gray-900 to-gray-800' 
        : 'bg-gradient-to-b from-gray-50 to-white'
    }`}>
      <div className="text-center max-w-md">
        {/* Mobile Error */}
        <div className="lg:hidden">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <AlertIcon className={`w-10 h-10 ${isDarkMode ? 'text-red-500' : 'text-red-600'}`} />
          </div>
          <h2 className={`text-xl font-bold mb-3 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>حدث خطأ</h2>
          <p className={`mb-6 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>{error}</p>
          <Link
            href="/"
            className={`inline-flex items-center justify-center px-8 py-3 rounded-xl font-medium transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-primary-600 to-blue-600 text-white hover:scale-105' 
                : 'bg-gradient-to-r from-primary-600 to-blue-600 text-white hover:scale-105'
            } shadow-lg`}
          >
            العودة للرئيسية
          </Link>
        </div>
        
        {/* Desktop Error */}
        <div className="hidden lg:block">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <AlertIcon className={`w-12 h-12 ${isDarkMode ? 'text-red-500' : 'text-red-600'}`} />
          </div>
          <h2 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>حدث خطأ</h2>
          <p className={`text-lg mb-8 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>{error}</p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className={`inline-flex items-center justify-center px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-primary-600 to-blue-600 text-white' 
                  : 'bg-gradient-to-r from-primary-600 to-blue-600 text-white'
              } shadow-lg hover:shadow-xl`}
            >
              العودة للرئيسية
            </Link>
            <button
              onClick={() => window.location.reload()}
              className={`px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                isDarkMode 
                  ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-primary-500' 
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:border-primary-500'
              }`}
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <SubscribeForm />
    </Suspense>
  );
}

function SuspenseFallback() {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-b from-gray-900 to-gray-800' 
        : 'bg-gradient-to-b from-gray-50 to-white'
    }`}>
      <div className="text-center">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto ${
          isDarkMode ? 'border-primary-500' : 'border-primary-600'
        }`}></div>
        <p className={`mt-4 transition-colors duration-300 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>جاري التحميل...</p>
      </div>
    </div>
  );
}