'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Registration logic will be implemented here
    setTimeout(() => setLoading(false), 1000);
  };

  const handleSocialLogin = async (provider: string) => {
    setError('');
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 bg-white" dir="rtl">
      <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-8 items-center">
        {/* Right Side - Branding */}
        <div className="hidden lg:block">
          <div className="text-center space-y-6">
            <div className="relative w-32 h-32 mx-auto">
              <Image
                src="/logo.png"
                alt="حصتي"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-xl leading-relaxed text-gray-600">
              منصة تعليمية متكاملة لإدارة المراكز التعليمية
            </p>
            <div className="pt-8 space-y-4">
              <div className="flex items-center justify-center gap-3 text-gray-700">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-lg">إدارة شاملة للطلاب والمعلمين</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-gray-700">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-lg">متابعة الحضور والغياب</span>
              </div>
              <div className="flex items-center justify-center gap-3 text-gray-700">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-lg">تقارير تفصيلية وإحصائيات</span>
              </div>
            </div>
          </div>
        </div>

        {/* Left Side - Register Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="border rounded-2xl shadow-lg p-4 sm:p-6 bg-white border-gray-200">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-6 sm:mb-8 text-center">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto">
                <Image
                  src="/logo.png"
                  alt="حصتي"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">إنشاء حساب جديد</h1>
              <p className="text-gray-600 text-sm sm:text-base">انضم إلى منصة حصتي التعليمية</p>
            </div>

            {error && (
              <div className="border px-3 py-2 rounded-lg mb-4 text-sm bg-red-50 border-red-200 text-red-700">
                {error}
              </div>
            )}

            <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-semibold mb-1.5 text-gray-900 text-right">
                  الاسم الكامل
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent text-right text-base"
                  placeholder="أدخل الاسم الكامل"
                  required
                  dir="rtl"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold mb-1.5 text-gray-900 text-right">
                  رقم الهاتف (اختياري)
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent text-right text-base"
                  placeholder="مثال: 01012345678"
                  dir="rtl"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-1.5 text-gray-900 text-right">
                  البريد الإلكتروني
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent text-right text-base"
                  placeholder="your@email.com"
                  required
                  dir="ltr"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold mb-1.5 text-gray-900 text-right">
                  كلمة المرور
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent text-right text-base"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-1.5 text-gray-900 text-right">
                  تأكيد كلمة المرور
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent text-right text-base"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-2 sm:py-2.5 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base sm:text-lg mt-2"
              >
                {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
              </button>
            </form>

            <div className="relative my-5 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">أو سجل باستخدام</span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <button
                onClick={() => handleSocialLogin('Google')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-medium text-sm text-gray-700">تسجيل بواسطة Google</span>
              </button>
              <button
                onClick={() => handleSocialLogin('Facebook')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="font-medium text-sm text-gray-700">تسجيل بواسطة Facebook</span>
              </button>
            </div>

            <div className="mt-5 text-center">
              <p className="text-sm text-gray-600">
                لديك حساب بالفعل؟{' '}
                <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-5 text-center">
            <Link href="/" className="text-sm inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              العودة إلى الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
