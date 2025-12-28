'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getTeacher } from '@/lib/firebase/firestore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Teacher } from '@/types';
import { TeacherIcon, StarIcon, UsersIcon, BookIcon, ClockIcon, CheckIcon } from '@/components/icons/Icons';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import FloatingButtons from '@/components/FloatingButtons';
import { useTheme } from '@/contexts/ThemeContext';

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

  if (!teacher) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-primary-50 via-white to-primary-50'
      }`}>
        <div className="text-center">
          <TeacherIcon className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h2 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>المدرس غير موجود</h2>
          <p className={`mb-6 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>لم نتمكن من العثور على المدرس المطلوب</p>
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

  const initials = teacher.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <Header />
      
      <div className={`min-h-screen pb-8 sm:pb-12 transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-900' : 'bg-gray-50'
      }`}>
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl py-4 sm:py-6 md:py-8 lg:py-12">
          {/* Teacher Profile Card */}
          <div className={`rounded-lg sm:rounded-xl shadow-md overflow-hidden mb-4 sm:mb-6 md:mb-8 transition-colors duration-300 ${
            isDarkMode ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className="flex flex-col md:grid md:grid-cols-5 gap-0">
              {/* Teacher Photo */}
              <div className="md:col-span-2 relative">
                <div className="relative h-64 sm:h-80 md:h-full bg-gray-100">
                  {teacher.photoURL ? (
                    <>
                      {imageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                          <div className="text-5xl font-bold text-gray-400">{initials}</div>
                        </div>
                      )}
                      <Image
                        src={teacher.photoURL}
                        alt={teacher.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 40vw"
                        priority
                        quality={90}
                        onLoad={() => setImageLoading(false)}
                        onError={() => setImageLoading(false)}
                      />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200 text-gray-500">
                      <div className="text-5xl font-bold mb-4">{initials}</div>
                      <TeacherIcon className="w-20 h-20" />
                    </div>
                  )}
                </div>
              </div>

              {/* Teacher Info */}
              <div className="md:col-span-3 p-4 sm:p-6 md:p-8">
                <div className={`border-b pb-4 sm:pb-6 mb-4 sm:mb-6 transition-colors duration-300 ${
                  isDarkMode ? 'border-slate-700' : 'border-gray-200'
                }`}>
                  <div className={`flex items-center gap-2 text-xs sm:text-sm mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-sky-400' : 'text-primary-600'
                  }`}>
                    <TeacherIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>هيئة التدريس</span>
                  </div>
                  <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>{teacher.name}</h1>
                  <div className="flex flex-wrap items-center gap-2">
                    {teacher.subjects.map((subject, idx) => (
                      <span 
                        key={idx} 
                        className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors duration-300 ${
                          isDarkMode ? 'bg-sky-900 text-sky-300' : 'bg-primary-50 text-primary-700'
                        }`}
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                {teacher.bio && (
                  <div className="mb-4 sm:mb-6">
                    <h3 className={`text-base sm:text-lg font-semibold mb-2 transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>نبذة تعريفية</h3>
                    <p className={`text-sm sm:text-base leading-relaxed transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>{teacher.bio}</p>
                  </div>
                )}

                {/* Stats Grid */}
                <div className={`grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t transition-colors duration-300 ${
                  isDarkMode ? 'border-slate-700' : 'border-gray-200'
                }`}>
                  <div className="text-center">
                    <UsersIcon className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 transition-colors duration-300 ${
                      isDarkMode ? 'text-sky-400' : 'text-primary-600'
                    }`} />
                    <div className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{teacher.studentIds.length}</div>
                    <div className={`text-xs transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>عدد الطلاب</div>
                  </div>
                  <div className="text-center">
                    <BookIcon className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 transition-colors duration-300 ${
                      isDarkMode ? 'text-sky-400' : 'text-primary-600'
                    }`} />
                    <div className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>{classes.length}</div>
                    <div className={`text-xs transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>عدد الصفوف</div>
                  </div>
                  <div className="text-center">
                    <StarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 mx-auto mb-1" />
                    <div className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>4.8</div>
                    <div className={`text-xs transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>التقييم</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Qualifications Section */}
        <div className={`rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8 transition-colors duration-300 ${
          isDarkMode ? 'bg-slate-800' : 'bg-white'
        }`}>
          <h2 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>المؤهلات والخبرات</h2>

          <div className="space-y-2 sm:space-y-3">
            {[
              'خبرة في التدريس لأكثر من 5 سنوات',
              'تخرج من كلية التربية جامعة القاهرة',
              'متخصص في المناهج الحديثة والتكنولوجيا التعليمية',
              'حاصل على شهادات تدريب متقدمة'
            ].map((qual, idx) => (
              <div 
                key={idx} 
                className="flex items-start gap-2 sm:gap-3 py-2 sm:py-3"
              >
                <div className="mt-0.5">
                  <svg className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 ${
                    isDarkMode ? 'text-sky-400' : 'text-primary-600'
                  }`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className={`text-sm sm:text-base leading-relaxed transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>{qual}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Classes Section */}
        <div>
          <div className="mb-4 sm:mb-6">
            <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-2 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>الصفوف الدراسية المتاحة</h2>
            <p className={`text-sm sm:text-base transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>اختر الصف المناسب لك وابدأ رحلتك التعليمية</p>
          </div>

          {classes.length === 0 ? (
            <div className={`text-center py-12 sm:py-16 rounded-lg sm:rounded-xl shadow-md transition-colors duration-300 ${
              isDarkMode ? 'bg-slate-800' : 'bg-white'
            }`}>
              <BookIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className={`text-lg sm:text-xl font-bold mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>لا توجد صفوف متاحة حالياً</h3>
              <p className={`text-sm sm:text-base transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>سيتم إضافة صفوف جديدة قريباً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {classes.map((classItem, index) => (
                <div
                  key={classItem.id}
                  className={`rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden ${
                    isDarkMode ? 'bg-slate-800' : 'bg-white'
                  }`}
                >
                  {/* Card Header */}
                  <div className={`p-3 sm:p-4 transition-colors duration-300 ${
                    isDarkMode ? 'bg-sky-700' : 'bg-primary-600'
                  }`}>
                    <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                      <h3 className="text-base sm:text-lg font-bold text-white leading-tight flex-1">{classItem.name}</h3>
                      {classItem.available ? (
                        <span className="bg-green-500 text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                          متاح
                        </span>
                      ) : (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                          مكتمل
                        </span>
                      )}
                    </div>
                    <p className={`text-xs sm:text-sm font-semibold transition-colors duration-300 ${
                      isDarkMode ? 'text-sky-100' : 'text-primary-100'
                    }`}>{classItem.subject}</p>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-6">
                    {/* Details */}
                    <div className="space-y-2.5 sm:space-y-3 mb-4 sm:mb-6">
                      <div className={`flex items-start gap-2 sm:gap-3 transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <ClockIcon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 transition-colors duration-300 ${
                          isDarkMode ? 'text-sky-400' : 'text-primary-600'
                        }`} />
                        <div>
                          <div className={`text-xs mb-0.5 transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-500'
                          }`}>موعد الحصة</div>
                          <div className="text-xs sm:text-sm font-semibold">{classItem.schedule}</div>
                        </div>
                      </div>
                      <div className={`flex items-start gap-2 sm:gap-3 transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <BookIcon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 transition-colors duration-300 ${
                          isDarkMode ? 'text-sky-400' : 'text-primary-600'
                        }`} />
                        <div>
                          <div className={`text-xs mb-0.5 transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-500'
                          }`}>مدة الحصة</div>
                          <div className="text-xs sm:text-sm font-semibold">{classItem.duration}</div>
                        </div>
                      </div>
                      <div className={`flex items-start gap-2 sm:gap-3 transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <UsersIcon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 transition-colors duration-300 ${
                          isDarkMode ? 'text-sky-400' : 'text-primary-600'
                        }`} />
                        <div>
                          <div className={`text-xs mb-0.5 transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-500'
                          }`}>الطلاب المسجلين</div>
                          <div className="text-xs sm:text-sm font-semibold">
                            {classItem.studentsCount} من {classItem.maxStudents}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className={`rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border transition-colors duration-300 ${
                      isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="text-center">
                        <div className={`text-xs mb-1 transition-colors duration-300 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>رسوم الاشتراك الشهري</div>
                        <div className={`text-2xl sm:text-3xl font-bold transition-colors duration-300 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{classItem.price}</div>
                      </div>
                    </div>

                    {/* Action Button */}
                    {classItem.available ? (
                      <Link
                        href={`/subscribe?teacherId=${teacherId}&classId=${classItem.id}`}
                        className={`block w-full text-white text-center py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base transition-colors ${
                          isDarkMode ? 'bg-sky-600 hover:bg-sky-700' : 'bg-primary-600 hover:bg-primary-700'
                        }`}
                      >
                        التسجيل في الصف
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="block w-full bg-gray-300 text-gray-600 text-center py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base cursor-not-allowed"
                      >
                        الصف مكتمل
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
      
    <Footer />
    <FloatingButtons />
    </>
  );
}
