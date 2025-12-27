'use client';

import Link from 'next/link';

export default function FirebaseSetupError() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🔧</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            يتطلب إعداد Firebase
          </h1>
          <p className="text-gray-600">
            التطبيق جاهز ولكن يحتاج إلى إعداد Firebase للعمل
          </p>
        </div>

        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="mr-3">
              <h3 className="text-sm font-medium text-red-800">
                Firebase Configuration Missing
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>ملف <code className="bg-red-100 px-2 py-1 rounded">.env.local</code> غير موجود أو غير مكتمل</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <h2 className="text-xl font-bold mb-3 text-gray-900">خطوات الإعداد السريع (5 دقائق):</h2>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="mr-3">
                  <h3 className="font-semibold text-gray-900">إنشاء مشروع Firebase</h3>
                  <p className="text-sm text-gray-600">
                    اذهب إلى{' '}
                    <a 
                      href="https://console.firebase.google.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      Firebase Console
                    </a>
                    {' '}وأنشئ مشروع جديد
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="mr-3">
                  <h3 className="font-semibold text-gray-900">تفعيل الخدمات</h3>
                  <p className="text-sm text-gray-600">
                    فعّل: Authentication (Email/Password) + Firestore Database + Storage
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="mr-3">
                  <h3 className="font-semibold text-gray-900">الحصول على بيانات الإعداد</h3>
                  <p className="text-sm text-gray-600">
                    إعدادات المشروع → Your apps → Web → انسخ firebaseConfig
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div className="mr-3">
                  <h3 className="font-semibold text-gray-900">إنشاء ملف .env.local</h3>
                  <div className="mt-2">
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto" dir="ltr">
{`NEXT_PUBLIC_FIREBASE_API_KEY=your-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABC123`}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                  5
                </div>
                <div className="mr-3">
                  <h3 className="font-semibold text-gray-900">إعادة تشغيل السيرفر</h3>
                  <div className="mt-2">
                    <code className="bg-gray-900 text-gray-100 px-3 py-2 rounded block text-sm" dir="ltr">
                      npm run dev
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="text-2xl ml-3">📚</div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">مستندات التوثيق</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• راجع <code className="bg-blue-100 px-2 py-0.5 rounded">FIREBASE_SETUP_REQUIRED.md</code> للتعليمات الكاملة</li>
                <li>• راجع <code className="bg-blue-100 px-2 py-0.5 rounded">SETUP.md</code> لدليل الإعداد المفصل</li>
                <li>• راجع <code className="bg-blue-100 px-2 py-0.5 rounded">README.md</code> للتوثيق الكامل</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <a
            href="https://console.firebase.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex-1 text-center"
          >
            فتح Firebase Console
          </a>
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary flex-1"
          >
            إعادة المحاولة
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>بعد إعداد Firebase، أعد تحميل هذه الصفحة</p>
        </div>
      </div>
    </div>
  );
}
