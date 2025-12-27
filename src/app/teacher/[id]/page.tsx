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
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <TeacherIcon className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">المدرس غير موجود</h2>
          <p className="text-gray-600 mb-6">لم نتمكن من العثور على المدرس المطلوب</p>
          <Link
            href="/"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  const initials = teacher.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 lg:px-8 max-w-7xl py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-primary-600 transition-colors flex-shrink-0"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-semibold text-sm sm:text-base">العودة</span>
            </Link>
            <h1 className="text-base sm:text-xl font-bold text-gray-900 text-center flex-1">تفاصيل المدرس</h1>
            <div className="w-16 sm:w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-8 max-w-7xl py-4 sm:py-6 md:py-12">
        {/* Teacher Profile Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden mb-6 sm:mb-8 md:mb-12">
          <div className="grid md:grid-cols-3 gap-0 md:gap-8">
            {/* Teacher Photo */}
            <div className="md:col-span-1">
              <div className="relative h-56 sm:h-64 md:h-full md:min-h-[400px] bg-gradient-to-br from-primary-600 to-primary-700">
                {teacher.photoURL ? (
                  <>
                    {imageLoading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 text-white">{initials}</div>
                        <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-white"></div>
                      </div>
                    )}
                    <Image
                      src={teacher.photoURL}
                      alt={teacher.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      priority
                      quality={90}
                      onLoad={() => setImageLoading(false)}
                      onError={() => setImageLoading(false)}
                    />
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4">{initials}</div>
                    <TeacherIcon className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 opacity-40" />
                  </div>
                )}
              </div>
            </div>

            {/* Teacher Info */}
            <div className="md:col-span-2 p-4 sm:p-6 md:p-8 lg:p-10">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">{teacher.name}</h2>
                <p className="text-base sm:text-lg md:text-xl text-primary-600 font-semibold mb-3 sm:mb-4">
                  {teacher.subjects.length > 0 ? teacher.subjects.join(' • ') : 'مدرس'}
                </p>
                {teacher.bio && (
                  <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">{teacher.bio}</p>
                )}
              </div>

              {/* Stats Grid */}
              <div className="hidden md:grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
                  <StarIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-yellow-600 mx-auto mb-1 sm:mb-2" />
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">4.8</div>
                  <div className="text-xs sm:text-sm text-gray-600">التقييم</div>
                </div>
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
                  <UsersIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary-600 mx-auto mb-1 sm:mb-2" />
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{teacher.studentIds.length}</div>
                  <div className="text-xs sm:text-sm text-gray-600">طالب</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
                  <BookIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-green-600 mx-auto mb-1 sm:mb-2" />
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{classes.length}</div>
                  <div className="text-xs sm:text-sm text-gray-600">صف</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
                  <ClockIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-600 mx-auto mb-1 sm:mb-2" />
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">5+</div>
                  <div className="text-xs sm:text-sm text-gray-600">سنوات خبرة</div>
                </div>
              </div>

              {/* Qualifications */}
              <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  المؤهلات والخبرات
                </h3>
                <ul className="space-y-2 text-gray-700 text-sm sm:text-base">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 mt-1 flex-shrink-0">•</span>
                    <span>خبرة في التدريس لأكثر من 5 سنوات</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 mt-1 flex-shrink-0">•</span>
                    <span>تخرج من كلية التربية جامعة القاهرة</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 mt-1 flex-shrink-0">•</span>
                    <span>متخصص في المناهج الحديثة والتكنولوجيا التعليمية</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 mt-1 flex-shrink-0">•</span>
                    <span>حاصل على شهادات تدريب متقدمة</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Classes Section */}
        <div className="mb-6 sm:mb-8">
          <div className="text-center mb-6 sm:mb-8 px-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">الصفوف المتاحة</h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600">اختر الصف المناسب لك وابدأ رحلتك التعليمية</p>
          </div>

          {classes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-md">
              <BookIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">لا توجد صفوف متاحة حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {classes.map((classItem, index) => (
                <div
                  key={classItem.id}
                  className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-3 sm:p-4 md:p-6">
                    {/* Class Header */}
                    <div className="mb-2 sm:mb-3 md:mb-4">
                      <div className="flex items-start justify-between gap-1 sm:gap-2 mb-1.5 sm:mb-2">
                        <h3 className="text-xs sm:text-base md:text-xl font-bold text-gray-900 flex-1 leading-tight line-clamp-2">{classItem.name}</h3>
                        {classItem.available ? (
                        <span className="bg-green-100 text-green-700 text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap flex-shrink-0">
                          متاح
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-700 text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap flex-shrink-0">
                          مكتمل
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-sm md:text-base text-primary-600 font-semibold truncate">{classItem.subject}</p>
                  </div>

                  {/* Class Details */}
                  <div className="space-y-1.5 sm:space-y-2 md:space-y-3 mb-2.5 sm:mb-4 md:mb-6">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600">
                      <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-400 flex-shrink-0" />
                      <span className="text-[10px] sm:text-xs md:text-sm leading-tight line-clamp-1">{classItem.schedule}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600">
                      <BookIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-400 flex-shrink-0" />
                      <span className="text-[10px] sm:text-xs md:text-sm line-clamp-1">مدة: {classItem.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600">
                      <UsersIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-400 flex-shrink-0" />
                      <span className="text-[10px] sm:text-xs md:text-sm">
                        {classItem.studentsCount}/{classItem.maxStudents} طالب
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-md sm:rounded-lg md:rounded-xl p-2 sm:p-3 md:p-4 mb-2 sm:mb-3 md:mb-4">
                    <div className="text-center">
                      <div className="text-base sm:text-xl md:text-2xl font-bold text-primary-700">{classItem.price}</div>
                      <div className="text-[9px] sm:text-xs md:text-sm text-gray-600">الاشتراك الشهري</div>
                    </div>
                  </div>

                  {/* Action Button */}
                  {classItem.available ? (
                    <Link
                      href={`/subscribe?teacherId=${teacherId}&classId=${classItem.id}`}
                      className="block w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-center py-2 sm:py-2.5 md:py-3 px-2 sm:px-4 rounded-md sm:rounded-lg md:rounded-xl font-semibold text-[11px] sm:text-sm md:text-base transition-all duration-300 transform active:scale-95 sm:hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      اشترك الآن
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="block w-full bg-gray-300 text-gray-500 text-center py-2 sm:py-2.5 md:py-3 px-2 sm:px-4 rounded-md sm:rounded-lg md:rounded-xl font-semibold text-[11px] sm:text-sm md:text-base cursor-not-allowed"
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
  );
}
