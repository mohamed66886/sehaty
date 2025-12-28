'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';

export default function LoginPage() {
  const { isDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle, signInWithFacebook, signInWithGithub, signInWithApple } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      // Redirect is handled by AuthContext
    } catch (err: any) {
      setError('فشل تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setError('');
    setLoading(true);
    
    try {
      switch (provider) {
        case 'Google':
          await signInWithGoogle();
          break;
        case 'Facebook':
          await signInWithFacebook();
          break;
        case 'GitHub':
          await signInWithGithub();
          break;
        case 'Apple':
          await signInWithApple();
          break;
        default:
          throw new Error('مزود غير مدعوم');
      }
    } catch (err: any) {
      console.error('Social login error:', err);
      
      // Handle specific Firebase errors
      if (err.code === 'auth/popup-closed-by-user') {
        setError('تم إلغاء عملية تسجيل الدخول');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('يوجد حساب بنفس البريد الإلكتروني بطريقة تسجيل دخول مختلفة');
      } else if (err.code === 'auth/popup-blocked') {
        setError('تم حظر النافذة المنبثقة. يرجى السماح للنوافذ المنبثقة في المتصفح');
      } else {
        setError(`فشل تسجيل الدخول عبر ${provider}. يرجى المحاولة مرة أخرى`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900' : 'bg-white'
    }`}>
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
            <p className={`text-xl leading-relaxed transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              منصة تعليمية متكاملة لإدارة المراكز التعليمية
            </p>
            <div className="pt-8 space-y-4">
              <div className={`flex items-center justify-center gap-3 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <svg className={`w-6 h-6 transition-colors duration-300 ${
                  isDarkMode ? 'text-sky-400' : 'text-primary-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-lg">إدارة شاملة للطلاب والمعلمين</span>
              </div>
              <div className={`flex items-center justify-center gap-3 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <svg className={`w-6 h-6 transition-colors duration-300 ${
                  isDarkMode ? 'text-sky-400' : 'text-primary-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-lg">متابعة الحضور والغياب</span>
              </div>
              <div className={`flex items-center justify-center gap-3 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                <svg className={`w-6 h-6 transition-colors duration-300 ${
                  isDarkMode ? 'text-sky-400' : 'text-primary-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-lg">نظام امتحانات ونتائج متطور</span>
              </div>
            </div>
          </div>
        </div>

        {/* Left Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <div className={`border rounded-2xl shadow-lg p-6 transition-colors duration-300 ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
     
            
     

            {error && (
              <div className={`border px-3 py-2 rounded-lg mb-4 text-sm transition-colors duration-300 ${
                isDarkMode ? 'bg-red-900/20 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {error}
              </div>
            )}





            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className={`block text-sm font-semibold mb-1.5 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  البريد الإلكتروني
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                    isDarkMode 
                      ? 'bg-slate-900 border-slate-700 text-white focus:ring-sky-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-primary-500'
                  }`}
                  placeholder="example@email.com"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="password" className={`block text-sm font-semibold mb-1.5 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  كلمة المرور
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                    isDarkMode 
                      ? 'bg-slate-900 border-slate-700 text-white focus:ring-sky-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-primary-500'
                  }`}
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className={`rounded transition-colors ${
                    isDarkMode 
                      ? 'border-slate-600 text-sky-600 focus:ring-sky-500' 
                      : 'border-gray-300 text-primary-600 focus:ring-primary-500'
                  }`} />
                  <span className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>تذكرني</span>
                </label>
                <Link
                  href="/forgot-password"
                  className={`text-sm font-medium transition-colors ${
                    isDarkMode 
                      ? 'text-sky-400 hover:text-sky-500' 
                      : 'text-primary-600 hover:text-primary-700'
                  }`}
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode 
                    ? 'bg-sky-600 hover:bg-sky-700' 
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </button>
            </form>

         <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t transition-colors duration-300 ${
                  isDarkMode ? 'border-slate-600' : 'border-gray-300'
                }`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-4 transition-colors duration-300 ${
                  isDarkMode ? 'bg-slate-800 text-gray-400' : 'bg-white text-gray-500'
                }`}>أو</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-2 mb-4">
              <button
                onClick={() => handleSocialLogin('Google')}
                disabled={loading}
                className={`w-full flex items-center justify-center gap-3 px-4 py-2.5 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode 
                    ? 'border-slate-600 hover:bg-slate-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className={`font-medium text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>تسجيل الدخول بواسطة Google</span>
              </button>

              <button
                onClick={() => handleSocialLogin('Facebook')}
                disabled={loading}
                className={`w-full flex items-center justify-center gap-3 px-4 py-2.5 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode 
                    ? 'border-slate-600 hover:bg-slate-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className={`font-medium text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>تسجيل الدخول بواسطة Facebook</span>
              </button>

              <button
                onClick={() => handleSocialLogin('GitHub')}
                disabled={loading}
                className={`w-full flex items-center justify-center gap-3 px-4 py-2.5 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode 
                    ? 'border-slate-600 hover:bg-slate-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill={isDarkMode ? '#FFFFFF' : '#181717'} viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className={`font-medium text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>تسجيل الدخول بواسطة GitHub</span>
              </button>

              <button
                onClick={() => handleSocialLogin('Apple')}
                disabled={loading}
                className={`w-full flex items-center justify-center gap-3 px-4 py-2.5 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode 
                    ? 'border-slate-600 hover:bg-slate-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill={isDarkMode ? '#FFFFFF' : '#000000'} viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span className={`font-medium text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-700'
                }`}>تسجيل الدخول بواسطة Apple</span>
              </button>
            </div>

            <div className="mt-5 text-center">
              <p className={`text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                ليس لديك حساب؟{' '}
                <Link href="/register" className={`font-semibold transition-colors ${
                  isDarkMode 
                    ? 'text-sky-400 hover:text-sky-500' 
                    : 'text-primary-600 hover:text-primary-700'
                }`}>
                  إنشاء حساب جديد
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-5 text-center">
            <Link href="/" className={`text-sm inline-flex items-center gap-2 transition-colors ${
              isDarkMode 
                ? 'text-gray-400 hover:text-gray-300' 
                : 'text-gray-600 hover:text-gray-900'
            }`}>
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
