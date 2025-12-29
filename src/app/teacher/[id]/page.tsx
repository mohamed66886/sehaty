'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getTeacher } from '@/lib/firebase/firestore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Teacher } from '@/types';
import { 
  TeacherIcon, 
  StarIcon, 
  UsersIcon, 
  BookIcon, 
  ClockIcon, 
  CheckIcon, 
  AwardIcon, 
  CalendarIcon, 
  GraduationIcon,
  ChevronLeftIcon,
  ShareIcon,
  HeartIcon,
  PhoneIcon,
  MessageIcon,
  MapPinIcon,
  VideoIcon,
  BadgeIcon,
  CertificateIcon
} from '@/components/icons/Icons';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import FloatingButtons from '@/components/FloatingButtons';
import { useTheme } from '@/contexts/ThemeContext';
import Head from "next/head";

interface ClassItem {
  id: string;
  name: string;
  subject: string;
  schedule: string;
  duration: string;
  price: string;
  studentsCount: number;
  maxStudents: number;
  available: boolean;
  isActive: boolean;
}

export default function TeacherDetailsPage() {
  const params = useParams();
  const teacherId = params.id as string;
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'classes' | 'info' | 'reviews'>('classes');
  const [isFavorite, setIsFavorite] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    async function loadTeacher() {
      try {
        const teacherData = await getTeacher(teacherId);
        setTeacher(teacherData);
      } catch (error) {
        console.error('Error loading teacher:', error);
      } finally {
        setLoading(false);
      }
    }
    
    async function loadClasses() {
      try {
        const classesRef = collection(db, 'classes');
        const q = query(classesRef, where('teacherId', '==', teacherId), where('isActive', '==', true));
        const snapshot = await getDocs(q);
        
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          available: doc.data().studentsCount < doc.data().maxStudents,
        })) as ClassItem[];

        setClasses(data);
      } catch (error) {
        console.error('Error loading classes:', error);
      }
    }

    loadTeacher();
    loadClasses();
  }, [teacherId]);

  // Loading State
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-white'
      }`}>
        <div className="text-center">
          {/* Desktop Loading */}
          <div className="hidden lg:block">
            <div className="flex gap-8">
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
          
          {/* Mobile Loading */}
          <div className="lg:hidden">
            <div className="w-32 h-32 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse mb-6 mx-auto"></div>
            <div className="w-48 h-6 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse mb-4 mx-auto"></div>
            <div className="w-32 h-4 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-white'
      }`}>
        <div className="text-center p-6">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            <TeacherIcon className={`w-12 h-12 ${
              isDarkMode ? 'text-gray-600' : 'text-gray-400'
            }`} />
          </div>
          <h2 className={`text-2xl lg:text-3xl font-bold mb-4 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>المدرس غير موجود</h2>
          <p className={`text-gray-500 mb-8 max-w-md mx-auto transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            لم نتمكن من العثور على المدرس المطلوب
          </p>
          <Link
            href="/"
            className={`inline-flex items-center justify-center px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-primary-600 to-blue-600 text-white' 
                : 'bg-gradient-to-r from-primary-600 to-blue-600 text-white'
            } shadow-lg hover:shadow-xl`}
          >
            <ChevronLeftIcon className="w-5 h-5 ml-2" />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  const initials = teacher.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <Head>
        <title>{teacher.name} | منصة حصتي</title>
        <meta name="description" content={`صفحة تعريفية للمدرس ${teacher.name} في منصة حصتي التعليمية`} />
        <meta property="og:title" content={`${teacher.name} | منصة حصتي`} />
        <meta property="og:description" content={`صفحة تعريفية للمدرس ${teacher.name} في منصة حصتي التعليمية`} />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
      </Head>
      {/* Only show Header on desktop */}
      <div className="hidden lg:block">
        <Header />
      </div>
      
      <div className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-white'
      }`}>
        {/* ========== MOBILE DESIGN ========== */}
        <div className="lg:hidden">
          {/* Mobile Header */}
          <div className={`sticky top-0 z-50 px-4 py-3 border-b transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-900/95 backdrop-blur-sm border-gray-800' : 'bg-white/95 backdrop-blur-sm border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
              >
                <ChevronLeftIcon className={`w-6 h-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
              </Link>
              
              <h1 className="text-lg font-semibold truncate max-w-[40%]">
                {teacher.name}
              </h1>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`p-2 rounded-lg transition-colors duration-300 ${
                    isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  }`}
                >
                  <HeartIcon className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-red-500' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
                <button
                  onClick={() => {/* Share functionality */}}
                  className={`p-2 rounded-lg transition-colors duration-300 ${
                    isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  }`}
                >
                  <ShareIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Content */}
          <div className="p-4">
            {/* Teacher Profile Card - Mobile */}
            <div className={`rounded-2xl overflow-hidden mb-6 transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gradient-to-b from-gray-800 to-gray-900' 
                : 'bg-gradient-to-b from-white to-gray-50'
            } shadow-xl`}>
              {/* Profile Image */}
              <div className="relative h-64">
                {teacher.photoURL ? (
                  <>
                    {imageLoading && (
                      <div className={`absolute inset-0 flex items-center justify-center ${
                        isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                      }`}>
                        <div className={`text-4xl font-bold ${
                          isDarkMode ? 'text-gray-600' : 'text-gray-400'
                        }`}>{initials}</div>
                      </div>
                    )}
                    <Image
                      src={teacher.photoURL}
                      alt={teacher.name}
                      fill
                      className="object-cover"
                      sizes="100vw"
                      priority
                      quality={90}
                      onLoad={() => setImageLoading(false)}
                      onError={() => setImageLoading(false)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </>
                ) : (
                  <div className={`absolute inset-0 flex items-center justify-center ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-gray-800 to-gray-900' 
                      : 'bg-gradient-to-br from-primary-50 to-blue-50'
                  }`}>
                    <div className={`text-5xl font-bold ${
                      isDarkMode ? 'text-gray-400' : 'text-primary-600'
                    }`}>{initials}</div>
                  </div>
                )}
                
                {/* Floating Info */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className={`px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 mb-2 ${
                        isDarkMode 
                          ? 'bg-black/50 backdrop-blur-sm text-gray-200' 
                          : 'bg-white/90 backdrop-blur-sm text-gray-700'
                      }`}>
                        <TeacherIcon className="w-3 h-3" />
                        <span>هيئة التدريس</span>
                      </div>
                      <h1 className={`text-xl font-bold mb-1 ${
                        isDarkMode ? 'text-white' : 'text-white'
                      }`}>{teacher.name}</h1>
                    </div>
                    
                    {/* Rating Badge */}
                    <div className={`flex flex-col items-center p-2 rounded-xl ${
                      isDarkMode 
                        ? 'bg-black/50 backdrop-blur-sm' 
                        : 'bg-white/90 backdrop-blur-sm'
                    }`}>
                      <div className="flex items-center gap-0.5">
                        <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold">4.8</span>
                      </div>
                      <span className="text-xs text-gray-500 mt-0.5">التقييم</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="p-4">
                {/* Quick Actions */}
                <div className="flex items-center justify-around mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                  <button className="flex flex-col items-center gap-1">
                    <div className={`p-2 rounded-full ${
                      isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      <PhoneIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    </div>
                    <span className="text-xs font-medium">اتصل</span>
                  </button>
                  <button className="flex flex-col items-center gap-1">
                    <div className={`p-2 rounded-full ${
                      isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      <MessageIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    </div>
                    <span className="text-xs font-medium">رسالة</span>
                  </button>
                  <button className="flex flex-col items-center gap-1">
                    <div className={`p-2 rounded-full ${
                      isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      <VideoIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    </div>
                    <span className="text-xs font-medium">فيديو</span>
                  </button>
                </div>

                {/* Subjects */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {teacher.subjects.map((subject, idx) => (
                      <span 
                        key={idx} 
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 active:scale-95 ${
                          isDarkMode 
                            ? 'bg-gray-800 text-gray-300' 
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className={`grid grid-cols-3 gap-2 mb-4 p-3 rounded-xl ${
                  isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
                }`}>
                  <div className="text-center">
                    <UsersIcon className={`w-5 h-5 mx-auto mb-1 ${
                      isDarkMode ? 'text-primary-400' : 'text-primary-600'
                    }`} />
                    <div className={`text-base font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{teacher.studentIds.length}</div>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>طلاب</div>
                  </div>
                  <div className="text-center">
                    <BookIcon className={`w-5 h-5 mx-auto mb-1 ${
                      isDarkMode ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                    <div className={`text-base font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{classes.length}</div>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>صفوف</div>
                  </div>
                  <div className="text-center">
                    <GraduationIcon className={`w-5 h-5 mx-auto mb-1 ${
                      isDarkMode ? 'text-amber-400' : 'text-amber-600'
                    }`} />
                    <div className={`text-base font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>5+</div>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>سنوات</div>
                  </div>
                </div>

                {/* Bio */}
                {teacher.bio && (
                  <div className="mb-4">
                    <h3 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      <GraduationIcon className="w-4 h-4" />
                      نبذة تعريفية
                    </h3>
                    <p className={`text-xs leading-relaxed ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>{teacher.bio}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Tabs */}
            <div className={`sticky top-14 z-40 mb-4 rounded-xl overflow-hidden ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <div className="flex">
                <button
                  onClick={() => setActiveTab('classes')}
                  className={`flex-1 py-3 text-center text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'classes'
                      ? isDarkMode
                        ? 'bg-primary-600 text-white'
                        : 'bg-primary-600 text-white'
                      : isDarkMode
                        ? 'text-gray-400'
                        : 'text-gray-500'
                  }`}
                >
                  الصفوف
                </button>
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex-1 py-3 text-center text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'info'
                      ? isDarkMode
                        ? 'bg-primary-600 text-white'
                        : 'bg-primary-600 text-white'
                      : isDarkMode
                        ? 'text-gray-400'
                        : 'text-gray-500'
                  }`}
                >
                  المعلومات
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`flex-1 py-3 text-center text-sm font-medium transition-colors duration-200 ${
                    activeTab === 'reviews'
                      ? isDarkMode
                        ? 'bg-primary-600 text-white'
                        : 'bg-primary-600 text-white'
                      : isDarkMode
                        ? 'text-gray-400'
                        : 'text-gray-500'
                  }`}
                >
                  التقييمات
                </button>
              </div>
            </div>

            {/* Mobile Tab Content */}
            <div>
              {/* Classes Tab - Mobile */}
              {activeTab === 'classes' && (
                <div className="space-y-3">
                  {classes.length === 0 ? (
                    <div className={`rounded-xl p-8 text-center ${
                      isDarkMode 
                        ? 'bg-gradient-to-b from-gray-800 to-gray-900' 
                        : 'bg-gradient-to-b from-white to-gray-50'
                    } shadow-lg`}>
                      <CalendarIcon className={`w-12 h-12 mx-auto mb-4 ${
                        isDarkMode ? 'text-gray-600' : 'text-gray-400'
                      }`} />
                      <h3 className={`text-lg font-bold mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>لا توجد صفوف حالياً</h3>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>سيتم إضافة صفوف جديدة قريباً</p>
                    </div>
                  ) : (
                    classes.map((classItem) => (
                      <div
                        key={classItem.id}
                        className={`rounded-xl overflow-hidden transition-all duration-300 active:scale-[0.98] ${
                          isDarkMode 
                            ? 'bg-gradient-to-b from-gray-800 to-gray-900' 
                            : 'bg-gradient-to-b from-white to-gray-50'
                        } shadow-lg`}
                      >
                        <div className={`p-4 ${
                          isDarkMode 
                            ? 'bg-gradient-to-r from-primary-900/30 to-blue-900/30' 
                            : 'bg-gradient-to-r from-primary-600 to-blue-600'
                        }`}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  classItem.available
                                    ? 'bg-white/20 text-white'
                                    : 'bg-rose-500/20 text-white'
                                }`}>
                                  {classItem.available ? 'متاح' : 'مكتمل'}
                                </span>
                              </div>
                              <h3 className="text-base font-bold text-white leading-tight">
                                {classItem.name}
                              </h3>
                              <p className="text-xs text-white/80 mt-1">{classItem.subject}</p>
                            </div>
                            <BookIcon className="w-5 h-5 text-white/80" />
                          </div>
                        </div>

                        <div className="p-4">
                          {/* Details */}
                          <div className="space-y-3 mb-4">
                            <div className="flex items-center gap-3">
                              <ClockIcon className={`w-4 h-4 ${
                                isDarkMode ? 'text-primary-400' : 'text-primary-600'
                              }`} />
                              <div>
                                <div className={`text-xs ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>الموعد</div>
                                <div className="text-sm font-semibold">{classItem.schedule}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <UsersIcon className={`w-4 h-4 ${
                                isDarkMode ? 'text-purple-400' : 'text-purple-600'
                              }`} />
                              <div className="flex-1">
                                <div className={`text-xs ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>الطلاب المسجلين</div>
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-semibold">
                                    {classItem.studentsCount}/{classItem.maxStudents}
                                  </div>
                                  <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full ${
                                        classItem.available 
                                          ? 'bg-emerald-500' 
                                          : 'bg-rose-500'
                                      }`}
                                      style={{ width: `${(classItem.studentsCount / classItem.maxStudents) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Price */}
                          <div className={`rounded-lg p-3 mb-4 ${
                            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                          }`}>
                            <div className="text-center">
                              <div className={`text-xs mb-1 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>الرسوم الشهرية</div>
                              <div className={`text-xl font-bold ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}>{classItem.price}</div>
                            </div>
                          </div>

                          {/* Action Button */}
                          {classItem.available ? (
                            <Link
                              href={`/subscribe?teacherId=${teacherId}&classId=${classItem.id}`}
                              className={`block w-full text-white text-center py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-300 active:scale-95 ${
                                isDarkMode 
                                  ? 'bg-gradient-to-r from-primary-600 to-blue-600' 
                                  : 'bg-gradient-to-r from-primary-600 to_blue-600'
                              } shadow-md`}
                            >
                              التسجيل في الصف
                            </Link>
                          ) : (
                            <button
                              disabled
                              className="block w-full bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-center py-3 px-4 rounded-lg font-semibold text-sm"
                            >
                              الصف مكتمل
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Info Tab - Mobile */}
              {activeTab === 'info' && (
                <div className={`rounded-xl p-4 ${
                  isDarkMode 
                    ? 'bg-gradient-to-b from-gray-800 to-gray-900' 
                    : 'bg-gradient-to-b from-white to-gray-50'
                } shadow-lg`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-emerald-900/30 to-teal-900/30' 
                        : 'bg-gradient-to-r from-emerald-100 to-teal-100'
                    }`}>
                      <AwardIcon className={`w-5 h-5 ${
                        isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>المؤهلات والخبرات</h3>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      'خبرة في التدريس لأكثر من 5 سنوات',
                      'تخرج من كلية التربية جامعة القاهرة',
                      'متخصص في المناهج الحديثة',
                      'حاصل على شهادات تدريب متقدمة',
                      'نشر أبحاث في المجلات التعليمية',
                      'مشارك في مؤتمرات التعليم الدولية'
                    ].map((qual, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                      >
                        <div className={`p-1.5 rounded ${
                          isDarkMode 
                            ? 'bg-emerald-900/30' 
                            : 'bg-emerald-100'
                        }`}>
                          <CheckIcon className={`w-3 h-3 ${
                            isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                          }`} />
                        </div>
                        <span className={`text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>{qual}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Tab - Mobile */}
              {activeTab === 'reviews' && (
                <div className={`rounded-xl p-4 ${
                  isDarkMode 
                    ? 'bg-gradient-to-b from-gray-800 to-gray-900' 
                    : 'bg-gradient-to-b from-white to-gray-50'
                } shadow-lg`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className={`text-lg font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>التقييمات</h3>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>آراء الطلاب السابقين</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <span className="text-lg font-bold">4.8</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Review 1 */}
                    <div className={`p-3 rounded-lg ${
                      isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-400 to-blue-400"></div>
                        <div>
                          <div className={`text-sm font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>أحمد محمد</div>
                          <div className="flex items-center gap-1">
                            <StarIcon className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs text-gray-500">قبل أسبوع</span>
                          </div>
                        </div>
                      </div>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        المعلم ممتاز جداً، طريقة الشرح سهلة ومبسطة.
                      </p>
                    </div>

                    {/* Review 2 */}
                    <div className={`p-3 rounded-lg ${
                      isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"></div>
                        <div>
                          <div className={`text-sm font-semibold ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>سارة أحمد</div>
                          <div className="flex items-center gap-1">
                            <StarIcon className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs text-gray-500">قبل شهر</span>
                          </div>
                        </div>
                      </div>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        شرح مفصل ودقيق، ومتابعة مستمرة للطلاب.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========== DESKTOP DESIGN ========== */}
        <div className="hidden lg:block">
          <div className="container mx-auto px-8 py-12 max-w-7xl">
            {/* Desktop Hero Section */}
            <div className="grid grid-cols-3 gap-8 mb-12">
              {/* Left Column - Teacher Image & Basic Info */}
              <div className="col-span-1">
                <div className={`rounded-2xl overflow-hidden mb-6 transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gradient-to-b from-gray-800 to-gray-900' 
                    : 'bg-gradient-to-b from-white to-gray-50'
                } shadow-2xl`}>
                  {/* Teacher Image */}
                  <div className="relative h-80">
                    {teacher.photoURL ? (
                      <>
                        {imageLoading && (
                          <div className={`absolute inset-0 flex items-center justify-center ${
                            isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                          }`}>
                            <div className={`text-5xl font-bold ${
                              isDarkMode ? 'text-gray-600' : 'text-gray-400'
                            }`}>{initials}</div>
                          </div>
                        )}
                        <Image
                          src={teacher.photoURL}
                          alt={teacher.name}
                          fill
                          className="object-cover"
                          sizes="33vw"
                          priority
                          quality={100}
                          onLoad={() => setImageLoading(false)}
                          onError={() => setImageLoading(false)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      </>
                    ) : (
                      <div className={`absolute inset-0 flex items-center justify-center ${
                        isDarkMode 
                          ? 'bg-gradient-to-br from-gray-800 to-gray-900' 
                          : 'bg-gradient-to-br from-primary-50 to-blue-50'
                      }`}>
                        <div className={`text-6xl font-bold ${
                          isDarkMode ? 'text-gray-400' : 'text-primary-600'
                        }`}>{initials}</div>
                      </div>
                    )}
                  </div>

                  {/* Teacher Info */}
                  <div className="p-6">
                    <div className="text-center mb-6">
                      <h1 className={`text-2xl font-bold mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{teacher.name}</h1>
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                        isDarkMode 
                          ? 'bg-gray-800 text-gray-300' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        <TeacherIcon className="w-4 h-4" />
                        <span>هيئة التدريس</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className={`grid grid-cols-3 gap-4 mb-6 p-4 rounded-xl ${
                      isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
                    }`}>
                      <div className="text-center">
                        <div className={`w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center ${
                          isDarkMode 
                            ? 'bg-gradient-to-br from-primary-900/30 to-blue-900/30' 
                            : 'bg-gradient-to-br from-primary-100 to-blue-100'
                        }`}>
                          <UsersIcon className={`w-6 h-6 ${
                            isDarkMode ? 'text-primary-400' : 'text-primary-600'
                          }`} />
                        </div>
                        <div className={`text-xl font-bold mb-1 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{teacher.studentIds.length}</div>
                        <div className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>طلاب</div>
                      </div>
                      <div className="text-center">
                        <div className={`w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center ${
                          isDarkMode 
                            ? 'bg-gradient-to-br from-purple-900/30 to-indigo-900/30' 
                            : 'bg-gradient-to-br from-purple-100 to-indigo-100'
                        }`}>
                          <BookIcon className={`w-6 h-6 ${
                            isDarkMode ? 'text-purple-400' : 'text-purple-600'
                          }`} />
                        </div>
                        <div className={`text-xl font-bold mb-1 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{classes.length}</div>
                        <div className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>صفوف</div>
                      </div>
                      <div className="text-center">
                        <div className={`w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center ${
                          isDarkMode 
                            ? 'bg-gradient-to-br from-amber-900/30 to-yellow-900/30' 
                            : 'bg-gradient-to-br from-amber-100 to-yellow-100'
                        }`}>
                          <StarIcon className="w-6 h-6 text-amber-500" />
                        </div>
                        <div className={`text-xl font-bold mb-1 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>4.8</div>
                        <div className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>التقييم</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
                        isDarkMode 
                          ? 'bg-gradient-to-r from-primary-600 to-blue-600 text-white' 
                          : 'bg-gradient-to-r from-primary-600 to_blue-600 text-white'
                      } shadow-lg hover:shadow-xl`}>
                        التواصل مع المدرس
                      </button>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setIsFavorite(!isFavorite)}
                          className={`flex-1 py-3 rounded-xl font-semibold transition-colors duration-300 ${
                            isDarkMode 
                              ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-primary-500' 
                              : 'bg-gray-100 text-gray-700 border border-gray-300 hover:border-primary-500'
                          }`}
                        >
                          {isFavorite ? 'تم الإضافة' : 'المفضلة'}
                        </button>
                        <button className={`flex-1 py-3 rounded-xl font-semibold transition-colors duration-300 ${
                          isDarkMode 
                            ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-primary-500' 
                            : 'bg-gray-100 text-gray-700 border border-gray-300 hover:border-primary-500'
                        }`}>
                          مشاركة
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Qualifications - Desktop */}
                <div className={`rounded-2xl p-6 transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-gradient-to-b from-gray-800 to-gray-900' 
                    : 'bg-gradient-to-b from-white to-gray-50'
                } shadow-2xl`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-xl ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-emerald-900/30 to-teal-900/30' 
                        : 'bg-gradient-to-r from-emerald-100 to-teal-100'
                    }`}>
                      <CertificateIcon className={`w-6 h-6 ${
                        isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>المؤهلات</h3>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      'خبرة تدريس 5+ سنوات',
                      'خريج كلية التربية',
                      'متخصص مناهج حديثة',
                      'شهادات تدريب متقدمة'
                    ].map((qual, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800"
                      >
                        <div className={`p-2 rounded-lg ${
                          isDarkMode 
                            ? 'bg-emerald-900/30' 
                            : 'bg-emerald-100'
                        }`}>
                          <CheckIcon className={`w-4 h-4 ${
                            isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
                          }`} />
                        </div>
                        <span className={`font-medium ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>{qual}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Main Content */}
              <div className="col-span-2">
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1 className={`text-4xl font-bold mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{teacher.name}</h1>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <StarIcon className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                          <span className="text-lg font-bold">4.8</span>
                          <span className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>(120 تقييم)</span>
                        </div>
                        <span className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>•</span>
                        <span className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>5+ سنوات خبرة</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                        isDarkMode 
                          ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-800/50' 
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}>
                        متاح للتدريس
                      </div>
                    </div>
                  </div>

                  {/* Subjects */}
                  <div className="mb-8">
                    <h3 className={`text-lg font-semibold mb-4 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>التخصصات</h3>
                    <div className="flex flex-wrap gap-3">
                      {teacher.subjects.map((subject, idx) => (
                        <span 
                          key={idx} 
                          className={`px-6 py-3 rounded-xl text-base font-medium transition-all duration-300 hover:scale-105 ${
                            isDarkMode 
                              ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-gray-300 border border-gray-700 hover:border-primary-500' 
                              : 'bg-gradient-to-r from-white to-gray-50 text-gray-700 border border-gray-300 hover:border-primary-400'
                          } shadow-md`}
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bio */}
                  {teacher.bio && (
                    <div className={`rounded-2xl p-6 mb-8 ${
                      isDarkMode 
                        ? 'bg-gradient-to-b from-gray-800 to-gray-900' 
                        : 'bg-gradient-to-b from-white to-gray-50'
                    } shadow-xl`}>
                      <h3 className={`text-xl font-bold mb-4 flex items-center gap-3 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        <GraduationIcon className="w-6 h-6" />
                        نبذة تعريفية
                      </h3>
                      <p className={`text-lg leading-relaxed ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>{teacher.bio}</p>
                    </div>
                  )}
                </div>

                {/* Classes Section - Desktop */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className={`text-2xl font-bold mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>الصفوف الدراسية المتاحة</h2>
                      <p className={`${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>اختر الصف المناسب لك وابدأ رحلتك التعليمية</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm ${
                      isDarkMode 
                        ? 'bg-gray-800 text-gray-300' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {classes.length} صف متاح
                    </div>
                  </div>

                  {classes.length === 0 ? (
                    <div className={`rounded-2xl p-12 text-center ${
                      isDarkMode 
                        ? 'bg-gradient-to-b from-gray-800 to-gray-900' 
                        : 'bg-gradient-to-b from-white to-gray-50'
                    } shadow-xl`}>
                      <CalendarIcon className={`w-16 h-16 mx-auto mb-6 ${
                        isDarkMode ? 'text-gray-600' : 'text-gray-400'
                      }`} />
                      <h3 className={`text-2xl font-bold mb-4 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>لا توجد صفوف حالياً</h3>
                      <p className={`text-lg mb-8 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>سيتم إضافة صفوف جديدة قريباً</p>
                      <button className={`px-8 py-3 rounded-xl font-semibold transition-colors duration-300 ${
                        isDarkMode 
                          ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-primary-500' 
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:border-primary-500'
                      }`}>
                        إشعارني عند الإضافة
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-6">
                      {classes.map((classItem) => (
                        <div
                          key={classItem.id}
                          className={`rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] group ${
                            isDarkMode 
                              ? 'bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-800 hover:border-primary-600' 
                              : 'bg-gradient-to-b from-white to-gray-50 border border-gray-200 hover:border-primary-400'
                          } shadow-xl hover:shadow-2xl`}
                        >
                          {/* Class Header */}
                          <div className={`relative p-6 ${
                            isDarkMode 
                              ? 'bg-gradient-to-r from-primary-900/30 to-blue-900/30' 
                              : 'bg-gradient-to-r from-primary-600 to-blue-600'
                          }`}>
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="text-xl font-bold text-white leading-tight mb-2 group-hover:translate-x-1 transition-transform duration-300">
                                  {classItem.name}
                                </h3>
                                <p className="text-primary-100">{classItem.subject}</p>
                              </div>
                              {classItem.available ? (
                                <span className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                                  متاح
                                </span>
                              ) : (
                                <span className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                                  مكتمل
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Class Body */}
                          <div className="p-6">
                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                              <div className={`p-4 rounded-xl ${
                                isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
                              }`}>
                                <div className="flex items-center gap-3 mb-3">
                                  <ClockIcon className={`w-5 h-5 ${
                                    isDarkMode ? 'text-primary-400' : 'text-primary-600'
                                  }`} />
                                  <div>
                                    <div className={`text-xs ${
                                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>موعد الحصة</div>
                                    <div className="text-sm font-semibold">{classItem.schedule}</div>
                                  </div>
                                </div>
                              </div>
                              <div className={`p-4 rounded-xl ${
                                isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
                              }`}>
                                <div className="flex items-center gap-3 mb-3">
                                  <BookIcon className={`w-5 h-5 ${
                                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                                  }`} />
                                  <div>
                                    <div className={`text-xs ${
                                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>مدة الحصة</div>
                                    <div className="text-sm font-semibold">{classItem.duration}</div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Students Progress */}
                            <div className="mb-6">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <UsersIcon className={`w-5 h-5 ${
                                    isDarkMode ? 'text-purple-400' : 'text-purple-600'
                                  }`} />
                                  <div>
                                    <div className={`text-sm font-semibold ${
                                      isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>
                                      {classItem.studentsCount} من {classItem.maxStudents}
                                    </div>
                                    <div className={`text-xs ${
                                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>الطلاب المسجلين</div>
                                  </div>
                                </div>
                                <div className="text-sm font-bold">
                                  {Math.round((classItem.studentsCount / classItem.maxStudents) * 100)}%
                                </div>
                              </div>
                              <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    classItem.available 
                                      ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
                                      : 'bg-gradient-to-r from-rose-500 to-pink-500'
                                  }`}
                                  style={{ width: `${(classItem.studentsCount / classItem.maxStudents) * 100}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Price & Action */}
                            <div className="flex items-center justify-between gap-6">
                              <div className="flex-1">
                                <div className={`text-xs mb-1 ${
                                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>الرسوم الشهرية</div>
                                <div className={`text-3xl font-bold bg-gradient-to-r ${
                                  isDarkMode 
                                    ? 'from-primary-400 to-blue-400 bg-clip-text text-transparent' 
                                    : 'from-primary-600 to-blue-600 bg-clip-text text-transparent'
                                }`}>{classItem.price}</div>
                              </div>
                              {classItem.available ? (
                                <Link
                                  href={`/subscribe?teacherId=${teacherId}&classId=${classItem.id}`}
                                  className={`px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 ${
                                    isDarkMode 
                                      ? 'bg-gradient-to-r from-primary-600 to_blue-600' 
                                      : 'bg-gradient-to-r from-primary-600 to_blue-600'
                                  } shadow-lg hover:shadow-xl`}
                                >
                                  التسجيل الآن
                                </Link>
                              ) : (
                                <button
                                  disabled
                                  className={`px-8 py-3 rounded-xl font-semibold ${
                                    isDarkMode 
                                      ? 'bg-gray-800 text-gray-400 border border-gray-700' 
                                      : 'bg-gray-100 text-gray-400 border border-gray-300'
                                  }`}
                                >
                                  مكتمل
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
      <FloatingButtons />
    </>
  );
}