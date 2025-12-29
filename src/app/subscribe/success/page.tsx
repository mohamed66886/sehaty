'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { 
  CheckIcon, 
  MailIcon, 
  PhoneIcon, 
  ClockIcon,
  GraduationIcon,
  ShieldIcon,
  AlertCircleIcon,
  HomeIcon,
  LogOutIcon,
  ArrowRightIcon
} from '@/components/icons/Icons';

export default function SubscribeSuccessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      if (!user.emailVerified) {
        router.push(`/verify-email?email=${encodeURIComponent(user.email || '')}`);
        return;
      }

      try {
        // Get subscription data
        const subscriptionDoc = await getDoc(doc(db, 'pendingSubscriptions', user.uid));
        if (subscriptionDoc.exists()) {
          const data = subscriptionDoc.data();
          setSubscriptionData(data);
          
          // Calculate estimated review time
          const createdAt = data.createdAt?.toDate() || new Date();
          const reviewTime = new Date(createdAt);
          reviewTime.setDate(reviewTime.getDate() + 2); // 2 days for review
          
          const now = new Date();
          const diff = reviewTime.getTime() - now.getTime();
          
          if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            
            setTimeLeft({ days, hours, minutes });
          }
        }
      } catch (error) {
        console.error('Error loading subscription data:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        {/* Mobile Loading */}
        <div className="lg:hidden text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-transparent border-t-primary-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-b-primary-400 rounded-full animate-spin animation-delay-200"></div>
          </div>
          <p className="text-lg font-medium text-gray-600">جاري التحميل...</p>
          <p className="text-sm text-gray-500 mt-2">يتم الآن تحميل تفاصيل اشتراكك</p>
        </div>
        
        {/* Desktop Loading */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-center gap-8">
            <div className="space-y-4">
              <div className="w-64 h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
            </div>
            <div className="space-y-4 w-96">
              <div className="h-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-32 bg-gray-200 rounded-2xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ========== MOBILE DESIGN ========== */}
      <div className="lg:hidden">
        <div className="min-h-screen bg-gradient-to-b from-primary-50/50 to-white">
          {/* Mobile Header */}
          <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <LogOutIcon className="w-5 h-5" />
                <span className="text-sm font-medium">تسجيل خروج</span>
              </button>
              
              <h1 className="text-lg font-bold text-gray-900">تم الاشتراك بنجاح</h1>
              
              <Link
                href="/"
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
              >
                <HomeIcon className="w-5 h-5" />
                <span className="text-sm font-medium">الرئيسية</span>
              </Link>
            </div>
          </div>

          <div className="p-4">
            {/* Success Card - Mobile */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
              {/* Success Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center">
                <div className="relative inline-block">
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto">
                    <CheckIcon className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white animate-ping"></div>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  تم الاشتراك بنجاح!
                </h1>
                <p className="text-green-50 text-sm">
                  مبروك! تم تقديم طلب اشتراكك بنجاح
                </p>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Subscription Details */}
                {subscriptionData && (
                  <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
                        <GraduationIcon className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-lg font-bold text-gray-900">تفاصيل الاشتراك</h2>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">الاسم:</span>
                        <span className="font-semibold text-gray-900 text-sm">{subscriptionData.studentName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">المدرس:</span>
                        <span className="font-semibold text-gray-900 text-sm">{subscriptionData.teacherName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">الصف:</span>
                        <span className="font-semibold text-gray-900 text-sm">{subscriptionData.className}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">الحالة:</span>
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
                          قيد المراجعة
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Countdown Timer */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <ClockIcon className="w-5 h-5 text-orange-600" />
                    <h3 className="font-semibold text-gray-900">وقت المراجعة المتوقع</h3>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white rounded-xl p-3">
                      <div className="text-2xl font-bold text-gray-900">{timeLeft.days}</div>
                      <div className="text-xs text-gray-600 mt-1">أيام</div>
                    </div>
                    <div className="bg-white rounded-xl p-3">
                      <div className="text-2xl font-bold text-gray-900">{timeLeft.hours}</div>
                      <div className="text-xs text-gray-600 mt-1">ساعات</div>
                    </div>
                    <div className="bg-white rounded-xl p-3">
                      <div className="text-2xl font-bold text-gray-900">{timeLeft.minutes}</div>
                      <div className="text-xs text-gray-600 mt-1">دقائق</div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mt-3 text-center">
                    الوقت التقريبي للمراجعة من المدرس
                  </p>
                </div>

                {/* Next Steps */}
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldIcon className="w-5 h-5 text-primary-600" />
                    <h3 className="font-semibold text-gray-900">الخطوات القادمة</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                      <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-1">
                        1
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">مراجعة المدرس</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          سيقوم المدرس بمراجعة طلبك في أقرب وقت
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl">
                      <div className="bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-1">
                        2
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">التواصل معك</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          سيتم التواصل عبر البريد أو الواتساب
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl">
                      <div className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-1">
                        3
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">تفعيل الحساب</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          يمكنك تسجيل الدخول بعد الموافقة
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <MailIcon className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">معلومات التواصل</h3>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <MailIcon className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{subscriptionData?.studentEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <PhoneIcon className="w-4 h-4 text-gray-400" />
                      <span dir="ltr">{subscriptionData?.studentPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Important Note */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircleIcon className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                    <p className="text-xs text-red-800">
                      <strong>ملاحظة:</strong> تحقق من البريد الإلكتروني (بما فيهم البريد المزعج) لمتابعة التحديثات.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Link
                    href="/dashboard"
                    className="block w-full bg-gradient-to-r from-primary-600 to-blue-600 text-white text-center py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 active:scale-95 shadow-lg"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>الذهاب للوحة التحكم</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </div>
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="block w-full bg-white hover:bg-gray-50 text-gray-700 text-center py-3 px-6 rounded-xl font-semibold text-sm border-2 border-gray-200 transition-colors"
                  >
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                تحتاج مساعدة؟{' '}
                <Link href="/contact" className="text-primary-600 hover:text-primary-700 font-semibold">
                  تواصل معنا
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========== DESKTOP DESIGN ========== */}
      <div className="hidden lg:block">
        <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-blue-50/30">
          {/* Desktop Header */}
          <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-8 py-4">
            <div className="container mx-auto max-w-6xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <h1 className="text-xl font-bold text-gray-900">تم الاشتراك بنجاح</h1>
                  <div className={`px-4 py-2 rounded-full text-sm ${
                    subscriptionData?.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {subscriptionData?.status === 'pending' ? 'قيد المراجعة' : 'مقبول'}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <ArrowRightIcon className="w-5 h-5" />
                    <span>اللوحة التحكم</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
                  >
                    <LogOutIcon className="w-5 h-5" />
                    <span>تسجيل خروج</span>
                  </button>
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
                  >
                    <HomeIcon className="w-5 h-5" />
                    <span>الرئيسية</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Content */}
          <div className="container mx-auto max-w-6xl px-8 py-12">
            <div className="grid grid-cols-3 gap-8">
              {/* Left Column - Success Celebration */}
              <div className="col-span-2">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                  {/* Success Header */}
                  <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 p-8">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <CheckIcon className="w-16 h-16 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-white animate-ping opacity-75"></div>
                        <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-white animate-ping opacity-50"></div>
                      </div>
                      <div className="flex-1">
                        <h1 className="text-4xl font-bold text-white mb-3">
                          تم تقديم طلب الاشتراك بنجاح!
                        </h1>
                        <p className="text-green-50 text-lg">
                          مبروك! تم تقديم طلب اشتراكك وسيتم مراجعته من قبل المدرس
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    {/* Timeline */}
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <ClockIcon className="w-6 h-6 text-primary-600" />
                        خطوات المراجعة
                      </h2>
                      
                      <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-200 to-blue-200"></div>
                        
                        {/* Timeline Steps */}
                        <div className="space-y-8">
                          {/* Step 1 */}
                          <div className="flex items-start gap-6 relative">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-blue-500 flex items-center justify-center flex-shrink-0 z-10">
                              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                                <span className="text-xl font-bold text-primary-600">1</span>
                              </div>
                            </div>
                            <div className="flex-1 pt-2">
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">تقديم الطلب</h3>
                              <p className="text-gray-600">
                                تم تقديم طلب الاشتراك بنجاح وجارٍ الآن مراجعته من قبل المدرس
                              </p>
                            </div>
                          </div>

                          {/* Step 2 */}
                          <div className="flex items-start gap-6 relative">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center flex-shrink-0 z-10">
                              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                                <span className="text-xl font-bold text-amber-600">2</span>
                              </div>
                            </div>
                            <div className="flex-1 pt-2">
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">مراجعة المدرس</h3>
                              <p className="text-gray-600">
                                سيقوم المدرس بمراجعة طلبك خلال 24-48 ساعة وسيتم التواصل معك
                              </p>
                            </div>
                          </div>

                          {/* Step 3 */}
                          <div className="flex items-start gap-6 relative">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center flex-shrink-0 z-10">
                              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                                <span className="text-xl font-bold text-emerald-600">3</span>
                              </div>
                            </div>
                            <div className="flex-1 pt-2">
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">الموافقة والتفعيل</h3>
                              <p className="text-gray-600">
                                بعد الموافقة، يمكنك تسجيل الدخول والبدء في حضور الحصص
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact and Important Notes */}
                    <div className="grid grid-cols-2 gap-6">
                      {/* Contact Info */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <MailIcon className="w-6 h-6 text-blue-600" />
                          <h3 className="text-lg font-semibold text-gray-900">معلومات التواصل</h3>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                              <MailIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">البريد الإلكتروني</div>
                              <div className="font-semibold text-gray-900">{subscriptionData?.studentEmail}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                              <PhoneIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-600">رقم الهاتف</div>
                              <div className="font-semibold text-gray-900" dir="ltr">{subscriptionData?.studentPhone}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Important Notes */}
                      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <AlertCircleIcon className="w-6 h-6 text-red-600" />
                          <h3 className="text-lg font-semibold text-gray-900">ملاحظات مهمة</h3>
                        </div>
                        
                        <ul className="space-y-3 text-sm text-gray-700">
                          <li className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <div className="w-2 h-2 rounded-full bg-red-600"></div>
                            </div>
                            <span>تحقق من بريدك الإلكتروني بشكل دوري</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <div className="w-2 h-2 rounded-full bg-red-600"></div>
                            </div>
                            <span>التحقق من مجلد البريد المزعج (Spam)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <div className="w-2 h-2 rounded-full bg-red-600"></div>
                            </div>
                            <span>سيتم التواصل عبر الواتساب أيضاً</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <div className="w-2 h-2 rounded-full bg-red-600"></div>
                            </div>
                            <span>احتفظ برقم طلب الاشتراك للاستفسار</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Summary and Actions */}
              <div className="col-span-1">
                {/* Subscription Summary */}
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6">
                  <div className="bg-gradient-to-r from-primary-600 to-blue-600 p-6">
                    <h2 className="text-xl font-bold text-white">ملخص الاشتراك</h2>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">الطالب</div>
                        <div className="font-semibold text-gray-900">{subscriptionData?.studentName}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-600 mb-1">المدرس</div>
                        <div className="font-semibold text-gray-900">{subscriptionData?.teacherName}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-600 mb-1">الصف الدراسي</div>
                        <div className="font-semibold text-gray-900">{subscriptionData?.className}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-600 mb-1">رقم الطلب</div>
                        <div className="font-mono font-semibold text-gray-900 text-sm" dir="ltr">
                          {subscriptionData?.studentUid?.substring(0, 8).toUpperCase()}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-600 mb-1">تاريخ التقديم</div>
                        <div className="font-semibold text-gray-900">
                          {new Date().toLocaleDateString('ar-SA')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estimated Review Time */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 mb-6">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <ClockIcon className="w-6 h-6 text-orange-600" />
                      <h3 className="text-lg font-semibold text-gray-900">وقت المراجعة المتوقع</h3>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-xl p-4">
                        <div className="text-3xl font-bold text-gray-900">{timeLeft.days}</div>
                        <div className="text-sm text-gray-600 mt-1">أيام</div>
                      </div>
                      <div className="bg-white rounded-xl p-4">
                        <div className="text-3xl font-bold text-gray-900">{timeLeft.hours}</div>
                        <div className="text-sm text-gray-600 mt-1">ساعات</div>
                      </div>
                      <div className="bg-white rounded-xl p-4">
                        <div className="text-3xl font-bold text-gray-900">{timeLeft.minutes}</div>
                        <div className="text-sm text-gray-600 mt-1">دقائق</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      الوقت التقريبي لانتهاء مراجعة الطلب
                    </p>
                    <div className="mt-3 w-full h-2 bg-white rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-1000"
                        style={{ width: `${Math.min(100, ((48 - (timeLeft.days * 24 + timeLeft.hours)) / 48) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Link
                    href="/dashboard"
                    className="block w-full bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white text-center py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <ArrowRightIcon className="w-5 h-5" />
                      <span>الذهاب للوحة التحكم</span>
                    </div>
                  </Link>

                  <Link
                    href="/contact"
                    className="block w-full bg-white hover:bg-gray-50 text-gray-700 text-center py-3 px-6 rounded-xl font-semibold text-base border-2 border-gray-300 hover:border-gray-400 transition-all duration-300 hover:scale-105"
                  >
                    التواصل مع الدعم
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-center py-3 px-6 rounded-xl font-semibold text-base border-2 border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-8">
                <div className="text-gray-600">
                  هل تحتاج مساعدة فورية؟{' '}
                  <Link href="/contact" className="text-primary-600 hover:text-primary-700 font-semibold">
                    تواصل مع الدعم
                  </Link>
                </div>
                <div className="text-gray-600">
                  أو{' '}
                  <Link href="/faq" className="text-primary-600 hover:text-primary-700 font-semibold">
                    تصفح الأسئلة الشائعة
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}