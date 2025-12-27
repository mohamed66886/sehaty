'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { CheckIcon, MailIcon, PhoneIcon, ClockIcon } from '@/components/icons/Icons';

export default function SubscribeSuccessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

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
          setSubscriptionData(subscriptionDoc.data());
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Success Icon Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
            <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckIcon className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              تم الاشتراك بنجاح! 🎉
            </h1>
            <p className="text-green-50 text-lg">
              مبروك! تم إنشاء حسابك وطلب الاشتراك بنجاح
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Subscription Details */}
            {subscriptionData && (
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">تفاصيل الاشتراك</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">الاسم:</span>
                    <span className="font-semibold text-gray-900">{subscriptionData.studentName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">المدرس:</span>
                    <span className="font-semibold text-gray-900">{subscriptionData.teacherName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">الصف:</span>
                    <span className="font-semibold text-gray-900">{subscriptionData.className}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">الحالة:</span>
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
                      قيد المراجعة
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ClockIcon className="w-6 h-6 text-primary-600" />
                الخطوات القادمة
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                  <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">المراجعة من المدرس</h3>
                    <p className="text-sm text-gray-600">
                      سيقوم المدرس بمراجعة طلب اشتراكك في أقرب وقت ممكن
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                  <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">التواصل معك</h3>
                    <p className="text-sm text-gray-600">
                      سيتم التواصل معك عبر البريد الإلكتروني أو الواتساب لتأكيد الاشتراك وترتيب التفاصيل
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                  <div className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">تفعيل الحساب</h3>
                    <p className="text-sm text-gray-600">
                      بعد الموافقة، يمكنك تسجيل الدخول إلى لوحة التحكم الخاصة بك
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MailIcon className="w-5 h-5 text-orange-600" />
                معلومات الاتصال
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <MailIcon className="w-4 h-4 text-gray-400" />
                  <span>سيتم إرسال التحديثات على: <span className="font-semibold">{subscriptionData?.studentEmail}</span></span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <PhoneIcon className="w-4 h-4 text-gray-400" />
                  <span>رقم التواصل: <span className="font-semibold" dir="ltr">{subscriptionData?.studentPhone}</span></span>
                </div>
              </div>
            </div>

            {/* Important Note */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-800">
                <strong>ملاحظة مهمة:</strong> يرجى التحقق من بريدك الإلكتروني بشكل دوري (بما في ذلك مجلد البريد المزعج) لمتابعة حالة طلب الاشتراك.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/login"
                className="block w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-center py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                الذهاب لتسجيل الدخول
              </Link>

              <button
                onClick={handleSignOut}
                className="block w-full bg-white hover:bg-gray-50 text-gray-700 text-center py-3 px-6 rounded-xl font-semibold border-2 border-gray-200 transition-all duration-300"
              >
                تسجيل الخروج
              </button>

              <Link
                href="/"
                className="block text-center text-gray-600 hover:text-gray-900 font-medium py-2 transition-colors"
              >
                العودة للصفحة الرئيسية
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Help */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            هل تحتاج مساعدة؟{' '}
            <Link href="/contact" className="text-primary-600 hover:text-primary-700 font-semibold">
              تواصل معنا
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
