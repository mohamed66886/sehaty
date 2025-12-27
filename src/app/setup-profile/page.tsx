'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { UserRole } from '@/types';
import Image from 'next/image';

export default function SetupProfilePage() {
  const { firebaseUser, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    role: 'student' as UserRole,
    phone: '',
  });

  useEffect(() => {
    // If user already has a profile, redirect
    if (user) {
      router.push('/');
      return;
    }

    // Pre-fill name from Firebase user
    if (firebaseUser?.displayName) {
      setFormData(prev => ({ ...prev, name: firebaseUser.displayName || '' }));
    }
  }, [user, firebaseUser, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firebaseUser) {
      setError('لم يتم العثور على معلومات المستخدم');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Create user document in Firestore
      const userDoc = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
        photoURL: firebaseUser.photoURL || '',
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userDoc);

      // Redirect based on role
      switch (formData.role) {
        case 'super_admin':
          router.push('/dashboard/super-admin');
          break;
        case 'teacher':
          router.push('/dashboard/teacher');
          break;
        case 'student':
          router.push('/dashboard/student');
          break;
        case 'parent':
          router.push('/dashboard/parent');
          break;
        default:
          router.push('/');
      }
    } catch (err: any) {
      console.error('Profile setup error:', err);
      setError('فشل إنشاء الملف الشخصي. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  if (!firebaseUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="relative w-20 h-20 mx-auto mb-4">
              {firebaseUser.photoURL ? (
                <Image
                  src={firebaseUser.photoURL}
                  alt={formData.name || 'User'}
                  fill
                  className="object-cover rounded-full"
                />
              ) : (
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">مرحباً بك في حصتي</h1>
            <p className="text-gray-600">يرجى إكمال ملفك الشخصي للمتابعة</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                الاسم الكامل *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="أدخل اسمك الكامل"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                type="email"
                value={firebaseUser.email || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">لا يمكن تعديل البريد الإلكتروني</p>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                رقم الهاتف
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="01xxxxxxxxx"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-900 mb-2">
                نوع الحساب *
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                disabled={loading}
              >
                <option value="student">طالب</option>
                <option value="parent">ولي أمر</option>
                <option value="teacher">معلم</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                اختر نوع حسابك. يمكن للمسؤول تغيير الصلاحيات لاحقاً.
              </p>
            </div>

            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-primary-900">
                  <p className="font-semibold mb-1">ملاحظة هامة:</p>
                  <p>سيتم مراجعة حسابك من قبل المسؤولين قبل منحك صلاحيات كاملة. قد يستغرق هذا بعض الوقت.</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              العودة إلى تسجيل الدخول
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
