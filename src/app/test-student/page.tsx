'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';

export default function TestStudentPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const createTestStudent = async () => {
    setLoading(true);
    setMessage('جاري إنشاء حساب طالب تجريبي...');

    try {
      // Get first teacher from database
      const teachersQuery = query(collection(db, 'users'), where('role', '==', 'teacher'));
      const teachersSnapshot = await getDocs(teachersQuery);
      
      if (teachersSnapshot.empty) {
        setMessage('❌ لا يوجد معلمين في النظام. يجب إضافة معلم أولاً.');
        setLoading(false);
        return;
      }

      const firstTeacher = teachersSnapshot.docs[0].data();
      const teacherId = firstTeacher.uid;
      const teacherName = firstTeacher.name;

      // Create student auth account
      const email = `student-test-${Date.now()}@example.com`;
      const password = 'Test123!';
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const studentUid = userCredential.user.uid;

      // Create user document
      await setDoc(doc(db, 'users', studentUid), {
        uid: studentUid,
        name: 'طالب تجريبي',
        email: email,
        phone: '0500000000',
        role: 'student',
        class: 'الصف الأول الثانوي',
        teacherIds: [teacherId],
        centerId: 'center1',
        parentId: '', // يمكن تركه فارغ للاختبار
        createdAt: Timestamp.now(),
      });

      // Create pending subscription
      await setDoc(doc(db, 'pendingSubscriptions', studentUid), {
        studentUid: studentUid,
        studentName: 'طالب تجريبي',
        studentEmail: email,
        studentPhone: '0500000000',
        teacherId: teacherId,
        teacherName: teacherName,
        classId: 'class1',
        className: 'الصف الأول الثانوي - رياضيات',
        status: 'approved',
        emailVerified: true,
        emailVerifiedAt: Timestamp.now(),
        createdAt: Timestamp.now(),
        reviewedAt: Timestamp.now(),
        reviewedBy: teacherId,
      });

      setMessage(`
✅ تم إنشاء حساب الطالب بنجاح!

📧 البريد الإلكتروني: ${email}
🔑 كلمة المرور: ${password}
👨‍🏫 المعلم: ${teacherName}

سيتم تحويلك لصفحة تسجيل الدخول...
      `);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (error: any) {
      console.error('Error creating test student:', error);
      setMessage(`❌ حدث خطأ: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">إنشاء طالب تجريبي</h1>
          <p className="text-gray-600">لاختبار صفحة الطالب</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg whitespace-pre-line text-right ${
            message.includes('✅') 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : message.includes('❌')
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {message}
          </div>
        )}

        <button
          onClick={createTestStudent}
          disabled={loading}
          className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {loading ? '⏳ جاري الإنشاء...' : '✨ إنشاء حساب طالب تجريبي'}
        </button>

        <div className="mt-6 text-center">
          <a href="/login" className="text-blue-600 hover:text-blue-800 text-sm">
            العودة لتسجيل الدخول
          </a>
        </div>
      </div>
    </div>
  );
}
