'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { MailIcon, CheckIcon, AlertIcon } from '@/components/icons/Icons';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');

  const [checking, setChecking] = useState(true);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push('/');
      return;
    }

    // Check email verification status
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      setChecking(true);
      
      // Reload user to get latest email verification status
      await user.reload();
      
      if (user.emailVerified) {
        setVerified(true);
        
        // Update pending subscription with email verified status
        try {
          await updateDoc(doc(db, 'pendingSubscriptions', user.uid), {
            emailVerified: true,
            emailVerifiedAt: new Date(),
          });
        } catch (error) {
          console.error('Error updating subscription:', error);
        }
        
        // Redirect to success page after 2 seconds
        setTimeout(() => {
          router.push('/subscribe/success');
        }, 2000);
      }
      
      setChecking(false);
    });

    return () => unsubscribe();
  }, [email, router]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleResendEmail = async () => {
    if (!auth.currentUser) return;

    setResending(true);
    setResendMessage('');

    try {
      await sendEmailVerification(auth.currentUser);
      setResendMessage('تم إرسال رسالة التأكيد بنجاح! يرجى التحقق من بريدك الإلكتروني');
      setCountdown(60);
      setCanResend(false);
    } catch (error: any) {
      console.error('Error resending email:', error);
      if (error.code === 'auth/too-many-requests') {
        setResendMessage('تم إرسال العديد من الطلبات. يرجى الانتظار قليلاً والمحاولة مرة أخرى');
      } else {
        setResendMessage('حدث خطأ أثناء إرسال البريد. يرجى المحاولة مرة أخرى');
      }
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!auth.currentUser) return;

    setChecking(true);
    
    try {
      await auth.currentUser.reload();
      
      if (auth.currentUser.emailVerified) {
        setVerified(true);
        
        // Update pending subscription
        try {
          await updateDoc(doc(db, 'pendingSubscriptions', auth.currentUser.uid), {
            emailVerified: true,
            emailVerifiedAt: new Date(),
          });
        } catch (error) {
          console.error('Error updating subscription:', error);
        }
        
        // Redirect to success page
        setTimeout(() => {
          router.push('/subscribe/success');
        }, 2000);
      } else {
        setResendMessage('البريد الإلكتروني لم يتم تأكيده بعد. يرجى التحقق من صندوق البريد الوارد أو البريد المزعج');
      }
    } catch (error) {
      console.error('Error checking verification:', error);
      setResendMessage('حدث خطأ أثناء التحقق. يرجى المحاولة مرة أخرى');
    } finally {
      setChecking(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckIcon className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">تم التأكيد بنجاح!</h1>
          <p className="text-gray-600 text-lg mb-6">
            تم تأكيد بريدك الإلكتروني بنجاح. جاري التحويل إلى صفحة النجاح...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8">
        {/* Icon */}
        <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <MailIcon className="w-12 h-12 text-primary-600" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
          تأكيد البريد الإلكتروني
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-center mb-2">
          لقد أرسلنا رسالة تأكيد إلى:
        </p>
        <p className="text-primary-600 font-semibold text-center mb-6 break-all">
          {email}
        </p>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <CheckIcon className="w-5 h-5 text-blue-600" />
            الخطوات التالية:
          </h3>
          <ol className="text-sm text-gray-700 space-y-2 mr-7 list-decimal">
            <li>افتح بريدك الإلكتروني</li>
            <li>ابحث عن رسالة التأكيد من &quot;حصتي&quot;</li>
            <li>اضغط على رابط التأكيد في الرسالة</li>
            <li>عد إلى هذه الصفحة واضغط &quot;تحقق من التأكيد&quot;</li>
          </ol>
        </div>

        {/* Check verification button */}
        <button
          onClick={handleCheckVerification}
          disabled={checking}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:cursor-not-allowed mb-4"
        >
          {checking ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>جاري التحقق...</span>
            </div>
          ) : (
            'تحقق من التأكيد'
          )}
        </button>

        {/* Resend message */}
        {resendMessage && (
          <div className={`mb-4 p-4 rounded-xl ${
            resendMessage.includes('بنجاح') 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start gap-2">
              {resendMessage.includes('بنجاح') ? (
                <CheckIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertIcon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              <p className={`text-sm ${
                resendMessage.includes('بنجاح') ? 'text-green-800' : 'text-red-800'
              }`}>
                {resendMessage}
              </p>
            </div>
          </div>
        )}

        {/* Resend email button */}
        <div className="text-center">
          <p className="text-gray-600 text-sm mb-3">لم تستلم الرسالة؟</p>
          <button
            onClick={handleResendEmail}
            disabled={resending || !canResend}
            className="text-primary-600 hover:text-primary-700 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {resending ? (
              'جاري الإرسال...'
            ) : canResend ? (
              'إعادة إرسال رسالة التأكيد'
            ) : (
              `إعادة الإرسال متاحة بعد ${countdown} ثانية`
            )}
          </button>
        </div>

        {/* Help text */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center mb-2">
            تأكد من التحقق من مجلد البريد المزعج (Spam) إذا لم تجد الرسالة
          </p>
          <div className="text-center">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري التحميل...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
