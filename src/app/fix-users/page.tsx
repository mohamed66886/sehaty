'use client';

import { useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';

export default function FixUsersPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const fixAllUsers = async () => {
    setLoading(true);
    setMessage('جاري إصلاح بيانات المستخدمين...\n');

    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      setMessage(prev => prev + `\nعدد المستخدمين: ${snapshot.docs.length}\n\n`);

      let fixed = 0;
      let alreadyOk = 0;

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const docId = docSnap.id;

        // Check if uid field exists and matches document ID
        if (!data.uid || data.uid !== docId) {
          // Update the document to include uid field
          await updateDoc(doc(db, 'users', docId), {
            uid: docId
          });
          
          setMessage(prev => prev + `✅ تم إصلاح: ${data.name || data.email || docId}\n`);
          fixed++;
        } else {
          alreadyOk++;
        }
      }

      setMessage(prev => prev + `\n📊 النتيجة:\n`);
      setMessage(prev => prev + `✅ تم الإصلاح: ${fixed}\n`);
      setMessage(prev => prev + `✔️ كان صحيح مسبقاً: ${alreadyOk}\n`);
      setMessage(prev => prev + `\n🎉 تم بنجاح! الآن حدّث الصفحة.`);

    } catch (error: any) {
      console.error('Error fixing users:', error);
      setMessage(prev => prev + `\n❌ حدث خطأ: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🔧 إصلاح بيانات المستخدمين</h1>
          <p className="text-gray-600">إضافة uid field لجميع المستخدمين</p>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-lg whitespace-pre-line text-right bg-gray-50 border border-gray-200 max-h-96 overflow-y-auto">
            <pre className="text-sm font-mono">{message}</pre>
          </div>
        )}

        <button
          onClick={fixAllUsers}
          disabled={loading}
          className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {loading ? '⏳ جاري الإصلاح...' : '🔧 إصلاح جميع المستخدمين'}
        </button>

        <div className="mt-6 flex gap-4 justify-center">
          <a href="/check-user" className="text-blue-600 hover:text-blue-800 text-sm">
            فحص المستخدم
          </a>
          <a href="/dashboard/student/teachers" className="text-green-600 hover:text-green-800 text-sm">
            صفحة المعلمين
          </a>
        </div>
      </div>
    </div>
  );
}
