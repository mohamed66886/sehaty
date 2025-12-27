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
    <>
      <Header />
      
      <div className="min-h-screen bg-gray-50 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 md:py-12">
          {/* Teacher Profile Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="grid md:grid-cols-5 gap-0">
              {/* Teacher Photo */}
              <div className="md:col-span-2 relative">
                <div className="relative h-96 md:h-full bg-gray-100">
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
              <div className="md:col-span-3 p-8">
                <div className="border-b border-gray-200 pb-6 mb-6">
                  <div className="flex items-center gap-2 text-primary-600 text-sm mb-2">
                    <TeacherIcon className="w-4 h-4" />
                    <span>هيئة التدريس</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{teacher.name}</h1>
                  <div className="flex flex-wrap items-center gap-2">
                    {teacher.subjects.map((subject, idx) => (
                      <span 
                        key={idx} 
                        className="bg-primary-50 text-primary-700 px-4 py-1.5 rounded-md text-sm font-semibold"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                {teacher.bio && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">نبذة تعريفية</h3>
                    <p className="text-gray-600 leading-relaxed">{teacher.bio}</p>
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <UsersIcon className="w-6 h-6 text-primary-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-gray-900">{teacher.studentIds.length}</div>
                    <div className="text-xs text-gray-600">عدد الطلاب</div>
                  </div>
                  <div className="text-center">
                    <BookIcon className="w-6 h-6 text-primary-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-gray-900">{classes.length}</div>
                    <div className="text-xs text-gray-600">عدد الصفوف</div>
                  </div>
                  <div className="text-center">
                    <StarIcon className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-gray-900">4.8</div>
                    <div className="text-xs text-gray-600">التقييم</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Qualifications Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">المؤهلات والخبرات</h2>

          <div className="space-y-3">
            {[
              'خبرة في التدريس لأكثر من 5 سنوات',
              'تخرج من كلية التربية جامعة القاهرة',
              'متخصص في المناهج الحديثة والتكنولوجيا التعليمية',
              'حاصل على شهادات تدريب متقدمة'
            ].map((qual, idx) => (
              <div 
                key={idx} 
                className="flex items-start gap-3 py-3"
              >
                <div className="mt-0.5">
                  <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700 leading-relaxed">{qual}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Classes Section */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">الصفوف الدراسية المتاحة</h2>
            <p className="text-gray-600">اختر الصف المناسب لك وابدأ رحلتك التعليمية</p>
          </div>

          {classes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <BookIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد صفوف متاحة حالياً</h3>
              <p className="text-gray-600">سيتم إضافة صفوف جديدة قريباً</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((classItem, index) => (
                <div
                  key={classItem.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="bg-primary-600 p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg font-bold text-white leading-tight flex-1">{classItem.name}</h3>
                      {classItem.available ? (
                        <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                          متاح
                        </span>
                      ) : (
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                          مكتمل
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-primary-100 font-semibold">{classItem.subject}</p>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    {/* Details */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-3 text-gray-700">
                        <ClockIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs text-gray-500 mb-0.5">موعد الحصة</div>
                          <div className="text-sm font-semibold">{classItem.schedule}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-gray-700">
                        <BookIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs text-gray-500 mb-0.5">مدة الحصة</div>
                          <div className="text-sm font-semibold">{classItem.duration}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-gray-700">
                        <UsersIcon className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs text-gray-500 mb-0.5">الطلاب المسجلين</div>
                          <div className="text-sm font-semibold">
                            {classItem.studentsCount} من {classItem.maxStudents}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                      <div className="text-center">
                        <div className="text-xs text-gray-600 mb-1">رسوم الاشتراك الشهري</div>
                        <div className="text-3xl font-bold text-gray-900">{classItem.price}</div>
                      </div>
                    </div>

                    {/* Action Button */}
                    {classItem.available ? (
                      <Link
                        href={`/subscribe?teacherId=${teacherId}&classId=${classItem.id}`}
                        className="block w-full bg-primary-600 hover:bg-primary-700 text-white text-center py-3 px-6 rounded-lg font-semibold transition-colors"
                      >
                        التسجيل في الصف
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="block w-full bg-gray-300 text-gray-600 text-center py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
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
    </>
  );
}
