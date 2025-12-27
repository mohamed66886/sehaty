'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { TeacherIcon, StarIcon, UsersIcon, CheckIcon, ClipboardIcon, ChatIcon, ChartIcon } from "@/components/icons/Icons";
import { getAllTeachers } from "@/lib/firebase/firestore";
import type { Teacher } from "@/types";

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadTeachers() {
      try {
        const teachersData = await getAllTeachers();
        // Show only the top 4 teachers for the landing page
        const topTeachers = teachersData.slice(0, 4);
        setTeachers(topTeachers);
        setFilteredTeachers(topTeachers);
        
        // Initialize image loading state
        const loadingState: Record<string, boolean> = {};
        topTeachers.forEach(teacher => {
          if (teacher.photoURL) {
            loadingState[teacher.uid] = true;
            // Preload images for faster loading
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = teacher.photoURL;
            document.head.appendChild(link);
          }
        });
        setImageLoading(loadingState);
      } catch (error) {
        console.error('Error loading teachers:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTeachers();
  }, []);

  // Filter teachers based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTeachers(teachers);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = teachers.filter(teacher => {
      const nameMatch = teacher.name.toLowerCase().includes(query);
      const subjectMatch = teacher.subjects.some(subject => 
        subject.toLowerCase().includes(query)
      );
      const bioMatch = teacher.bio?.toLowerCase().includes(query);
      
      return nameMatch || subjectMatch || bioMatch;
    });
    
    setFilteredTeachers(filtered);
  }, [searchQuery, teachers]);

  // Helper function to highlight search matches
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={index} className="bg-yellow-200 text-gray-900 px-1 rounded">{part}</mark>
        : part
    );
  };

  return (
    <section id="teachers" className="py-16 md:py-24 bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 md:mb-20 animate-fade-in">
          <div className="inline-block mb-4">
            <span className="bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold">
              نخبة من المحترفين
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-gray-900 leading-tight">
            مدرسينا المتميزين
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4 mb-8">
            نفخر بوجود نخبة من أفضل المدرسين المتميزين في مختلف التخصصات، مع سنوات من الخبرة والتفاني في التعليم
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto px-4 animate-slide-in-right">
            <div className="relative group">
              <input
                type="text"
                placeholder="ابحث عن مدرس أو مادة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pr-14 pl-12 text-base md:text-lg rounded-2xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all duration-300 shadow-md hover:shadow-lg bg-white"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors duration-300">
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all duration-300"
                  aria-label="مسح البحث"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="mt-3 px-2 animate-fade-in">
                <p className="text-sm md:text-base text-gray-600 flex items-center justify-center gap-2">
                  {filteredTeachers.length === 0 ? (
                    <>
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>لا توجد نتائج مطابقة للبحث</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold">
                        تم العثور على {filteredTeachers.length} {filteredTeachers.length === 1 ? 'مدرس' : 'مدرسين'}
                      </span>
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12 md:mb-20">
          {loading ? (
            // Loading state with skeleton cards
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-lg animate-pulse">
                  <div className="bg-gray-300 h-56 md:h-64"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : filteredTeachers.length === 0 ? (
            // No teachers found
            <div className="col-span-full text-center py-16 md:py-24">
              <div className="bg-white rounded-3xl p-12 shadow-lg max-w-md mx-auto">
                <TeacherIcon className="w-20 h-20 md:w-24 md:h-24 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {searchQuery ? 'لم يتم العثور على نتائج' : 'لا يوجد مدرسين حالياً'}
                </h3>
                <p className="text-gray-600">
                  {searchQuery ? 'حاول البحث بكلمات أخرى' : 'سنضيف مدرسين متميزين قريباً'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-300"
                  >
                    مسح البحث
                  </button>
                )}
              </div>
            </div>
          ) : (
            // Teachers list
            filteredTeachers.map((teacher, index) => {
              // Get teacher photo URL or use initials
              const photoURL = teacher.photoURL;
              const initials = teacher.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              
              return (
                <div
                  key={teacher.uid}
                  className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Teacher Image */}
                  <div className="relative h-56 md:h-64 overflow-hidden bg-gradient-to-br from-primary-600 to-primary-700">
                    {photoURL ? (
                      <>
                        {/* Background placeholder while loading */}
                        <div 
                          className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary-600 to-primary-700 transition-opacity duration-500 ${
                            imageLoading[teacher.uid] ? 'opacity-100' : 'opacity-0'
                          }`}
                        >
                          <div className="text-5xl md:text-6xl font-bold mb-3 text-white">
                            {initials}
                          </div>
                          <div className="mt-2">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                          </div>
                        </div>
                        {/* Actual image */}
                        <Image 
                          src={photoURL} 
                          alt={teacher.name}
                          fill
                          className="object-cover relative z-10 group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          priority={index < 2}
                          quality={90}
                          onLoad={() => {
                            setImageLoading(prev => ({
                              ...prev,
                              [teacher.uid]: false
                            }));
                          }}
                          onError={() => {
                            setImageLoading(prev => ({
                              ...prev,
                              [teacher.uid]: false
                            }));
                          }}
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20"></div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                        <div className="text-5xl md:text-6xl font-bold mb-3">
                          {initials}
                        </div>
                        <TeacherIcon className="w-14 h-14 md:w-16 md:h-16 opacity-40" />
                      </div>
                    )}
                  </div>
                  
                  {/* Teacher Info */}
                  <div className="p-5 md:p-6">
                    <h3 className="text-xl md:text-2xl font-bold mb-2 text-gray-900 group-hover:text-primary-600 transition-colors duration-300 line-clamp-1">
                      {searchQuery ? highlightText(teacher.name, searchQuery) : teacher.name}
                    </h3>
                    <p className="text-primary-600 font-semibold mb-3 text-sm md:text-base line-clamp-1">
                      {teacher.subjects.length > 0 ? (
                        searchQuery ? (
                          <span>{highlightText(teacher.subjects.join(' • '), searchQuery)}</span>
                        ) : (
                          teacher.subjects.join(' • ')
                        )
                      ) : 'مدرس'}
                    </p>
                    {teacher.bio && (
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2 min-h-[2.5rem]">
                        {searchQuery ? highlightText(teacher.bio, searchQuery) : teacher.bio}
                      </p>
                    )}
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-yellow-50 p-2 rounded-lg">
                          <StarIcon className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-sm md:text-base">4.8</span>
                          <span className="text-xs text-gray-500">التقييم</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-primary-50 p-2 rounded-lg">
                          <UsersIcon className="w-4 h-4 md:w-5 md:h-5 text-primary-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-sm md:text-base">
                            {teacher.studentIds.length}
                          </span>
                          <span className="text-xs text-gray-500">طالب</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <a
                      href={`/teacher/${teacher.uid}`}
                      className="block w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-center py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      عرض التفاصيل والاشتراك
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Features for Teachers */}
        <div className="bg-gradient-to-br from-white to-primary-50 rounded-3xl p-8 md:p-12 shadow-xl max-w-5xl mx-auto border border-primary-100">
          <div className="text-center mb-10">
            <div className="inline-block mb-4">
              <span className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                مزايا حصرية
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
              مزايا المعلمين على المنصة
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              نوفر لك كل الأدوات اللازمة لإدارة فصولك بفعالية وكفاءة
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
            <div className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-green-100 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <CheckIcon className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2 text-lg md:text-xl">إدارة الفصول بسهولة</h4>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    متابعة جميع الطلاب وحضورهم وأدائهم في مكان واحد منظم
                  </p>
                </div>
              </div>
            </div>
            
            <div className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-blue-100 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <ClipboardIcon className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2 text-lg md:text-xl">تسجيل النتائج فوراً</h4>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    سجل نتائج الامتحانات والواجبات بكل سهولة ووضوح
                  </p>
                </div>
              </div>
            </div>
            
            <div className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-purple-100 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <ChatIcon className="w-8 h-8 md:w-10 md:h-10 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2 text-lg md:text-xl">التواصل مع أولياء الأمور</h4>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    تواصل مباشر وسريع وفعال عند الحاجة مع أولياء الأمور
                  </p>
                </div>
              </div>
            </div>
            
            <div className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-orange-100 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <ChartIcon className="w-8 h-8 md:w-10 md:h-10 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2 text-lg md:text-xl">تقارير تلقائية</h4>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                    احصل على تقارير مفصلة ومرئية عن أداء كل طالب
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
