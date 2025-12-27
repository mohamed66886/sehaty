'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, where, doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function FixStudentsPage() {
  const { user } = useAuth();
  const [fixing, setFixing] = useState(false);
  const [result, setResult] = useState<string>('');

  const fixStudents = async () => {
    if (!user?.uid) return;

    setFixing(true);
    setResult('جاري معالجة البيانات...\n\n');

    try {
      // الحصول على جميع الاشتراكات الموافق عليها للمدرس
      const subsRef = collection(db, 'pendingSubscriptions');
      const subsQuery = query(
        subsRef,
        where('teacherId', '==', user.uid),
        where('status', '==', 'approved')
      );
      const subsSnapshot = await getDocs(subsQuery);

      setResult(prev => prev + `تم العثور على ${subsSnapshot.docs.length} اشتراك موافق عليه\n\n`);

      let created = 0;
      let updated = 0;
      let errors = 0;

      for (const subDoc of subsSnapshot.docs) {
        const subData = subDoc.data();
        const studentUid = subData.studentUid || subData.studentId;

        if (!studentUid) {
          setResult(prev => prev + `⚠️ لا يوجد studentUid في الاشتراك ${subDoc.id}\n`);
          errors++;
          continue;
        }

        try {
          // التحقق من وجود الطالب في جدول users
          const userRef = doc(db, 'users', studentUid);
          const usersQuery = query(collection(db, 'users'), where('__name__', '==', studentUid));
          const userSnapshot = await getDocs(usersQuery);

          if (userSnapshot.empty) {
            // إنشاء سجل جديد للطالب
            await setDoc(userRef, {
              name: subData.studentName || 'بدون اسم',
              email: subData.studentEmail || '',
              phone: subData.studentPhone || '',
              role: 'student',
              class: subData.className || '',
              teacherIds: [user.uid],
              centerId: '',
              parentId: '',
              createdAt: Timestamp.now(),
            });
            setResult(prev => prev + `✅ تم إنشاء سجل للطالب: ${subData.studentName}\n`);
            created++;
          } else {
            // تحديث teacherIds إذا لم يكن موجوداً
            const existingData = userSnapshot.docs[0].data();
            const teacherIds = existingData.teacherIds || [];
            
            if (!teacherIds.includes(user.uid)) {
              await setDoc(userRef, {
                ...existingData,
                teacherIds: [...teacherIds, user.uid],
              }, { merge: true });
              setResult(prev => prev + `🔄 تم تحديث سجل الطالب: ${subData.studentName}\n`);
              updated++;
            } else {
              setResult(prev => prev + `ℹ️ الطالب موجود بالفعل: ${subData.studentName}\n`);
            }
          }
        } catch (error) {
          console.error('Error processing student:', error);
          setResult(prev => prev + `❌ خطأ في معالجة الطالب: ${subData.studentName}\n`);
          errors++;
        }
      }

      setResult(prev => prev + `\n\n📊 النتائج:\n`);
      setResult(prev => prev + `✅ تم إنشاء: ${created} طالب\n`);
      setResult(prev => prev + `🔄 تم التحديث: ${updated} طالب\n`);
      setResult(prev => prev + `❌ الأخطاء: ${errors}\n`);
      setResult(prev => prev + `\n✨ تم الانتهاء! يمكنك الآن الذهاب إلى صفحة الحضور\n`);

    } catch (error) {
      console.error('Error fixing students:', error);
      setResult(prev => prev + `\n❌ حدث خطأ: ${error}\n`);
    } finally {
      setFixing(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={['teacher']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">إصلاح بيانات الطلاب</h1>
          <p className="text-gray-600 mt-1">هذه الصفحة لإصلاح البيانات القديمة - قم بتشغيلها مرة واحدة فقط</p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">ℹ️ ما الذي سيحدث؟</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>سيتم البحث عن جميع الطلاب الموافق على اشتراكهم معك</li>
                <li>سيتم إنشاء سجلات للطلاب في جدول users إذا لم تكن موجودة</li>
                <li>سيتم تحديث teacherIds لربط الطلاب بك</li>
              </ul>
            </div>

            <button
              onClick={fixStudents}
              disabled={fixing}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {fixing ? 'جاري المعالجة...' : 'بدء الإصلاح'}
            </button>

            {result && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">السجل:</h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {result}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
