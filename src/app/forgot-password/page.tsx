'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('الرجاء إدخال البريد الإلكتروني');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
      setEmail('');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('لا يوجد حساب مسجل بهذا البريد الإلكتروني');
      } else if (err.code === 'auth/invalid-email') {
        setError('البريد الإلكتروني غير صالح');
      } else {
        setError('حدث خطأ. يرجى المحاولة مرة أخرى.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="relative w-24 h-24 mx-auto">
              <Image
                src="/logo.png"
                alt="حصتي"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">نسيت كلمة المرور؟</h1>
            <p className="text-gray-600">أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-r-4 border-red-500 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border-r-4 border-green-500 rounded">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 text-right">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                placeholder="your@email.com"
                required
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
            >
              {loading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
            </button>
          </form>

          <div className="mt-8 text-center space-y-3">
            <Link 
              href="/login" 
              className="block text-primary-600 hover:text-primary-700 font-medium"
            >
              العودة لتسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
